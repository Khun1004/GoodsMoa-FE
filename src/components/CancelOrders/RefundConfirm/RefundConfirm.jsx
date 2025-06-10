import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RefundConfirm.css';

const RefundConfirm = ({ setRefundConfirm, selectedPurchase, selectedReason }) => {
    const navigate = useNavigate();

    const handleCancelOrder = () => {
        const canceledOrders = JSON.parse(localStorage.getItem("canceledOrders")) || [];
        const purchaseHistory = JSON.parse(localStorage.getItem("purchaseHistory")) || [];
    
        const canceledProducts = selectedPurchase.products.map(product => ({
            id: selectedPurchase.id,
            name: product.name,
            image: product.image,
            quantity: product.quantity,
            price: product.price.toLocaleString(),
        }));
    
        localStorage.setItem("canceledOrders", JSON.stringify([...canceledOrders, ...canceledProducts]));
    
        const updatedPurchaseHistory = purchaseHistory.filter(purchase => purchase.id !== selectedPurchase.id);
        localStorage.setItem("purchaseHistory", JSON.stringify(updatedPurchaseHistory));
    
        alert("주문이 취소되었습니다.");
        navigate("/");
    };

    const reasons = [
        "배송지를 잘못 입력함",
        "상품이 마음에 들지 않음 (단순변심)",
        "다른 상품 추가 후 재주문 예정"
    ];

    const totalPrice = selectedPurchase?.products.reduce((total, product) => total + product.price * product.quantity, 0);

    return (
        <div className="refund-confirm-container">
            <h1 className="cancel-title">주문취소</h1>
            
            <div className="progress-steps">
                <div className="step completed">1 상품 선택</div>
                <div className="step completed">2 사유 선택</div>
                <div className="step active">3 환불정보 확인</div>
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
            
            <div className="selected-reason">
                <h2 className="section-title">선택한 사유</h2>
                <div className="reason-text">{reasons[selectedReason]}</div>
            </div>

            <div className="refund-info">
                <h2 className="section-title">환불 정보를 확인해주세요</h2>
                
                <div className="refund-guide">
                    <h3 className="sub-title">환불안내</h3>
                    <div className="refund-detail">
                        <div className="detail-row">
                            <span className='refund-span'>상품금액</span>
                            <span className="amount">{totalPrice.toLocaleString()} 원</span>
                        </div>
                        <div className="detail-row">
                            <span className='refund-span'>배송비</span>
                            <span className="amount">0 원</span>
                        </div>
                        <div className="detail-row">
                            <span className='refund-span'>반품비</span>
                            <span className="amount">0 원</span>
                        </div>
                    </div>
                </div>
                
                <div className="expected-refund">
                    <div className="expected-row">
                        <span className='refund-span'>환불 예상금액</span>
                        <span className="total-amount">{totalPrice.toLocaleString()} 원</span>
                    </div>
                </div>
                
                <div className="payment-method">
                    <div className="method-row">
                        <span className='refund-span'>환불 수단</span>
                        <span className='refund-span'>하나카드 / 일시불</span>
                    </div>
                    <div className="amount-row">
                        <span className="total-amount">{totalPrice.toLocaleString()} 원</span>
                    </div>
                </div>
                
                <div className="refund-notice">
                    <p>캐시 적립 혜택 한도 및 할인쿠폰은 환불요청 완료 후 복구됩니다. (복구에 시간이 소요될 수 있습니다.)</p>
                </div>
            </div>
            
            <div className="button-group">
                <button className="prev-button" onClick={() => setRefundConfirm(false)}>{"< 이전 단계"}</button>
                <button className="confirm-button" onClick={handleCancelOrder}>주문 취소하기</button>
            </div>
        </div>
    );
};

export default RefundConfirm;
