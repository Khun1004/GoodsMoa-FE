import React, { useContext, useEffect, useState } from 'react';
import { AiFillAlert } from "react-icons/ai";
import { CgProfile } from "react-icons/cg";
import { FaStar } from "react-icons/fa";
import { useLocation, useNavigate } from 'react-router-dom';
import productService from '../../../api/ProductService';
import { LoginContext } from "../../../contexts/LoginContext";
import LikeButton from '../Sale/LikeButton';
import "./SaleDetail.css";

const API_BASE_URL = 'http://localhost:8080';

const SaleDetail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [liked, setLiked] = useState({});
    const [likedInfo, setLikedInfo] = useState(null);
    const [likeError, setLikeError] = useState(null);

    const [ddescription, setDdescription] = useState( "");
    const [sellerId, setSellerId] = useState(null);
    const [fetchedProducts, setFetchedProducts] = useState([]);
    const {
        product,
        products = [],
        selectedImage: initialSelectedImage = null,
        productReviews: initialProductReviews = [],
        start_time = null,
        end_time = null,
        saleLabel = "판매",
        isPublic = true,
        privateCode = "",
        description = "",
        hashtags = [],
        from = "",
        userName: userNameProp,
        profileImage: profileImageProp
    } = location.state || {};

    const [shippingMethods, setShippingMethods] = useState(product?.delivers || []);

    const { profileImage: contextProfileImage, userInfo } = useContext(LoginContext);

    const [profileImage, setProfileImage] = useState(
        product?.userImage || null
    );

    const [userName, setUserName] = useState(
        product?.nickname || "사용자 이름"
    )

    useEffect(() => {
        if (!product?.id) return;

        const fetchProductDetail = async () => {
            try {
                const response = await fetch(`http://localhost:8080/product/post-detail/${product.id}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!response.ok) {
                    console.error("❌ 상품글 상세 조회 실패 (status:", response.status, ")");
                    return;
                }

                const data = await response.json();
                console.log("✅ 상품 상세 조회 성공! 응답 데이터:", data);
                setSellerId(data.userId); // 여기서 저장!!

                setDdescription(data.content);
                if (data.products) {
                    setFetchedProducts(data.products); // ← 네가 따로 만든 상태
                    setSelectedProduct(data.products[0] || {});
                    setSelectedImage(data.products[0]?.image || null);

                }

                if (data.delivers) {
                    console.log("🚚 배송방식(delivers):", data.delivers);
                }

                if (data.categoryName) {
                    setCategory(data.categoryName);
                }

            } catch (err) {
                console.error("❌ 상품 상세 조회 중 에러 발생:", err);
            }
        };

        fetchProductDetail();
    }, [product?.id]);



    useEffect(() => {
        // 상품 ID가 없으면 실행 안 함
        if (!product?.id) return;

        const fetchProductDetail = async () => {
            console.log("📦 상품 상세 정보 조회 시작됨 (id:", product.id, ")");

            try {
                // fetch로 상품 상세 정보 조회 요청
                const response = await fetch(`http://localhost:8080/product/post-detail/${product.id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                // 응답이 성공인지 확인
                if (!response.ok) {
                    console.error("❌ 상품글 상세 조회 실패 (status:", response.status, ")");
                    return;
                }

                // JSON 파싱
                const data = await response.json();
                console.log("✅ 상품 상세 조회 성공! 응답 데이터:", data);

                // product 안의 하위 상품들 덮어쓰기
                if (data.products) {
                    setSelectedProduct(data.products[0] || {});  // 첫 번째 상품으로 기본 설정
                    setSelectedImage(data.products[0]?.image || null);  // 대표 이미지도 세팅
                    console.log("📷 대표 이미지 설정:", data.products[0]?.image);
                }

                // 배송 방식 업데이트
                if (data.delivers) {
                    console.log("🚚 배송방식(delivers) 정보 업데이트:", data.delivers);
                    setShippingMethods(data.delivers);
                }

                // 카테고리 업데이트
                if (data.categoryName) {
                    console.log("📂 카테고리 업데이트:", data.categoryName);
                    setCategory(data.categoryName);
                }

            } catch (err) {
                console.error("❌ 상품 상세 조회 중 에러 발생:", err);
            }
        };

        fetchProductDetail();
    }, [product?.id]);


    useEffect(() => {
        if (contextProfileImage) setProfileImage(contextProfileImage);
    }, [contextProfileImage]);

    // 좋아요 상태 가져오기
    useEffect(() => {
        const fetchLikedInfo = async () => {
            if (!product?.id) return;

            try {
                const res = await productService.getSingleLikedPost(product.id);
                setLiked(prev => ({
                    ...prev,
                    [String(product.id)]: !!res
                }));
            } catch (err) {
                // 404인 경우엔 콘솔 줄이기
                if (err.message.includes("404")) {
                    console.warn(`🤍 좋아요 안 되어 있음 (ID: ${product.id})`);
                } else {
                    console.error(`❌ 좋아요 조회 중 에러 (ID: ${product.id}):`, err);
                }

                setLiked({ [String(product.id)]: false });
            }
        };

        fetchLikedInfo();
    }, [product?.id]);

    const fixedContent = (product.content || "").replace(/<img[^>]*src=['"]([^'"]+)['"][^>]*>/g, (match, src) => {
        if (src.startsWith("http")) return match; // 절대경로면 그대로
        return match.replace(src, `http://localhost:8080/${src}`);
    });

    const [selectedImage, setSelectedImage] = useState(initialSelectedImage || product.src || product.image || null);
    const [selectedProduct, setSelectedProduct] = useState(product);
    const [wantedProducts, setWantedProducts] = useState([]);
    const [hashtag, setHashtag] = useState([]);

    useEffect(() => {
        const tagSource = location.state?.hashtags || product?.hashtag || "";
        const parsed = typeof tagSource === 'string' ? tagSource.split(',') : Array.isArray(tagSource) ? tagSource : [];
        setHashtag(parsed);
    }, [location.state, product?.hashtag]);

    const [category, setCategory] = useState(location.state?.category || product?.category || product?.categoryName || "미정");
    const [productReviews, setProductReviews] = useState(initialProductReviews);

    // 서버에서 불러오는 리뷰
    useEffect(() => {
        const fetchProductReviews = async () => {
            if (!product?.id) return;
            try {
                const response = await productService.getReviewsByPost(product.id);
                setProductReviews(response.content); // Page 객체에서 content만 저장
            } catch (err) {
                console.error("상품 리뷰 조회 실패:", err);
            }
        };

        fetchProductReviews();
    }, [product?.id]);

    // 로컬 스토리지로 불러오는 리뷰 값
    // useEffect(() => {
    //     const storedReviews = JSON.parse(localStorage.getItem("reviews")) || [];
    //     const filteredReviews = storedReviews.filter(review =>
    //         review.productId === product.id ||
    //         review.purchase?.products?.some(p => p.id === product.id)
    //     );
    //     setProductReviews(filteredReviews);
    // }, [product.id]);

    useEffect(() => {
        if (location.state?.productReviews) {
            setProductReviews(location.state.productReviews);
            return;
        }

        const storedReviews = JSON.parse(localStorage.getItem("reviews")) || [];
        const filteredReviews = storedReviews.filter(review => {
            if (review.productId === product.id) return true;
            if (review.purchase?.products) {
                return review.purchase.products.some(p => p.id === product.id);
            }
            return false;
        });
        setProductReviews(filteredReviews);
    }, [product.id, location.state?.productReviews]);

    useEffect(() => {
        const handleStorageChange = () => {
            const storedReviews = JSON.parse(localStorage.getItem("reviews")) || [];
            const filteredReviews = storedReviews.filter(review =>
                review.productId === product.id ||
                review.purchase?.products?.some(p => p.id === product.id)
            );
            setProductReviews(filteredReviews);
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [product.id]);

    const averageRating = productReviews.length > 0
        ? (productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length).toFixed(1)
        : 0;

    const formatPrice = (price) => {
        if (!price) return "가격 미정";
        return typeof price === 'number' ? price.toLocaleString() : Number(price).toLocaleString();
    };

    const isValidProductImage = () => {


        if (!selectedImage) {

            return false;
        }

        if (selectedImage.includes('/thumbnail/')) {

            return false;
        }

        const selectedFileName = selectedImage.split('/').pop();


        const candidates = fetchedProducts.length > 0
            ? fetchedProducts
            : (product?.products || products || []);

        if (candidates.length > 0) {
            const match = candidates.some(prod => {
                const prodImage = prod.image || prod.preview || prod.src || "";
                const match = prodImage.includes(selectedFileName);

                return match;
            });
            console.log("✅ 매칭 결과:", match);
            return match;
        }

        const mainImage = product.image || product.src || "";
        const match = mainImage.includes(selectedFileName);
        console.log(`🖼️ 메인이미지 검사: ${mainImage} vs ${selectedFileName} → ${match}`);
        return match;
    };


    useEffect(() => {
        if (from === 'saleForm' && product.products) {
            if (product.products.length > 0 && !selectedImage) {
                const firstProductImage = product.products[0].image || product.products[0].preview || null;
                if (firstProductImage) {
                    setSelectedImage(firstProductImage);
                }
            }
        }
    }, [from, product, selectedImage]);

    const handleReportClick = () => {
        navigate('/report', { state: { selectedProduct } });
    };

    // 채팅 실행하는 메서드
    const handleChatClick = async () => {
        console.log("✅ handleChatClick 호출됨");

        // 여기서 상태값 sellerId 를 직접 사용하거나, 복사해서 씀
        const currentSellerId = sellerId;

        if (!userInfo) {
            alert("로그인이 필요합니다.");
            return;
        }
        if (!currentSellerId) {
            alert("판매자 정보가 없습니다.");
            return;
        }
        if (userInfo.id === currentSellerId) {
            alert("자기 자신과는 채팅할 수 없습니다.");
            return;
        }

        const res = await fetch("http://localhost:8080/chatroom/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                buyerId: userInfo.id,
                sellerId: currentSellerId,
            }),
            credentials: "include"
        });

        if (res.ok) {
            const roomData = await res.json();
            window.open(`/chat-app?roomId=${roomData.id}`, "_blank", "width=1000,height=800,resizable=yes");
        } else if (res.status === 409) {
            const roomData = await res.json();
            window.open(`/chat-app?roomId=${roomData.id}`, "_blank", "width=1000,height=800,resizable=yes");
        } else {
            alert("채팅방 생성에 실패했습니다.");
        }
    };


    const onImageClick = (image) => {
        setSelectedImage(image);

        const imageFileName = image.split('/').pop(); // ex: 3_1.png

        const candidateProducts = product?.products || products || [];

        const selected = candidateProducts.find((p) => {
            const candidatePath = p.image || p.src || p.preview || "";
            return candidatePath.includes(imageFileName);
        });

        if (selected) {
            setSelectedProduct(selected);
        }
    };


    const [activeTab, setActiveTab] = useState('상세 설명');

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    const handleWantClick = () => {
        // Check if the current image is a valid product image
        if (!isValidProductImage()) {
            alert("상품 이미지를 선택해주세요.");
            return;
        }

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
            postId: product.id
        };

        setWantedProducts([...wantedProducts, productWithCategory]);
    };

    const handleCancelClick = (productToRemove) => {
        const updatedProducts = wantedProducts.filter(product => product !== productToRemove);
        setWantedProducts(updatedProducts);

        // 마지막 상품이 삭제되면 selectedImage와 selectedProduct를 초기화
        if (updatedProducts.length === 0) {
            setSelectedImage(initialSelectedImage || product.src || product.image || null);
            setSelectedProduct(product); // 원래의 product로 초기화
        }
    };

    const increaseQuantity = (product) => {
        // 재고 확인 (selectedProduct.stock 또는 product.stock 사용)
        const stock = selectedProduct.stock || product.stock || Infinity;

        // 최대 구매 가능 수량 확인
        const maxQty = Math.min(
            stock,
            product.maxQuantity || product.maxPurchase || 99
        );

        if (product.quantity >= maxQty) {
            alert(`${maxQty}개만 구매할 수 있습니다.`);
            return;
        }

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

    // 좋아요 토글
    const handleLike = async (postId) => {
        console.log('handleLike 실행됨!@!@!@!@!@!@!@!@!@');
        const isLiked = liked[String(postId)];

        try {
            if (isLiked) {
                await productService.unlikeProduct(postId);
            } else {
                await productService.likeProduct(postId);
            }

            // 상태 토글
            setLiked(prev => ({
                ...prev,
                [String(postId)]: !isLiked,
            }));
        } catch (err) {
            console.error('좋아요 처리 중 오류:', err.message);
            alert('좋아요 처리에 실패했습니다.');
        }
    };

    const isMainProductImage = () => {
        if (!selectedImage || !product) return false;

        const mainImage = product.image || product.src || "";
        const selectedFileName = selectedImage.split('/').pop();

        return mainImage.includes(selectedFileName);
      };

    // Placeholder image for when images are missing
    const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='24' fill='%23999999'%3E이미지 없음%3C/text%3E%3C/svg%3E";




    return (

        <div className='container'>
            <div className="person-container">
                <div className="person-product-card">
                    {/* Person Left */}
                    <div className="person-left">
                        {/* Clicked Image Rendering */}
                        <div className="personImageFrameLeft">
                            {selectedImage ? (
                                <img
                                    src={selectedImage}
                                    alt={selectedProduct.name || product.title || "식네임 이미지"}
                                    className="person-image"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = placeholderImage;
                                    }}
                                />
                            ) : (
                                <img src={placeholderImage} alt="식네임 이미지 없음" className="person-image" />
                            )}
                        </div>
                        <button
                            className={`needORlike ${!isValidProductImage() ? 'disabled' : ''}`}
                            onClick={handleWantClick}
                            disabled={!isValidProductImage()}
                        >
                            상품 추가하기
                        </button>
                    </div>

                    {/* Person Right */}
                    <div className='person-right'>
                        <div className="person-profile">
                            <label className="person-user-profile">
                                {profileImage ? (
                                    <img
                                        src={profileImage}
                                        alt="Profile"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = placeholderImage;
                                        }}
                                    />
                                ) : (
                                    <CgProfile className="personProfile-icon"/>
                                )}
                            </label>
                            <span className="person-username">
                                {userName}
                            </span>
                        </div>
                        <h1 className="person-maintitle">
                            {product.title || product.name || "상품 제목"}
                        </h1>

                        <div className="person-info">
                            <p className="person-sale-period">
                                판매기간: {
                                product.isPermanent
                                    ? "상시판매"
                                    : (product.startTime && product.endTime)
                                        ? `${product.startTime} ~ ${product.endTime}`
                                        : "상시판매"
                            }
                            </p>
                            <p className="person-category">카테고리: {category || product.category || "미정"}</p>
                            <p className='person-products'>상품명: {selectedProduct.name || "상품명"}</p>
                            <p className="person-price">가격: {formatPrice(selectedProduct.price || product.price)} 원</p>
                            <p className="person-stock">
                                재고: {
                                selectedProduct.quantity !== undefined ? selectedProduct.quantity :
                                    selectedProduct.stock !== undefined ? selectedProduct.stock : "무제한"
                            } {

                            }
                            </p>
                            <p className="view-count">조회수 : {product.views || 0}</p>


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
                                <AiFillAlert className='report-icon'/> 신고하기
                            </span>
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <button className="person-chatting" onClick={handleChatClick}>채팅하기</button>
                                <LikeButton postId={product.id} liked={liked} handleLike={handleLike}/>
                            </div>
                        </div>

                        {/* Thumbnail Image List */}
                        <div className="personImageFrameRight">
                            {Array.isArray(fetchedProducts) && fetchedProducts.length > 0 ? (
                                fetchedProducts.map((prod, index) => {
                                    const thumbnailSrc = prod.image || prod.preview || prod.src;
                                    if (!thumbnailSrc) return null;

                                    const imageUrl = thumbnailSrc.startsWith('http') ? thumbnailSrc : `${API_BASE_URL}/${thumbnailSrc}`;

                                    return (
                                        <div key={index} className="thumbnail-container">
                                            <img
                                                src={imageUrl}
                                                alt={`상품 이미지 ${index + 1}`}
                                                className="person-image-thumbnail"
                                                onClick={() => onImageClick(imageUrl)} // 클릭 시에도 반영
                                                onMouseEnter={() => {
                                                    setSelectedImage(imageUrl);
                                                    setSelectedProduct(prod); // ← 이걸 추가해줘야 오른쪽 정보가 바뀜!
                                                }}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = placeholderImage;
                                                }}
                                            />
                                            <p className="product-name">{prod.name || `상품 ${index + 1}`}</p>
                                        </div>
                                    );
                                })
                            ) : product.image ? (
                                // 기존 product.image만 있는 경우도 처리 유지
                                <div className="thumbnail-container">
                                    <img
                                        src={product.image.startsWith('http') ? product.image : `${API_BASE_URL}/${product.image}`}
                                        alt="상품 이미지"
                                        className="person-image-thumbnail"
                                        onClick={() => onImageClick(product.image.startsWith('http') ? product.image : `${API_BASE_URL}/${product.image}`)}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = placeholderImage;
                                        }}
                                    />
                                    <p className="product-name">{product.name || "상품"}</p>
                                </div>
                            ) : (
                                <div className="thumbnail-container">
                                    <img src={placeholderImage} alt="이미지 없음" className="person-image-thumbnail"/>
                                    <p className="product-name">이미지 없음</p>
                                </div>
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
                                <img src={product.image || placeholderImage} alt={product.name}
                                     className="wanted-image"/>
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
                        <p>상품 추가 시 여기에 추가 됩니다.</p>
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
                    onClick={() => {
                        if (wantedProducts.length === 0) {
                            alert("상품을 추가해 주세요!");
                            return;
                        }
                        handleCartClick();
                    }}
                    // disabled={wantedProducts.length === 0} // 일시적 주석 처리
                >
                    장바구니
                </button>
                <button
                    className="person-buy"
                    onClick={() => {
                        if (wantedProducts.length === 0) {
                            alert("구매할 상품을 먼저 추가해 주세요.");
                            return;
                        }
                        navigate('/purchase', {
                            state: {
                                wantedProducts,
                                saleLabel,
                                shippingMethods,
                                product: location.state?.product
                            }
                        });
                    }}
                    // disabled={wantedProducts.length === 0} // 주석 처리 또는 제거
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
                        리뷰 ({productReviews.length})
                    </li>
                </ul>
            </div>

            {/* 상세 설명 및 리뷰 내용 */}
            <div className='personReviewFrame'>
                {activeTab === '상세 설명' ? (
                    <div className='person-description'>
                        <p dangerouslySetInnerHTML={{__html: ddescription || fixedContent || product.description || "상품 설명이 없습니다."}}/>

                    </div>
                ) : (
                    productReviews.length > 0 ? (
                        <>
                        <div className="reviews-summary">
                                <div className="average-rating">
                                    <h3 className='average-ratingTitle'>평균 평점</h3>
                                    <div className="big-rating">
                                        <FaStar className="big-star-icon" />
                                        <span className='starAverageRating'>{averageRating}</span>
                                    </div>
                                    <span className='starTotalRating'>총 {productReviews.length}개의 리뷰</span>
                                </div>
                                <div className="rating-breakdown">
                                    {[5, 4, 3, 2, 1].map((stars) => {
                                        const count = productReviews.filter(review => review.rating === stars).length;
                                        const percentage = productReviews.length > 0 ? Math.round((count / productReviews.length) * 100) : 0;

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
                                {productReviews.map((review) => (
                                    <div key={review.reviewId} className="person-review-item">
                                        <div className="person-review-header">
                                            <div className="person-review-profile">
                                                <div className="person-review-profile-image">
                                                    <CgProfile className="person-review-profile-icon" />
                                                </div>
                                                <span className="person-review-nickname">{review.userName || "익명"}</span>
                                            </div>
                                            <div className="person-review-rating-date">
                                              <span className="person-review-rating">
                                                {"★".repeat(Math.round(review.rating)) + "☆".repeat(5 - Math.round(review.rating))}
                                              </span>
                                                                                    <span className="person-review-date">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                              </span>
                                            </div>
                                        </div>
                                        <p className="person-review-text">{review.content}</p>
                                        {review.mediaUrls && review.mediaUrls.length > 0 && (
                                            <div className="person-review-images">
                                                {review.mediaUrls.map((img, i) => (
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
