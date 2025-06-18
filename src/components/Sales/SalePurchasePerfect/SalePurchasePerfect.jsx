import { useEffect, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import { useLocation, useNavigate } from 'react-router-dom';
import "./SalePurchasePerfect.css";

export default function SalePurchasePerfect() {
    const location = useLocation();
    const navigate = useNavigate();
    const orderInfo = location.state?.orderInfo;

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('orderInfo ::: ',orderInfo);
        if (!orderInfo) {
            navigate("/"); // orderInfo가 없으면 홈으로 돌려보냄
        }

        const timer = setTimeout(() => {
            setLoading(false);
        }, 800);

        return () => clearTimeout(timer);
    }, [orderInfo, navigate]);

    const handleGoToHome = () => {
        navigate("/");
    };

    const handleViewOrder = () => {
        navigate("/mypage?page=purchaseHistory")
    };


    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}년 ${month}월 ${day}일`;
    };

    if (loading || !orderInfo) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>결제 완료 중...</p>
            </div>
        );
    }

    return (
        <div className="purchase-perfect-container">
            <button className="back-button" onClick={handleGoToHome}>
                <IoIosArrowBack />
            </button>

            <div className="purchase-perfect-content">
                <div className="success-animation">
                    <FaCheckCircle className="check-icon" />
                    <div className="success-rings">
                        <div className="success-ring ring1"></div>
                        <div className="success-ring ring2"></div>
                    </div>
                </div>

                <h1 className="perfect-title">결제 완료</h1>
                <p className="perfect-message">
                    주문이 성공적으로 완료되었습니다.<br />
                    주문내역은 마이페이지에서 확인하실 수 있습니다.
                </p>

                <div className="order-summary">
                    <h3>주문 정보</h3>
                    <div className="summary-item">
                        <span className="salePurchasePerfectSpan">주문 번호</span>
                        <span className="salePurchasePerfectSpan">#{orderInfo.id}</span>
                    </div>
                    <div className="summary-item">
                        <span className="salePurchasePerfectSpan">주문자</span>
                        <span className="salePurchasePerfectSpan">{orderInfo.userName}</span>
                    </div>
                    <div className="summary-item">
                        <span className="salePurchasePerfectSpan">결제 일시</span>
                        <span className="salePurchasePerfectSpan">
                            {formatDate(orderInfo.paidAt)}
                        </span>
                    </div>
                    <div className="summary-item">
                        <span className="salePurchasePerfectSpan">배송 방법</span>
                        <span className="salePurchasePerfectSpan">
                            {orderInfo.selectedDelivery?.name || "기본 배송"}
                        </span>
                    </div>
                    <div className="summary-item">
                        <span className="salePurchasePerfectSpan">배송지</span>
                        <span className="salePurchasePerfectSpan">
                            {orderInfo.mainAddress || "주소 정보 없음"}
                        </span>
                    </div>
                    <div className="summary-item">
                        <span className="salePurchasePerfectSpan">결제 금액</span>
                        <span className="highlight">{orderInfo.totalPrice.toLocaleString()}원</span>
                    </div>
                </div>

                {/* 주문 상품 리스트가 있다면 출력 */}
                {orderInfo.products && Array.isArray(orderInfo.products) && (
                    <div className="product-list">
                        <h3>주문 상품 ({orderInfo.products.length})</h3>
                        {orderInfo.products.map((product, index) => (
                            <div className="product-item" key={index}>
                                {product.image && (
                                    <img src={product.image} alt={product.name} className="product-thumbnail" />
                                )}
                                <div className="product-details">
                                    <p className="product-name">{product.name}</p>
                                    <p className="product-info">
                                        {product.quantity}개 · {(product.price * product.quantity).toLocaleString()}원
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="status-tracker">
                    <div className="status-point active">
                        <div className="status-dot"></div>
                        <span className="salePurchasePerfectSpan">결제 완료</span>
                    </div>
                    <div className="status-line"></div>
                    <div className="status-point">
                        <div className="status-dot"></div>
                        <span className="salePurchasePerfectSpan">상품 준비 중</span>
                    </div>
                    <div className="status-line"></div>
                    <div className="status-point">
                        <div className="status-dot"></div>
                        <span className="salePurchasePerfectSpan">배송 중</span>
                    </div>
                    <div className="status-line"></div>
                    <div className="status-point">
                        <div className="status-dot"></div>
                        <span className="salePurchasePerfectSpan">배송 완료</span>
                    </div>
                </div>

                <div className="button-group">
                    <button className="view-order-button" onClick={handleViewOrder}>
                        주문 내역 보기
                    </button>
                    <button className="home-button" onClick={handleGoToHome}>
                        쇼핑 계속하기
                    </button>
                </div>
            </div>
        </div>
    );
}
