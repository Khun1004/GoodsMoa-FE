import React from 'react';
import './CancelOrder.css';

const CancelOrder = ({ selectedPurchase }) => {
    return (
        <div className="cancel-order-container">
            <h1 className="cancel-title">주문취소</h1>
            
            <div className="progress-steps">
                <div className="step active">1 상품 선택</div>
                <div className="step">2 사유 선택</div>
                <div className="step">3 환불정보 확인</div>
            </div>
            
            <div className="product-selection">
                <h2 className="section-title">상품을 선택해 주세요</h2>
                {selectedPurchase?.products.map((product) => (
                    <div key={product.name} className="product-item selected">
                        <img src={product.image} alt={product.name} className="product-img" />
                        <div className="cancelOrder-product-details">
                            <h3 className="cancelOrder-product-name">{product.name}</h3>
                            <p className="cancelOrder-product-quantity">수량: {product.quantity}개</p>
                            <p className="cancelOrder-product-category">카테고리: {selectedPurchase.category || "미정"}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            <button className="next-button">다음 단계 &gt;</button>
        </div>
    );
};

export default CancelOrder;
