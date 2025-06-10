import React from "react";
import "./PurchaseConfirmation.css";

export default function PurchaseConfirmation({ selectedPurchase, onClose }) {
    if (!selectedPurchase) return null;

    const product = selectedPurchase.products[0];
    return (
        <div className="purchaseConfirmation-container">
            <p className="backpurchaseConfirmation" onClick={onClose}>{"<"}</p>
            <h1 className="purchaseConfirmationTitle">확정 페이지</h1>
            <div className="purchaseConfirmation-header">
                <h2 className="date">{selectedPurchase.paymentDate}</h2>
                <button className="order-details">주문 상세</button>
            </div>

            <div className="purchase-info">
                <p className="status">구매 확정</p>
                <div className="purchaseConfirmation-product">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="product-image"
                    />
                    <div className="product-details">
                        <p className="brand">{product.brand}</p>
                        <p className="product-name">{product.name}</p>
                        <p className="size">{product.size} / {product.quantity}개</p>
                        <p className="price">{(product.price * product.quantity).toLocaleString()}원</p>
                    </div>
                </div>
            </div>

            <div className="actions">
                <button className="review-button">후기 작성 (최대 2,500원 적립)</button>
                <div className="bottom-buttons">
                    <button className="delivery-button">배송 조회</button>
                    <button className="repurchase-button">재구매</button>
                </div>
            </div>
        </div>
    );
}
