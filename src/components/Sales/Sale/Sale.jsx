import React, { useContext, useEffect, useState } from 'react';
import { CgProfile } from "react-icons/cg";
import { FaHeart } from 'react-icons/fa';
import { SlSocialDropbox } from "react-icons/sl";
import { useLocation, useNavigate } from 'react-router-dom';
import { default as placeholderImage, default as Sale1 } from '../../../assets/sales/sale1.jpg';
import Sale10 from '../../../assets/sales/sale10.jpg';
import Sale2 from '../../../assets/sales/sale2.jpg';
import Sale3 from '../../../assets/sales/sale3.jpg';
import Sale4 from '../../../assets/sales/sale4.jpg';
import Sale5 from '../../../assets/sales/sale5.jpg';
import Sale6 from '../../../assets/sales/sale6.jpg';
import Sale7 from '../../../assets/sales/sale7.jpg';
import Sale8 from '../../../assets/sales/sale8.jpg';
import Sale9 from '../../../assets/sales/sale9.jpg';
import welcomeVideo from '../../../assets/saleWelcome.mp4';
import { LoginContext } from "../../../contexts/LoginContext";
import './Sale.css';

const API_BASE_URL = 'http://localhost:8080';

// List of supported image extensions
const SUPPORTED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

const Sale = ({ showBanner = true, showCustomProducts = true }) => {
    const defaultProducts = [
        { id: 1, src: Sale1, name: "판매상품_1", price: 10000 },
        { id: 2, src: Sale2, name: "판매상품_2", price: 20000 },
        { id: 3, src: Sale3, name: "판매상품_3", price: 15000 },
        { id: 4, src: Sale4, name: "판매상품_4", price: 25000 },
        { id: 5, src: Sale5, name: "판매상품_5", price: 18000 },
        { id: 6, src: Sale6, name: "판매상품_6", price: 22000 },
        { id: 7, src: Sale7, name: "판매상품_7", price: 19000 },
        { id: 8, src: Sale8, name: "판매상품_8", price: 28000 },
        { id: 9, src: Sale9, name: "판매상품_9", price: 17000 },
        { id: 10, src: Sale10, name: "판매상품_10", price: 30000 }
    ];

    const [userName, setUserName] = useState(() => {
        // localStorage에서 사용자 이름 가져오기
        const storedName = localStorage.getItem('userName');
        // 없으면 기본값 사용
        return storedName || "사용자 이름";
    });
    const { profileImage, userInfo } = useContext(LoginContext);
    const [reviews, setReviews] = useState([]);
    const [savedFormData, setSavedFormData] = useState(() => {
        const storedFormData = localStorage.getItem('formData');
        return storedFormData ? JSON.parse(storedFormData) : null;
    });
    const [liked, setLiked] = useState({});
    const [showDetails, setShowDetails] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const location = useLocation();
    const navigate = useNavigate();

    const [saleFormDataList, setSaleFormDataList] = useState(() => {
        const storedData = localStorage.getItem('saleFormDataList');
        return storedData ? JSON.parse(storedData) : [];
    });

    const [apiResponseList, setApiResponseList] = useState(() => {
        const storedResponses = localStorage.getItem('apiResponseList');
        return storedResponses ? JSON.parse(storedResponses) : [];
    });

    // 리뷰 데이터 로드 및 필터링 로직 개선
    useEffect(() => {
        const loadReviews = () => {
            const storedReviews = JSON.parse(localStorage.getItem("reviews")) || [];
            setReviews(storedReviews);
        };
        
        loadReviews();
        
        const handleStorageChange = () => loadReviews();
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // 현재 상품에 대한 리뷰 필터링 로직 개선
    const productReviews = React.useMemo(() => {
        return reviews.filter(review => {
            // 리뷰에 명시적으로 productId가 있는 경우
            if (review.productId) {
                return [...defaultProducts, ...saleFormDataList.flatMap(sale => sale.products || [])]
                    .some(p => p.id === review.productId);
            }
            
            // 구매 데이터가 있는 경우 구매한 상품과 비교
            if (review.purchase?.products) {
                const allProducts = [
                    ...defaultProducts,
                    ...saleFormDataList.flatMap(sale => sale.products || [])
                ];
                return review.purchase.products.some(p => 
                    allProducts.some(sp => sp.id === p.id)
                );
            }
            
            return false;
        });
    }, [reviews, saleFormDataList]);

    useEffect(() => {
        const storedLikes = JSON.parse(localStorage.getItem('likedProducts')) || [];
        const initialLikedState = {};

        defaultProducts.forEach(product => {
            initialLikedState[product.id] = storedLikes.some(p => p.id === product.id);
        });

        saleFormDataList.forEach(saleData => {
            saleData.products?.forEach(product => {
                initialLikedState[product.id] = storedLikes.some(p => p.id === product.id);
            });
        });

        setLiked(initialLikedState);
    }, [saleFormDataList]);

    useEffect(() => {
        if (location.state?.formData && location.state?.from === 'saleForm') {
            const newFormData = location.state.formData;
            const newApiResponse = location.state.apiResponse || null;
    
            setSaleFormDataList(prev => {
                const existingIndex = prev.findIndex(data => data.id === newFormData.id);
                let updatedList;
                if (existingIndex >= 0) {
                    updatedList = [...prev];
                    updatedList[existingIndex] = newFormData;
                } else {
                    updatedList = [...prev, newFormData];
                }
                localStorage.setItem('saleFormDataList', JSON.stringify(updatedList));
                return updatedList;
            });
    
            setApiResponseList(prev => {
                const existingIndex = prev.findIndex(res => res?.id === newApiResponse?.id);
                let updatedResponses;
                if (existingIndex >= 0 && newApiResponse) {
                    updatedResponses = [...prev];
                    updatedResponses[existingIndex] = newApiResponse;
                } else if (newApiResponse) {
                    updatedResponses = [...prev, newApiResponse];
                } else {
                    updatedResponses = prev;
                }
                localStorage.setItem('apiResponseList', JSON.stringify(updatedResponses));
                return updatedResponses;
            });
        }
    }, [location.state]);

    useEffect(() => {
        if (location.state?.from === 'management' && location.state?.message) {
            const storedData = localStorage.getItem('saleFormDataList');
            setSaleFormDataList(storedData ? JSON.parse(storedData) : []);

            const storedResponses = localStorage.getItem('apiResponseList');
            setApiResponseList(storedResponses ? JSON.parse(storedResponses) : []);
        }
    }, [location.state]);

    const handleLike = (productId) => {
        setLiked(prev => {
            const newState = { ...prev, [productId]: !prev[productId] };
            
            const likedProducts = JSON.parse(localStorage.getItem('likedProducts')) || [];
            const product = [...defaultProducts, ...saleFormDataList.flatMap(sale => sale.products || [])]
                .find(p => p.id === productId);
            
            if (product) {
                if (newState[productId]) {
                    localStorage.setItem('likedProducts', 
                        JSON.stringify([...likedProducts, product]));
                } else {
                    localStorage.setItem('likedProducts', 
                        JSON.stringify(likedProducts.filter(p => p.id !== productId)));
                }
            }
            
            return newState;
        });
    };

    const formatHashtags = (hashtagData) => {
        if (!hashtagData) return [];
        if (Array.isArray(hashtagData)) return hashtagData.filter(tag => tag.trim() !== '');
        if (typeof hashtagData === 'string') return hashtagData.split(',').filter(tag => tag.trim() !== '');
        return [];
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (e) {
            return dateString;
        }
    };

    // 검색 기능 개선: 기본 상품명 검색
    const filteredProducts = defaultProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 커스텀 상품 검색 기능: title과 hashtag 포함
    const filteredSaleFormData = saleFormDataList.filter(saleData => {
        const query = searchQuery.toLowerCase();
        
        // title 검색
        const titleMatch = saleData.title?.toLowerCase().includes(query);
        
        // hashtag 검색
        const hashtags = formatHashtags(saleData.hashtag);
        const hashtagMatch = hashtags.some(tag => 
            tag.toLowerCase().includes(query)
        );
        
        // 상품명 검색 (products 배열 내)
        const productNameMatch = saleData.products?.some(product =>
            product.name?.toLowerCase().includes(query)
        );
        
        return titleMatch || hashtagMatch || productNameMatch;
    });

    // Enter 키 처리 함수
    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            console.log('검색어:', searchQuery);
        }
    };

    const handleProductClick = (product) => {
        navigate('/person', {
            state: {
                product: {
                    ...product,
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.src,
                    src: product.src,
                    quantity: 10,
                    maxQuantity: 20
                },
                products: [{
                    ...product,
                    image: product.src,
                    src: product.src
                }],
                selectedImage: product.src,
                saleLabel: "판매",
                userName: userName,
                profileImage: userInfo?.profileImage || profileImage,
                from: 'sale',
                productReviews: productReviews.filter(review => 
                    review.productId === product.id || 
                    review.purchase?.products?.some(p => p.id === product.id))
                }
        });
    };

    const getImageExtension = (image) => {
        if (!image) return SUPPORTED_IMAGE_EXTENSIONS[0];
        if (typeof image === 'string') {
            const match = image.match(/\.([a-zA-Z0-9]+)$/);
            return match ? match[1].toLowerCase() : SUPPORTED_IMAGE_EXTENSIONS[0];
        }
        if (typeof image === 'object' && image.extension) {
            return image.extension.toLowerCase();
        }
        return SUPPORTED_IMAGE_EXTENSIONS[0];
    };

    const getProductImageUrl = (image, postId, index) => {
        if (!image || !postId) return placeholderImage;
    
        if (typeof image === 'string') {
            if (image.startsWith('http') || image.startsWith('blob:')) {
                return image;
            }
        }
    
        if (typeof image === 'object' && image.preview) {
            return image.preview;
        }
    
        const extension = getImageExtension(image) || 'png';
        return `${API_BASE_URL}/productPost/product/${postId}_${index + 1}.${extension}`;
    };

    const getThumbnailImageUrl = (thumbnailImage, productId) => {
        if (!thumbnailImage) return placeholderImage;

        if (typeof thumbnailImage === 'string') {
            if (thumbnailImage.startsWith('http') || thumbnailImage.startsWith('blob:')) {
                return thumbnailImage;
            }
        }

        if (typeof thumbnailImage === 'object' && thumbnailImage.preview) {
            return thumbnailImage.preview;
        }

        const extension = getImageExtension(thumbnailImage);
        return `${API_BASE_URL}/productPost/thumbnail/${productId}_1.${extension}`;
    };

    const handleSaleFormProductClick = (saleFormData) => {
        if (!saleFormData) return;
    
        const thumbnailImageUrl = getThumbnailImageUrl(saleFormData.thumbnailImage, saleFormData.id);
    
        const formattedProducts = saleFormData.products?.map((product, index) => ({
            ...product,
            id: product.id,
            name: product.name,
            price: product.price,
            image: getProductImageUrl(product.image, saleFormData.id, index) || thumbnailImageUrl,
            src: getProductImageUrl(product.image, saleFormData.id, index) || thumbnailImageUrl,
            quantity: product.quantity,
            maxQuantity: product.maxQuantity
        }));
    
        // 해당 상품과 관련된 리뷰만 필터링
        const relatedReviews = productReviews.filter(review => {
            if (review.productId) {
                return saleFormData.products?.some(p => p.id === review.productId);
            }
            if (review.purchase?.products) {
                return review.purchase.products.some(p => 
                    saleFormData.products?.some(sp => sp.id === p.id))
            }
            return false;
        });
    
        navigate('/person', {
            state: {
                product: {
                    ...saleFormData,
                    id: saleFormData.id,
                    name: saleFormData.title,
                    price: saleFormData.products?.[0]?.price || 0,
                    image: thumbnailImageUrl,
                    src: thumbnailImageUrl,
                    quantity: saleFormData.products?.[0]?.quantity || 0,
                    maxQuantity: saleFormData.products?.[0]?.maxQuantity || 0
                },
                products: formattedProducts || [],
                selectedImage: thumbnailImageUrl,
                saleLabel: "판매",
                userName: saleFormData.user?.name || userName,
                userProfileImage: saleFormData.user?.profileImage || profileImage,
                shippingMethods: saleFormData.delivers || [],
                category: saleFormData.category?.name || "",
                description: saleFormData.content || "",
                hashtags: saleFormData.hashtag ? formatHashtags(saleFormData.hashtag) : [],
                from: 'saleForm',
                productReviews: relatedReviews
            }
        });
    };

    // 검색어가 있는지 확인
    const isSearching = searchQuery.trim().length > 0;

    return (
        <div className='container'>
            <div className="sale-container">
                {showBanner && (
                    <div className="sale-banner">
                        <video 
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="sale-video"
                            disablePictureInPicture
                            onContextMenu={(e) => e.preventDefault()}
                        >
                            <source src={welcomeVideo} type="video/mp4" />
                        </video>
                        <div className="sale-banner-content">
                            <h1 className="sale-title">😊 원하는 상품을 검색해 보세요 😊</h1>
                            <input 
                                type="text" 
                                placeholder="상품명, 제목, 해시태그 검색" 
                                className="sale-search-input" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleSearchKeyPress}
                            />
                        </div>
                    </div>
                )}

                <div className='saleProductFrame'>
                    {/* 검색 중이 아닐 때만 헤더 표시 */}
                    {showBanner && !isSearching && (
                        <div className='sale-header'>
                            <div className='sale-icon'>
                                <SlSocialDropbox className='salebox-icon' />
                                <FaHeart className='heart-icon' />
                            </div>
                            <h2 className="sale-heading">판매 제품</h2>
                        </div>
                    )}

                    <div className="sale-grid">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="sale-card">
                                <div className="sale-profile-info">
                                    {userInfo?.profileImage ? (
                                        <img 
                                        src={userInfo.profileImage} 
                                        alt="Profile" 
                                        className="sale-profile-pic" 
                                        onError={(e) => { e.target.src = placeholderImage; }}
                                        />
                                    ) : (
                                        <CgProfile className="sale-profile-pic" />
                                    )}
                                    <p className="sale-user-name">{userName}</p>
                                </div>
                                <div onClick={() => handleProductClick(product)}>
                                    <img 
                                        src={product.src} 
                                        alt={product.name} 
                                        className="sale-image" 
                                        onError={(e) => { e.target.src = placeholderImage; }}
                                    />
                                </div>
                                <span className="sale-label">판매</span>
                                <button 
                                    className={`sale-like-button ${liked[product.id] ? 'liked' : ''}`} 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleLike(product.id);
                                    }}
                                >
                                    <FaHeart size={18} />
                                </button>
                                <p className="sale-product-name">{product.name}</p>
                                <p className="sale-product-price">
                                    {product.price.toLocaleString()}원
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {showCustomProducts && filteredSaleFormData.length > 0 && (
                    <div className="customProductFrame">
                        {/* 검색 중이 아닐 때만 헤더 표시 */}
                        {!isSearching && (
                            <div className='sale-header'>
                                <div className='sale-icon'>
                                    <SlSocialDropbox className='salebox-icon' />
                                    <FaHeart className='heart-icon' />
                                </div>
                                <h2 className="sale-heading">내 판매 제품</h2>
                            </div>
                        )}
                        <div className="saleWrite-grid">
                            {filteredSaleFormData.map((saleFormData) => (
                                <div key={saleFormData.id} className="sale-card">
                                    <div className="sale-profile-info">
                                        {userInfo?.profileImage || profileImage ? (
                                            <img 
                                            src={userInfo?.profileImage || profileImage} 
                                            alt="Profile" 
                                            className="sale-profile-pic" 
                                            onError={(e) => { e.target.src = placeholderImage; }}
                                            />
                                        ) : (
                                            <CgProfile className="sale-profile-pic" />
                                        )}
                                        <p className="sale-user-name">{userInfo?.nickname || userName}</p>
                                    </div>
                                    <div onClick={() => handleSaleFormProductClick(saleFormData)}>
                                        {saleFormData.thumbnailImage && (
                                            <img
                                                src={getThumbnailImageUrl(saleFormData.thumbnailImage, saleFormData.id)}
                                                alt={saleFormData.title}
                                                className="sale-image"
                                                onError={(e) => { e.target.src = placeholderImage; }}
                                            />
                                        )}
                                    </div>
                                    <span className="sale-label">판매</span>
                                    {saleFormData.products && saleFormData.products[0] && (
                                        <button 
                                            className={`sale-like-button ${liked[saleFormData.products[0].id] ? 'liked' : ''}`} 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleLike(saleFormData.products[0].id);
                                            }}
                                        >
                                            <FaHeart size={18} />
                                        </button>
                                    )}
                                    <p className="sale-product-name">{saleFormData.title}</p>
                                    {saleFormData.products?.[0] && (
                                        <p className="sale-product-price">
                                            {Number(saleFormData.products[0].price).toLocaleString()}원
                                        </p>
                                    )}
                                    {showDetails[saleFormData.id] && (
                                        <div className="product-details">
                                            <div dangerouslySetInnerHTML={{ 
                                                __html: saleFormData.content 
                                            }} />
                                            
                                            <h4>상품 목록</h4>
                                            {saleFormData.products?.map((product, index) => (
                                                <div key={product.id} className="product-detail-item">
                                                    <h3>{product.name}</h3>
                                                    <img 
                                                        src={getProductImageUrl(product.image, saleFormData.id, index)} 
                                                        alt={product.name} 
                                                        className="product-image" 
                                                        onError={(e) => { e.target.src = placeholderImage; }}
                                                    />
                                                    <p>가격: {Number(product.price).toLocaleString()}원</p>
                                                    <p>재고: {product.quantity}</p>
                                                    <p>최대 구매 개수: {product.maxQuantity}</p>
                                                </div>
                                            ))}
                                            <p>카테고리: {saleFormData.category?.name || saleFormData.category}</p>
                                            {productReviews.length > 0 && (
                                                <div className="reviews-section">
                                                    <h3>리뷰 ({productReviews.length})</h3>
                                                    {productReviews.map((review, index) => (
                                                        <div key={`${review.date}-${index}`} className="review-item">
                                                            <div className="review-header">
                                                                <span className="review-rating">
                                                                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                                                </span>
                                                                <span className="review-date">{review.date}</span>
                                                            </div>
                                                            <p className="review-text">{review.reviewText}</p>
                                                            
                                                            {review.uploadedImages && review.uploadedImages.length > 0 && (
                                                                <div className="review-images">
                                                                    {review.uploadedImages.map((img, imgIndex) => (
                                                                        <img 
                                                                            key={imgIndex} 
                                                                            src={img} 
                                                                            alt={`리뷰 이미지 ${imgIndex + 1}`} 
                                                                            className="review-image"
                                                                            onError={(e) => { e.target.src = placeholderImage; }}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <p>판매 기간: 
                                                {saleFormData.isPermanent ? (
                                                    " 상시판매"
                                                ) : saleFormData.startTime && saleFormData.endTime ? (
                                                    ` ${formatDate(saleFormData.startTime)} ~ ${formatDate(saleFormData.endTime)}`
                                                ) : (
                                                    " 판매 기간 없음"
                                                )}
                                            </p>
                                            
                                            <h4>배송 방법</h4>
                                            {saleFormData.delivers?.map((method, index) => (
                                                <div key={index} className="shipping-method-item">
                                                    <p>배송 방법: {method.name}</p>
                                                    <p>배송비: {Number(method.price).toLocaleString()}원</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {saleFormData.hashtag && (
                                        <div className="tags-container">
                                            <div className="tags-list">
                                                {formatHashtags(saleFormData.hashtag).map((tag, index) => (
                                                    <span key={index} className="tag-item">#{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 검색 결과가 없을 때 표시 */}
                {searchQuery && filteredProducts.length === 0 && filteredSaleFormData.length === 0 && (
                    <div className="no-search-results">
                        <p style={{ textAlign: 'center', marginTop: '50px', fontSize: '18px', color: '#666' }}>
                            "{searchQuery}"에 대한 검색 결과가 없습니다.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sale;