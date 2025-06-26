import React, {useEffect, useState} from "react";
import './ReviewsCheck.css';

const ReviewCheck = ({ review, onClose, onEdit }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);

    const handleImageClick = (index) => {
        setSelectedImageIndex(index);
    };

    // 수정 시 초기값 세팅
    useEffect(() => {
        console.log('review ::: ',review);
    }, []);

    const closeModal = () => {
        setSelectedImageIndex(null);
    };

    const handleNextImage = () => {
        if (selectedImageIndex < review.media.length - 1) {
            setSelectedImageIndex(selectedImageIndex + 1);
        }
    };

    const handlePrevImage = () => {
        if (selectedImageIndex > 0) {
            setSelectedImageIndex(selectedImageIndex - 1);
        }
    };

    const selectedImage = review.media?.[selectedImageIndex]?.filePath;

    return (
        <div className="review-check-container">
            <h2 className="review-checkTitle">리뷰 상세보기</h2>

            <div className="review-details">
                <div className="review-info">
                    <p><strong>작성일:</strong> {new Date(review.createdAt).toLocaleString()}</p>
                    <p className="checkReviewStar">
                        {"★".repeat(Math.round(review.rating)) + "☆".repeat(5 - Math.round(review.rating))}
                    </p>
                </div>

                <div className="review-text-section">
                    <strong>리뷰 내용:</strong>
                    <p className="checkReviewText">{review.content}</p>
                </div>

                {review.media && review.media.length > 0 && (
                    <div className="uploaded-images-section">
                        <h4>업로드 이미지:</h4>
                        <div className="image-preview-container">
                            {review.media.map((item, index) => (
                                <div key={index} className="image-preview">
                                    <img
                                        src={item.filePath}
                                        alt={`리뷰 이미지 ${index + 1}`}
                                        onClick={() => handleImageClick(index)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 이미지 확대 모달 */}
            {selectedImage && (
                <div className="image-modal" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="close-btn" onClick={closeModal}>X</div>
                        <img src={selectedImage} alt="리뷰 확대 이미지" />
                        <div className="image-navigation">
                            <button className="nav-btn prev-btn" onClick={handlePrevImage}>{'<'}</button>
                            <button className="nav-btn next-btn" onClick={handleNextImage}>{'>'}</button>
                        </div>
                    </div>
                </div>
            )}

            <button className="reviewCheckBtn" onClick={onClose}>뒤로 가기</button>
            <button className="reviewCheckBtn" onClick={() => onEdit(review)}>수정하기</button>
        </div>
    );
};

export default ReviewCheck;
