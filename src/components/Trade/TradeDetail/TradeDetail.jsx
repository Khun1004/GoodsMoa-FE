import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LoginContext } from "../../../contexts/LoginContext";
import "./TradeDetail.css";
import { FaHeart } from 'react-icons/fa';

const TradeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useContext(LoginContext);
  const [loading, setLoading] = useState(true);
  const [tradePost, setTradePost] = useState(null);
  const [detailImages, setDetailImages] = useState([]);
  const [activeTab, setActiveTab] = useState("상세 설명");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [map, setMap] = useState(null);

  const isDirectTrade = tradePost?.direct === "b'1'" || !!tradePost?.place;

  const [liked, setLiked] = useState(false);

useEffect(() => {
  const fetchLikedStatus = async () => {
    try {
      const res = await fetch(`http://localhost:8080/trade-like/my-likes/${id}`, {
        credentials: "include"
      });

      if (res.ok) {
        await res.json(); // 응답이 있다는 건 찜된 상태
        setLiked(true);
        console.log("✅ 이미 찜한 게시글입니다.");
      } else if (res.status === 404) {
        setLiked(false);
        console.log("⭕ 아직 찜하지 않은 게시글입니다.");
      } else {
        throw new Error("알 수 없는 상태");
      }
    } catch (error) {
      console.error("찜 상태 확인 중 오류:", error);
    }
  };

  if (userInfo && id) {
    fetchLikedStatus();
  }
}, [id, userInfo]);


