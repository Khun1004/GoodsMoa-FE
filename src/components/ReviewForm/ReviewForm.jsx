import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ReviewForm.css";
import productService from "../../api/ProductService.jsx";

const ReviewForm = ({ review = null, selectedPurchase = null, onClose }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(null);
    const [reviewText, setReviewText] = useState("");
    const [uploadedImages, setUploadedImages] = useState([]); // [{id?, filePath, isNew}]
    const [deletedImageIds, setDeletedImageIds] = useState([]); // 삭제할 id 저장
    const navigate = useNavigate();

    const ratingTexts = ["별로예요", "그저 그래요", "괜찮아요", "좋아요", "최고예요"];

    // 수정 시 초기 값 세팅
    useEffect(() => {
        if (review) {
            setRating(review.rating);
            setReviewText(review.content);
            const formattedImages = review.media?.map(img => ({
                id: img.id,
                filePath: img.filePath,
                isNew: false,
            })) || [];

            setUploadedImages(formattedImages);
        }
    }, [review]);

    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files).slice(0, 5 - uploadedImages.length);

        const newImages = files.map((file) => ({
            file,
            filePath: URL.createObjectURL(file),
            isNew: true,
        }));

        setUploadedImages([...uploadedImages, ...newImages]);
    };


    const handleRemoveImage = (index) => {
        const removed = uploadedImages[index];
        // 기존 이미지라면 id 추적
        if (!removed.isNew && removed.id) {
            setDeletedImageIds(prev => [...prev, removed.id]);
        }
        setUploadedImages(uploadedImages.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (rating === 0 || reviewText.trim() === "") {
            alert("별점과 내용을 모두 입력해주세요.");
            return;
        }

        try {
            const newFiles = [];

            for (const image of uploadedImages) {
                if (image.isNew) {
                    const res = await fetch(image.filePath);
                    const blob = await res.blob();
                    const file = new File([blob], `review_${Date.now()}.jpg`, { type: blob.type });
                    newFiles.push(file);
                }
            }

            const remainImageUrls = uploadedImages
                .filter(img => !img.isNew)
                .map(img => img.filePath);

            if (review) {
                // 수정 요청
                await productService.updateReview({
                    reviewId: review.reviewId,
                    postId: review.postId,
                    rating,
                    content: reviewText,
                    imageUrls: remainImageUrls,
                    deletedImageIds: deletedImageIds, // 이게 핵심
                }, newFiles);

                alert("리뷰가 수정되었습니다!");
                navigate("/mypage?page=reviews");
            } else {
                // 새 리뷰 등록
                const postId = selectedPurchase?.products?.[0]?.postId;
                if (!postId) {
                    alert("postId를 찾을 수 없습니다.");
                    return;
                }

                await productService.createReview(postId, {
                    rating,
                    content: reviewText,
                    reviewImages: newFiles,
                });

                alert("리뷰가 등록되었습니다!");
                navigate("/mypage?page=reviews");
            }

            onClose();
        } catch (error) {
            console.error("리뷰 등록/수정 실패:", error);
            alert("작업에 실패했습니다.");
        }
    };



    return (
        <div className="reviewForm-container">
            <h2 className="reviewForm-Title">{review ? "리뷰 수정" : "리뷰 작성"}</h2>

            <div className="product-selection">
                {review ? (
                    <div className="review-product-item">
                        <div className="review-product-info">
                            <h3>리뷰 ID: {review.reviewId}</h3>
                            <p>게시물 ID: {review.postId}</p>
                            <p>작성자: {review.userName}</p>
                        </div>
                    </div>
                ) : (
                    selectedPurchase?.products?.map((product, index) => (
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
                    ))
                )}
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
                            <img src={image.filePath} alt={`Uploaded ${index}`} />
                            <button className="remove-image-button" onClick={() => handleRemoveImage(index)}>✖</button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="reviewFormsubmit-container">
                <button className="reviewFormcancel-button" onClick={onClose}>취소하기</button>
                <button className="reviewFormsubmit-button" onClick={handleSubmit}>
                    {review ? "수정하기" : "등록하기"}
                </button>
            </div>
        </div>
    );
};

export default ReviewForm;
