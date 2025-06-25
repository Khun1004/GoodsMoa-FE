import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OrderSaleDetail from "../../../api/OrderSaleDetail";
// import TossPayments from "tosspayments";
import "./SalePurchaseCheck.css";

export function SalePurchaseCheck() {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedPayment, setSelectedPayment] = useState("toss");
    const [agreeTerms, setAgreeTerms] = useState(false);
    const purchaseData = location.state?.purchaseData || {};
    const orderId = purchaseData.orderId || null;
    const formData = purchaseData.formData || {};
    const wantedProducts = purchaseData.products || [];
    const refundBank = purchaseData.refundBank || "";
    const refundAccount = purchaseData.refundAccount || "";
    const selectedDelivery = purchaseData.selectedDelivery || null;
    const shippingMethods = purchaseData.shippingMethods || [];

    const calculateTotalProductPrice = () => {
        return wantedProducts.reduce((acc, product) => acc + product.price * product.quantity, 0);
    };

    useEffect(() => {
        console.log('purchaseData : ', purchaseData);
        console.log('formData : ', formData);
        console.log('wantedProducts : ', wantedProducts);
        console.log('selectedDelivery : ', selectedDelivery);
        console.log('refundBank : ', refundBank);
        console.log('refundAccount : ', refundAccount);
        console.log('shippingMethods : ', shippingMethods);
    }, []);

    const getDeliveryDisplay = () => {
        if (!purchaseData.selectedDelivery) return "배송 방법 미선택";
        
        // 선택한 배송 방법 이름으로 실제 배송 방법 객체 찾기
        const deliveryMethod = purchaseData.shippingMethods.find(
            method => method.name === purchaseData.selectedDelivery
        );
        
        if (deliveryMethod) {
            return `${deliveryMethod.name} (${Number(deliveryMethod.price).toLocaleString()}원)`;
        }
        return "배송 방법 미선택";
    };
    
    // 배송비 계산 로직
    const getDeliveryCost = () => {
        if (!purchaseData.selectedDelivery) return 0;
        
        const deliveryMethod = purchaseData.shippingMethods.find(
            method => method.name === purchaseData.selectedDelivery
        );
        return deliveryMethod ? Number(deliveryMethod.price) : 0;
    };

    const totalProductPrice = calculateTotalProductPrice();
    const deliveryCost = getDeliveryCost();
    const totalAmount = totalProductPrice + deliveryCost;

    const handlePayment = async () => {
        if (!agreeTerms) {
            alert("결제 약관에 동의해주세요.");
            return;
        }
    
        if (!orderId) {
            alert("유효하지 않은 주문입니다. 다시 시도해주세요.");
            return;
        }
    
        if (typeof window.TossPayments !== 'function') {
            alert("결제 모듈이 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.");
            return;
        }
    
        try {
            const response = await OrderSaleDetail.requestTossPayment({ orderId });
    
            // Create complete order data with more details
            const completeOrderData = {
                id: new Date().getTime(),
                orderId: orderId,
                products: wantedProducts.map(product => ({
                    ...product,
                    totalPrice: product.price * product.quantity
                })),
                formData: formData,
                selectedDelivery: selectedDelivery,
                refundBank: refundBank,
                refundAccount: refundAccount,
                paymentDate: new Date().toISOString(),
                status: "상품 준비 중",
                saleLabel: purchaseData.saleLabel,
                category: wantedProducts[0]?.category || "미정",
                totalPrice: totalAmount,
                ordererName: formData.ordererName,
                ordererPhone: formData.ordererPhone,
                ordererEmail: formData.ordererEmail,
                paidAt: new Date().toISOString(),
                userName: formData.ordererName,
                shipping: {
                    name: formData.recipient_name,
                    phone: formData.phone_number,
                    address: `${formData.zipCode} ${formData.mainAddress} ${formData.detailedAddress || ''}`,
                    memo: formData.deliveryMemo
                },
                deliveryFee: deliveryCost,  // 배송비 명시적으로 포함
                tracking: {
                    number: "",
                    company: ""
                }
            };
    
            // Save to localStorage for PurchaseHistory
            const existingPurchases = JSON.parse(localStorage.getItem("purchaseHistory")) || [];
            const updatedPurchases = [...existingPurchases, completeOrderData];
            localStorage.setItem("purchaseHistory", JSON.stringify(updatedPurchases));
    
            const tossPayments = window.TossPayments("test_ck_AQ92ymxN342Zya29jK2KrajRKXvd");
    
            await tossPayments.requestPayment("카드", {
                amount: response.amount,
                orderId: response.orderCode,
                orderName: response.orderName,
                customerName: response.customerName,
                successUrl: `http://localhost:5177/payment/success`,
                failUrl: `http://localhost:5177/payment/fail`,
            });
    
            // Navigate to success page with order data
            navigate('/payment/success', {
                state: {
                    orderInfo: completeOrderData
                }
            });
    
        } catch (error) {
            console.error("Payment error:", error);
            alert("결제 요청 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
    };

    return (
        <div className="container">
            <div className="salePurchaseCheck-content">
                <div className="salePurchaseCheck-header">
                    <h1 className="salePurchaseCheck-header-title">결제 화면</h1>
                </div>

                <div className="salePurchaseCheck-section">
                    <h3 className="salePurchaseCheck-section-title">주문자 정보</h3>
                    <div className="salePurchaseCheck-info-grid">
                        <div className="salePurchaseCheck-info-item">
                            <span className="salePurchaseCheck-info-label">주문자명</span>
                            <span className="salePurchaseCheck-info-value">{formData.ordererName || "미입력"}</span>
                        </div>
                        <div className="salePurchaseCheck-info-item">
                            <span className="salePurchaseCheck-info-label">이메일</span>
                            <span className="salePurchaseCheck-info-value">{formData.ordererEmail || "미입력"}</span>
                        </div>
                        <div className="salePurchaseCheck-info-item">
                            <span className="salePurchaseCheck-info-label">핸드폰번호</span>
                            <span className="salePurchaseCheck-info-value">{formData.ordererPhone || "미입력"}</span>
                        </div>
                    </div>
                </div>

                <div className="salePurchaseCheck-section">
                    <h3 className="salePurchaseCheck-section-title">배송지 정보</h3>
                    <div className="salePurchaseCheck-info-grid">
                        <div className="salePurchaseCheck-info-item">
                            <span className="salePurchaseCheck-info-label">수령자명</span>
                            <span className="salePurchaseCheck-info-value">{formData.recipient_name || "미입력"}</span>
                        </div>
                        <div className="salePurchaseCheck-info-item">
                            <span className="salePurchaseCheck-info-label">연락처</span>
                            <span className="salePurchaseCheck-info-value">{formData.phone_number || "미입력"}</span>
                        </div>
                        <div className="salePurchaseCheck-info-item full-width">
                            <span className="salePurchaseCheck-info-label">주소</span>
                            <span className="salePurchaseCheck-info-value">
                                {formData.zipCode
                                    ? `(${formData.zipCode}) ${formData.mainAddress} , ${formData.detailedAddress || ""}`
                                    : "미입력"}
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

                <div className="salePurchaseCheck-section">
                    <h3 className="salePurchaseCheck-section-title">상품 정보</h3>
                    {wantedProducts.map((product, index) => (
                        <div key={index} className="salePurchaseCheck-product-item">
                            <div className="salePurchaseCheck-product-image-container">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="salePurchaseCheck-product-image"
                                />
                            </div>
                            <div className="salePurchaseCheck-product-details">
                                <p className="salePurchaseCheck-product-name">{product.name}</p>
                                <p className="salePurchaseCheck-product-category">{product.category || "미정"}</p>
                                <p className="salePurchaseCheck-product-quantity">수량: {product.quantity}개</p>
                                <p className="salePurchaseCheck-product-price">
                                    가격: {(product.price * product.quantity).toLocaleString()}원
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="salePurchaseCheck-section">
                    <h3 className="salePurchaseCheck-section-title">배송 방법</h3>
                    <div className="salePurchaseCheck-delivery-method">
                        {getDeliveryDisplay()}
                    </div>
                </div>

                <div className="salePurchaseCheck-section">
                    <h3 className="salePurchaseCheck-section-title">환불 계좌</h3>
                    <div className="salePurchaseCheck-refund-account">
                        {refundBank && refundAccount ? (
                            <>
                                <span className="salePurchaseCheck-refund-bank">
                                    {refundBank === "kakao"
                                        ? "카카오뱅크"
                                        : refundBank === "shinhan"
                                            ? "신한은행"
                                            : refundBank === "woori"
                                                ? "우리은행"
                                                : refundBank}
                                </span>
                                <span className="salePurchaseCheck-refund-account-number">{refundAccount}</span>
                            </>
                        ) : (
                            <span>환불 계좌 정보 미입력</span>
                        )}
                    </div>
                </div>

                <div className="salePurchaseCheck-section">
                    <h3 className="salePurchaseCheck-section-title">결제 방법</h3>
                    <div className="salePurchaseCheck-payment-methods">
                        <div className="salePurchaseCheck-payment-option">
                            <input
                                type="radio"
                                id="toss"
                                name="payment"
                                value="toss"
                                checked={selectedPayment === "toss"}
                                onChange={(e) => setSelectedPayment(e.target.value)}
                                className="salePurchaseCheck-payment-input"
                            />
                            <label
                                htmlFor="toss"
                                className={`salePurchaseCheck-payment-label ${
                                    selectedPayment === "toss" ? "payment-label-checked" : ""
                                }`}
                            >
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
                                checked={selectedPayment === "kakao"}
                                onChange={(e) => setSelectedPayment(e.target.value)}
                                className="salePurchaseCheck-payment-input"
                            />
                            <label
                                htmlFor="kakao"
                                className={`salePurchaseCheck-payment-label ${
                                    selectedPayment === "kakao" ? "payment-label-checked" : ""
                                }`}
                            >
                                <div className="salePurchaseCheck-payment-icon salePurchaseCheck-kakao-icon">
                                    <span>💛</span>
                                </div>
                                <span className="salePurchaseCheck-payment-text">카카오 페이</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="salePurchaseCheck-section">
                    <h3 className="salePurchaseCheck-section-title">결제 금액</h3>
                    <div className="salePurchaseCheck-payment-summary">
                        <div className="salePurchaseCheck-price-row">
                            <span className="salePurchaseCheck-price-label">총 상품 금액</span>
                            <span className="salePurchaseCheck-price-value">
                                {totalProductPrice.toLocaleString()}원
                            </span>
                        </div>
                        <div className="salePurchaseCheck-price-row">
                            <span className="salePurchaseCheck-price-label">배송비</span>
                            <span className="salePurchaseCheck-price-value">{deliveryCost.toLocaleString()}원</span>
                        </div>
                        <div className="salePurchaseCheck-price-row-total">
                            <span className="salePurchaseCheck-price-label-total">총 결제 금액</span>
                            <span className="salePurchaseCheck-price-value-total">
                                {totalAmount.toLocaleString()}원
                            </span>
                        </div>
                    </div>
                </div>

                <div className="salePurchaseCheck-terms-section">
                    <div className="salePurchaseCheck-terms-item">
                        <input
                            type="checkbox"
                            id="agree-all"
                            checked={agreeTerms}
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                            className="salePurchaseCheck-terms-checkbox"
                        />
                        <label htmlFor="agree-all" className="salePurchaseCheck-terms-label">
                            아래 내용에 전체 동의합니다.
                        </label>
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

                <button
                    className={`salePurchaseCheck-payment-button ${!agreeTerms ? "salePurchaseCheck-payment-button-disabled" : ""}`}
                    disabled={!agreeTerms}
                    onClick={handlePayment}
                >
                    {totalAmount.toLocaleString()}원 결제하기
                </button>
            </div>
        </div>
    );
}
export default SalePurchaseCheck;