const handleLikeToggle = async () => {
  if (!userInfo) {
    alert("로그인이 필요합니다.");
    return;
  }

  const url = liked
    ? `http://localhost:8080/trade-like/${id}`         // DELETE: 좋아요 취소
    : `http://localhost:8080/trade-like/like/${id}`;   // POST: 좋아요 등록

  const method = liked ? "DELETE" : "POST";

  try {
    const response = await fetch(url, {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("서버 요청 실패");
    }

    setLiked(prev => !prev); // UI 상태 토글
    console.log(`❤️ 서버에 ${liked ? "좋아요 취소" : "좋아요 등록"} 요청 완료`);
  } catch (error) {
    console.error("❤️ 좋아요 처리 중 오류:", error);
    alert("좋아요 상태를 변경하는 데 실패했습니다.");
  }
};


  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`http://localhost:8080/tradePost/${id}`, {
          credentials: "include",
        });
  
        if (!res.ok) throw new Error("서버 응답 오류");
  
        const data = await res.json();
        setTradePost(data);
        console.log("전체 데이터:", data); // 여기에 descriptions 있는지 확인

  
        // ✅ imageUrl 필드를 detailImages로 매핑
        if (data.imageUrl) {
          setDetailImages(data.imageUrl);
        }
      } catch (err) {
        console.error("게시글 정보 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };
  
    if (id) fetchPost();
  }, [id]);
  

  useEffect(() => {
    const loadKakaoMap = () => {
      if (!isDirectTrade || !tradePost?.place) return;

      if (window.kakao && window.kakao.maps) {
        const container = document.getElementById("map");
        if (!container) return;

        const mapOptions = {
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
          level: 3,
        };

        const mapInstance = new window.kakao.maps.Map(container, mapOptions);
        setMap(mapInstance);

        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(tradePost.place, function (result, status) {
          if (status === window.kakao.maps.services.Status.OK) {
            const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
            const marker = new window.kakao.maps.Marker({
              map: mapInstance,
              position: coords,
            });
            mapInstance.setCenter(coords);
          } else {
            console.error("주소 변환 실패:", tradePost.place);
          }
        });
      } else {
        setTimeout(loadKakaoMap, 1000);
      }
    };

    if (document.readyState === "complete") {
      loadKakaoMap();
    } else {
      window.addEventListener("load", loadKakaoMap);
      return () => window.removeEventListener("load", loadKakaoMap);
    }
  }, [tradePost?.place, isDirectTrade]);

  if (loading) return <div>불러오는 중...</div>;
  if (!tradePost) return <h2 className="no-item">상품을 찾을 수 없습니다.</h2>;

  console.log("대표 이미지:", tradePost.thumbnailImage);
  console.log("가격:", tradePost.productPrice);
  console.log("상세 이미지들:", detailImages);
  console.log("설명 목록:", tradePost.description);
  




  const getImageUrl = (path) => {
    if (!path) return "";
    return `http://localhost:8080${path.startsWith("/") ? "" : "/"}${path}`;
  };
  
  const allImages = [
    getImageUrl(tradePost.thumbnailImage), // 썸네일
    ...detailImages.map(img => getImageUrl(img.imagePath)) // ✅ 올바른 필드명 사용
  ];
  
  const prevImage = () => {
    setSelectedIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setSelectedIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const openModal = (imageSrc) => {
    setModalImage(imageSrc);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleChatClick = async () => {
    console.log("✅ handleChatClick 호출됨");
    // 실제 데이터 구조에 맞게 판매자 ID 추출
    const sellerId = tradePost?.sellerId || tradePost?.userId;
    if (!userInfo) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!sellerId) {
      alert("판매자 정보가 없습니다.");
      return;
    }
    if (userInfo.id === sellerId) {
      alert("자기 자신과는 채팅할 수 없습니다.");
      return;
    }

    // 채팅방 생성 요청 (title 필드 없이)
    const res = await fetch("http://localhost:8080/chatroom/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buyerId: userInfo.id,   // 구매자 ID
        sellerId: sellerId      // 판매자 ID
      }),
      credentials: "include"
    });

    if (res.ok) {
      const roomData = await res.json();
      window.open(`/chat-app?roomId=${roomData.id}`, "_blank", "width=1000,height=800,resizable=yes");
    } else if (res.status === 409) {
      // 이미 채팅방이 존재하는 경우(중복)
      const roomData = await res.json();
      window.open(`/chat-app?roomId=${roomData.id}`, "_blank", "width=1000,height=800,resizable=yes");
    } else {
      alert("채팅방 생성에 실패했습니다.");
    }
  };
  
  const handleBuyClick = () => {
    navigate("/tradePurchase", {
      state: {
        wantedProducts: [
          {
            id: tradePost.id,
            name: tradePost.title,
            price: tradePost.productPrice,
            quantity: 1,
            image: tradePost.thumbnailImage,
            representativeImage: tradePost.thumbnailImage,
           detailImages: detailImages.map(img => ({ imagePath: img.imagePath })), 
            category: tradePost.categoryName || "미정",
            shippingMethods: tradePost.delivery_price || (isDirectTrade ? "없음" : "3500원"),
            tradeLabel: "중고거래",
            directTradeLocation: tradePost.place || "",
            condition: tradePost.condition_status || "미정",
            location: tradePost.place || "대구광역시 북구 복현로",
          },
        ],
        saleLabel: "중고거래",
        isDirectTrade,
      },
    });
  };

  const handleReportClick = () => {
  const item = {
    id: tradePost.id,
    title: tradePost.title,
    price: tradePost.productPrice ?? null,
    condition: tradePost.condition_status ?? null,
  };

  navigate("/demandReport", {
    state: {
      item,
      representativeImage: allImages[selectedIndex],
    },
  });
};




  return (
    <div className="container">
      <div className="tradeDetail-container">
        <div className="tradeDetail-content">
          <div className="tradeDetailImg-box">
            <button className="prev-btn" onClick={prevImage}>&#8249;</button>
            <img
              src={allImages[selectedIndex]}
              alt="대표 이미지"
              className="main-image"
              onClick={() => openModal(allImages[selectedIndex])}
            />
            <div className="sale-labelProduct">
              중고거래 <span className="separator"> &gt; </span> {tradePost.title}
              <span className="separator"> &gt; </span> {tradePost.categoryName || "미정"}
            </div>
            <button className="next-btn" onClick={nextImage}>&#8250;</button>
          </div>

          <div className="tradeDetailProduct-info">
            <h1 className="tradeDetailProduct">상품명 : {tradePost.title}</h1>
            <p className="tradeDetailPrice">가격 : {tradePost.productPrice}원</p>

            {tradePost.hashtag && (
              <div className="tags-list">
                {tradePost.hashtag.split(" ").map((tag, index) => (
                  <span key={index} className="tag-item">#{tag.replace("#", "")}</span>
                ))}
              </div>
            )}

            {isDirectTrade && (
              <div>
                <h2 className="tradeDetailTitle">거래 희망 장소</h2>
                <p className="tradeDetailMapName">{tradePost.place || "장소 정보 없음"}</p>
                <div className="tradeDetailMap-container">
                  <div id="map" className="tradeDetailMap"></div>
                </div>
              </div>
            )}

            <div className="tradeRCBtn">
              <button className="tradeDetailReportBtn" onClick={handleReportClick}>🚨 신고하기</button>
              <button className="tradeDetailChatBtn" onClick={handleChatClick}>
  💬 채팅하기
</button>


              <button
  className={`detail-like-button ${liked ? 'liked' : ''}`}
  onClick={handleLikeToggle}
>
  <FaHeart size={20} />
</button>

            </div>
            <button className="person-buy" onClick={handleBuyClick}>구매하기</button>
          </div>
        </div>

        <div className="trade-detail-images-box">
          <h2 className="image-section-title">상세 이미지</h2>
          <div className="flex gap-2 mt-2">
            {detailImages.length > 0 ? (
              detailImages.map((img, index) => (
                <img
                  key={index}
                  src={`http://localhost:8080${img.imagePath}`}
                  alt={`상세 이미지 ${index}`}
                  className={`w-50 h-20 border rounded cursor-pointer hover:opacity-75 ${
                    selectedIndex === index + 1 ? "border-2 border-blue-500" : ""
                  }`}
                  onClick={() => {
                    setSelectedIndex(index + 1);
                    openModal(`http://localhost:8080${img.imagePath}`);
                  }}
                />
              ))
            ) : (
              <p>상세 이미지가 없습니다.</p>
            )}
          </div>
        </div>

        <div className="info-table">
          <div className="info-row header">
            <span>배송 방법</span>
            <span>택배비</span>
            <span>상품상태</span>
            <span>안전거래</span>
          </div>
          <div className="info-row">
            <span><strong>{isDirectTrade ? "직거래" : "택배"}</strong></span>
            <span><strong>{isDirectTrade ? "없음" : tradePost.delivery_price || "3500원"}</strong></span>
            <span><strong>{tradePost.condition_status || "중고"}</strong></span>
            <span><strong>{tradePost.shipping || "사용"}</strong></span>
          </div>
        </div>

        {isModalOpen && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={closeModal}>&times;</button>
              <img src={modalImage} alt="확대 이미지" className="modal-image" />
            </div>
          </div>
        )}
      </div>

      <div className="person-details-tabs">
        <ul>
          <li className={activeTab === "상세 설명" ? "active" : ""} onClick={() => setActiveTab("상세 설명")}>상세 설명</li>
          <li className={activeTab === "리뷰" ? "active" : ""} onClick={() => setActiveTab("리뷰")}>리뷰</li>
        </ul>
      </div>

      <div className="personReviewFrame">
        {activeTab === "상세 설명" ? (
         <div className="person-description">
         
       {tradePost.description && tradePost.description.length > 0 ? (
  <ul className="description-list">
    {tradePost.description.map((desc, index) => {
      if (desc.contentType === "TEXT") {
        return <li key={index}><p>{desc.value}</p></li>;
      } else if (desc.contentType === "IMAGE") {
        return (
          <li key={index}>
            <img
              src={`http://localhost:8080${desc.value}`}
              alt={`상세 이미지 ${desc.sequence}`}
              className="description-image"
            />
          </li>
        );
      } else {
        return null;
      }
    })}
  </ul>
) : (
  <p>설명이 없습니다.</p>
)}


       </div>
       
        ) : (
          <div className="person-review">
            <p>리뷰가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeDetail;