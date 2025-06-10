import React, { useEffect, useState } from "react";
import "./Review.css";

import ReviewCheck from "../ReviewsCheck/ReviewsCheck";

const Review = () => {
    const [reviews, setReviews] = useState([]);
    const [selectedReview, setSelectedReview] = useState(null);

    useEffect(() => {
        const storedReviews = JSON.parse(localStorage.getItem("reviews")) || [];
        setReviews(storedReviews);
    }, []);

    const handleStarClick = (review) => {
        setSelectedReview(review);
    };

    const handleCloseReview = () => {
        setSelectedReview(null);
    };

    const handleDeleteReview = (reviewToDelete) => {
        const updatedReviews = reviews.filter((review) => review !== reviewToDelete);
        setReviews(updatedReviews);
        localStorage.setItem("reviews", JSON.stringify(updatedReviews));
    };

    // 모바일용 카드 뷰
    const renderMobileView = () => (
        <div className="mobile-cards-container">
        {reviews.map((review, index) => (
            <div 
            key={index} 
            className="review-card"
            onClick={() => handleStarClick(review)}
            >
            <div className="review-card-header">
                <div className="review-card-product">
                {(review.purchase?.products?.[0]?.image) && (
                    <img 
                    src={review.purchase.products[0].image} 
                    alt={review.purchase.products[0].name} 
                    className="review-card-image"
                    />
                )}
                <div className="review-card-info">
                    <div className="product-name">
                    {review.purchase?.products?.[0]?.name || '상품명 없음'}
                    </div>
                    <div className="review-stars">{"★".repeat(review.rating)}</div>
                </div>
                </div>
                <div className="review-date">{review.date}</div>
            </div>
            
            <p className="review-card-text">{review.reviewText}</p>
            
            <div className="review-card-actions">
                <button
                className="delete-button-mobile"
                onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteReview(review);
                }}
                >
                삭제
                </button>
            </div>
            </div>
        ))}
        </div>
    );

    // 데스크톱용 테이블 뷰
    const renderDesktopView = () => (
        <div className="table-container">
        <table className="review-table">
            <thead>
            <tr>
                <th>사진</th>
                <th>상품명</th>
                <th>리뷰내용</th>
                <th>작성날짜</th>
                <th>별점</th>
                <th>삭제</th>
            </tr>
            </thead>
            <tbody>
            {reviews.map((review, index) => (
                <tr 
                key={index}
                onClick={() => handleStarClick(review)}
                className="review-table-row"
                >
                <td>
                    {(review.purchase?.products || []).map((product, productIndex) => (
                    <img
                        key={productIndex}
                        src={product.image}
                        alt={product.name}
                        className="review-product-image"
                    />
                    ))}
                </td>
                <td>{review.purchase?.products?.[0]?.name || '상품명 없음'}</td>
                <td className="review-text">{review.reviewText}</td>
                <td>{review.date}</td>
                <td className="reviewStar">{"★".repeat(review.rating)}</td>
                <td>
                    <button
                    className="delete-button"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteReview(review);
                    }}
                    >
                    삭제
                    </button>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    );

    // 공통 내용이 없는 경우 표시할 메시지
    const renderEmptyState = () => (
        <div className="empty-reviews">
        리뷰가 없습니다. 첫 리뷰를 작성해보세요!
        </div>
    );

    return (
        <div className="review-container">
        {selectedReview ? (
            <ReviewCheck
            review={selectedReview}
            onClose={handleCloseReview}
            />
        ) : (
            <>
            <h1 className="review-title">리뷰 화면</h1>
            
            {/* 모바일 뷰 (작은 화면에서만 표시) */}
            <div className="mobile-view">
                {reviews.length > 0 ? renderMobileView() : renderEmptyState()}
            </div>
            
            {/* 데스크톱 뷰 (큰 화면에서만 표시) */}
            <div className="desktop-view">
                {reviews.length > 0 ? renderDesktopView() : renderEmptyState()}
            </div>
            </>
        )}
        </div>
    );
};

export default Review;