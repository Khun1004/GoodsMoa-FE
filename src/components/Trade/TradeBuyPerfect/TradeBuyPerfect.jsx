import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./TradeBuyPerfect.css";

const TradeBuyPerfect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const orderId = query.get("orderId");

  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    if (!orderId) {
      console.error("❌ orderId 누락");
      return;
    }

    // 1. 주문 정보 조회
    fetch(`http://localhost:8080/order/${orderId}`, {
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
        console.log("📦 주문 응답 전체:", data);
  console.log("🆔 tradePostId:", data.tradePostId); // ← 여기에 찍힐지 확인
        setOrderData(data);
      })
      .catch((err) => {
        console.error("❌ 주문 조회 오류:", err);
      });
  }, [orderId]);

  const handleGoToTradeList = async () => {
    const postId = orderData?.tradePostId;

    if (!postId) {
      console.warn("❗ tradePostId가 없어 게시글 삭제를 건너뜁니다.");
      navigate("/trade");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/tradePost/delete/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("게시글 삭제 실패");

      console.log("🗑️ 게시글 삭제 완료");
      navigate("/trade");
    } catch (err) {
      console.error("❌ 게시글 삭제 오류:", err);
      alert("게시글 삭제에 실패했습니다. 거래 목록으로 이동합니다.");
      navigate("/trade");
    }
  };

  const getImageUrl = (path) => {
    if (!path || typeof path !== "string") return "/default-image.jpg";
    return path.startsWith("http")
      ? path
      : `http://localhost:8080/${path.replace(/^\/?/, "")}`;
  };

  return (
    <div className="trade-buy-perfect-container">
      <div className="trade-buy-perfect-card">
        <div className="perfect-icon">
          {/* 아이콘 또는 SVG */}
        </div>
        <h2 className="perfect-title">🎉 구매 완료!</h2>
        <p className="perfect-subtitle">
          감사합니다. 아래 내용으로 거래가 완료되었습니다.
        </p>

        <div className="perfect-product-info">
          <img
            src={getImageUrl(orderData?.products?.[0]?.imageUrl)}
            alt="상품 이미지"
            className="perfect-product-image"
          />
          <div className="perfect-product-details">
            <h3>{orderData?.orderName || "상품명 없음"}</h3>
            <p>
              <strong>가격:</strong>{" "}
              {orderData?.totalPrice ? `${orderData.totalPrice}원` : "가격 정보 없음"}
            </p>
            <p>
              <strong>배송지:</strong> {orderData?.mainAddress || "주소 정보 없음"}
            </p>
            <p>
              <strong>배송 메모:</strong> {orderData?.postMemo || "없음"}
            </p>
            <p>
              <strong>결제 수단:</strong> 토스페이
            </p>
            <p>
              <strong>주문 번호:</strong> {orderId || "없음"}
            </p>
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
