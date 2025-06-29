import React, { useEffect, useState, useContext } from 'react';
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

const Trade = ({ showBanner = true }) => {
  const { userInfo } = useContext(LoginContext);
  const navigate = useNavigate();

  const [fetchedTradePosts, setFetchedTradePosts] = useState([]);
  const [likedServerPosts, setLikedServerPosts] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState('latest');
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || "사용자 이름");

  const [isTradeSubmitted, setIsTradeSubmitted] = useState(() => {
    return localStorage.getItem('isTradeSubmitted') === 'true';
  });

  const [savedTradeFormData, setSavedTradeFormData] = useState(() => {
    const stored = localStorage.getItem('tradeFormData');
    return stored ? JSON.parse(stored) : null;
  });

  const sortOptions = [
    { label: '최신순', value: 'latest' },
    { label: '인기순', value: 'popular' },
    { label: '찜순', value: 'likes' },
    { label: '등록일순', value: 'createdAt' },
  ];

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

  // 게시글 + 좋아요 상태 가져오기
  useEffect(() => {
    const fetchTradeData = async () => {
      try {
        const postsRes = await api.get("/tradePost/post");
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

  const filteredPosts = fetchedTradePosts.filter((item) => {
    const titleMatch = item.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const hashtagArr = item.hashtag?.split(" ").filter(tag => tag.trim() !== "") || [];
    const tagMatch = searchTerm.startsWith("#") && hashtagArr.some(tag =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return !searchTerm || titleMatch || tagMatch;
  });

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
              <Category gap={90} />
              <hr className="sale-divider" />

              {searchTerm.trim().length === 0 && (
                  <BestsellerList
                      apiFn={getBestsellerByType}
                      type="trade"
                      heading="인기 중고거래 제품"
                      liked={likedServerPosts}
                      onLike={handleServerLikeToggle}
                      onCardClick={(item) => navigate(`/tradeDetail/${item.id}`, { state: { item } })}
                  />
              )}
            </>
        )}

        <div className='saleProductFrame'>
          {showBanner && (
              <div className='sale-header'>
                <div className='sale-icon'>
                  <SlSocialDropbox className='salebox-icon' />
                  <FaHeart className='heart-icon' />
                </div>
                <h2 className="sale-heading">중고거래 제품</h2>
                <div style={{ marginLeft: 'auto' }}>
                  <SortSelect
                      options={sortOptions}
                      selected={sortOrder}
                      onChange={setSortOrder}
                  />
                </div>
              </div>
          )}

          <div className="sale-grid">
            {filteredPosts.map((item) => (
                <div key={item.id} className="sale-card">
                  <Link to={`/tradeDetail/${item.id}`} state={{ item }}>
                    <div className="card-image-container">
                      {item.thumbnailImage ? (
                          <img
                              src={
                                item.thumbnailImage.startsWith("http")
                                    ? item.thumbnailImage
                                    : `http://localhost:8080${item.thumbnailImage}?v=${Date.now()}`
                              }
                              alt={item.title}
                              className="sale-image"
                              onError={e => { e.target.src = "/placeholder.jpg"; }}
                          />
                      ) : (
                          <div className="no-image">이미지 없음</div>
                      )}
                      <span className="sale-label">중고거래</span>
                    </div>
                  </Link>

                  <div className="card-content-area">
                    <div className="profile-line">
                      <div className="profile-mini">
                        {item.userImage ? (
                            <img src={item.userImage} alt="프로필" className="profile-pic-mini" />
                        ) : (
                            <CgProfile className="profile-pic-mini" />
                        )}
                        <span className="user-name-mini">{item.userNickName || '작성자'}</span>
                      </div>
                      <span className="view-count">조회수 : {item.views || 0}</span>
                    </div>
                    <span className="sale-product-title">{item.title}</span>
                    {item.hashtag && item.hashtag.trim() && (
                        <div className="tags-list">
                          {item.hashtag.split(",").filter(tag => tag.trim() !== "").map((tag, idx) => (
                              <span key={idx} className="tag-item">{tag}</span>
                          ))}
                        </div>
                    )}
                  </div>

                  <button
                      className={`sale-like-button ${likedServerPosts[item.id] ? 'liked' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleServerLikeToggle(item.id);
                      }}
                  >
                    <FaHeart size={18} />
                  </button>
                </div>
            ))}

            {isTradeSubmitted && savedTradeFormData && (
                <div className="sale-card">
                  <Link to="/tradeDetail" state={{ item: savedTradeFormData }}>
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
                    <FaHeart size={18} />
                  </button>
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default Trade;
