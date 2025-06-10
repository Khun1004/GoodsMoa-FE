import { useEffect, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import { useLocation, useNavigate } from 'react-router-dom';
import "./SalePurchasePerfect.css";

export default function SalePurchasePerfect() {
    const location = useLocation();
    const navigate = useNavigate();
    const [purchaseData, setPurchaseData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get the latest purchase from localStorage
        const purchases = JSON.parse(localStorage.getItem("purchaseHistory")) || [];
        if (purchases.length > 0) {
            // Get the latest purchase (last item in the array)
            const latestPurchase = purchases[purchases.length - 1];
            setPurchaseData(latestPurchase);
        }
        
        // Simulate loading time for better UX
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800);
        
        return () => clearTimeout(timer);
    }, []);

    const handleGoToHome = () => {
        navigate("/");
    };

    const handleViewOrder = () => {
        navigate("/my-orders");
    };

    // Format date to Korean style (YYYY년 MM월 DD일)
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}년 ${month}월 ${day}일`;
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>결제 완료 중...</p>
            </div>
        );
    }

    if (!purchaseData) {
        return (
            <div className="error-container">
                <h2>주문 정보를 찾을 수 없습니다</h2>
                <button className="home-button" onClick={handleGoToHome}>홈으로 돌아가기</button>
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
                        <span className="salePurchasePerfectSpan">#{purchaseData.id}</span>
                    </div>
                    <div className="summary-item">
                        <span className="salePurchasePerfectSpan">주문자</span>
                        <span className="salePurchasePerfectSpan">{purchaseData.ordererName}</span>
                    </div>
                    <div className="summary-item">
                        <span className="salePurchasePerfectSpan">결제 일시</span>
                        <span className="salePurchasePerfectSpan">{formatDate(purchaseData.paymentDate)}</span>
                    </div>
                    <div className="summary-item">
                        <span className="salePurchasePerfectSpan">결제 금액</span>
                        <span className="highlight">{purchaseData.totalAmount.toLocaleString()}원</span>
                    </div>
                </div>
                
                <div className="product-list">
                    <h3>주문 상품 ({purchaseData.products.length})</h3>
                    {purchaseData.products.map((product, index) => (
                        <div className="product-item" key={index}>
                            {product.image && <img src={product.image} alt={product.name} className="product-thumbnail" />}
                            <div className="product-details">
                                <p className="product-name">{product.name}</p>
                                <p className="product-info">{product.quantity}개 · {(product.price * product.quantity).toLocaleString()}원</p>
                            </div>
                        </div>
                    ))}
                </div>
                
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
                    <button className="view-order-button" onClick={handleViewOrder}>주문 내역 보기</button>
                    <button className="home-button" onClick={handleGoToHome}>쇼핑 계속하기</button>
                </div>
            </div>
        </div>
    );
}