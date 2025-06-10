import React, { useState } from 'react';
import RefundConfirm from '../RefundConfirm/RefundConfirm';
import './CancelReason.css';

const CancelReason = ({ setCancelReason, selectedPurchase }) => {
    const [selectedReason, setSelectedReason] = useState(null);
    const [showRefundConfirm, setShowRefundConfirm] = useState(false);

    const reasons = [
        "배송지를 잘못 입력함",
        "상품이 마음에 들지 않음 (단순변심)",
        "다른 상품 추가 후 재주문 예정"
    ];

    const handleReasonSelect = (index) => {
        setSelectedReason(index);
    };

    const handleNextStep = () => {
        setShowRefundConfirm(true);
    };

    return (
        <div className="cancel-reason-container">
            {showRefundConfirm ? (
                <RefundConfirm 
                    setRefundConfirm={setShowRefundConfirm} 
                    selectedPurchase={selectedPurchase} 
                    selectedReason={selectedReason} // Pass the selected reason here
                />
            ) : (
                <>
                    <h1 className="cancel-title">주문취소</h1>
                    
                    <div className="progress-steps">
                        <div className="step completed">1 상품 선택</div>
                        <div className="step active">2 사유 선택</div>
                        <div className="step">3 환불정보 확인</div>
                    </div>
                    
                    <div className="reason-selection">
                        <h2 className="section-title">취소 사유를 선택해주세요</h2>
                        
                        <div className="reason-list">
                            {reasons.map((reason, index) => (
                                <div 
                                    key={index}
                                    className={`reason-item ${selectedReason === index ? 'selected' : ''}`}
                                    onClick={() => handleReasonSelect(index)}
                                >
                                    <div className="radio-circle">
                                        {selectedReason === index && <div className="radio-inner"></div>}
                                    </div>
                                    <span className='reason-span'>{reason}</span>
                                </div>
                            ))}
                        </div>
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
                                    <p className="cancelOrder-product-price">가격: {product.price.toLocaleString()} 원</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="button-group">
                        <button className="prev-button" onClick={() => setCancelReason(false)}>{"< 이전 단계"}</button>
                        <button className="next-button" disabled={selectedReason === null} onClick={handleNextStep}>다음 단계</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CancelReason;