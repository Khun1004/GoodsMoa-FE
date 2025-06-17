import { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useLocation, useNavigate } from 'react-router-dom';
import "./MyOrders.css";

export default function MyOrders() {
    const location = useLocation();
    const navigate = useNavigate();
    const orderInfo = location.state?.orderInfo;
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        // orderInfo가 있으면 임시로 orders에 추가 (실제로는 API에서 가져옴)
        if (orderInfo) {
            setOrders([orderInfo]);
        } else {
            // 여기서 실제로는 API 호출로 주문 목록을 가져옵니다.
            // 임시 데이터
            setOrders([
                {
                    id: "ORD12345",
                    userName: "홍길동",
                    paidAt: new Date().toISOString(),
                    totalPrice: 45000,
                    status: "배송중",
                    products: [
                        {
                            name: "프리미엄 스마트폰 케이스",
                            price: 15000,
                            quantity: 2,
                            image: "https://via.placeholder.com/80"
                        },
                        {
                            name: "무선 이어폰",
                            price: 15000,
                            quantity: 1,
                            image: "https://via.placeholder.com/80"
                        }
                    ]
                },
                {
                    id: "ORD67890",
                    userName: "홍길동",
                    paidAt: new Date(Date.now() - 86400000 * 3).toISOString(),
                    totalPrice: 75000,
                    status: "배송완료",
                    products: [
                        {
                            name: "스마트워치",
                            price: 75000,
                            quantity: 1,
                            image: "https://via.placeholder.com/80"
                        }
                    ]
                }
            ]);
        }
    }, [orderInfo]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}.${month.toString().padStart(2, '0')}.${day.toString().padStart(2, '0')}`;
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "결제완료":
                return "status-payment";
            case "상품준비중":
                return "status-preparing";
            case "배송중":
                return "status-shipping";
            case "배송완료":
                return "status-delivered";
            default:
                return "";
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleViewOrderDetail = (order) => {
        navigate("/order-detail", { state: { order } });
    };

    return (
        <div className="my-orders-container">
            <div className="orders-header">
                <button className="back-button" onClick={handleGoBack}>
                    <IoIosArrowBack />
                </button>
                <h1>주문 내역</h1>
            </div>

            <div className="orders-list">
                {orders.length > 0 ? (
                    orders.map((order, index) => (
                        <div className="order-card" key={index} onClick={() => handleViewOrderDetail(order)}>
                            <div className="order-header">
                                <span className="order-date">{formatDate(order.paidAt)}</span>
                                <span className={`order-status ${getStatusClass(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>
                            <div className="order-products-preview">
                                {order.products && Array.isArray(order.products) ? (
                                    <>
                                        {order.products.slice(0, 3).map((product, idx) => (
                                            <div className="product-preview" key={idx}>
                                                <img 
                                                    src={product.image} 
                                                    alt={product.name} 
                                                    className="product-thumbnail" 
                                                />
                                            </div>
                                        ))}
                                        {order.products.length > 3 && (
                                            <div className="product-more">+{order.products.length - 3}</div>
                                        )}
                                    </>
                                ) : (
                                    <div className="no-products">상품 정보 없음</div>
                                )}
                            </div>
                            <div className="order-footer">
                                <span className="total-products">
                                    총 {order.products?.length || 0}개 상품
                                </span>
                                <span className="total-price">
                                    {order.totalPrice?.toLocaleString() || 0}원
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-orders">
                        <p>주문 내역이 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}