import React, { useEffect, useState } from 'react';
import { CgProfile } from "react-icons/cg";
import { FaHeart } from 'react-icons/fa';
import { SlSocialDropbox } from "react-icons/sl";
import { Link, useLocation } from 'react-router-dom';
import Trade1 from '../../../assets/trades/trade1.jpg';
import Trade10 from '../../../assets/trades/trade10.jpg';
import Trade2 from '../../../assets/trades/trade2.jpg';
import Trade3 from '../../../assets/trades/trade3.jpg';
import Trade4 from '../../../assets/trades/trade4.jpg';
import Trade5 from '../../../assets/trades/trade5.jpg';
import Trade6 from '../../../assets/trades/trade6.jpg';
import Trade7 from '../../../assets/trades/trade7.jpg';
import Trade8 from '../../../assets/trades/trade8.jpg';
import Trade9 from '../../../assets/trades/trade9.jpg';
import { LoginContext } from "../../../contexts/LoginContext";
import { useContext } from "react";

import './Trade.css';

const Trade = ({ showBanner = true}) => {
    const { userInfo, isLogin } = useContext(LoginContext);

    // // 비로그인 사용자는 접근 제한
    // if (!isLogin) {
    //     return (
    //         <div className="sale-container">
    //             <h2 style={{ textAlign: "center", marginTop: "3rem" }}>
    //                 🔒 로그인 후 중고거래 게시글을 확인할 수 있습니다.
    //             </h2>
    //         </div>
    //     );
    // }
const [likedServerPosts, setLikedServerPosts] = useState({});

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
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) throw new Error("서버 요청 실패");

    // 상태 업데이트
    setLikedServerPosts(prev => ({
      ...prev,
      [tradeId]: !isLiked
    }));

    // ✅ 콘솔 로그 추가
    console.log(isLiked ? "❌ 찜 해제 완료" : "✅ 찜 등록 완료");
  } catch (error) {
    console.error("🚫 서버 좋아요 처리 실패:", error);
    alert("좋아요 처리 중 오류 발생");
  }
};


