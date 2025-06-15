import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./TradeBuyPerfect.css";

const TradeBuyPerfect = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { item, deliveryAddress, detailAddress, deliveryNote, paymentMethod } = location.state || {};

    const fullAddress = `${deliveryAddress}, ${detailAddress}`.trim();

    const getImageUrl = (path) => {
        if (!path || typeof path !== "string") return "/default-image.jpg";
        return path.startsWith("http") ? path : `http://localhost:8080/${path.replace(/^\/?/, "")}`;
    };

    return (
        <div className="trade-buy-perfect-container">
        <div className="trade-buy-perfect-card">
            <div className="perfect-icon">
                <svg className='svgPerfect' 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="80" height="80" 
                    viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" 
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            </div>
            <h2 className="perfect-title">🎉 구매 완료!</h2>
            <p className="perfect-subtitle">감사합니다. 아래 내용으로 거래가 완료되었습니다.</p>

            <div className="perfect-product-info">
            <img
                src={getImageUrl(item?.representativeImage)}
                alt="상품 이미지"
                className="perfect-product-image"
            />
            <div className="perfect-product-details">
                <h3>{item?.title}</h3>
                <p><strong>가격:</strong> {item?.price}원</p>
                <p><strong>거래 장소:</strong> {item?.directTradeLocation || item?.location}</p>
                <p><strong>배송지:</strong> {fullAddress}</p>
                <p><strong>배송 메모:</strong> {deliveryNote || "없음"}</p>
                <p><strong>결제 수단:</strong> {getPaymentLabel(paymentMethod)}</p>
            </div>
            </div>

            <button
            className="perfect-back-button"
            onClick={() => navigate("/trade")}
            >
            거래 목록으로 돌아가기
            </button>
        </div>
        </div>
    );
};

// 결제 수단 라벨 변환
const getPaymentLabel = (method) => {
    switch (method) {
        case "creditCard": return "신용카드";
        case "bankTransfer": return "계좌이체";
        case "kakaoPay": return "카카오페이";
        case "naverPay": return "네이버페이";
        default: return "결제 수단 없음";
    }
};

export default TradeBuyPerfect;
