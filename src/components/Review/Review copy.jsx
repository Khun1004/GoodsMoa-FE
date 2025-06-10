import React, { useEffect, useState } from "react";
import ReviewCheck from "../ReviewsCheck/ReviewsCheck";
import "./Review.css";

const Review = () => {
    const [reviews, setReviews] = useState([]);
    const [selectedReview, setSelectedReview] = useState(null);

    useEffect(() => {
        const loadReviews = () => {
            const storedReviews = JSON.parse(localStorage.getItem("reviews")) || [];
            setReviews(storedReviews);
        };
        
        loadReviews();
        
        // Add event listener to update reviews when storage changes
        window.addEventListener('storage', loadReviews);
        
        return () => {
            window.removeEventListener('storage', loadReviews);
        };
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
        
        // Trigger storage event for other components to detect the change
        window.dispatchEvent(new Event("storage"));
    };

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
                    {reviews.length > 0 ? (
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
                                    <tr key={index} onClick={() => handleStarClick(review)}>
                                        <td>
                                            {(review.purchase.products || []).map((product, productIndex) => (
                                                <img 
                                                    key={productIndex} 
                                                    src={product.image} 
                                                    alt={product.name} 
                                                    className="review-product-image"
                                                />
                                            ))}
                                        </td>
                                        <td>{review.purchase.products[0].name}</td>
                                        <td className="review-text">{review.reviewText}</td>
                                        <td>{review.date}</td>
                                        <td className="reviewStar">
                                            {"★".repeat(review.rating)}
                                        </td>
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
                    ) : (
                        <div className="no-reviews-message">
                            <p>아직 작성된 리뷰가 없습니다.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Review;