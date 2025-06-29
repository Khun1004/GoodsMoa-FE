import React, {useEffect, useState, useContext, useCallback} from 'react';
import { CgProfile } from "react-icons/cg";
import { FaHeart } from 'react-icons/fa';
import { SlSocialDropbox } from "react-icons/sl";
import { Link, useNavigate } from 'react-router-dom';
import { LoginContext } from "../../../contexts/LoginContext";
import SearchBanner from '../../Public/SearchBanner';
import './Trade.css';
import Category from '../../public/Category/Category';
import SortSelect from "../../public/SortSelect.jsx";
import BestsellerList from "../../public/BestsellerList.jsx";
import { getBestsellerByType } from "../../../api/publicService";
import api from "../../../api/api";
import _ from "lodash";
import Trade1 from '../../../assets/demands/demand1.jpg';

const Trade = ({ showBanner = true }) => {
  const { userInfo } = useContext(LoginContext);
  const navigate = useNavigate();

  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || "사용자 이름");
  const [fetchedTradePosts, setFetchedTradePosts] = useState([]);
  const [likedServerPosts, setLikedServerPosts] = useState({});

  const [tradeProducts, setTradeProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState(0);
  const [orderBy, setOrderBy] = useState('latest');
  const [includeExpired, setIncludeExpired] = useState(true);
  const [includeScheduled, setIncludeScheduled] = useState(true);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  const [isTradeSubmitted, setIsTradeSubmitted] = useState(() => {
    return localStorage.getItem('isTradeSubmitted') === 'true';
  });

  const [savedTradeFormData, setSavedTradeFormData] = useState(() => {
    const stored = localStorage.getItem('tradeFormData');
    return stored ? JSON.parse(stored) : null;
  });

  const sortOptions = [
    { label: '최신순', value: 'new' },      // 최신 등록순
    { label: '오래된순', value: 'old' },        // 오래된 등록순
    { label: '조회수순', value: 'view' },       // 조회수 많은 순
    { label: '좋아요순', value: 'like' },         // 좋아요(찜) 많은 순
  ];

  const getFullThumbnailUrl = (thumbnailUrl) =>
      thumbnailUrl
          ? thumbnailUrl.startsWith('http')
              ? thumbnailUrl
              : `http://localhost:8080/${thumbnailUrl.replace(/^\/+/, '')}`
          : Trade1;

  const getNumericId = (id) => {
    if (typeof id === 'string' && id.startsWith('TRADE_')) {
      return id.replace('TRADE_', '');
    }
    return String(id);
  };

  const fetchTradeProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        query: searchTerm,
        category,
        order_by: orderBy,
        include_expired: includeExpired,
        include_scheduled: includeScheduled,
        page,
        page_size: pageSize,
      };
      const res = await api.get('/tradePost', { params });
      const data = res.data;
      const productsArr = Array.isArray(data.content) ? data.content : [];

      // demandProducts에 liked 정보 유지하면서 업데이트 하려면 서버에서 liked 정보 같이 받아야 함.
      // 없으면 기존 liked 유지
      setTradeProducts(productsArr);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message || '데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, category, orderBy, includeExpired, includeScheduled, page]);

  useEffect(() => {
    const debounceFetch = _.debounce(() => {
      fetchTradeProducts();
    }, 500);
    debounceFetch();
    return () => debounceFetch.cancel();
  }, [fetchTradeProducts]);

  // 서버 좋아요 토글
  const handleServerLikeToggle = async (tradeId) => {
    if (!userInfo) {
      alert("로그인이 필요합니다.");
      return;
    }
    const isLiked = likedServerPosts[tradeId];
    try {
      if (isLiked) {
        await api.delete(`/trade-like/${tradeId}`);
      } else {
        await api.post(`/trade-like/like/${tradeId}`);
      }
      setLikedServerPosts(prev => ({ ...prev, [tradeId]: !isLiked }));
    } catch (error) {
      console.error("좋아요 처리 중 오류:", error);
      alert("좋아요 처리 중 오류 발생");
    }
  };

  const handleLike = async (id) => {
    const numericId = getNumericId(id);
    try {
      const item = tradeProducts.find(p => getNumericId(p.id) === numericId);
      const isLiked = item?.liked;
      if (isLiked) {
        await api.delete(`/trade-like/${numericId}`);
      } else {
        await api.post(`/trade-like/like/${numericId}`);
      }
      setTradeProducts(prev =>
          prev.map(item => {
            const numericItemId = getNumericId(item.id);
            if (numericItemId === numericId) {
              return { ...item, liked: !item.liked };
            }
            return item;
          })
      );
    } catch (err) {
      alert('좋아요 처리 실패: ' + (err.response?.data?.message || err.message));
    }
  };

  // 게시글 + 좋아요 상태 가져오기
  useEffect(() => {
    const fetchTradeData = async () => {
      try {
        const postsRes = await api.get("/tradePost");
        const posts = postsRes.data.content || [];
        setFetchedTradePosts(posts);

        if (userInfo && posts.length > 0) {
          const postIds = posts.map(post => post.id);
          const likesRes = await api.post('/trade-like/my-likes-status', { postIds });
          setLikedServerPosts(likesRes.data);
        } else {
          setLikedServerPosts({});
        }
      } catch (err) {
        console.error("중고거래 게시글 로딩 실패:", err);
        setFetchedTradePosts([]);
      }
    };

    fetchTradeData();
  }, [userInfo]);

  //이거 지워야함 ㅇㅇ
  // const filteredPosts = fetchedTradePosts.filter((item) => {
  //   const titleMatch = item.title?.toLowerCase().includes(searchTerm.toLowerCase());
  //   const hashtagArr = item.hashtag?.split(" ").filter(tag => tag.trim() !== "") || [];
  //   const tagMatch = searchTerm.startsWith("#") && hashtagArr.some(tag =>
  //       tag.toLowerCase().includes(searchTerm.toLowerCase())
  //   );
  //   return !searchTerm || titleMatch || tagMatch;
  // });

  // 검색용
  const filteredProducts = tradeProducts.filter(item => {
    const query = searchTerm.toLowerCase();
    return (
        item.title?.toLowerCase().includes(query) ||
        item.hashtag?.toLowerCase().includes(query) ||
        item.nickname?.toLowerCase().includes(query)
    );
  });
  const isSearching = searchTerm.trim().length > 0;

  return (
      <div className="sale-container">
        {showBanner && (
            <>
              <SearchBanner
                  title="중고거래 검색:"
                  placeholder="중고거래 검색"
                  searchQuery={searchTerm}
                  setSearchQuery={setSearchTerm}
                  handleSearchKeyPress={(e) => {
                    if (e.key === 'Enter') console.log('검색어:', searchTerm);
                  }}
              />
              <Category
                  gap={60}
                  selectedId={category}
                  onCategoryClick={(id) => {
                    setCategory(id);
                    setPage(0);
                  }}
              />

              {searchTerm.trim().length === 0 && (
                  <BestsellerList
                      apiFn={getBestsellerByType}
                      type="trade"
                      heading="인기 중고거래 제품"
                      liked={tradeProducts.reduce((acc, item) => {
                        const id = getNumericId(item.id || item.demandPostId);
                        acc[id] = item.liked;
                        return acc;
                      }, {})}
                      onLike={(postId) => {
                        handleLike(postId);
                      }}
                      onCardClick={(item) =>
                          navigate(`/tradeDetail/${getNumericId(item.id || item.demandPostId)}`, {
                            state: { product: item },
                          })
                      }
                  />
              )}
            </>
        )}

        <div className='saleProductFrame'>
          {showBanner && (
              <div className='sale-header'>
                <div className='sale-icon'>
                  <SlSocialDropbox className='salebox-icon'/>
                  <FaHeart className='heart-icon'/>
                </div>
                <h2 className="sale-heading">중고거래 제품</h2>
                <div style={{marginLeft: 'auto'}}>
                  <SortSelect options={sortOptions} selected={orderBy} onChange={setOrderBy}/>
                </div>
              </div>
          )}

          <div className="sale-grid">
            {loading && <div className="loading-box">🔄 로딩중입니다...</div>}
            {!loading && (isSearching ? filteredProducts : tradeProducts).length === 0 && (
                <div className="no-search-result">"{searchTerm}"에 대한 검색 결과가 없습니다.</div>
            )}
            {(isSearching ? filteredProducts : tradeProducts).map((item) => {
              const id = getNumericId(item.id);

              return (
                  <div key={id} className="sale-card">
                    <Link
                        to={`/tradeDetail/${id}`}
                        state={{
                          product: item,
                          saleLabel: '중고거래',
                          products: tradeProducts,
                        }}
                    >
                      <div className="card-image-container">
                        {item.thumbnailUrl ? (
                            <img
                                src={getFullThumbnailUrl(item.thumbnailUrl)}
                                alt={item.title}
                                className="sale-image"
                                onError={e => {
                                  e.target.src = "/placeholder.jpg";
                                }}
                            />
                        ) : (
                            <div className="no-image">이미지 없음</div>
                        )}
                      </div>
                    </Link>
                    <span className="demand-label">중고거래</span>
                    <button
                        className={`sale-like-button${item.liked ? ' liked' : ''}`}
                        onClick={() => handleLike(id)}
                    >
                      <FaHeart size={18}/>
                    </button>

                    <div className="card-content-area">
                      <div className="profile-line">
                        <div className="profile-mini">
                          {item.userImage ? (
                              <img src={item.userImage} alt="프로필" className="profile-pic-mini"/>
                          ) : (
                              <CgProfile className="profile-pic-mini"/>
                          )}
                          <span className="user-name-mini">{item.nickname || '작성자'}</span>
                        </div>
                        <span className="view-count">조회수: {item.views || 0}</span>
                      </div>
                      <span className="sale-product-title">{item.title}</span>
                      {item.hashtag && item.hashtag.trim() && (
                          <div className="tags-list">
                            {item.hashtag
                                .split(',')
                                .map(tag => tag.trim())
                                .filter(tag => tag.length > 0)
                                .map((tag, idx) => (
                                    <span key={idx} className="tag-item">#{tag}</span>
                                ))}
                          </div>
                      )}
                    </div>
                  </div>
              );
            })}


            {isTradeSubmitted && savedTradeFormData && (
                <div className="sale-card">
                  <Link to="/tradeDetail" state={{item: savedTradeFormData}}>
                    <img
                        src={savedTradeFormData.representativeImage}
                        alt={savedTradeFormData.title}
                        className="sale-image"
                    />
                    <span className="sale-label">중고거래</span>
                  </Link>
                  <div className="card-content-area">
                    <span className="sale-product-title">{savedTradeFormData.title}</span>
                    <p className="user-name-mini">{userName}</p>
                  </div>
                  <button className="sale-like-button">
                    <FaHeart size={18}/>
                  </button>
                </div>
            )}
          </div>
          <div className="pagination">
            {Array.from({length: totalPages}, (_, i) => (
                <button
                    key={i}
                    onClick={() => setPage(i)}
                    style={{
                      margin: '0 5px',
                      padding: '6px 10px',
                      backgroundColor: i === page ? '#333' : '#eee',
                      color: i === page ? '#fff' : '#000',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                >
                  {i + 1}
                </button>
            ))}
          </div>
        </div>
      </div>
  );
};

export default Trade;
