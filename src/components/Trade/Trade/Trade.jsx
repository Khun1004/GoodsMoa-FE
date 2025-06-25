import React, { useEffect, useState, useContext } from 'react';
import { CgProfile } from "react-icons/cg";
import { FaHeart } from 'react-icons/fa';
import { SlSocialDropbox } from "react-icons/sl";
import { Link } from 'react-router-dom';
import Trade1 from '../../../assets/trades/trade1.jpg';
import Trade2 from '../../../assets/trades/trade2.jpg';
import Trade3 from '../../../assets/trades/trade3.jpg';
import Trade4 from '../../../assets/trades/trade4.jpg';
import Trade5 from '../../../assets/trades/trade5.jpg';
import Trade6 from '../../../assets/trades/trade6.jpg';
import Trade7 from '../../../assets/trades/trade7.jpg';
import Trade8 from '../../../assets/trades/trade8.jpg';
import Trade9 from '../../../assets/trades/trade9.jpg';
import Trade10 from '../../../assets/trades/trade10.jpg';
import { LoginContext } from "../../../contexts/LoginContext";
import SearchBanner from '../../Public/SearchBanner';
import './Trade.css';
import Category from '../../public/Category/Category';

const Trade = ({ showBanner = true }) => {
  const { userInfo } = useContext(LoginContext);
  const [likedServerPosts, setLikedServerPosts] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [fetchedTradePosts, setFetchedTradePosts] = useState([]);
  const [isTradeSubmitted, setIsTradeSubmitted] = useState(() => {
    return localStorage.getItem('isTradeSubmitted') === 'true';
  });
  const [savedTradeFormData, setSavedTradeFormData] = useState(() => {
    const storedTradeFormData = localStorage.getItem('tradeFormData');
    return storedTradeFormData ? JSON.parse(storedTradeFormData) : null;
  });
  const [userName, setUserName] = useState("사용자 이름");
  const [liked, setLiked] = useState(() => {
    const savedLiked = localStorage.getItem('liked');
    return savedLiked ? JSON.parse(savedLiked) : Array(10).fill(false);
  });
  const [savedFormData, setSavedFormData] = useState(() => {
    const storedFormData = localStorage.getItem('formData');
    return storedFormData ? JSON.parse(storedFormData) : null;
  });
  const [showDetails, setShowDetails] = useState(false);
  // const [retryCount, setRetryCount] = useState(0);
  const products1 = [
    { id: 1, src: Trade1, name: "중고거래_1" },
    { id: 2, src: Trade2, name: "중고거래_2" },
    { id: 3, src: Trade3, name: "중고거래_3" },
    { id: 4, src: Trade4, name: "중고거래_4" },
    { id: 5, src: Trade5, name: "중고거래_5" }
  ];
  const products2 = [
    { id: 6, src: Trade6, name: "중고거래_6" },
    { id: 7, src: Trade7, name: "중고거래_7" },
    { id: 8, src: Trade8, name: "중고거래_8" },
    { id: 9, src: Trade9, name: "중고거래_9" },
    { id: 10, src: Trade10, name: "중고거래_10" }
  ];

  // 서버 찜 토글
  const handleServerLikeToggle = async (tradeId) => {
    if (!userInfo) {
      alert("로그인이 필요합니다.");
      return;
    }
    const isLiked = likedServerPosts[tradeId];
    const url = isLiked
      ? `http://localhost:8080/trade-like/${tradeId}`
      : `http://localhost:8080/trade-like/like/${tradeId}`;
    const method = isLiked ? "DELETE" : "POST";
    try {
      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("서버 요청 실패");
      setLikedServerPosts(prev => ({ ...prev, [tradeId]: !isLiked }));
    } catch (error) {
      alert("좋아요 처리 중 오류 발생");
    }
  };

  // 게시글 및 찜 상태 fetch
  useEffect(() => {
    const fetchTradePosts = async () => {
      try {
        const res = await fetch("http://localhost:8080/tradePost/post", {
          method: "GET",
          credentials: "include"
        });
        if (!res.ok) throw new Error("중고거래 글 불러오기 실패");
        const data = await res.json();
        const posts = data.content;
        console.log("서버에서 받아온 posts:", posts);
        setFetchedTradePosts(posts);

        // 각 게시글의 찜 상태 조회
        const updatedLikes = {};
        for (const post of posts) {
          try {
            const likeRes = await fetch(`http://localhost:8080/trade-like/my-likes/${post.id}`, {
              credentials: "include",
            });
            updatedLikes[post.id] = likeRes.ok;
          } catch {}
        }
        setLikedServerPosts(updatedLikes);
      } catch (err) {
        setFetchedTradePosts([]);
      }
    };
    fetchTradePosts();
  }, []);

  useEffect(() => {
    localStorage.setItem('liked', JSON.stringify(liked));
  }, [liked]);

  useEffect(() => {
    if (savedFormData) {
      localStorage.setItem('formData', JSON.stringify(savedFormData));
      setSavedFormData(savedFormData);
    }
  }, [savedFormData]);

  // 로컬 찜 토글
  const handleLike = (index) => {
    const newLiked = [...liked];
    newLiked[index] = !newLiked[index];
    setLiked(newLiked);
    const productList = [...products1, ...products2];
    const selectedProduct = productList[index];
    let likedProducts = JSON.parse(localStorage.getItem('selectedProducts')) || [];
    if (newLiked[index]) {
      likedProducts.push(selectedProduct);
    } else {
      likedProducts = likedProducts.filter((product) => product.id !== selectedProduct.id);
    }
    localStorage.setItem('selectedProducts', JSON.stringify(likedProducts));
  };

  // 제목/해시태그 검색 필터 (빈 해시태그 안전 처리)
  const filteredPosts = fetchedTradePosts.filter((item) => {
    const titleMatch = item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const hashtagArr = item.hashtag ? item.hashtag.split(" ").filter(tag => tag.trim() !== "") : [];
    const tagMatch =
      searchTerm.startsWith("#") &&
      hashtagArr.some((tag) =>
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
            <Category gap={90} /> {/* ✅ 카테고리 추가 */}
            <hr className="sale-divider" />
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
          </div>
        )}
       <div className="sale-grid">
  {filteredPosts.map((item) => (
    <div key={item.id} className="sale-card">
      {/* 썸네일 이미지를 감싸는 링크 */}
      <Link to={`/tradeDetail/${item.id}`} state={{ item }}>
        <div className="card-image-container">
        {item.thumbnailImage ? (
          <img
            src={
              item.thumbnailImage?.startsWith("http")
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

      {/* ✅ [수정] 텍스트 정보를 담는 컨테이너 추가 */}
      <div className="card-content-area">
        <div className="profile-row-vertical">
          <div className="profile-mini">
            {item.userImage ? (
              <img src={item.userImage} alt="프로필" className="profile-pic-mini" />
            ) : (
              <CgProfile className="profile-pic-mini" />
            )}
            <span className="user-name-mini">{item.userNickName || '작성자'}</span>
          </div>
          <span className="sale-product-title">{item.title}</span>
        </div>
        {/* 해시태그 */}
        {item.hashtag && item.hashtag.trim() && (
          <div className="tags-list">
            {item.hashtag.split(" ").filter(tag => tag.trim() !== "").map((tag, idx) => (
              <span key={idx} className="tag-item">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* ✅ 좋아요 버튼을 이미지 컨테이너 안으로 옮김 */}
    <button
      className={`sale-like-button ${likedServerPosts[item.id] ? 'liked' : ''}`}
      onClick={(e) => {
        e.preventDefault(); // 링크로 이동 막기
        handleServerLikeToggle(item.id);
      }}
    >
      <FaHeart size={18} />
    </button>
      </div>
  ))}
          {/* 커스텀 상품(직접 등록) */}
          {isTradeSubmitted && savedTradeFormData && (
            <div className="customProductFrame">
              <div className="saleWrite-grid">
                <div className="sale-card">
                  <div className="profile-info">
                    <CgProfile className="profile-pic" />
                    <p className="user-name">{userName}</p>
                  </div>
                  <Link
                    to="/tradeDetail"
                    state={{
                      item: {
                        id: savedTradeFormData.id || Date.now(),
                        title: savedTradeFormData.title,
                        representativeImage: savedTradeFormData.representativeImage,
                        price: savedTradeFormData.price,
                        description: savedTradeFormData.description,
                        tags: savedTradeFormData.tags,
                        category: savedTradeFormData.category || ["미정"],
                        condition: savedTradeFormData.condition || "중고",
                        directTrade: savedTradeFormData.directTrade || "직거래 가능",
                        directTradeLocation: savedTradeFormData.directTradeLocation,
                        shipping: savedTradeFormData.shipping || "안전거래 가능",
                        detailImages: savedTradeFormData.detailImages || [],
                        saleLabel: "중고거래"
                      }
                    }}
                  >
                    {savedTradeFormData.representativeImage && (
                      <img
                        src={savedTradeFormData.representativeImage}
                        alt={savedTradeFormData.title}
                        className="sale-image"
                        onClick={() => setShowDetails(!showDetails)}
                      />
                    )}
                  </Link>
                  <span className="sale-label">중고거래</span>
                  <p className="sale-product-name">{savedTradeFormData.title}</p>
                  <button
                    className={`sale-like-button ${liked.includes(savedTradeFormData.title) ? 'liked' : ''}`}
                    onClick={() => handleLike(savedTradeFormData.title)}
                  >
                    <FaHeart size={18} />
                  </button>
                  {showDetails && (
                    <>
                      <p>가격: {savedTradeFormData.price} 원</p>
                      <p>설명: {savedTradeFormData.description}</p>
                      <p>{savedTradeFormData.category}</p>
                    </>
                  )}
                  {savedTradeFormData.tags && savedTradeFormData.tags.length > 0 && (
                    <div className="tags-list">
                      {savedTradeFormData.tags.map((tag, index) => (
                        <span key={index} className="tag-item">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Trade;
