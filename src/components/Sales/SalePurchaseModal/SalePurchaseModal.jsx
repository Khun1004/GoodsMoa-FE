import { useContext, useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useLocation, useNavigate } from 'react-router-dom';
import OrderPayment from '../../../api/OrderPayment';
import { LoginContext } from "../../../contexts/LoginContext";
import "./SalePurchaseModal.css";

export default function SalePurchaseModal() {
    const location = useLocation();
    const [selectedDelivery, setSelectedDelivery] = useState("");
    const [refundBank, setRefundBank] = useState("");
    const [refundAccount, setRefundAccount] = useState("");
    const [sameAsOrderer, setSameAsOrderer] = useState(false);
    const { userInfo } = useContext(LoginContext);

    const [formData, setFormData] = useState({
        ordererName: userInfo?.nickname || "", // 닉네임을 주문자 이름으로 사용
        ordererEmail: userInfo?.email || "",
        ordererPhone: userInfo?.phoneNumber || "",
        recipient_name: "",
        phone_number: "",
        zipCode: "",
        mainAddress: "",
        detailedAddress: "",
        deliveryMemo: "",
    });

    const navigate = useNavigate();
    const wantedProducts = location.state?.wantedProducts || [];
    const shippingMethods = location.state?.shippingMethods || [];
    const saleLabel = location.state?.saleLabel || "";

    useEffect(() => {
        if (userInfo) {
            setFormData(prev => ({
                ...prev,
                ordererName: userInfo.nickname || "",
                ordererEmail: userInfo.email || "",
                ordererPhone: userInfo.phoneNumber || ""
            }));
        }
    }, [userInfo]);

    useEffect(() => {
        if (location.state?.formData?.selectedDelivery) {
            setSelectedDelivery(location.state.formData.selectedDelivery);
        }
    }, [location.state]);

    const handleSameAsOrderer = () => {
        setSameAsOrderer(!sameAsOrderer);
        if (!sameAsOrderer) {
            setFormData(prevData => ({
                ...prevData,
                recipient_name: prevData.ordererName,
                phone_number: prevData.ordererPhone,
            }));
        } else {
            setFormData(prevData => ({
                ...prevData,
                recipient_name: "",
                phone_number: "",
            }));
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleFindZipCode = () => {
        window.daum.postcode.load(() => {
            new window.daum.Postcode({
                oncomplete: function(data) {
                    setFormData(prev => ({
                        ...prev,
                        zipCode: data.zonecode,
                        mainAddress: data.address,
                    }));
                    document.querySelector('input[name="detailedAddress"]').focus();
                }
            }).open();
        });
    };

    // 총 상품 금액
    const calculateTotalProductPrice = () => {
        return wantedProducts.reduce((acc, product) => acc + (product.price * product.quantity), 0);
    };

    // 해당 택배의 배송비
    const getDeliveryCost = () => {
        // shippingMethods가 있고 선택된 배송 방법이 있으면 해당 방법의 가격 반환
        if (selectedDelivery && shippingMethods.length > 0) {
            const selectedMethod = shippingMethods.find(m => m.name === selectedDelivery);
            return selectedMethod ? Number(selectedMethod.price) : 0;
        }
        return 0;
    };

    const safetyPaymentFee = 2400;
    // 총 상품 금액
    const totalProductPrice = calculateTotalProductPrice();
    // 총 배송비 금액
    const deliveryCost = getDeliveryCost();
    // 총 결제 금액
    const totalAmount = totalProductPrice + deliveryCost;

    const validateBeforePayment = () => {
        if (!userInfo?.id) {
            alert('로그인 정보가 없습니다. 다시 로그인해주세요.');
            navigate('/login');
            return false;
        }
        if (wantedProducts.some(p => !p.postId)) {
            alert('일부 상품 정보가 불완전합니다. 장바구니를 확인해주세요.');
            return false;
        }
        return true;
    };

    // 결제 할 때 사용하는 메서드
    const handlePurchase = async () => {
        try {
            // 필수 필드 검증
            if (!formData.ordererName || !formData.ordererEmail || !formData.ordererPhone) {
                alert('주문자 정보를 모두 입력해주세요.');
                return;
            }
            if (wantedProducts.some(p => !p.id || !p.postId)) {
                alert('일부 상품 정보가 불완전합니다. 장바구니를 다시 확인해주세요.');
                return;
            }
            if (!formData.recipient_name || !formData.phone_number || !formData.zipCode || !formData.mainAddress) {
                alert('배송지 정보를 모두 입력해주세요.');
                return;
            }
            if (!selectedDelivery) {
                alert('배송 방식을 선택해주세요.');
                return;
            }
            if (!refundBank || !refundAccount) {
                alert('환불 계좌 정보를 입력해주세요.');
                return;
            }

            if (formData.ordererName !== userInfo?.nickname) {
                alert('주문자 이름은 로그인한 사용자의 닉네임과 일치해야 합니다.');
                return;
            }

            if (!validateBeforePayment()) return;

            if (!userInfo?.id) {
                alert('로그인 정보가 없습니다. 다시 로그인해주세요.');
                navigate('/login');
                return;
            }
    
            const orderPayment = new OrderPayment(userInfo, shippingMethods);

            console.log('wantedProducts: ',wantedProducts);

            const paymentResult = await orderPayment.processPayment(
                wantedProducts,
                formData,
                selectedDelivery,
                refundBank,
                refundAccount,
                totalAmount
            );
            console.log('paymentResult.orderId ::: ',paymentResult.orderId);
            if (!paymentResult.success) {
                if (paymentResult.userError) {
                    navigate('/login');
                    return;
                }
                if (paymentResult.productError) {
                    // Optionally refresh cart data here
                    navigate('/cart');
                    return;
                }
                alert(paymentResult.error);
                return;
            }
    
            console.log('Payment Result:', paymentResult); // 디버깅 로그
            if (paymentResult.success) {
                if (paymentResult.tossPayment && paymentResult.tossPayment.checkoutUrl) {
                    window.location.href = paymentResult.tossPayment.checkoutUrl;
                } else {
                    const purchaseData = {
                        id: new Date().getTime(),
                        products: wantedProducts.map(product => ({
                            ...product,
                            category: product.category || "미정",
                            price: product.price,
                            quantity: product.quantity,
                        })),
                        formData: formData,
                        selectedDelivery: selectedDelivery,
                        shippingMethods: shippingMethods,
                        refundBank: refundBank,
                        refundAccount: refundAccount,
                        paymentDate: new Date().toISOString().split("T")[0],
                        status: "상품 준비 중",
                        saleLabel: saleLabel,
                        category: wantedProducts[0]?.category || "미정",
                        totalAmount: totalAmount,
                        orderId: paymentResult.orderId,
                    };
    
                    navigate("/salePurchaseCheck", { state: { purchaseData } });
                }
            } else {
                alert(`결제 처리 실패: ${paymentResult.error}`);
            }
        } catch (error) {
            console.error("결제 처리 중 오류 발생:", error);
            if (error.message.includes('401')) {
                alert('세션이 만료되었습니다. 다시 로그인해주세요.');
                navigate('/login');
            } else {
                alert("결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
            }
        }
    };
    

    return (
        <div className="container">
            <button className="back-button" onClick={() => navigate(-1)}>
                <IoIosArrowBack />
            </button>

            <h1 className="mainPayPage">결제 페이지</h1>
            
            <div className='purchase-products'>
                {wantedProducts.length > 0 ? (
                    wantedProducts.map((product, index) => (
                        <div key={index} className='purchase-product'>
                            <div className="purchaseimage-container">
                                <img src={product.image} alt={product.name} className="purchase-image" />
                                <div className="purchase-labelProduct">
                                    {saleLabel} <span className="separator"> &gt; </span> {product.name} 
                                    <span className="separator"> &gt; </span> {product.category || "미정"}
                                </div>
                            </div>
                            <div className="purchase-info">
                                <p className="purchase-name">{product.name}</p>
                                <p className="purchase-price">{(product.price * product.quantity).toLocaleString()} 원</p>
                                <p className="purchase-quantity">수량: {product.quantity}개</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>선택한 상품이 없습니다.</p>
                )}
            </div>

            <div className="purchaseModal">
                <div className="modal-content-left">
                    <h3>주문자 정보 <span className="required">*</span></h3>
                    <input type="text" name="ordererName" placeholder="주문자명" className="input-field" value={formData.ordererName} onChange={handleChange} readOnly/>
                    <input type="email" name="ordererEmail" placeholder="주문자이메일" className="input-field" value={formData.ordererEmail} onChange={handleChange} />
                    <input type="tel" name="ordererPhone" placeholder="주문자 핸드폰번호" className="input-field" value={formData.ordererPhone} onChange={handleChange} />

                    <h3>배송지 정보 <span className="required">*</span></h3>
                    <label className="checkbox-label">
                        <input type="checkbox" checked={sameAsOrderer} onChange={handleSameAsOrderer} />
                        <span>주문자 정보와 동일</span>
                    </label>
                    <input type="text" name="recipientName" placeholder="수령자명" className="input-field" value={formData.recipient_name} onChange={handleChange} />
                    <input type="tel" name="recipientPhone" placeholder="연락처" className="input-field" value={formData.phone_number} onChange={handleChange} />

                    <div className="zip-code-container">
                        <input type="text" name="zipCode" placeholder="우편번호" className="input-field zip-code" value={formData.zipCode} onChange={handleChange} />
                        <button className="find-zip" onClick={handleFindZipCode}>우편번호 찾기</button>
                    </div>
                    <input type="text" name="address" placeholder="주소" className="input-field" value={formData.mainAddress} onChange={handleChange} />
                    <input type="text" name="detailedAddress" placeholder="상세주소" className="input-field" value={formData.detailedAddress} onChange={handleChange} />
                    <textarea name="deliveryMemo" placeholder="배송 메모" className="input-field memo-field" value={formData.deliveryMemo} onChange={handleChange}></textarea>
                </div>

                <div className="modal-content-right">
                    <div className="payment-summary">
                        <div className="payment-item">
                            <span>총 상품 금액</span>
                            <span>{totalProductPrice.toLocaleString()} 원</span>
                        </div>
                        <div className="payment-item">
                            <span>배송비</span>
                            <span>{deliveryCost.toLocaleString()} 원</span>
                        </div>
                        <div className="total-payment">
                            <span>총 결제 금액</span>
                            <span className="highlight">{totalAmount.toLocaleString()} 원</span>
                        </div>
                    </div>

                    {shippingMethods.length > 0 && (
                        <div className="delivery-method">
                            <h4>배송 방식 선택 <span className="required">*</span></h4>
                            <div className="delivery-options">
                                {shippingMethods.map((method, index) => (
                                    <label key={index}>
                                        <input 
                                            type="radio" 
                                            name="delivery" 
                                            value={method.name} 
                                            checked={selectedDelivery === method.name} 
                                            onChange={() => setSelectedDelivery(method.name)} 
                                        />
                                        {method.name} ({Number(method.price).toLocaleString()}원)
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="refund-account">
                        <h4>환불 계좌 (물건을 보낼 수 없을 경우)<span className="required">*</span></h4>
                        <div className="refund-inputs">
                            <select value={refundBank} onChange={(e) => setRefundBank(e.target.value)}>
                                <option value="">은행선택</option>
                                <option value="kakao">카카오뱅크</option>
                                <option value="shinhan">신한은행</option>
                                <option value="woori">우리은행</option>
                            </select>
                            <input type="text" placeholder="계좌 번호" value={refundAccount} onChange={(e) => setRefundAccount(e.target.value)} />
                        </div>
                    </div>

                    <button className="confirm-payment" onClick={handlePurchase}>결제하기</button>
                </div>
            </div>
        </div>
    );
}