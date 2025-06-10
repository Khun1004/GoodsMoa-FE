import React, { useEffect, useState } from 'react';
import { AiFillAlert } from "react-icons/ai";
import { CgProfile } from "react-icons/cg";
import { FaStar } from "react-icons/fa";
import { useLocation, useNavigate } from 'react-router-dom';
import "./SaleDetail.css";

const API_BASE_URL = 'http://localhost:8080';

const SaleDetail = () => {
    // Get user name from localStorage
    const [userName, setUserName] = useState(() => localStorage.getItem('userName') || "사용자 이름");
    const [profileImage, setProfileImage] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    
    // Extract all possible data from location state with defaults
    const { 
        product = {}, 
        products = [], 
        selectedImage: initialSelectedImage = null,
        shippingMethods = [], 
        productReviews = [], 
        start_time = null, 
        end_time = null, 
        saleLabel = "판매",
        isPublic = true,
        privateCode = "",
        description = "",
        hashtags = [],
        from = ""
    } = location.state || {};
    
    // Initialize state values from location data
    const [selectedImage, setSelectedImage] = useState(initialSelectedImage || product.src || product.image || null);
    const [selectedProduct, setSelectedProduct] = useState(product);
    const [wantedProducts, setWantedProducts] = useState([]);
    const [hashtag, setHashtag] = useState(hashtags || product.hashtag || []);
    const [category, setCategory] = useState(location.state?.category || product?.category || "미정");
    
    // Calculate reviews summary
    const reviews = productReviews || [];
    const averageRating = reviews.length > 0 
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
        : 0;
    
    // Format price function for consistent display
    const formatPrice = (price) => {
        if (!price) return "가격 미정";
        return typeof price === 'number' ? price.toLocaleString() : Number(price).toLocaleString();
    };
    
    useEffect(() => {
        // If coming from saleForm, handle specific data format
        if (from === 'saleForm' && product.products) {
            // Initialize with the first product's image if products exist
            if (product.products.length > 0 && !selectedImage) {
                const firstProductImage = product.products[0].image || 
                    (product.products[0].preview ? product.products[0].preview : null);
                
                if (firstProductImage) {
                    setSelectedImage(firstProductImage);
                }
            }
        }
    }, [from, product, selectedImage]);
    
    const handleReportClick = () => {
        navigate('/report', { state: { selectedProduct } });
    };
    
    const onImageClick = (image) => {
        setSelectedImage(image);
        
        // Find the corresponding product
        let selected;
        if (Array.isArray(products) && products.length > 0) {
            selected = products.find((p) => 
                p.image === image || p.src === image || 
                (p.preview && p.preview === image)
            );
        }
        
        if (selected) {
            setSelectedProduct(selected);
        }
    };    

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const [activeTab, setActiveTab] = useState('상세 설명');

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    const handleWantClick = () => {
        if (wantedProducts.some(p => p.id === selectedProduct.id)) {
            alert("이미 추가된 상품입니다.");
            return;
        }
        
        const productWithCategory = {
            ...selectedProduct,
            id: selectedProduct.id || Date.now(),
            name: selectedProduct.name || product.title || "상품명",
            image: selectedImage || product.src || null,
            category: selectedProduct.category || category || "미정",
            price: selectedProduct.price || product.price || 0,
            quantity: 1,
            postId: product.id // Add this line to include the postId
        };
    
        setWantedProducts([...wantedProducts, productWithCategory]);
    };
    
    const handleCancelClick = (productToRemove) => {
        setWantedProducts(wantedProducts.filter(product => product !== productToRemove));
    };

    const increaseQuantity = (product) => {
        // Check max quantity constraint
        const maxQty = product.maxQuantity || product.maxPurchase || 99;
        
        setWantedProducts(wantedProducts.map(p =>
            p.id === product.id ? { 
                ...p, 
                quantity: p.quantity < maxQty ? p.quantity + 1 : p.quantity 
            } : p
        ));
    };
    
    const decreaseQuantity = (product) => {
        setWantedProducts(wantedProducts.map(p =>
            p.id === product.id ? { ...p, quantity: p.quantity > 1 ? p.quantity - 1 : 1 } : p
        ));
    };

    const handleCartClick = () => {
        // Get existing cart items
        const existingCart = JSON.parse(localStorage.getItem("wantedProducts")) || [];
        
        // Combine with new items (avoiding duplicates)
        const combinedCart = [...existingCart];
        
        wantedProducts.forEach(newProduct => {
            const existingIndex = combinedCart.findIndex(p => p.id === newProduct.id);
            if (existingIndex >= 0) {
                // Update quantity if product already exists
                combinedCart[existingIndex].quantity += newProduct.quantity;
            } else {
                // Add new product
                combinedCart.push(newProduct);
            }
        });
        
        localStorage.setItem("wantedProducts", JSON.stringify(combinedCart));
        window.dispatchEvent(new Event("storage"));
        navigate('/order', { state: { wantedProducts, saleLabel, shippingMethods } });
    };
    
    // Calculate total product cost
    const calculateProductCost = () => {
        return wantedProducts.reduce((total, product) => 
            total + (product.price || 0) * product.quantity, 0);
    };

    // Rating label mapping
    const getRatingLabel = (stars) => {
        switch(stars) {
            case 5: return "최고";
            case 4: return "좋음";
            case 3: return "보통";
            case 2: return "별로";
            case 1: return "나쁨";
            default: return "";
        }
    };

    // Placeholder image for when images are missing
    const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='24' fill='%23999999'%3E이미지 없음%3C/text%3E%3C/svg%3E";

    return (
        <div className='container'>
            <div className="person-container">
                <div className="person-product-card">
                    {/* Person Left */}
                    <div className="person-left">
                        <div className="person-profile">
                            <label className="person-user-profile" onClick={() => document.getElementById('profileImage').click()}>
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile" />
                                ) : (
                                    <CgProfile className="personProfile-icon" />
                                )}
                            </label>
                            <input
                                id="profileImage"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="file-input"
                                style={{ display: 'none' }}
                            />
                            <span className="person-username">{userName}</span>
                        </div>

                        {/* Clicked Image Rendering */}
                        <div className="personImageFrameLeft">
                            {selectedImage ? (
                                <img 
                                    src={selectedImage} 
                                    alt={selectedProduct.name || product.title || "상품 이미지"} 
                                    className="person-image" 
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = placeholderImage;
                                    }}
                                />
                            ) : (
                                <img src={placeholderImage} alt="이미지 없음" className="person-image" />
                            )}
                        </div>
                        <button className='needORlike' onClick={handleWantClick}>원합니다</button>
                    </div>

                    {/* Person Right */}
                    <div className='person-right'>
                        <h1 className="person-maintitle">
                            {product.title || product.name || "상품 제목"}
                        </h1>

                        <div className="person-info">
                            <p className='person-products'>상품명: {selectedProduct.name || product.name || "상품명"}</p>
                            <p className="person-price">가격: {formatPrice(selectedProduct.price || product.price)} 원</p>
                            <p className="person-stock">
                                재고: {
                                    selectedProduct.quantity !== undefined ? selectedProduct.quantity : 
                                    selectedProduct.stock !== undefined ? selectedProduct.stock : "무제한"
                                } {
                                    selectedProduct.maxQuantity ? ` / ${selectedProduct.maxQuantity}` :
                                    selectedProduct.maxPurchase ? ` / ${selectedProduct.maxPurchase}` : ""
                                }
                            </p>
                            <p className="person-sale-period">
                                판매기간: {
                                    product.isPermanent ? "상시판매" :
                                    (start_time && end_time) ? `${start_time} ~ ${end_time}` : 
                                    "상시판매"
                                }
                            </p>
                            <p className="person-category">카테고리: {category || product.category || "미정"}</p>
                        </div>
                        
                        {/* Tags Section */}
                        <div className="tags-list">
                            {hashtag && hashtag.length > 0 ? (
                                hashtag.map((tag, index) => (
                                    <span key={index} className="tag-item">
                                        #{typeof tag === 'string' ? tag.trim() : tag}
                                    </span>
                                ))
                            ) : (
                                <p>태그 없음</p>
                            )}
                        </div>

                        <div className='person-button'>
                            <span className='person-report' onClick={handleReportClick}>
                                <AiFillAlert className='report-icon' /> 신고하기
                            </span>
                            <button className="person-chatting">채팅하기</button>
                        </div>

                        {/* Thumbnail Image List */}
                        <div className="personImageFrameRight">
                            {Array.isArray(products) && products.length > 0 ? (
                                products.map((prod, index) => {
                                    const thumbnailSrc = prod.image || 
                                                    (prod.preview ? prod.preview : null);
                                    
                                    if (!thumbnailSrc) return null;
                                    
                                    return (
                                        <img
                                            key={index}
                                            src={thumbnailSrc.startsWith('http') ? thumbnailSrc : 
                                                `${API_BASE_URL}${thumbnailSrc}`}
                                            alt={`상품 이미지 ${index + 1}`}
                                            className="person-image-thumbnail"
                                            onClick={() => onImageClick(thumbnailSrc)}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = placeholderImage;
                                            }}
                                        />
                                    );
                                })
                            ) : (
                                product.image && (
                                    <img 
                                        src={product.image.startsWith('http') ? product.image : 
                                            `${API_BASE_URL}${product.image}`} 
                                        alt="상품 이미지" 
                                        className="person-image-thumbnail"
                                        onClick={() => onImageClick(product.image)}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = placeholderImage;
                                        }}
                                    />
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className='wanted-product-frame'>
                {wantedProducts.length > 0 ? (
                    wantedProducts.map((product, index) => (
                        <div key={index} className='wanted-product'>
                            <div className="image-container">
                                <img src={product.image || placeholderImage} alt={product.name} className="wanted-image" />
                                <div className="sale-labelProduct">
                                    {saleLabel} <span className="separator"> &gt; </span> {product.name} 
                                    <span className="separator"> &gt; </span> {category || product.category || "미정"}
                                </div>
                            </div>
                            <div className="wanted-info">
                                <div className='wanted-NamePrice'>
                                    <p className="wanted-name">{product.name}</p>
                                    <p className="wanted-price">{(product.price * product.quantity).toLocaleString()} 원</p>
                                </div>
                                <div className="quantity-controls">
                                    <p>수량</p>
                                    <div className='quantity'>
                                        <button onClick={() => decreaseQuantity(product)}>-</button>
                                        <span>{product.quantity}</span>
                                        <button onClick={() => increaseQuantity(product)}>+</button>
                                    </div>
                                </div>
                            </div>
                            <button className='needCancel' onClick={() => handleCancelClick(product)}>취소</button>
                        </div>
                    ))
                ) : (
                    <div className='wanted-product-empty'>
                        <p>원한 상품이 없습니다. "원합니다"를 눌러 주십시오.</p>
                    </div>
                )}
            </div>

            <div className='person-details'>
                <div className='person-details-name'>
                    <ul>
                        <li>총 상품 갯수</li>
                        <li>총 상품 금액</li>
                    </ul>
                </div>
                <div className='person-details-price'>
                    <ul>
                        <li>{wantedProducts.reduce((total, product) => total + product.quantity, 0)} 개</li>
                        <li>{calculateProductCost().toLocaleString()} 원</li>
                    </ul>
                </div>
            </div>

            <div className='person-button-group'>
                <button 
                    className='person-cart-btn' 
                    onClick={handleCartClick}
                    disabled={wantedProducts.length === 0}
                >
                    장바구니
                </button>
                <button
                    className="person-buy"
                    onClick={() => navigate('/purchase', { state: { wantedProducts, saleLabel, shippingMethods, product: location.state?.product } })}
                    disabled={wantedProducts.length === 0}
                    >
                    구매하기
                </button>
            </div>

            {/* Tabs for 상세 설명 and 리뷰 */}
            <div className='person-details-tabs'>
                <ul>
                    <li
                        className={activeTab === '상세 설명' ? 'active' : ''}
                        onClick={() => handleTabClick('상세 설명')}
                    >
                        상세 설명
                    </li>
                    <li
                        className={activeTab === '리뷰' ? 'active' : ''}
                        onClick={() => handleTabClick('리뷰')}
                    >
                        리뷰 ({reviews.length})
                    </li>
                </ul>
            </div>

            {/* 상세 설명 및 리뷰 내용 */}
            <div className='personReviewFrame'>
                {activeTab === '상세 설명' ? (
                    <div className='person-description'>
                        <p dangerouslySetInnerHTML={{ __html: description || product.content || product.description || "상품 설명이 없습니다." }} />
                    </div>
                ) : (
                    reviews.length > 0 ? (
                        <>
                            <div className="reviews-summary">
                                <div className="average-rating">
                                    <h3 className='average-ratingTitle'>평균 평점</h3>
                                    <div className="big-rating">
                                        <FaStar className="big-star-icon" />
                                        <span className='starAverageRating'>{averageRating}</span>
                                    </div>
                                    <span className='starTotalRating'>총 {reviews.length}개의 리뷰</span>
                                </div>
                                <div className="rating-breakdown">
                                    {[5, 4, 3, 2, 1].map((stars) => {
                                        const count = reviews.filter(review => review.rating === stars).length;
                                        const percentage = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                                        
                                        return (
                                            <div key={stars} className="rating-bar">
                                                <span className='starPoint'>{getRatingLabel(stars)}</span>
                                                <div className="bar-container">
                                                    <div className="bar" style={{ width: `${percentage}%` }}></div>
                                                </div>
                                                <span className='countStarPoint'>{percentage}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            <div className="person-review">
                                {reviews.map((review, index) => (
                                    <div key={index} className="person-review-item">
                                        <div className="person-review-header">
                                            <div className="person-review-profile">
                                                <div className="person-review-profile-image">
                                                    {review.profileImage ? (
                                                        <img src={review.profileImage} alt="프로필" />
                                                    ) : (
                                                        <CgProfile className="person-review-profile-icon" />
                                                    )}
                                                </div>
                                                <span className="person-review-nickname">{review.nickname || "익명"}</span>
                                            </div>
                                            <div className="person-review-rating-date">
                                                <span className="person-review-rating">
                                                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                                </span>
                                                <span className="person-review-date">{review.date}</span>
                                            </div>
                                        </div>
                                        <p className="person-review-text">{review.reviewText}</p>
                                        {review.uploadedImages && review.uploadedImages.length > 0 && (
                                            <div className="person-review-images">
                                                {review.uploadedImages.map((img, i) => (
                                                    <img key={i} src={img} alt={`리뷰 이미지 ${i + 1}`} className="person-review-image" />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="no-reviews">
                            <p>아직 등록된 리뷰가 없습니다.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

export default SaleDetail;