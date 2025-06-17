import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DemandService from '../../../api/DemandService.jsx';
import './DemandDetail.css';

const getFullImageUrl = (url) =>
    url
        ? url.startsWith('http')
            ? url
            : `http://localhost:8080/${url.replace(/^\/+/, '')}`
        : '';

const DemandDetail = () => {
    const { id } = useParams(); // /demandDetail/:id
    const navigate = useNavigate();

    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 상품 옵션 관련 상태
    const [activeIndex, setActiveIndex] = useState(0);
    const [quantities, setQuantities] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);

    // 설명 탭 상태
    const [tab, setTab] = useState('desc');

    // 데이터 패칭
    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`http://localhost:8080/demand/${id}`);
                if (!res.ok) throw new Error('서버 응답 에러');
                const data = await res.json();
                setDetail(data);
                setQuantities(data.products ? data.products.map(() => 1) : []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) return <div>로딩중...</div>;
    if (error) return <div>에러 발생: {error}</div>;
    if (!detail) return <div>데이터 없음</div>;

    // 상품 옵션
    const products = detail.products || [];
    const mainImage = getFullImageUrl(detail.imageUrl);

    // 날짜 포맷
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return dateStr.split(' ')[0];
    };

    // 수량 변경
    const updateQuantity = (index, newQty) => {
        if (newQty < 1) return;
        const updated = [...quantities];
        updated[index] = newQty;
        setQuantities(updated);
        setSelectedProducts((prev) =>
            prev.map((p) =>
                p.index === index ? { ...p, quantity: newQty } : p
            )
        );
    };

    // 옵션 선택/해제
    const handleCheckboxChange = (product, index) => {
        const isSelected = selectedProducts.find((p) => p.index === index);
        if (isSelected) {
            setSelectedProducts((prev) => prev.filter((p) => p.index !== index));
        } else {
            setSelectedProducts((prev) => [
                ...prev,
                { ...product, index, quantity: quantities[index] || 1 },
            ]);
        }
    };

    // 총 수량, 총 금액
    const totalItems = selectedProducts.reduce((sum, p) => sum + p.quantity, 0);
    const totalPrice = selectedProducts.reduce((sum, p) => sum + p.quantity * p.price, 0);

    // 옵션 썸네일 클릭
    const handleThumbnailClick = (index) => {
        setActiveIndex(index);
    };

    // 참여하기 버튼
    const handleDemandBuy = async() => {
        try {
            const productsPayload = selectedProducts.map(item => ({
                postProductId: item.id, // 상품 id
                quantity: item.quantity // 선택한 수량
            }));
            await DemandService.createOrder(id, productsPayload);
            alert('참여가 완료되었습니다!');
            // 필요하다면 페이지 이동 등 추가 작업
        } catch (error) {
            alert(`참여 중 오류: ${error.message}`);
        }
        // navigate('/demandDetailBuy', {
        //     state: {
        //         selectedProducts,
        //         totalItems,
        //         totalPrice,
        //     }
        // });
    };

    // 신고하기
    const handleReport = () => {
        navigate('/demandReport', {
            state: {
                item: {
                    title: products[activeIndex]?.name,
                    price: products[activeIndex]?.price,
                    condition: '미상'
                },
                representativeImage: getFullImageUrl(products[activeIndex]?.imageUrl)
            }
        });
    };

    return (
        <div className='container'>
            <div className="DemandDetail-container">
                {/* 메인 상품 영역 */}
                <div className="DemandDetail-product-main">
                    <img
                        src={products[activeIndex]?.imageUrl ? getFullImageUrl(products[activeIndex].imageUrl) : mainImage}
                        alt={detail.title}
                        className="DemandDetail-main-image"
                    />
                    <div className="DemandDetail-product-info">
                        <h2 className="DemandDetail-title">
                            {detail.title}
                        </h2>
                        <p className="DemandDetail-hashtag">
                            {detail.hashtag && detail.hashtag.split(' ').map((tag, i) =>
                                <span key={i} className="DemandDetail-tag">#{tag}</span>
                            )}
                        </p>
                        <div className="DemandDetail-stock-info">
                            <span className='DemandDetailInfoName'>
                                수요 조사 기간: {formatDate(detail.startTime)} ~ {formatDate(detail.endTime)}
                            </span>
                            <span className='DemandDetailInfoName'>카테고리: {detail.category}</span>
                            <span className='DemandDetailInfoName'>조회수: {detail.views}</span>
                        </div>
                        {/* 옵션 썸네일 목록 */}
                        {products.length > 0 && (
                            <div className="DemandDetail-thumbnails">
                                {products.map((product, i) => (
                                    <img
                                        key={i}
                                        src={getFullImageUrl(product.imageUrl)}
                                        alt={product.name}
                                        onClick={() => handleThumbnailClick(i)}
                                        className={activeIndex === i ? 'active' : ''}
                                        style={{ cursor: 'pointer', width: 60, height: 60, marginRight: 8, border: activeIndex === i ? '2px solid #3498db' : '1px solid #eee' }}
                                    />
                                ))}
                            </div>
                        )}
                        <div className="DemandDetail-actions">
                            <button className="DemandDetail-report-btn" onClick={handleReport}>🚨 신고하기</button>
                            <button className="DemandDetail-chat-btn">채팅하기</button>
                        </div>
                    </div>
                </div>
                {/* 상품 옵션 목록 */}
                {products.length > 0 && (
                    <div className="DemandDetail-products-container">
                        <div className="DemandDetail-products-row">
                            {products.map((product, index) => (
                                <div
                                    key={product.id}
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
                                        src={getFullImageUrl(product.imageUrl)}
                                        alt={product.name}
                                        className="DemandDetailProduct-thumbnail"
                                        onClick={() => handleThumbnailClick(index)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <div className="DemandDetailProduct-info">
                                        <p>{product.name}</p>
                                        <p>{product.price.toLocaleString()}원</p>
                                        <div className="demandDetail-controls">
                                            <p>수량</p>
                                            <div className="demandDetailQuantity">
                                                <button
                                                    onClick={() => {
                                                        if ((quantities[index] || 1) > 1) {
                                                            updateQuantity(index, (quantities[index] || 1) - 1);
                                                        }
                                                    }}
                                                >-</button>
                                                <span className='demandDetailQuntitySpan'>{quantities[index] || 1}</span>
                                                <button
                                                    onClick={() => {
                                                        updateQuantity(index, (quantities[index] || 1) + 1);
                                                    }}
                                                >+</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {/* 요약 정보 및 결제 버튼 */}
                <div className="DemandDetail-summary">
                    <div className="demandDetailCheck">
                        {selectedProducts.length > 0 ? (
                            selectedProducts.map((item, idx) => (
                                <div key={idx} className="demandDetailCheck-item">
                                    <img
                                        src={getFullImageUrl(item.imageUrl)}
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

                {/* 설명 탭 */}
                <div className="DemandDetail-tab-box">
                    <div className="DemandDetail-tab-content">
                        {tab === 'desc' && (
                            <p className="DemandDetail-description">
                                {detail.description || '설명이 없습니다.'}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemandDetail;
