import React, { useContext, useEffect, useState } from 'react';
import { CgProfile } from "react-icons/cg";
import { FaHeart } from 'react-icons/fa';
import { SlSocialDropbox } from "react-icons/sl";
import { useLocation, useNavigate } from 'react-router-dom';
import productService from "../../../api/ProductService";
import { default as placeholderImage } from '../../../assets/sales/sale1.jpg';
import { LoginContext } from "../../../contexts/LoginContext";
import SearchBanner from '../../Public/SearchBanner';
import './Sale.css';
import Category from '../../public/Category/Category';
import BestsellerList from "../../public/BestsellerList.jsx";
import { getBestsellerByType } from "../../../api/publicService";
import SortSelect from "../../public/SortSelect.jsx";
const API_BASE_URL = 'http://localhost:8080';

const Sale = ({ showBanner = true, showCustomProducts = true }) => {
    const [userName, setUserName] = useState(() => localStorage.getItem('userName') || "사용자 이름");
    const { profileImage, userInfo } = useContext(LoginContext);
    const [liked, setLiked] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const location = useLocation();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [saleFormDataList, setSaleFormDataList] = useState(() => JSON.parse(localStorage.getItem('saleFormDataList')) || []);
    const [apiResponseList, setApiResponseList] = useState(() => JSON.parse(localStorage.getItem('apiResponseList')) || []);
    const [sortOrder, setSortOrder] = useState('latest');

    //나중에 API연동할떄 바꾸셈 적절히
    const sortOptions = [
        { label: '최신순', value: 'latest' },
        { label: '인기순', value: 'popular' },
        { label: '찜순', value: 'likes' },
        { label: '등록일순', value: 'createdAt' },
    ];

    // 상품글 조회
    useEffect(() => {
        const fetchProductPosts = async () => {
            try {
                const res = await productService.getPosts();

                const now = new Date(); // 현재 시간

                const filteredPosts = res.content.filter(post => {
                    const startTime = post.startTime ? new Date(post.startTime) : null;
                    const endTime = post.endTime ? new Date(post.endTime) : null;

                    // startTime이 있고, 현재가 startTime 이전이면 제외
                    if (startTime && now < startTime) {
                        return false;
                    }

                    // endTime이 있고, 현재가 endTime 이후이면 제외
                    if (endTime && now > endTime) {
                        return false;
                    }

                    return true;
                });

                setPosts(filteredPosts);
            } catch (err) {
                console.error('상품글 목록 불러오기 실패:', err.message);
            }
        };
        fetchProductPosts();
    }, []);


    useEffect(() => {
        console.log('posts :::',posts);
    }, []);

    // 좋아요 버튼 초기값
    useEffect(() => {
        const fetchInitialLikes = async () => {
            const token = localStorage.getItem('userInfo'); // 또는 쿠키에서 가져오기
            if (!token) {
                console.log('토큰 없음. 좋아요 요청 생략');
                return;
            }

            try {
                const res = await productService.getLikedPosts();
                console.log('res  ::: ', res.content);
                const likedMap = {}; // ✅ 먼저 선언
                res.content.forEach(item => {
                    console.log('item ::: ', item.postId);
                    likedMap[String(item.postId)] = true;
                });
                setLiked(likedMap);
            } catch (err) {
                console.error('초기 좋아요 정보 로딩 실패:', err.message);
            }
        };

        fetchInitialLikes();
    }, []);

    const handleLike = async (postId) => {
        try {
            const isLiked = liked[String(postId)];
            if (isLiked) {
                await productService.unlikeProduct(postId);
            } else {
                await productService.likeProduct(postId);
            }
            setLiked(prev => ({ ...prev, [String(postId)]: !isLiked }));
        } catch (err) {
            console.error('좋아요 처리 중 오류:', err);
            alert(err.message);
        }
    };

    useEffect(() => {
        console.log('liked ::: ',liked);
    }, []);

    const filteredPosts = posts.filter(post => {
        const query = searchQuery.toLowerCase();
        return post.title?.toLowerCase().includes(query) || post.hashtag?.toLowerCase().includes(query) || post.userNickName?.toLowerCase().includes(query);
    });

    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            console.log('검색어:', searchQuery);
        }
    };

    const handleProductClick = async (post) => {
        try {
            const detailedPost = await productService.getPostDetail(post.id);
            navigate('/person', {
                state: {
                    product: {
                        ...detailedPost,
                        id: detailedPost.id,
                        name: detailedPost.title,
                        price: detailedPost.price,
                        image: detailedPost.thumbnailImage,
                        src: detailedPost.thumbnailImage,
                        quantity: 10,
                        maxQuantity: 20,
                        shippingMethods: detailedPost.delivers || []
                    },
                    products: [{ ...detailedPost, image: detailedPost.thumbnailImage, src: detailedPost.thumbnailImage }],
                    selectedImage: detailedPost.thumbnailImage,
                    saleLabel: "판매",
                    userName: userName,
                    profileImage: userInfo?.profileImage || profileImage,
                    from: 'sale',
                    productReviews: []
                }
            });
        } catch (err) {
            console.error('handleProductClick 중 에러:', err);
            alert('상품 정보를 불러오는 데 실패했습니다.');
        }
    };

    const isSearching = searchQuery.trim().length > 0;

    return (
        <div className='container'>
            <div className="sale-container">
                {showBanner && (
                    <>
                        <SearchBanner
                            title="판매 상품 검색:"
                            placeholder=" 판매상품 검색"
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            handleSearchKeyPress={handleSearchKeyPress}
                        />
                        <Category gap={90}/>
                        <hr className="sale-divider"/>

                        {/* ✅ 베스트셀러 컴포넌트 추가 */}
                        {!isSearching && (
                            <BestsellerList
                                apiFn={getBestsellerByType}
                                type="product"
                                heading="인기 판매 제품"
                                liked={liked}
                                onLike={handleLike}
                                onCardClick={handleProductClick}
                            />
                        )}
                    </>
                )}

                <div className='saleProductFrame'>
                    {showBanner && !isSearching && (
                        <div className='sale-header'>
                            <div className='sale-icon'>
                                <SlSocialDropbox className='salebox-icon'/>
                                <FaHeart className='heart-icon'/>
                            </div>
                            <h2 className="sale-heading">판매 제품</h2>

                            {/* ✅ 정렬 셀렉트 박스 (오른쪽 정렬용 wrapper) */}
                            <div style={{marginLeft: 'auto'}}>
                                <SortSelect
                                    options={sortOptions}
                                    selected={sortOrder}
                                    onChange={setSortOrder}
                                />
                            </div>
                        </div>
                    )}

                    <div className="sale-grid">
                        {(isSearching ? filteredPosts : posts).map((post) => (
                            <div key={post.id} className="sale-card">
                                <div onClick={() => handleProductClick(post)}>
                                    <img
                                        src={post.thumbnailImage || placeholderImage}
                                        alt={post.title}
                                        className="sale-image"
                                        onError={(e) => {
                                            e.target.src = placeholderImage;
                                        }}
                                    />
                                </div>
                                <span className="sale-label">판매</span>
                                <button
                                    className={`sale-like-button ${liked[post.id] ? 'liked' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleLike(post.id);
                                    }}
                                >
                                    <FaHeart size={18}/>
                                </button>

                                <div className="sale-profile-block">
                                    <div className="sale-profile-row">
                                        {post.userImage ? (
                                            <img
                                                src={`http://localhost:8080/${post.userImage}`}
                                                alt="작성자"
                                                className="sale-profile-pic-mini"
                                                onError={(e) => {
                                                    e.target.src = placeholderImage;
                                                }}
                                            />
                                        ) : (
                                            <CgProfile className="sale-profile-pic-mini"/>
                                        )}
                                        <span className="sale-user-name-mini">{post.userNickName}</span>
                                    </div>
                                    <span className="view-count">조회수: {post.views || 0}</span>
                                </div>
                                <div className="sale-product-title">{post.title}</div>
                                {post.hashtag && (
                                    <div className="tags-container">
                                        <div className="tags-list">
                                            {post.hashtag.split(",").map((tag, idx) => (
                                                <span key={idx} className="tag-item">#{tag.trim()}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {searchQuery && filteredPosts.length === 0 && (
                    <div className="no-search-results">
                        <p style={{ textAlign: 'center', marginTop: '50px', fontSize: '18px', color: '#666' }}>
                            "{searchQuery}"에 대한 검색 결과가 없습니다.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sale;
