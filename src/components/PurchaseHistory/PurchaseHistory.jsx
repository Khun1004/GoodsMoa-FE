import React, { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import CancelOrder from "../CancelOrders/CancelOrder/CancelOrder";
import DeliveryTracking from "../DeliveryTracking/DeliveryTracking";
import PurchaseConfirmation from "../PurchaseConfirmation/PurchaseConfirmation";
import ReviewForm from "../ReviewForm/ReviewForm";
import "./PurchaseHistory.css";

const PurchaseHistory = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 10;
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const [purchaseHistory, setPurchaseHistory] = useState([]);
    const [filteredPurchases, setFilteredPurchases] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('종류');
    const [selectedType, setSelectedType] = useState('카테고리');
    const [selectedStatus, setSelectedStatus] = useState('전체');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const [selectedPurchase, setSelectedPurchase] = useState(null);

    const [isDeliveryTracking, setIsDeliveryTracking] = useState(false);
    const [isCancelOrder, setIsCancelOrder] = useState(false);
    const [isReviewForm, setIsReviewForm] = useState(false);
    const [isPurchaseConfirmation, setIsPurchaseConfirmation] = useState(false);

    const handleDeliveryTracking = () => {
        setIsDeliveryTracking(true);
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

    useEffect(() => {
        const storedPurchases = JSON.parse(localStorage.getItem("purchaseHistory")) || [];
        setPurchaseHistory(storedPurchases);
        setFilteredPurchases(storedPurchases);
    }, [isCancelOrder, isReviewForm, isPurchaseConfirmation]);

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

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setShowCategoryDropdown(false);
    };

    const handleTypeSelect = (type) => {
        setSelectedType(type);
        setShowTypeDropdown(false);
    };

    const handleStatusSelect = (status) => {
        setSelectedStatus(status);
        setCurrentPage(1);
    };

    // 상태별로 필터링된 구매 내역
    const filteredPurchasesList = purchaseHistory.filter(purchase => {
        if (selectedStatus === '전체') return true;
        return purchase.status === selectedStatus;
    });

    useEffect(() => {
        setFilteredPurchases(filteredPurchasesList);
    }, [selectedStatus, startDate, endDate, selectedCategory, selectedType]);

    const handleSearch = () => {
        let filtered = purchaseHistory;

        // 카테고리 필터링
        if (selectedCategory !== '종류') {
            filtered = filtered.filter(purchase => purchase.saleLabel === selectedCategory);
        }

        // 타입 필터링
        if (selectedType !== '카테고리') {
            filtered = filtered.filter(purchase => purchase.category === selectedType);
        }

        // 날짜 필터링
        if (startDate) {
            filtered = filtered.filter(purchase => new Date(purchase.paymentDate) >= new Date(startDate));
        }
        if (endDate) {
            filtered = filtered.filter(purchase => new Date(purchase.paymentDate) <= new Date(endDate));
        }

        setFilteredPurchases(filtered);
    };

    const getStatusCount = (status) => {
        return purchaseHistory.filter(purchase => purchase.status === status).length;
    };

    const CategoryDropdown = () => (
        <div className="categoryDropdown-box">
            <div className="dropdown-item" onClick={() => handleCategorySelect('종류')}>종류</div>
            <div className="dropdown-item" onClick={() => handleCategorySelect('상품')}>상품</div>
            <div className="dropdown-item" onClick={() => handleCategorySelect('판매')}>판매</div>
            <div className="dropdown-item" onClick={() => handleCategorySelect('중고거래')}>중고거래</div>
            <div className="dropdown-item" onClick={() => handleCategorySelect('커미션')}>커미션</div>
            <div className="dropdown-item" onClick={() => handleCategorySelect('수요조사')}>수요조사</div>
        </div>
    );

    const TypeDropdown = () => (
        <div className="typeDropdown-box">
            <div className="dropdown-item" onClick={() => handleTypeSelect('카테고리')}>카테고리</div>
            <div className="dropdown-item" onClick={() => handleTypeSelect('아이돌')}>아이돌</div>
            <div className="dropdown-item" onClick={() => handleTypeSelect('영화')}>영화</div>
            <div className="dropdown-item" onClick={() => handleTypeSelect('게임')}>게임</div>
            <div className="dropdown-item" onClick={() => handleTypeSelect('드라마')}>드라마</div>
            <div className="dropdown-item" onClick={() => handleTypeSelect('애니메이션')}>애니메이션</div>
            <div className="dropdown-item" onClick={() => handleTypeSelect('음악')}>음악</div>
            <div className="dropdown-item" onClick={() => handleTypeSelect('웹소설')}>웹소설</div>
            <div className="dropdown-item" onClick={() => handleTypeSelect('웹툰')}>웹툰</div>
            <div className="dropdown-item" onClick={() => handleTypeSelect('그림')}>그림</div>
            <div className="dropdown-item" onClick={() => handleTypeSelect('기타')}>기타</div>
        </div>
    );

    return (
        <div className="purchaseHistory_container">
            {isDeliveryTracking ? (
                <DeliveryTracking setDeliveryTracking={setIsDeliveryTracking} />
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
            ) : (
                <div>
                    <h2 className="pur-title">구매 내역</h2>
                    <p className="notice">* 일반 판매, 커미션 중 선택</p>

                    <div className="filters">
                        {/* 카테고리 드롭다운 */}
                        <div className="categoryDropdown-group">
                            <button className="categorybtn" onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}>
                                {selectedCategory}
                            </button>
                            {showCategoryDropdown && <CategoryDropdown />}
                        </div>

                        {/* 타입 드롭다운 */}
                        <div className="typeDropdown-group">
                            <button className="typebtn" onClick={() => setShowTypeDropdown(!showTypeDropdown)}>
                                {selectedType}
                            </button>
                            {showTypeDropdown && <TypeDropdown />}
                        </div>

                        {/* 날짜 입력 */}
                        <div className="input-date">
                            <input 
                                type="date" 
                                className="start-date" 
                                value={startDate} 
                                onChange={(e) => setStartDate(e.target.value)} 
                                placeholder="시작일"
                            />
                            <span className="iconDate"> ~ </span>
                            <input 
                                type="date" 
                                className="end-date" 
                                value={endDate} 
                                onChange={(e) => setEndDate(e.target.value)} 
                                placeholder="종료일"
                                min={startDate}
                            />
                        </div>

                        {/* 검색 버튼 */}
                        <button className="searchbtn" onClick={handleSearch}>
                            상세 검색 <FiSearch />
                        </button>
                    </div>

                    <div className="status-buttons">
                        <div className="btnClr" style={{ "--clr": "#78fd61", "--clr-glow": "#4003e6" }} onClick={() => handleStatusSelect('전체')}>
                            <div className="status-circle">{purchaseHistory.length}</div>
                            <a href="#">전체</a>
                        </div>
                        <div className="btnClr" style={{ "--clr": "#2dd9fe", "--clr-glow": "#00a3d5" }} onClick={() => handleStatusSelect('상품 준비 중')}>
                            <div className="status-circle">{getStatusCount('상품 준비 중')}</div>
                            <a href="#">상품 준비 중</a>
                        </div>
                        <div className="btnClr" style={{ "--clr": "#FF53cd", "--clr-glow": "#e10361" }} onClick={() => handleStatusSelect('배송 중')}>
                            <div className="status-circle">{getStatusCount('배송 중')}</div>
                            <a href="#">배송 중</a>
                        </div>
                        <div className="btnClr" style={{ "--clr": "#FF53cd", "--clr-glow": "#e10361" }} onClick={() => handleStatusSelect('배송 완료')}>
                            <div className="status-circle">{getStatusCount('배송 완료')}</div>
                            <a href="#">배송 완료</a>
                        </div>
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
                            {filteredPurchases.length > 0 ? (
                                filteredPurchases.map((purchase) => (
                                    <tr key={purchase.id}>
                                        <td>
                                            {purchase.products.map((product) => (
                                                <div key={product.name}>
                                                    <img src={product.image} alt={product.name} className="product-img" />
                                                    {product.name}
                                                </div>
                                            ))}
                                        </td>
                                        <td>{purchase.ordererName}</td>
                                        <td>{purchase.saleLabel}</td>
                                        <td>
                                            {purchase.products.reduce((sum, p) => sum + p.quantity, 0)} 개, 
                                            {purchase.products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toLocaleString()}원
                                        </td>

                                        <td>{purchase.status}</td>
                                        <td>{purchase.category || "미정"}</td>
                                        <td>{purchase.paymentDate}</td>
                                        <td>
                                            <div className="action-buttons">
                                                {purchase.status === '상품 준비 중' && (
                                                    <>
                                                    <button className="btn" onClick={() => handleCancelOrder(purchase)}>
                                                        취소 신청
                                                    </button>
                                                    <button className="btn" onClick={() => handleReviewClick(purchase)}>
                                                    리뷰 쓰기</button>
                                                    </>
                                                )}
                                                {purchase.status === '배송 완료' && (
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
                                                    <button className="btn" onClick={handleDeliveryTracking}>
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
