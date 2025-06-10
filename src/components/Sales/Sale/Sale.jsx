import React, { useEffect, useState } from 'react';
import { CgProfile } from "react-icons/cg";
import { FaHeart } from 'react-icons/fa';
import { SlSocialDropbox } from "react-icons/sl";
import { useLocation, useNavigate } from 'react-router-dom';
import Sale1 from '../../../assets/sales/sale1.jpg';
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
import './Sale.css';

const API_BASE_URL = 'http://localhost:8080';

// List of supported image extensions
const SUPPORTED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

const Sale = ({ showBanner = true }) => {
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

    const [userName] = useState(() => localStorage.getItem('userName') || "사용자 이름");
    const [reviews] = useState([]);
    const [liked, setLiked] = useState({});
    const [showDetails, setShowDetails] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const location = useLocation();
    const navigate = useNavigate();

    const [saleFormData, setSaleFormData] = useState(() => {
        if (location.state?.formData && location.state?.from === 'saleForm') {
            return location.state.formData;
        }
        const storedData = localStorage.getItem('saleFormData');
        return storedData ? JSON.parse(storedData) : null;
    });

    const [apiResponse, setApiResponse] = useState(() => {
        return location.state?.apiResponse || null;
    });

    useEffect(() => {
        const storedLikes = JSON.parse(localStorage.getItem('likedProducts')) || [];
        const initialLikedState = {};
        
        defaultProducts.forEach(product => {
            initialLikedState[product.id] = storedLikes.some(p => p.id === product.id);
        });
        
        if (saleFormData?.products) {
            saleFormData.products.forEach(product => {
                initialLikedState[product.id] = storedLikes.some(p => p.id === product.id);
            });
        }
        
        setLiked(initialLikedState);
    }, [saleFormData]);

    useEffect(() => {
        if (location.state?.formData && location.state?.from === 'saleForm') {
            const formData = location.state.formData;
            localStorage.setItem('saleFormData', JSON.stringify(formData));
            setSaleFormData(formData);
            
            if (location.state?.apiResponse) {
                setApiResponse(location.state.apiResponse);
            }
        }
    }, [location.state]);

    const handleLike = (productId) => {
        setLiked(prev => {
            const newState = { ...prev, [productId]: !prev[productId] };
            
            const likedProducts = JSON.parse(localStorage.getItem('likedProducts')) || [];
            const product = [...defaultProducts, ...(saleFormData?.products || [])]
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

    const filteredProducts = defaultProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                from: 'sale'
            }
        });
    };

    const getImageExtension = (image) => {
        if (!image) return SUPPORTED_IMAGE_EXTENSIONS[0]; // Default to first supported extension
        if (typeof image === 'string') {
            const match = image.match(/\.([a-zA-Z0-9]+)$/);
            return match ? match[1].toLowerCase() : SUPPORTED_IMAGE_EXTENSIONS[0];
        }
        if (typeof image === 'object' && image.extension) {
            return image.extension.toLowerCase();
        }
        return SUPPORTED_IMAGE_EXTENSIONS[0]; // Fallback
    };

    const getProductImageUrl = (image, postId, index) => {
        if (!image || !postId) return placeholderImage;
    
        // If image is a full URL (http or blob), use it directly
        if (typeof image === 'string') {
            if (image.startsWith('http') || image.startsWith('blob:')) {
                return image;
            }
        }
    
        // If image is an object with a preview, use the preview
        if (typeof image === 'object' && image.preview) {
            return image.preview;
        }
    
        // Derive extension dynamically
        const extension = getImageExtension(image) || 'png';
    
        // Construct URL with the correct postId and index
        return `${API_BASE_URL}/productPost/product/${postId}_${index + 1}.${extension}`;
    };

    const getThumbnailImageUrl = (thumbnailImage, productId) => {
        if (!thumbnailImage) return placeholderImage;

        // If thumbnail is a full URL (http or blob), use it directly
        if (typeof thumbnailImage === 'string') {
            if (thumbnailImage.startsWith('http') || thumbnailImage.startsWith('blob:')) {
                return thumbnailImage;
            }
        }

        // If thumbnail is an object with a preview, use the preview
        if (typeof thumbnailImage === 'object' && thumbnailImage.preview) {
            return thumbnailImage.preview;
        }

        // Derive extension dynamically
        const extension = getImageExtension(thumbnailImage);

        // Construct URL with the derived extension
        return `${API_BASE_URL}/productPost/thumbnail/${productId}_1.${extension}`;
    };

    const handleSaleFormProductClick = () => {
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
                shippingMethods: saleFormData.delivers || [],
                category: saleFormData.category?.name || "",
                description: saleFormData.content || "",
                hashtags: saleFormData.hashtag ? formatHashtags(saleFormData.hashtag) : [],
                from: 'saleForm'
            }
        });
    };

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
                                placeholder="상품명 검색🎉🎉" 
                                className="sale-search-input" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <div className='saleProductFrame'>
                    {showBanner && (
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
                                    <CgProfile className="sale-profile-pic" />
                                    <p className="sale-user-name">{userName}</p>
                                </div>
                                <div onClick={() => handleProductClick(product)}>
                                    <img 
                                        src={product.src} 
                                        alt={product.name} 
                                        className="sale-image" 
                                        onError={(e) => { e.target.src = placeholderImage; }} // Fallback to placeholder
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

                {saleFormData && (
                    <div className="customProductFrame">
                        <div className='sale-header'>
                            <div className='sale-icon'>
                                <SlSocialDropbox className='salebox-icon' />
                                <FaHeart className='heart-icon' />
                            </div>
                            <h2 className="sale-heading">내 판매 제품</h2>
                        </div>
                        <div className="saleWrite-grid">
                            <div className="sale-card">
                                <div className="sale-profile-info">
                                    <CgProfile className="sale-profile-pic" />
                                    <p className="sale-user-name">
                                        {saleFormData.user?.name || userName}
                                    </p>
                                </div>
                                <div onClick={handleSaleFormProductClick}>
                                    {saleFormData.thumbnailImage && (
                                        <img
                                            src={getThumbnailImageUrl(saleFormData.thumbnailImage, saleFormData.id)}
                                            alt={saleFormData.title}
                                            className="sale-image"
                                            onError={(e) => { e.target.src = placeholderImage; }} // Fallback to placeholder
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

                                {showDetails && (
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
                                        <p>카테고리: {saleFormData.category}</p>
                                        
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
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sale;