import React, { useEffect, useState } from "react";
import "./RefundHistory.css";

const RefundHistory = () => {
    const [canceledOrders, setCanceledOrders] = useState([]);

    useEffect(() => {
        const storedCanceledOrders = JSON.parse(localStorage.getItem("canceledOrders")) || [];
        setCanceledOrders(storedCanceledOrders);
    }, []);

    const handleDeleteOrder = (index) => {
        const updatedOrders = canceledOrders.filter((order, orderIndex) => orderIndex !== index);
        setCanceledOrders(updatedOrders);
        localStorage.setItem("canceledOrders", JSON.stringify(updatedOrders));
    };

    return (
        <div className="refund-history-container">
            <h2 className="refund-historyTitle">취소된 주문 내역</h2>
            {canceledOrders.length > 0 ? (
                canceledOrders.map((order, index) => (
                    <div key={index} className="order-cancel-card">
                        <div className="order-header">
                            <strong>{new Date().toLocaleDateString()} 취소</strong>
                            <a href="#" className="order-detail-link">주문 상세보기 &gt;</a>
                        </div>
                        <div className="order-content">
                            <p className="cancel-info">취소완료 · 카드사 환불 예정</p>
                            <div className="product-info">
                                <img src={order.image} alt={order.name} className="product-image" />
                                <div className="product-details">
                                    <span className="rocket-badge">🚀 로켓와우</span>
                                    <p className="product-name">{order.name}</p>
                                    <p className="product-price">{order.price.toLocaleString()} 원 · {order.quantity}개</p>
                                </div>
                                <button className="cart-button">장바구니 담기</button>
                            </div>
                        </div>
                        <button className="cancel-detail-button">취소 상세 보기</button>
                        <button 
                            className="refundHistory-deleteBtn"
                            onClick={() => handleDeleteOrder(index)}
                        >
                            삭제
                        </button>
                    </div>
                ))
            ) : (
                <p>취소된 주문이 없습니다.</p>
            )}
        </div>
    );
};

export default RefundHistory;