const fetchLikeStatusForPosts = async (posts) => {
  const updatedLikes = {};

  for (const post of posts) {
    try {
      const res = await fetch(`http://localhost:8080/trade-like/my-likes/${post.id}`, {
        credentials: "include",
      });

      if (res.ok) {
        updatedLikes[post.id] = true; // 찜한 상태
      } else if (res.status === 404) {
        updatedLikes[post.id] = false; // 찜 안 함
      }
    } catch (error) {
      console.error(`❌ 게시글 ID ${post.id}의 찜 상태 조회 실패`, error);
    }
  }

  setLikedServerPosts(updatedLikes);
};



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


    const [isTradeSubmitted, setIsTradeSubmitted] = useState(() => {
        return localStorage.getItem('isTradeSubmitted') === 'true';
    });

    const [savedTradeFormData, setSavedTradeFormData] = useState(() => {
        const storedTradeFormData = localStorage.getItem('tradeFormData');
        return storedTradeFormData ? JSON.parse(storedTradeFormData) : null;
    });
    
    const [fetchedTradePosts, setFetchedTradePosts] = useState([]); // ✅


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
      setFetchedTradePosts(posts);
      console.log("서버로부터 받은 중고거래 글:", posts);

      // ✅ 각 게시글의 찜 상태 조회 추가
      const updatedLikes = {};
      for (const post of posts) {
        try {
          const likeRes = await fetch(`http://localhost:8080/trade-like/my-likes/${post.id}`, {
            credentials: "include",
          });

          if (likeRes.ok) {
            updatedLikes[post.id] = true;
          } else if (likeRes.status === 404) {
            updatedLikes[post.id] = false;
          }
        } catch (err) {
          console.error(`❌ 게시글 ID ${post.id}의 찜 상태 조회 실패:`, err);
        }
      }

      // ✅ 찜 상태 반영
      setLikedServerPosts(updatedLikes);

    } catch (err) {
      console.error("중고거래 글 요청 실패:", err);
      setFetchedTradePosts([]);
    }
  };

  fetchTradePosts();
}, []);

      
      
      console.log("✅ 로그인 상태:", isLogin);
      console.log("👤 로그인된 사용자 정보:", userInfo);

    const location = useLocation();
    const { formData } = location.state || {};

    const [userName, setUserName] = useState("사용자 이름");
    const [liked, setLiked] = useState(() => {
        const savedLiked = localStorage.getItem('liked');
        return savedLiked ? JSON.parse(savedLiked) : Array(products1.length + products2.length).fill(false);
    });

    const [savedFormData, setSavedFormData] = useState(() => {
        const storedFormData = localStorage.getItem('formData');
        return storedFormData ? JSON.parse(storedFormData) : null;
    });

    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        localStorage.setItem('liked', JSON.stringify(liked));
    }, [liked]);

    useEffect(() => {
        if (formData) {
        localStorage.setItem('formData', JSON.stringify(formData));
        setSavedFormData(formData);
        }
    }, [formData]);

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
    
    useEffect(() => {
        const storedFormData = localStorage.getItem('formData');
        if (storedFormData) {
            setSavedFormData(JSON.parse(storedFormData));
        }
    }, []); 
    fetchedTradePosts.forEach((item, index) => {
        console.log(`🧩 ${index}번 항목 썸네일:`, item.thumbnailImage);
      });

    return (
        <div className="sale-container">
            {showBanner && (
                <div className="sale-banner">
                    <div className="sale-banner-content">
                        <h1 className="sale-title">😊 원하는 상품을 검색해 보세요 😊</h1>
                        <input type="text" placeholder="상품명 검색🎉🎉" className="sale-search-input" />
                    </div>
                </div>
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

                <div className='saleFrame1'>
                    <div className="sale-grid">
                        {products1.map((product, index) => (
                            <div key={product.id} className="sale-card">
                                <div className="profile-info">
                                    <CgProfile className="profile-pic" />
                                    <p className="user-name">{userName}</p>
                                </div>
                                <Link to={`/tradeDetail`} state={{ product, saleLabel: "판매" }}>
                                    <img src={product.src} alt={product.name} className="sale-image" />
                                </Link>
                                <span className="sale-label">중고거래</span>
                                <button className={`sale-like-button ${liked[index] ? 'liked' : ''}`} onClick={() => handleLike(index)}>
                                    <FaHeart size={18} />
                                </button>
                                <p className="sale-product-name">{product.name}</p>
                                

                            </div>
                        ))}
                    </div>
                </div>
                <div className="sale-grid">

  {/* 서버에서 받아온 중고거래 게시글만 출력 */}
  {fetchedTradePosts.map((item) => (
  <div key={item.id} className="sale-card">
    <div className="profile-info">
      <CgProfile className="profile-pic" />
      <p className="user-name">익명 사용자</p>
    </div>
    <Link to={`/tradeDetail/${item.id}`} state={{ item }}>
      {item.thumbnailImage ? (
        <img
          src={`http://localhost:8080${item.thumbnailImage.startsWith("/") ? "" : "/"}${item.thumbnailImage}`}
          alt={item.title}
          className="sale-image"
        />
      ) : (
        <div className="no-image">이미지 없음</div>
      )}
    </Link>
    <span className="sale-label">중고거래</span>

    {/* ❤️ 서버 게시글용 하트 버튼 수정 */}
    <button
      className={`sale-like-button ${likedServerPosts[item.id] ? 'liked' : ''}`}
      onClick={() => handleServerLikeToggle(item.id)}
    >
      <FaHeart size={18} />
    </button>

    <p className="sale-product-name">{item.title}</p>
  </div>
))}
</div>

              


                <div className='saleFrame2'>
                    <div className="sale-grid">
                        {products2.map((product, index) => (
                            <div key={product.id} className="sale-card">
                                <div className="profile-info">
                                    <CgProfile className="profile-pic" />
                                    <p className="user-name">{userName}</p>
                                </div>
                                <Link to={`/tradeDetail`} state={{ product, saleLabel: "중고거래" }}>
                                    <img src={product.src} alt={product.name} className="sale-image" />
                                </Link>
                                <span className="sale-label">중고거래</span>
                                <button className={`sale-like-button ${liked[products1.length + index] ? 'liked' : ''}`} onClick={() => handleLike(products1.length + index)}>
                                    <FaHeart size={18} />
                                </button>
                                <p className="sale-product-name">{product.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

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
    );
};

export default Trade;