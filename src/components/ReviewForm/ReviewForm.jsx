import React, { useState } from "react";
import "./ReviewForm.css";

const ReviewForm = ({ selectedPurchase, onClose }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(null);
    const [reviewText, setReviewText] = useState("");
    const [uploadedImages, setUploadedImages] = useState([]);

    const ratingTexts = ["별로예요", "그저 그래요", "괜찮아요", "좋아요", "최고예요"];

    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files).slice(0, 5 - uploadedImages.length);
        const imageUrls = files.map((file) => URL.createObjectURL(file));
        setUploadedImages([...uploadedImages, ...imageUrls]);
    };

    const handleRemoveImage = (index) => {
        setUploadedImages(uploadedImages.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        // Ensure we have all necessary data
        if (rating === 0) {
            alert("별점을 선택해주세요.");
            return;
        }
        
        if (reviewText.trim() === "") {
            alert("리뷰 내용을 입력해주세요.");
            return;
        }

        // Create new review object with all required fields
        const newReview = {
            purchase: selectedPurchase,
            rating,
            reviewText,
            uploadedImages,
            productImages: selectedPurchase.products.map(product => product.image),
            date: new Date().toISOString().split("T")[0],
            // Ensure we have the product ID for linking purposes
            productId: selectedPurchase.products[0].id
        };

        // Add review to localStorage
        const existingReviews = JSON.parse(localStorage.getItem("reviews")) || [];
        localStorage.setItem("reviews", JSON.stringify([...existingReviews, newReview]));

        // Trigger storage event for other components to detect the change
        window.dispatchEvent(new Event("storage"));
        
        // Close the form and provide feedback
        alert("리뷰가 성공적으로 등록되었습니다!");
        onClose();
    };
    
    return (
        <div className="reviewForm-container">
            <h2 className="reviewForm-Title">리뷰 작성</h2>

            <div className="product-selection">
                {selectedPurchase && selectedPurchase.products.map((product, index) => (
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

            <div className="reviewFormStars">
                {[...Array(5)].map((_, index) => {
                    const starValue = index + 1;
                    return (
                        <span
                            key={starValue}
                            className={`reviewFormStar ${starValue <= rating ? "selected" : ""}`}
                            onClick={() => setRating(starValue)}
                            onMouseEnter={() => setHover(starValue)}
                            onMouseLeave={() => setHover(null)}
                        >
                            {starValue <= (hover || rating) ? "★" : "☆"}
                        </span>
                    );
                })}
                <span className="reviewFormStarRating-text">
                    {hover || rating ? ratingTexts[(hover || rating) - 1] : ""}
                </span>
            </div>

            <div className="review-textarea-container">
                <textarea
                    className="review-textarea"
                    placeholder="상품에 대한 리뷰를 작성해주세요."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={5}
                />
            </div>

            <div className="image-upload-section">
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploadedImages.length >= 5}
                />
                <p className="image-upload-info">최대 5장까지 업로드할 수 있습니다.</p>
                <div className="image-preview-container">
                    {uploadedImages.map((image, index) => (
                        <div key={index} className="image-preview">
                            <img src={image} alt={`Uploaded ${index}`} />
                            <button className="remove-image-button" onClick={() => handleRemoveImage(index)}>✖</button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="reviewFormsubmit-container">
                <button className="reviewFormcancel-button" onClick={onClose}>취소하기</button>
                <button className="reviewFormsubmit-button" onClick={handleSubmit}>등록하기</button>
            </div>
        </div>
    );
};

export default ReviewForm;