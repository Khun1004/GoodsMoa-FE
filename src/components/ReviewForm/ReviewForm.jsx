import React, { useState, useEffect } from "react";
import "./ReviewForm.css";
import productService from "../../api/ProductService.jsx";

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

    const handleSubmit = async () => {
        if (rating === 0) {
            alert("별점을 선택해주세요.");
            return;
        }

        if (reviewText.trim() === "") {
            alert("리뷰 내용을 입력해주세요.");
            return;
        }

        const postId = selectedPurchase.products?.[0]?.postId;
        if (!postId) {
            alert("상품 ID를 찾을 수 없습니다.");
            return;
        }
        console.log('업로드 이미지 목록11111111111111:', uploadedImages);
        try {
            // blob URL → File 객체 변환
            const filePromises = uploadedImages.map(async (url, index) => {
                const response = await fetch(url);
                const blob = await response.blob();
                return new File([blob], `review_${index + 1}.jpg`, { type: blob.type });
            });

            const reviewImages = await Promise.all(filePromises);

            await productService.createReview(postId, {
                rating,
                content: reviewText,
                reviewImages,
            });

            alert("리뷰가 성공적으로 등록되었습니다!");
            onClose();

        } catch (error) {
            console.error("리뷰 등록 실패:", error);
            alert("리뷰 등록에 실패했습니다.");
        }
    };

    return (
        <div className="reviewForm-container">
            <h2 className="reviewForm-Title">리뷰 작성</h2>

            <div className="product-selection">
                {selectedPurchase && selectedPurchase.products.map((product, index) => (
                    <div key={index} className="review-product-item">
                        <img 
                            src={product.imageUrl}
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