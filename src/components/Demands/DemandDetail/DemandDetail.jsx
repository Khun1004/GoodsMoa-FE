import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './DemandDetail.css';

const DemandDetail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { product, details, products, category, tags, period, seller } = location.state || {};
    
    // 초기 선택된 상품은 첫 번째 상품 (또는 기본 product)
    const initialProduct = products?.[0] || product;
    const [activeIndex, setActiveIndex] = useState(0);
    const [quantities, setQuantities] = useState(products ? products.map(() => 1) : [1, 1, 1, 1]);
    const [selectedProduct, setSelectedProduct] = useState(initialProduct);
    const [selectedImage, setSelectedImage] = useState(initialProduct?.thumbnail || initialProduct?.src || '');
    const [selectedProducts, setSelectedProducts] = useState([]);

    // 가격 및 상품명 (백업 데이터)
    const prices = products ? products.map(p => p.price) : [19800, 5000, 8000, 15000];
    const productNames = products ? products.map(p => p.name) : [
        'LG TWINS 포토카드', 
        'LG TWINS 차량용 방향제', 
        'LG TWINS 키링', 
        'LG TWINS X 모나미 볼펜'
    ];

    // 총 수량 및 가격 계산
    const totalItems = selectedProducts.reduce((sum, p) => sum + p.quantity, 0);
    const totalPrice = selectedProducts.reduce((sum, p) => sum + p.quantity * p.price, 0);

    // 수량 업데이트 함수
    const updateQuantity = (index, newQty) => {
        if (newQty >= 0 && newQty <= products[index].quantity) {
            const updatedQuantities = [...quantities];
            updatedQuantities[index] = newQty;
            setQuantities(updatedQuantities);
    
            // 선택된 상품 중 수량을 업데이트해야 하는 상품이 있다면 업데이트
            setSelectedProducts(prev =>
                prev.map(p =>
                    p.index === index ? { ...p, quantity: newQty } : p
                )
            );
        }
    };    

    // 썸네일 클릭 시 실행되는 함수 (메인 이미지, 상품 정보 업데이트)
    const handleThumbnailClick = (product, index) => {
        setActiveIndex(index);
        setSelectedImage(product.thumbnail);
        setSelectedProduct(product);
    };

    if (!product && !products) {
        return <div>상품 정보를 불러올 수 없습니다.</div>;
    }

    const handleDemandBuy = () => {
        navigate('/demandDetailBuy', {
            state: {
                selectedProducts,
                totalItems,
                totalPrice,
            }
        });
    };

    const handleCheckboxChange = (product, index) => {
        const isSelected = selectedProducts.find(p => p.index === index);
        if (isSelected) {
            setSelectedProducts(prev => prev.filter(p => p.index !== index));
        } else {
            setSelectedProducts(prev => [...prev, { ...product, index, quantity: quantities[index] }]);
        }
    };    

    const handleReport = () => {
        navigate('/demandReport', {
            state: {
                item: {
                    title: selectedProduct.name,
                    price: selectedProduct.price,
                    condition: selectedProduct.condition || '미상'
                },
                representativeImage: selectedProduct.thumbnail || selectedProduct.src || ''
            }
        });
    };

    return (
        <div className='container'>
            <div className="DemandDetail-container">
                {/* 메인 상품 영역 */}
                <div className="DemandDetail-product-main">
                    <img 
                        src={selectedImage}
                        alt={selectedProduct.name} 
                        className="DemandDetail-main-image" 
                    />
                    <div className="DemandDetail-product-info">
                        <h2 className="DemandDetail-title">
                            <strong><em>{selectedProduct.brand}</em></strong> {selectedProduct.name}
                        </h2>
                        <p className="DemandDetail-product-name">
                            {selectedProduct.name} <span className="DemandDetail-badge">순수창작</span>
                        </p>
                        <p className="DemandDetail-price">{selectedProduct.price.toLocaleString()}원</p>
                        <div className="DemandDetail-stock-info">
                            <span className='DemandDetailInfoName'>재고 수량: {selectedProduct.quantity || '미정'}</span>
                            <span className='DemandDetailInfoName'>수요 조사 기간: {period || '미정'}</span>
                            <span className='DemandDetailInfoName'>카테고리: {category}</span>
                            {seller && <span className='DemandDetailInfoName'>판매자: {seller}</span>}
                        </div>
                        {tags && tags.length > 0 && (
                            <div className="DemandDetail-tags">
                                {tags.map((tag, i) => (
                                    <span key={i}>#{tag}</span>
                                ))}
                            </div>
                        )}
                        {/* 썸네일 목록 */}
                        <div className="DemandDetail-thumbnails">
                            {products && products.map((product, i) => (
                                <img 
                                    key={i} 
                                    src={product.thumbnail} 
                                    alt={product.name} 
                                    onClick={() => handleThumbnailClick(product, i)}
                                    className={activeIndex === i ? 'active' : ''}
                                    style={{ cursor: 'pointer' }}
                                />
                            ))}
                        </div>
                        {/* 액션 버튼 */}
                        <div className="DemandDetail-actions">
                            <button className="DemandDetail-report-btn" onClick={handleReport}>🚨 신고하기</button>
                            <button className="DemandDetail-chat-btn">채팅하기</button>
                        </div>
                    </div>
                </div>

                {/* 상품 옵션 목록 (두 줄 정렬) */}
                <div className="DemandDetail-products-container">
                    {[0, 1].map(row => (
                        <div key={row} className="DemandDetail-products-row">
                            {products.slice(row * 2, row * 2 + 2).map((product, idx) => {
                                const index = row * 2 + idx;
                                return (
                                    <div 
                                        key={index} 
                                        className="DemandDetailProduct-item"
                                        style={{
                                            border: activeIndex === index ? '3px solid #3498db' : '1px solid #eee'
                                        }}
                                    >
                                        <input 
                                            type="checkbox" 
                                            style={{ 
                                                position: 'relative', 
                                                top: 10, 
                                                right: 10, 
                                                zIndex: 10, 
                                                backgroundColor: 'black' 
                                            }} 
                                            checked={!!selectedProducts.find(p => p.index === index)}
                                            onChange={() => handleCheckboxChange(product, index)} 
                                        />
                                        <img 
                                            src={product.thumbnail} 
                                            alt={product.name} 
                                            className="DemandDetailProduct-thumbnail" 
                                            onClick={() => handleThumbnailClick(product, index)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <div className="DemandDetailProduct-info">
                                            <p>{product.name}</p>
                                            <p>{product.price.toLocaleString()}원</p>
                                            <p>재고: {product.quantity}개</p>
                                            <div className="demandDetail-controls">
                                                <p>수량</p>
                                                <div className="demandDetailQuantity">
                                                <button 
                                                    onClick={() => {
                                                        if (quantities[index] > 0) {
                                                        updateQuantity(index, quantities[index] - 1);
                                                        }
                                                    }}
                                                    >-</button>
                                                    <span className='demandDetailQuntitySpan'>{quantities[index]}</span>
                                                    <button 
                                                        onClick={() => {
                                                            if (quantities[index] < product.quantity) {
                                                            updateQuantity(index, quantities[index] + 1);
                                                            } else {
                                                            alert(`재고는 ${product.quantity}개만 있습니다. 더 이상 구매 불가능합니다.`);
                                                            }
                                                        }}
                                                        >+</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* 요약 정보 및 결제 버튼 */}
                <div className="DemandDetail-summary">
                    <div className="demandDetailCheck">
                        {selectedProducts.length > 0 ? (
                            selectedProducts.map((item, idx) => (
                                <div key={idx} className="demandDetailCheck-item">
                                    <img 
                                        src={item.thumbnail} 
                                        alt={item.name} 
                                        style={{ width: '60px', height: '60px', objectFit: 'cover', marginRight: '10px' }} 
                                    />
                                    <div>
                                    <p>{item.name}</p>
                                    <p>{item.price.toLocaleString()}원 x {item.quantity}개</p>
                                    <p>총액: {(item.price * item.quantity).toLocaleString()}원</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>선택된 상품이 없습니다.</p>
                        )}
                    </div>

                    {selectedProducts.length > 0 && (
                        <>
                            <div className="DemandDetail-summary-row">
                                <span className='DemandDetail-summary-rowTitle'>총 상품 갯수:</span>
                                <span className='DemandDetail-summary-value'>{totalItems}개</span>
                            </div>
                            <div className="DemandDetail-summary-row">
                                <span className='DemandDetail-summary-rowTitle'>총 상품 금액:</span>
                                <span className='DemandDetail-summary-value'>{totalPrice.toLocaleString()}원</span>
                            </div>
                        </>
                    )}

                    <div className="DemandDetail-summary-buttons">
                        <button className="DemandDetail-like-btn">찜하기</button>
                        <button 
                            className="DemandDetail-participate-btn" 
                            onClick={handleDemandBuy}
                            disabled={selectedProducts.length === 0}
                        >
                            참여하기
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DemandDetail;