import React, { useState } from "react";
import './ReviewsCheck.css';

const ReviewCheck = ({ review, onClose }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);

    const handleImageClick = (index) => {
        setSelectedImageIndex(index);
    };

    const closeModal = () => {
        setSelectedImageIndex(null);
    };

    const handleNextImage = () => {
        if (selectedImageIndex < review.uploadedImages.length - 1) {
            setSelectedImageIndex(selectedImageIndex + 1);
        }
    };

    const handlePrevImage = () => {
        if (selectedImageIndex > 0) {
            setSelectedImageIndex(selectedImageIndex - 1);
        }
    };

    const selectedImage = review.uploadedImages && review.uploadedImages[selectedImageIndex];

    return (
        <div className="review-check-container">
            <h2 className="review-checkTitle">리뷰 상세보기</h2>
            <div className="review-details">
                <div className="product-selection">
                    {review.purchase && review.purchase.products.map((product, index) => (
                        <div key={index} className="review-product-item">
                            <img 
                                src={product.image} 
                                alt={product.name} 
                                className="review-product-image" 
                            />
                            <div className="review-product-info">
                                <h3>{product.name}</h3>
                                <p>수량: {product.quantity}개</p>
                                <p>가격: {(product.price * product.quantity).toLocaleString()}원</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="rating-section">
                    <p className="checkReviewStar">{"★".repeat(review.rating)}</p>
                </div>
                <div className="review-text-section">
                    <strong>리뷰내용:</strong>
                    <p className="checkReviewText">{review.reviewText}</p>
                </div>

                {review.uploadedImages && review.uploadedImages.length > 0 && (
                    <div className="uploaded-images-section">
                        <h4>업로드 이미지:</h4>
                        <div className="image-preview-container">
                            {review.uploadedImages.map((image, index) => (
                                <div key={index} className="image-preview">
                                    <img 
                                        src={image} 
                                        alt={`Uploaded ${index}`} 
                                        onClick={() => handleImageClick(index)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal for displaying the larger image */}
            {selectedImage && (
                <div className="image-modal" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="close-btn" onClick={closeModal}>X</div>
                        <img src={selectedImage} alt="Selected for large view" />
                        <div className="image-navigation">
                            <button className="nav-btn prev-btn" onClick={handlePrevImage}>{'<'}</button>
                            <button className="nav-btn next-btn" onClick={handleNextImage}>{'>'}</button>
                        </div>
                    </div>
                </div>
            )}

            <button className="reviewCheckBtn" onClick={onClose}>뒤로 가기</button>
        </div>
    );
};

export default ReviewCheck;