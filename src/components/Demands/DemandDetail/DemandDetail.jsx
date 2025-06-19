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
    const { id } = useParams();
    const navigate = useNavigate();

    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [activeIndex, setActiveIndex] = useState(0);
    const [quantities, setQuantities] = useState([]);
    const [tab, setTab] = useState('desc');

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`http://localhost:8080/demand/${id}`, {
                    credentials: "include",
                });
                if (!res.ok) throw new Error('서버 응답 에러');
                const data = await res.json();
                setDetail(data);
                setQuantities(
                    data.products
                        ? data.products.map(product => product.defaultValue ?? 0)
                        : []
                );
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

    const products = detail.products || [];
    const mainImage = getFullImageUrl(detail.imageUrl);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return dateStr.split(' ')[0];
    };

    // 수량 변경
    const updateQuantity = (index, newQty) => {
        if (newQty < 0) return; // 0개까지 허용
        const updated = [...quantities];
        updated[index] = newQty;
        setQuantities(updated);
    };

    // 주문글 아이디
    const userOrderId = detail.userOrderId;
    // 수정모드 여부
    const isEditMode = userOrderId && products.some(item => (item.defaultValue ?? 0) > 0);

    // 참여하기(POST)
    const handleDemandBuy = async () => {
        const productsPayload = products
            .map((item, idx) => ({
                postProductId: item.id,
                quantity: quantities[idx]
            }))
            .filter(item => item.quantity > 0);

        if (productsPayload.length === 0) {
            alert('주문할 상품을 1개 이상 선택하세요!');
            return;
        }

        try {
            await DemandService.createOrder(id, productsPayload);
            alert('참여가 완료되었습니다!');
        } catch (error) {
            alert(`참여 중 오류: ${error.message}`);
        }
    };

    // 수정하기(PUT)
    const handleDemandEdit = async () => {
        const productsPayload = products
            .map((item, idx) => ({
                postProductId: item.id,
                quantity: quantities[idx]
            }))
            .filter(item => item.quantity > 0);

        if (productsPayload.length === 0) {
            alert('수정할 상품을 1개 이상 선택하세요!');
            return;
        }

        try {
            await DemandService.updateOrder(userOrderId, productsPayload);
            alert('수정이 완료되었습니다!');
        } catch (error) {
            alert(`수정 중 오류: ${error.message}`);
        }
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

    // 합계 계산
    const totalItems = quantities.reduce((sum, qty) => sum + (qty > 0 ? qty : 0), 0);
    const totalPrice = products.reduce(
        (sum, product, idx) => sum + (quantities[idx] > 0 ? quantities[idx] * product.price : 0),
        0
    );

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
                        <h2
                            className="DemandDetail-title"
                            style={{
                                fontSize: "2.2rem",     // h2 기본보다 크게 (보통 35px 정도)
                                fontWeight: 600,        // 적당히 굵게 (700이 완전 bold)
                                margin: 0,
                                lineHeight: 1.25,
                            }}
                        >
                            {detail.title}
                        </h2>

                        <p className="DemandDetail-hashtag" style={{margin: 0}}>
                            {detail.hashtag && detail.hashtag.split(' ').map((tag, i) =>
                                    <span
                                        key={i}
                                        style={{
                                            background: "#dedede",
                                            display: "inline-block",
                                            borderRadius: "16px",
                                            padding: "4px 14px",
                                            fontSize: "18px",
                                            fontWeight: 400,
                                            marginRight: "8px",
                                            marginBottom: "4px",
                                            verticalAlign: "middle",
                                        }}
                                    >
      #{tag}
    </span>
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
                                        onClick={() => setActiveIndex(i)}
                                        className={activeIndex === i ? 'active' : ''}
                                        style={{
                                            cursor: 'pointer',
                                            width: 60,
                                            height: 60,
                                            marginRight: 8,
                                            border: activeIndex === i ? '2px solid #3498db' : '1px solid #eee'
                                        }}
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
                                    <img
                                        src={getFullImageUrl(product.imageUrl)}
                                        alt={product.name}
                                        className="DemandDetailProduct-thumbnail"
                                        onClick={() => setActiveIndex(index)}
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
                                                        if ((quantities[index] || 0) > 0) {
                                                            updateQuantity(index, (quantities[index] || 0) - 1);
                                                        }
                                                    }}
                                                >-</button>
                                                <span className='demandDetailQuntitySpan'>{quantities[index] || 0}</span>
                                                <button
                                                    onClick={() => {
                                                        updateQuantity(index, (quantities[index] || 0) + 1);
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

                {/* 요약 정보 및 결제/수정 버튼 */}
                <div className="DemandDetail-summary">
                    <div className="demandDetailCheck">
                        {totalItems > 0 ? (
                            products
                                .map((item, idx) => ({ ...item, quantity: quantities[idx] }))
                                .filter(item => item.quantity > 0)
                                .map((item, idx) => (
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
                            <p>주문할 상품을 선택(수량 조절)하세요.</p>
                        )}
                    </div>
                    {totalItems > 0 && (
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
                        {isEditMode ? (
                            <button
                                className="DemandDetail-participate-btn"
                                onClick={handleDemandEdit}
                                disabled={totalItems === 0}
                            >
                                수정하기
                            </button>
                        ) : (
                            <button
                                className="DemandDetail-participate-btn"
                                onClick={handleDemandBuy}
                                disabled={totalItems === 0}
                            >
                                참여하기
                            </button>
                        )}
                    </div>
                </div>

                {/* 설명 탭 */}
                <div className="DemandDetail-tab-box">
                    <div className="DemandDetail-tab-content">
                        {tab === 'desc' && (
                            <div
                                className="DemandDetail-description"
                                dangerouslySetInnerHTML={{ __html: detail.description || '설명이 없습니다.' }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemandDetail;
