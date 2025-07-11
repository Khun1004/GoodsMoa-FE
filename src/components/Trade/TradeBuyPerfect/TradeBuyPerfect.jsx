import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./TradeBuyPerfect.css";

const TradeBuyPerfect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const orderId = query.get("orderId");

  const {
    item = {},
    deliveryAddress = "",
    deliveryNote = "",
    paymentMethod = "",
    isDirectTrade = false,
  } = location.state || {};

  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    if (!isDirectTrade && orderId) {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/order/${orderId}`, {
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) {
            return res.text().then((text) => {
              throw new Error(`단일 주문 조회 실패: ${res.status} - ${text}`);
            });
          }
          return res.json();
        })
        .then((data) => {
          console.log("✅ 단건 주문 데이터:", data);
          setOrderData(data);
        })
        .catch((err) => {
          console.error("❌ 주문 조회 오류:", err);
        });
    }
  }, [orderId, isDirectTrade]);

  const handleGoToTradeList = async () => {
    const postId = isDirectTrade ? item?.id : orderData?.tradePostId;

    if (!postId) {
      console.warn("❗ tradePostId가 없어 게시글 삭제를 건너뜁니다.");
      navigate("/trade");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tradePost/delete/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("게시글 삭제 실패");

      console.log("🗑️ 게시글 삭제 완료");
      navigate("/trade");
    } catch (err) {
      console.error("❌ 게시글 삭제 오류:", err);
      navigate("/trade");
    }
  };

  const getImageUrl = (path) => {
    if (!path || typeof path !== "string") return "/default-image.jpg";
    return path.startsWith("http")
      ? path
      : `${import.meta.env.VITE_API_BASE_URL}/${path.replace(/^\/?/, "")}`;
  };

  const image = isDirectTrade
    ? item?.representativeImage || item?.image
    : orderData?.products?.[0]?.imageUrl;

  const productName = isDirectTrade ? item?.name : orderData?.orderName;
  const price = isDirectTrade ? item?.price : orderData?.totalPrice;

  return (
    <div className="trade-buy-perfect-container">
      <div className="trade-buy-perfect-card">
        <div className="perfect-icon">🎉</div>
        <h2 className="perfect-title">구매 완료!</h2>
        <p className="perfect-subtitle">
          감사합니다. 아래 내용으로 거래가 완료되었습니다.
        </p>

        <div className="perfect-product-info">
          <img
            src={getImageUrl(image)}
            alt="상품 이미지"
            className="perfect-product-image"
          />
          <div className="perfect-product-details">
            <h3>{productName || "상품명 없음"}</h3>
            <p>
              <strong>가격:</strong>{" "}
              {price ? `${price}원` : "가격 정보 없음"}
            </p>
            {isDirectTrade ? (
              <p>
                <strong>거래 장소:</strong>{" "}
                {item?.directTradeLocation || "장소 정보 없음"}
              </p>
            ) : (
              <>
                <p>
                  <strong>배송지:</strong>{" "}
                  {orderData?.mainAddress || "주소 정보 없음"}
                </p>
                <p>
                  <strong>배송 메모:</strong>{" "}
                  {orderData?.postMemo || "없음"}
                </p>
                <p>
                  <strong>결제 수단:</strong> 토스페이
                </p>
                <p>
                  <strong>주문 번호:</strong> {orderId || "없음"}
                </p>
              </>
            )}
          </div>
        </div>

        <button
          className="perfect-back-button"
          onClick={handleGoToTradeList}
        >
          거래 목록으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default TradeBuyPerfect;
