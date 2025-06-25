import React, { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import CancelOrder from "../CancelOrders/CancelOrder/CancelOrder";
import DeliveryTracking from "../DeliveryTracking/DeliveryTracking";
import PurchaseConfirmation from "../PurchaseConfirmation/PurchaseConfirmation";
import PurchaseHistoryDetail from "../PurchaseHistoryDetail/PurchaseHistoryDetail";
import ReviewForm from "../ReviewForm/ReviewForm";
import "./PurchaseHistory.css";
import orderSaleDetail from "../../api/OrderSaleDetail";

const PurchaseHistory = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 10;
    const [purchaseHistory, setPurchaseHistory] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('전체');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const [selectedPurchase, setSelectedPurchase] = useState(null);

    const [isDeliveryTracking, setIsDeliveryTracking] = useState(false);
    const [isCancelOrder, setIsCancelOrder] = useState(false);
    const [isReviewForm, setIsReviewForm] = useState(false);
    const [isPurchaseConfirmation, setIsPurchaseConfirmation] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const BASE_URL = 'http://localhost:8080/';

    // 주문한 내역 가져오기
    useEffect(() => {
        console.log('fetchPurchaseHistory @@@@@@@@@@');
        const fetchPurchaseHistory = async () => {
            try {
                const res = await orderSaleDetail.listOrders(currentPage - 1, 10, 'id,DESC');
                setPurchaseHistory(res.content || []);
                // setTotalPages(res.totalPages); // 페이지네이션 연동 시 필요
            } catch (err) {
                console.error('구매 내역 불러오기 실패:', err.message);
            }
        };

        fetchPurchaseHistory();
        console.log('filteredPurchasesList ::: ',filteredPurchasesList);
    }, [currentPage, isCancelOrder, isReviewForm, isPurchaseConfirmation]);

    const handleDeliveryTracking = (purchase) => {
        setSelectedPurchase(purchase);
        setIsDeliveryTracking(true);
    };

    const handleImageClick = async (purchase) => {
        try {
            const res = await orderSaleDetail.getOrderDetail(purchase.orderId); // ← 서버에서 상세정보 가져오기
            setSelectedPurchase(res); // 서버 응답값을 저장
            setShowDetail(true);      // 상세창 열기
        } catch (error) {
            console.error('상세 조회 실패:', error.message);
            alert('주문 상세 정보를 불러오지 못했습니다.');
        }
    };
    
    const handleCancelOrder = (purchase) => {
        setSelectedPurchase({
            ...purchase,
            totalPrice: purchase.products.reduce((sum, p) => sum + (p.price * p.quantity), 0)
        });
        setIsCancelOrder(true);
    };

    const handleReviewClick = (purchase) => {
        setSelectedPurchase({
            ...purchase,
            totalPrice: purchase.products.reduce((sum, p) => sum + (p.price * p.quantity), 0)
        });
        setIsReviewForm(true);
    };
    
    const handlePurchaseConfirmation = (purchase) => {
        setSelectedPurchase({
            ...purchase,
            totalPrice: purchase.products.reduce((sum, p) => sum + (p.price * p.quantity), 0)
        });
        setIsPurchaseConfirmation(true);
    };    

    // useEffect(() => {
    //     const storedPurchases = JSON.parse(localStorage.getItem("purchaseHistory")) || [];
    //     // 상태별로 정렬 (최신 주문이 먼저 오도록)
    //     const sortedPurchases = storedPurchases.sort((a, b) =>
    //         new Date(b.paymentDate) - new Date(a.paymentDate)
    //     );
    //     setPurchaseHistory(sortedPurchases);
    // }, [isCancelOrder, isReviewForm, isPurchaseConfirmation]);

    // useEffect(() => {
    //     const storedPurchases = JSON.parse(localStorage.getItem("purchaseHistory")) || [];
    //     setPurchaseHistory(storedPurchases);
    // }, []);

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handleStatusSelect = (statusLabel) => {
        const dbStatus = statusLabel === '전체' ? '전체' : statusMap[statusLabel];

        setSelectedStatus(dbStatus);
        setCurrentPage(1);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    // 필터링된 구매 내역 계산
    const filteredPurchasesList = purchaseHistory.filter(purchase => {
        // 상태 필터링 ('전체' 선택 시 모든 상태 포함)
        if (selectedStatus !== '전체' && purchase.status !== selectedStatus) {
            return false;
        }

        // 검색어가 없으면 모든 항목 반환
        if (!searchQuery.trim()) return true;

        // 검색어로 필터링 (상품명, 카테고리, 종류)
        const query = searchQuery.toLowerCase();
        return (
            purchase.products.some(product => 
                product.name.toLowerCase().includes(query)
            ) ||
            (purchase.category && purchase.category.toLowerCase().includes(query)) ||
            (purchase.saleLabel && purchase.saleLabel.toLowerCase().includes(query))
        );
    });

    // 상태 매핑: 프론트 표시 → DB 저장값
    const statusMap = {
        '상품 준비 중': '상품준비중',
        '배송 준비': '배송준비',
        '배송 중': '배송중',
        '배송 완료': '배송완료'
    };

// 상태별 개수 세는 함수
    const getStatusCount = (statusLabel) => {
        const dbStatus = statusMap[statusLabel];
        if (!dbStatus) return 0;

        return purchaseHistory.filter(purchase => purchase.status === dbStatus).length;
    };
    // 날짜 포맷팅
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const pad = (n) => n.toString().padStart(2, '0');

        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hour = pad(date.getHours());
        const minute = pad(date.getMinutes());

        return `${year}년 ${month}월 ${day}일 ${hour}시 ${minute}분`;
    };

    return (
        <div className="purchaseHistory_container">
            {isDeliveryTracking ? (
                <DeliveryTracking
                    setDeliveryTracking={setIsDeliveryTracking}
                    selectedPurchase={selectedPurchase}
                />
            ) : isCancelOrder ? (
                <CancelOrder
                    selectedPurchase={selectedPurchase}
                    onClose={() => setIsCancelOrder(false)}/>
            ) : isReviewForm ? (
                <ReviewForm
                    selectedPurchase={selectedPurchase}
                    onClose={() => setIsReviewForm(false)}/>
            ) : isPurchaseConfirmation ? (
                <PurchaseConfirmation
                    selectedPurchase={selectedPurchase}
                    onClose={() => setIsPurchaseConfirmation(false)} />
            ) : showDetail ? (
                <PurchaseHistoryDetail
                    purchase={selectedPurchase}
                    onClose={() => setShowDetail(false)}
                />
            ) : (
                <div>
                    <h2 className="pur-title">구매 내역</h2>

                    <form className="pur-search-form" onSubmit={handleSearch}>
                        <div className="pur-search-container">
                            <input
                                type="text"
                                placeholder="상품명, 카테고리, 종류로 검색"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pur-search-input"
                            />
                            <button type="submit" className="pur-search-button">
                                <FiSearch />
                            </button>
                        </div>
                    </form>

                    <div className="status-buttons">
                        {['전체', '상품 준비 중', '배송 준비', '배송 중', '배송 완료'].map((status, idx) => (
                            <div
                                key={status}
                                className="btnClr"
                                style={{
                                    "--clr": ["#78fd61", "#FF53cd", "#2dd9fe", "#FF53cd", "#FF53cd"][idx],
                                    "--clr-glow": ["#4003e6", "#78fd61", "#00a3d5", "#e10361", "#e10361"][idx]
                                }}
                                onClick={() => handleStatusSelect(status)}
                            >
                                <div className="status-circle">
                                    {status === '전체'
                                        ? purchaseHistory.length
                                        : getStatusCount(status)
                                    }
                                </div>
                                <a href="#">{status}</a>
                            </div>
                        ))}
                    </div>


                    <table className="history-table">
                        <thead>
                        <tr>
                            <th>제품명</th>
                            <th>주문자</th>
                            <th>종류</th>
                            <th>수량, 가격</th>
                            <th>현재 상태</th>
                            <th>카테고리</th>
                            <th>결제 시간</th>
                            <th>배송 관련</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredPurchasesList.length > 0 ? (
                            filteredPurchasesList.map((purchase) => (
                                <tr key={purchase.id}>
                                    <td>
                                        <span
                                            className="order-detail-link"
                                            onClick={() => handleImageClick(purchase)}
                                        >
                                            주문 상세
                                        </span>
                                        {purchase.products.map((product) => (
                                            <div key={product.name}>
                                                <img
                                                    src={`${product.imageUrl}`}
                                                    alt={product.name}
                                                    className="ph-product-img"
                                                    onClick={() => handleImageClick(purchase)}
                                                    style={{cursor: 'pointer'}}
                                                />
                                                {product.name}
                                            </div>
                                        ))}
                                    </td>
                                    <td>{purchase.formData?.ordererName || purchase.recipientName || 'N/A'}</td>
                                    <td>{purchase.saleLabel}</td>
                                    <td>
                                        {purchase.products.reduce((sum, p) => sum + p.quantity, 0)} 개,
                                        {purchase.products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toLocaleString()}원
                                    </td>
                                    <td>{purchase.status}</td>
                                    <td>{purchase.category || "미정"}</td>
                                    <td>{formatDateTime(purchase.paymentDate)}</td>
                                    <td>
                                        <div className="action-buttons">
                                            {purchase.status === '상품 준비 중' && (
                                                <>
                                                    <button className="btn" onClick={() => handleCancelOrder(purchase)}>
                                                        취소 신청
                                                    </button>
                                                    <button className="btn" onClick={() => handleReviewClick(purchase)}>
                                                        리뷰 쓰기
                                                    </button>
                                                </>
                                            )}
                                            {purchase.status === '배송완료' && (
                                                <>
                                                    <button className="btn" onClick={() => handlePurchaseConfirmation(purchase)}>
                                                        구매 확정
                                                    </button>
                                                    <button className="btn" onClick={() => handleReviewClick(purchase)}>
                                                        리뷰 쓰기
                                                    </button>
                                                </>
                                            )}
                                            {purchase.status === "배송 중" && (
                                                <button className="btn" onClick={() => handleDeliveryTracking(purchase)}>
                                                    배송 조회
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8">구매 내역이 없습니다.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>

                    <div className="pagination">
                        <button className="page-btn" onClick={handlePrevPage}>◀</button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                className={`page-number ${currentPage === i + 1 ? "active" : ""}`}
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button className="page-btn" onClick={handleNextPage}>▶</button>
                    </div>
                </div>
            )}
        </div>
    );

};

export default PurchaseHistory;