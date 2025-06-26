import React, { useEffect, useState } from "react";
import "./Review.css";
import ReviewCheck from "../ReviewsCheck/ReviewsCheck";
import ReviewForm from "../ReviewForm/ReviewForm";
import productService from "../../api/ProductService";

const Review = () => {
    const [reviews, setReviews] = useState([]);
    const [selectedReview, setSelectedReview] = useState(null);
    const [editingReview, setEditingReview] = useState(null); // 수정용

    // 내 리뷰 가져오기
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await productService.getMyReviews(); // page, size 필요시 추가
                console.log('response ::: ',response.content);
                setReviews(response.content); // Page 객체의 content 사용
            } catch (err) {
                console.error("리뷰를 불러오는 데 실패했습니다:", err);
            }
        };

        fetchReviews();
    }, []);
    // localStorage 로 가져오는 정보
    // useEffect(() => {
    //     const storedReviews = JSON.parse(localStorage.getItem("reviews")) || [];
    //     setReviews(storedReviews);
    // }, []);

    const handleStarClick = (review) => {
        setSelectedReview(review);
    };

    const handleCloseReview = () => {
        setSelectedReview(null);
    };

    // 삭제 요청 메서드
    const handleDeleteReview = async (reviewToDelete) => {
        try {
            // 서버에 삭제 요청
            await productService.deleteReview(reviewToDelete.reviewId);

            // 삭제 성공 시, 프론트 상태 업데이트
            const updatedReviews = reviews.filter((review) => review.reviewId !== reviewToDelete.reviewId);
            setReviews(updatedReviews);
            localStorage.setItem("reviews", JSON.stringify(updatedReviews));
            alert('리뷰가 성공적으로 삭제되었습니다!');
            console.log('리뷰 삭제 완료');
        } catch (error) {
            console.error('리뷰 삭제 실패:', error);
            alert(error.message || '리뷰 삭제 중 오류가 발생했습니다.');
        }
    };

    // 모바일용 카드 뷰
    const renderMobileView = () => (
        <div className="mobile-cards-container">
            {reviews.map((review) => (
                <div
                    key={review.reviewId}
                    className="review-card"
                    onClick={() => handleStarClick(review)}
                >
                    <div className="review-card-header">
                        <div className="review-card-product">
                            {review.mediaUrls?.[0] && (
                                <img
                                    src={review.mediaUrls[0]}
                                    alt="리뷰 이미지"
                                    className="review-card-image"
                                />
                            )}
                            <div className="review-card-info">
                                <div className="product-name">리뷰 ID: {review.postId}</div>
                                <div className="review-stars">
                                    {"★".repeat(Math.round(review.rating))}
                                </div>
                            </div>
                        </div>
                        <div className="review-date">
                            {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                    <p className="review-card-text">{review.content}</p>
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
                    <th>게시물 ID</th>
                    <th>리뷰내용</th>
                    <th>작성날짜</th>
                    <th>별점</th>
                    <th>삭제</th>
                </tr>
                </thead>
                <tbody>
                {reviews.map((review) => (
                    <tr
                        key={review.reviewId}
                        onClick={() => handleStarClick(review)}
                        className="review-table-row"
                    >
                        <td>
                            {review.media?.map((item, idx) => (
                                <img
                                    key={idx}
                                    src={item.filePath}
                                    alt={`리뷰 이미지 ${idx + 1}`}
                                    className="review-product-image"
                                />
                            ))}
                        </td>
                        <td>{review.postId}</td>
                        <td className="review-text">{review.content}</td>
                        <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                        <td className="reviewStar">
                            {"★".repeat(Math.round(review.rating))}
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
            {editingReview ? (
                <ReviewForm
                    review={editingReview}
                    onClose={() => {
                        setEditingReview(null);
                        // 수정 후 목록 새로고침
                        productService.getMyReviews().then((res) => {
                            setReviews(res.content);
                        });
                    }}
                />
            ) : selectedReview ? (
                <ReviewCheck
                    review={selectedReview}
                    onClose={handleCloseReview}
                    onEdit={(review) => {
                        setSelectedReview(null);
                        setEditingReview(review);
                    }}
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