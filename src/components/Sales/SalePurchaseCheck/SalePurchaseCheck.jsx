import { useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import './SalePurchaseCheck.css';

const SalePurchaseCheck = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedPayment, setSelectedPayment] = useState('toss');
    const [agreeTerms, setAgreeTerms] = useState(false);
    
    // Get data passed from SalePurchaseModal
    const purchaseData = location.state?.purchaseData || {};
    const formData = purchaseData.formData || {};
    const wantedProducts = purchaseData.products || [];
    const selectedDelivery = purchaseData.selectedDelivery || "";
    const refundBank = purchaseData.refundBank || "";
    const refundAccount = purchaseData.refundAccount || "";
    
    // Calculate prices
    const calculateTotalProductPrice = () => {
        return wantedProducts.reduce((acc, product) => acc + (product.price * product.quantity), 0);
    };

    const getDeliveryCost = () => {
        switch (selectedDelivery) {
            case "GS25": return 4000;
            case "CU": return 2500;
            case "Post": return 4000;
            case "CJ": return 3500;
            default: return 3500; // default delivery cost
        }
    };

    const safetyPaymentFee = 2400;
    const totalProductPrice = calculateTotalProductPrice();
    const deliveryCost = getDeliveryCost();
    const totalAmount = totalProductPrice + deliveryCost + safetyPaymentFee;

    const handlePayment = () => {
        if (!agreeTerms) return;
        
        // Create a purchase object to save
        const purchase = {
            id: Date.now().toString(),
            ordererName: formData.ordererName,
            paymentDate: new Date().toISOString(),
            totalAmount,
            products: wantedProducts,
            deliveryInfo: {
                recipientName: formData.recipientName,
                recipientPhone: formData.recipientPhone,
                address: `${formData.zipCode} ${formData.address} ${formData.detailAddress}`,
                deliveryMethod: selectedDelivery,
                deliveryMemo: formData.deliveryMemo || ""
            },
            paymentMethod: selectedPayment,
            refundAccount: {
                bank: refundBank,
                account: refundAccount
            }
        };

        // Save to localStorage
        const purchases = JSON.parse(localStorage.getItem("purchaseHistory")) || [];
        purchases.push(purchase);
        localStorage.setItem("purchaseHistory", JSON.stringify(purchases));

        // Navigate to success page
        navigate("/salePurchasePerfect", { state: { purchaseData: purchase } });
    };

    return (
        <div className="container">
            <div className="salePurchaseCheck-content">
                {/* 결제하기 헤더 */}
                <div className="salePurchaseCheck-header">
                    <h1 className="salePurchaseCheck-header-title">결제하기</h1>
                </div>

                {/* 주문자 정보 */}
                <div className="salePurchaseCheck-section">
                    <h3 className="salePurchaseCheck-section-title">주문자 정보</h3>
                    <div className="salePurchaseCheck-info-grid">
                        <div className="salePurchaseCheck-info-item">
                            <span className="salePurchaseCheck-info-label">주문자명</span>
                            <span className="salePurchaseCheck-info-value">{formData.ordererName}</span>
                        </div>
                        <div className="salePurchaseCheck-info-item">
                            <span className="salePurchaseCheck-info-label">이메일</span>
                            <span className="salePurchaseCheck-info-value">{formData.ordererEmail}</span>
                        </div>
                        <div className="salePurchaseCheck-info-item">
                            <span className="salePurchaseCheck-info-label">핸드폰번호</span>
                            <span className="salePurchaseCheck-info-value">{formData.ordererPhone}</span>
                        </div>
                    </div>
                </div>

                {/* 배송지 정보 */}
                <div className="salePurchaseCheck-section">
                    <h3 className="salePurchaseCheck-section-title">배송지 정보</h3>
                    <div className="salePurchaseCheck-info-grid">
                        <div className="salePurchaseCheck-info-item">
                            <span className="salePurchaseCheck-info-label">수령자명</span>
                            <span className="salePurchaseCheck-info-value">{formData.recipientName}</span>
                        </div>
                        <div className="salePurchaseCheck-info-item">
                            <span className="salePurchaseCheck-info-label">연락처</span>
                            <span className="salePurchaseCheck-info-value">{formData.recipientPhone}</span>
                        </div>
                        <div className="salePurchaseCheck-info-item full-width">
                            <span className="salePurchaseCheck-info-label">주소</span>
                            <span className="salePurchaseCheck-info-value">
                                ({formData.zipCode}) {formData.address} {formData.detailAddress}
                            </span>
                        </div>
                        {formData.deliveryMemo && (
                            <div className="salePurchaseCheck-info-item full-width">
                                <span className="salePurchaseCheck-info-label">배송 메모</span>
                                <span className="salePurchaseCheck-info-value">{formData.deliveryMemo}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 상품 정보 */}
                <div className="salePurchaseCheck-section">
                    <h3 className="salePurchaseCheck-section-title">상품 정보</h3>
                    {wantedProducts.map((product, index) => (
                        <div key={index} className="salePurchaseCheck-product-item">
                            <div className="salePurchaseCheck-product-image-container">
                                <img src={product.image} alt={product.name} className="salePurchaseCheck-product-image" />
                            </div>
                            <div className="salePurchaseCheck-product-details">
                                <p className="salePurchaseCheck-product-name">{product.name}</p>
                                <p className="salePurchaseCheck-product-category">{product.category || "미정"}</p>
                                <div className="salePurchaseCheck-product-price-info">
                                    <span className="salePurchaseCheck-product-quantity">수량: {product.quantity}개</span>
                                    <span className="salePurchaseCheck-product-price">{(product.price * product.quantity).toLocaleString()}원</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 배송 방법 */}
                {selectedDelivery && (
                    <div className="salePurchaseCheck-section">
                        <h3 className="salePurchaseCheck-section-title">배송 방법</h3>
                        <div className="salePurchaseCheck-delivery-method">
                            {selectedDelivery === "GS25" && "GS25 택배 (4,000원)"}
                            {selectedDelivery === "CU" && "CU 택배 (2,500원)"}
                            {selectedDelivery === "Post" && "우체국 택배 (4,000원)"}
                            {selectedDelivery === "CJ" && "CJ 택배 (3,500원)"}
                        </div>
                    </div>
                )}

                {/* 환불 계좌 */}
                <div className="salePurchaseCheck-section">
                    <h3 className="salePurchaseCheck-section-title">환불 계좌</h3>
                    <div className="salePurchaseCheck-refund-account">
                        {refundBank && (
                            <>
                                <span className="salePurchaseCheck-refund-bank">
                                    {refundBank === "kakao" && "카카오뱅크"}
                                    {refundBank === "shinhan" && "신한은행"}
                                    {refundBank === "woori" && "우리은행"}
                                </span>
                                <span className="salePurchaseCheck-refund-account-number">{refundAccount}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* 결제 방법 */}
                <div className="salePurchaseCheck-section">
                    <h3 className="salePurchaseCheck-section-title">결제 방법</h3>
                    <div className="salePurchaseCheck-payment-methods">
                        <div className="salePurchaseCheck-payment-option">
                            <input
                                type="radio"
                                id="toss"
                                name="payment"
                                value="toss"
                                checked={selectedPayment === 'toss'}
                                onChange={(e) => setSelectedPayment(e.target.value)}
                                className="salePurchaseCheck-payment-input"
                            />
                            <label htmlFor="toss" className={`salePurchaseCheck-payment-label ${selectedPayment === 'toss' ? 'payment-label-checked' : ''}`}>
                                <div className="salePurchaseCheck-payment-icon salePurchaseCheck-toss-icon">
                                    <span>💙</span>
                                </div>
                                <span className="salePurchaseCheck-payment-text">toss pay</span>
                            </label>
                        </div>

                        <div className="salePurchaseCheck-payment-option">
                            <input
                                type="radio"
                                id="kakao"
                                name="payment"
                                value="kakao"
                                checked={selectedPayment === 'kakao'}
                                onChange={(e) => setSelectedPayment(e.target.value)}
                                className="salePurchaseCheck-payment-input"
                            />
                            <label htmlFor="kakao" className={`salePurchaseCheck-payment-label ${selectedPayment === 'kakao' ? 'payment-label-checked' : ''}`}>
                                <div className="salePurchaseCheck-payment-icon salePurchaseCheck-kakao-icon">
                                    <span>💛</span>
                                </div>
                                <span className="salePurchaseCheck-payment-text">카카오 페이</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* 결제 금액 요약 */}
                <div className="salePurchaseCheck-section">
                    <h3 className="salePurchaseCheck-section-title">결제 금액</h3>
                    <div className="salePurchaseCheck-payment-summary">
                        <div className="salePurchaseCheck-price-row">
                            <span className="salePurchaseCheck-price-label">총 상품 금액</span>
                            <span className="salePurchaseCheck-price-value">{totalProductPrice.toLocaleString()}원</span>
                        </div>
                        <div className="salePurchaseCheck-price-row">
                            <span className="salePurchaseCheck-price-label">배송비</span>
                            <span className="salePurchaseCheck-price-value">{deliveryCost.toLocaleString()}원</span>
                        </div>
                        <div className="salePurchaseCheck-price-row">
                            <span className="salePurchaseCheck-price-label">안전결제 수수료</span>
                            <span className="salePurchaseCheck-price-value">{safetyPaymentFee.toLocaleString()}원</span>
                        </div>
                        <div className="salePurchaseCheck-price-row-total">
                            <span className="salePurchaseCheck-price-label-total">총 결제 금액</span>
                            <span className="salePurchaseCheck-price-value-total">{totalAmount.toLocaleString()}원</span>
                        </div>
                    </div>
                </div>

                {/* 약관 동의 */}
                <div className="salePurchaseCheck-terms-section">
                    <div className="salePurchaseCheck-terms-item">
                        <input
                            type="checkbox"
                            id="agree-all"
                            checked={agreeTerms}
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                            className="salePurchaseCheck-terms-checkbox"
                        />
                        <label htmlFor="agree-all" className="salePurchaseCheck-terms-label">아래 내용에 전체 동의합니다.</label>
                    </div>
                    
                    <div className="salePurchaseCheck-terms-details">
                        <div className="salePurchaseCheck-terms-detail">
                            <span>주문내용 서비스 이용약관 동의(필수)</span>
                            <button className="salePurchaseCheck-detail-btn">자세히</button>
                        </div>
                        <div className="salePurchaseCheck-terms-detail">
                            <span>개인정보 수집 이용 동의(필수)</span>
                            <button className="salePurchaseCheck-detail-btn">자세히</button>
                        </div>
                        <div className="salePurchaseCheck-terms-detail">
                            <span>개인정보 제3자 제공 동의(필수)</span>
                            <button className="salePurchaseCheck-detail-btn">자세히</button>
                        </div>
                    </div>
                </div>

                {/* 결제 버튼 */}
                <button 
                className={`salePurchaseCheck-payment-button ${!agreeTerms ? 'salePurchaseCheck-payment-button-disabled' : ''}`}
                    disabled={!agreeTerms}
                    onClick={handlePayment}
                >
                    {totalAmount.toLocaleString()}원 결제하기
                </button>
            </div>
        </div>
    );
};

export default SalePurchaseCheck;