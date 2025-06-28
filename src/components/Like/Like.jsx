import React, { useEffect, useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
// ✅ 네가 사용한 CSS에 필요한 아이콘들을 lucide-react에서 가져온다고 가정
import { Package, Calendar, ChevronRight, Lock, Eye } from 'lucide-react';
import './Like.css'; // 네가 제공한 CSS 파일
import productService from '../../api/ProductService';
import demandService from '../../api/DemandService';

// --- 헬퍼 함수 ---
const API_BASE_URL = 'http://localhost:8080';

// 이미지 경로를 완전한 URL로 만들고, 없을 경우 대체 이미지를 반환
const getImageUrl = (path) => {
    const fallbackImage = 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop';
    if (!path) return fallbackImage;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

// 날짜 포맷팅 (예: 2025-06-18)
const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
};


const Like = () => {
  const [likedPosts, setLikedPosts] = useState([]);
  const [likedProductPosts, setLikedProductPosts] = useState([]);
  const [productPageInfo, setProductPageInfo] = useState({ page: 0, totalPages: 1 });

  const [likedDemandPosts, setLikedDemandPosts] = useState([]);
  const [demandPageInfo, setDemandPageInfo] = useState({ page: 0, totalPages: 1 });

  const [liked, setLiked] = useState({}); // postId => true
  const navigate = useNavigate();

  const [pageInfo, setPageInfo] = useState({ page: 0, size: 12, totalPages: 0 }); // size를 그리드에 맞게 조정 (4열 기준)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log(likedPosts);
  useEffect(() => {
    const fetchLikes = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_BASE_URL}/trade-like/likes?page=${pageInfo.page}&size=${pageInfo.size}`;
        const res = await fetch(url, { credentials: 'include' });

        if (!res.ok) throw new Error(`서버 응답 오류 (상태: ${res.status})`);

        const data = await res.json();
        setLikedPosts(data.content || []);
        setPageInfo(prev => ({ ...prev, page: data.number, totalPages: data.totalPages }));

      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLikes();
  }, [pageInfo.page, pageInfo.size]);

  // ======상품 좋아요 가져오기=========
    useEffect(() => {
        const fetchInitialLikes = async () => {
            const token = localStorage.getItem('userInfo'); // 또는 userInfo에 token이 있다면 거기서 꺼내기
            if (!token) {
                console.log('🔒 토큰 없음. 좋아요 요청 생략');
                return;
            }

            try {
                const res = await productService.getLikedPosts(0); // ✅ 첫 페이지
                const likedMap = {};

                // ✅ 좋아요 상태 설정
                res.content.forEach(item => {
                    likedMap[String(item.postId)] = true;
                });
                setLiked(likedMap);

                // ✅ 상품 목록 및 페이지 정보 설정
                setLikedProductPosts(res.content || []);
                setProductPageInfo({
                    page: res.number,
                    totalPages: res.totalPages,
                });

                console.log('👍 좋아요한 상품 초기 데이터:', res);
            } catch (err) {
                console.error('💥 초기 좋아요 정보 로딩 실패:', err.message);
            }
        };

        fetchInitialLikes();
    }, []);

    useEffect(() => {
        const fetchPagedLikedProducts = async () => {
            try {
                const res = await productService.getLikedPosts(productPageInfo.page);
                setLikedProductPosts(res.content || []);
                setProductPageInfo({
                    page: res.number,
                    totalPages: res.totalPages,
                });
            } catch (err) {
                console.error('📦 좋아요한 상품 페이지 가져오기 실패:', err.message);
            }
        };

        // 0번은 이미 초기화에서 처리했으므로 이후 페이지만 fetch
        if (productPageInfo.page !== 0) {
            fetchPagedLikedProducts();
        }
    }, [productPageInfo.page]);

    // 단일 useEffect로 통합
    useEffect(() => {
        const fetchLikedDemands = async () => {
            try {
                // demandService.getLikedDemands는 백엔드에서 수요조사 좋아요 목록을 반환하는 API여야 합니다.
                const url = `${API_BASE_URL}/demand/like/user?page=${pageInfo.page}&page_size=${pageInfo.size}`;
                const response = await fetch(url, { credentials: 'include' });
                const res = await response.json();

                // 좋아요 상태 맵 생성
                const likedMap = {};
                res.content.forEach(item => {
                    likedMap[String(item.id)] = true;
                });
                setLikedDemandPosts(likedMap);

                // 목록 및 페이지 정보 저장
                setLikedDemandPosts(res.content || []);
                setDemandPageInfo({
                    page: res.number,
                    totalPages: res.totalPages,
                });
            } catch (err) {
                console.error('좋아요한 수요조사 목록 가져오기 실패:', err.message);
            }
        };

        fetchLikedDemands();
    }, [demandPageInfo.page]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pageInfo.totalPages) {
      setPageInfo((prev) => ({ ...prev, page: newPage }));
    }
  };

    const handleProductPageChange = (newPage) => {
        setProductPageInfo(prev => ({ ...prev, page: newPage }));
    };

    // 상품으로 넘어가는 헨들러
    const handleProductClick = async (post) => {
        console.log('post ::: ', post);

        try {
            // 1. 상세 정보 조회
            const detailedPost = await productService.getPostDetail(post.postId); // postId 주의
            const imageUrl = `http://localhost:8080/${detailedPost.thumbnailImage}`;
            const shippingMethods = detailedPost.delivers || [];

            // 2. 유저 정보 로컬스토리지에서 가져오기
            const rawUserInfo = localStorage.getItem('userInfo');
            const parsedUserInfo = rawUserInfo ? JSON.parse(rawUserInfo) : {};
            const userName = parsedUserInfo?.name || '사용자';
            const profileImage = parsedUserInfo?.profileImage || '';

            // 3. 이동
            navigate('/person', {
                state: {
                    product: {
                        ...detailedPost,
                        id: detailedPost.postId,
                        name: detailedPost.title,
                        price: detailedPost.price,
                        content: detailedPost.content,
                        image: imageUrl,
                        src: imageUrl,
                        quantity: 10,
                        maxQuantity: 20,
                        shippingMethods
                    },
                    products: [{
                        ...detailedPost,
                        image: imageUrl,
                        src: imageUrl
                    }],
                    selectedImage: imageUrl,
                    saleLabel: "판매",
                    userName: userName,
                    profileImage: profileImage,
                    from: 'sale',
                    // productReviews: [...필요시 여기에 추가]
                }
            });

        } catch (err) {
            console.error('handleProductClick 중 에러:', err);
            alert('상품 정보를 불러오는 데 실패했습니다.');
        }
    };

    // 상품으로 넘어가는 헨들러
    const handleDemandClick = async (post) => {
        console.log('post ::: ', post);

        try {
            // 1. 상세 정보 조회
            const detailedPost = await demandService.getPostDetail(post.id);
            const imageUrl = detailedPost.imageUrl;

            // 2. 유저 정보 로컬스토리지에서 가져오기
            const rawUserInfo = localStorage.getItem('userInfo');
            const parsedUserInfo = rawUserInfo ? JSON.parse(rawUserInfo) : {};
            const userName = parsedUserInfo?.name || '사용자';
            const profileImage = parsedUserInfo?.profileImage || '';

            // 3. 이동
            navigate(`/demandDetail/${detailedPost.id}`, {
                state: {
                    demand: { // ✅ 수요조사 특화 데이터 구조
                        ...detailedPost,
                        id: detailedPost.id,
                        title: detailedPost.title,
                        description: detailedPost.description,
                        image: imageUrl,
                        startTime: detailedPost.startTime,
                        endTime: detailedPost.endTime,
                        hashtag: detailedPost.hashtag,
                        category: detailedPost.category,
                        products: detailedPost.products || [] // ✅ 상품 목록 포함
                    },
                    user: {
                        name: userName,
                        profileImage: profileImage
                    },
                    from: 'demand-like-list'
                }
            });
        } catch (err) {
            console.error('수요조사 상세 조회 실패:', err);
            alert('수요조사 정보를 불러오는 데 실패했습니다.');
        }
    };


    if (loading) {
    return (
        <div className="like-loading-container">
            <div className="like-loading-content">
                <div className="like-loading-spinner"></div>
                <p className="like-loading-text">찜한 목록을 불러오는 중...</p>
            </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="like-error-container">
            <div className="like-error-content">
                <p>오류가 발생했습니다: {error}</p>
            </div>
        </div>
    );
  }

    return (
        <div className="like-list-container">
            <div className="like-list-content">
                {/* 👍 좋아요한 상품 목록 */}
                <div className="like-list-header">
                    <h1 className="like-list-title">좋아요한 상품 목록</h1>
                </div>
                {likedProductPosts.length === 0 ? (
                    <div className="like-empty-container">
                        <div className="like-empty-content">
                            <h3 className="like-empty-title">좋아요한 상품이 없습니다</h3>
                            <p className="like-empty-description">관심있는 상품에 좋아요를 눌러보세요!</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="like-forms-grid">
                            {likedProductPosts.map((post) => (
                                <div
                                    key={post.postId}
                                    className="like-form-card"
                                    onClick={() => handleProductClick(post)}
                                >
                                    <div className="like-form-thumbnail">
                                        <img
                                            src={getImageUrl(post.thumbnailImage)}
                                            alt={post.title}
                                            className="like-thumbnail-img"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = getImageUrl(null);
                                            }}
                                        />
                                    </div>
                                    <div className="like-card-content">
                                        <div className="like-card-header">
                                            <h3 className="like-card-title">{post.title}</h3>
                                        </div>
                                        <div className="like-card-badges">
                                            {post.hashtag && (
                                                <span className="like-card-badge category">#{post.hashtag}</span>
                                            )}
                                            {post.createdAt && (
                                                <span className="like-card-badge date">
                          <Calendar className="like-icon-xs"/>
                                                    {formatDate(post.createdAt)}
                        </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {productPageInfo.totalPages > 1 && (
                            <div style={{textAlign: 'center', marginTop: '32px'}}>
                                <button
                                    onClick={() => handleProductPageChange(productPageInfo.page - 1)}
                                    disabled={productPageInfo.page === 0}
                                    className="like-btn-primary"
                                    style={{marginRight: '12px'}}
                                >
                                    이전
                                </button>
                                <span>
                  {productPageInfo.page + 1} / {productPageInfo.totalPages}
                </span>
                                <button
                                    onClick={() => handleProductPageChange(productPageInfo.page + 1)}
                                    disabled={productPageInfo.page + 1 >= productPageInfo.totalPages}
                                    className="like-btn-primary"
                                    style={{marginLeft: '12px'}}
                                >
                                    다음
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* 👍 좋아요한 수요조사 목록 */}
                <div className="like-list-header" style={{marginTop: '48px'}}>
                    <h1 className="like-list-title">좋아요한 수요조사 목록</h1>
                </div>
                {likedDemandPosts.length === 0 ? (
                    <div className="like-empty-container">
                        <div className="like-empty-content">
                            <h3 className="like-empty-title">좋아요한 수요조사가 없습니다</h3>
                            <p className="like-empty-description">관심있는 수요조사에 좋아요를 눌러보세요!</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="like-forms-grid">
                            {likedDemandPosts.map((post) => (
                                <div
                                    key={post.id}
                                    className="like-form-card"
                                    onClick={() => handleDemandClick(post)}
                                >
                                    <div className="like-form-thumbnail">
                                        <img
                                            src={post.imageUrl}
                                            alt={post.title}
                                            className="like-thumbnail-img"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = getImageUrl(null);
                                            }}
                                        />
                                    </div>
                                    <div className="like-card-content">
                                        <div className="like-card-header">
                                            <h3 className="like-card-title">{post.title}</h3>
                                        </div>
                                        <div className="like-card-badges">
                                            {post.hashtag && (
                                                <span className="like-card-badge category">#{post.hashtag}</span>
                                            )}
                                            {post.createdAt && (
                                                <span className="like-card-badge date">
                          <Calendar className="like-icon-xs"/>
                                                    {formatDate(post.createdAt)}
                        </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {demandPageInfo.totalPages > 1 && (
                            <div style={{textAlign: 'center', marginTop: '32px'}}>
                                <button
                                    onClick={() => handleProductPageChange(demandPageInfo.page - 1)}
                                    disabled={demandPageInfo.page === 0}
                                    className="like-btn-primary"
                                    style={{marginRight: '12px'}}
                                >
                                    이전
                                </button>
                                <span>
                  {demandPageInfo.page + 1} / {demandPageInfo.totalPages}
                </span>
                                <button
                                    onClick={() => handleProductPageChange(demandPageInfo.page + 1)}
                                    disabled={demandPageInfo.page + 1 >= demandPageInfo.totalPages}
                                    className="like-btn-primary"
                                    style={{marginLeft: '12px'}}
                                >
                                    다음
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* 👍 좋아요한 중고거래 목록 */}
                <div className="like-list-header" style={{marginTop: '48px'}}>
                    <h1 className="like-list-title">좋아요한 중고거래 목록</h1>
                </div>
                {likedPosts.length === 0 ? (
                    <div className="like-empty-container">
                        <div className="like-empty-content">
                            <h3 className="like-empty-title">좋아요한 게시글이 없습니다</h3>
                            <p className="like-empty-description">관심있는 게시글에 좋아요를 눌러보세요!</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="like-forms-grid">
                            {likedPosts.map((post, idx) => (
                                <Link
                                    to={`/tradeDetail/${post.tradeId ?? idx}`}
                                    key={post.tradeId ?? idx}
                                    className="like-form-card"
                                >
                                    <div className="like-form-thumbnail">
                                        <img
                                            src={getImageUrl(post.thumbnailImage)}
                                            alt={post.title}
                                            className="like-thumbnail-img"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = getImageUrl(null);
                                            }}
                                        />
                                        <div className="like-thumbnail-overlay">
                                            <div className="like-overlay-icon">
                                                <div className="like-icon-circle">
                                                    <ChevronRight className="like-icon-md"/>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="like-status-badge">
                      <span
                          className={`like-status ${post.tradeStatus === '판매중' ? 'public' : 'private'}`}
                      >
                        <Eye className="like-icon-xs"/>
                          {post.tradeStatus}
                      </span>
                                        </div>
                                    </div>
                                    <div className="like-card-content">
                                        <div className="like-card-header">
                                            <h3 className="like-card-title">{post.title}</h3>
                                        </div>
                                        <div className="like-card-badges">
                                            {post.categoryName && (
                                                <span className="like-card-badge category">
                          <Package className="like-icon-xs"/>
                                                    {post.categoryName}
                        </span>
                                            )}
                                            {post.createdAt && (
                                                <span className="like-card-badge date">
                          <Calendar className="like-icon-xs"/>
                                                    {formatDate(post.createdAt)}
                        </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {pageInfo.totalPages > 1 && (
                            <div style={{textAlign: 'center', marginTop: '32px'}}>
                                <button
                                    onClick={() => handlePageChange(pageInfo.page - 1)}
                                    disabled={pageInfo.page === 0}
                                    className="like-btn-primary"
                                    style={{marginRight: '12px'}}
                                >
                                    이전
                                </button>
                                <span>
                  {pageInfo.page + 1} / {pageInfo.totalPages}
                </span>
                                <button
                                    onClick={() => handlePageChange(pageInfo.page + 1)}
                                    disabled={pageInfo.page + 1 >= pageInfo.totalPages}
                                    className="like-btn-primary"
                                    style={{marginLeft: '12px'}}
                                >
                                    다음
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Like;