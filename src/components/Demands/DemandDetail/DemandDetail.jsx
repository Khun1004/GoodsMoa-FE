import React, {useContext, useEffect, useState} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../api/api'; // ★ api 인스턴스 import!
import DemandService from '../../../api/DemandService.jsx'; // 주문/수정용 서비스는 기존 그대로
import './DemandDetail.css';
import {LoginContext} from "../../../contexts/LoginContext.jsx";
import {FaHeart} from "react-icons/fa";
import {CgProfile} from "react-icons/cg";


const getFullImageUrl = (url) =>
    url
        ? url.startsWith('http')
            ? url
            : `${import.meta.env.VITE_API_BASE_URL}/${url.replace(/^\/+/, '')}`
        : '';

const DemandDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userInfo } = useContext(LoginContext);
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLike, setLiked] = useState(false);

    const [activeIndex, setActiveIndex] = useState(0);
    const [quantities, setQuantities] = useState([]);
    const [tab, setTab] = useState('desc');

    const handleLikeToggle = async () => {
        if (!userInfo) {
            alert("로그인이 필요합니다.");
            return;
        }
        const url = `/demand/like/${id}`
        try {
            await api.post(url);
            setLiked(prev => !prev);
        } catch (error) {
            alert("찜 상태를 변경하는 데 실패했습니다.");
        }
    };

    useEffect(() => {
        const getDemandDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                // ★ fetch → api.get 으로 교체
                const res = await api.get(`/demand/${id}`, { withCredentials: true });
                const data = res.data;
                setDetail(data);
                setQuantities(
                    data.products
                        ? data.products.map(product => product.defaultValue ?? 0)
                        : []
                );
                setLiked(data.likeStatus);
                console.log('찜 like여부', isLike)
            } catch (err) {
                setLiked(false);
                setError(err.message || (err.response?.data?.message));
            } finally {
                setLoading(false);
            }
        };
        getDemandDetail();
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
            await DemandService.createOrder(id, productsPayload); // DemandService 내부에서도 api 인스턴스 써야함!
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

    const handleChatClick = async () => {
        const sellerId = detail?.userId;
        if (!userInfo) {
            alert("로그인이 필요합니다.");
            return;
        }
        if (!sellerId) {
            alert("판매자 정보가 없습니다.");
            return;
        }
        if (userInfo.id === sellerId) {
            alert("자기 자신과는 채팅할 수 없습니다.");
            return;
        }
        try {
            const res = await api.post("/chatroom/create", {
                buyerId: userInfo.id,
                sellerId: sellerId
            });
            const roomData = res.data;
            window.open(`/chat-app?roomId=${roomData.id}`, "_blank", "width=1000,height=800,resizable=yes");
        } catch (error) {
            if (error.response && error.response.status === 409) {
                const roomData = error.response.data;
                window.open(`/chat-app?roomId=${roomData.id}`, "_blank", "width=1000,height=800,resizable=yes");
            } else {
                alert("채팅방 생성에 실패했습니다.");
            }
        }
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
                    <div className="DemandDetail-image-wrapper">
                        <img
                            src={products[activeIndex]?.imageUrl ? getFullImageUrl(products[activeIndex].imageUrl) : mainImage}
                            alt={detail.title}
                            className="DemandDetail-main-image"
                        />
                    </div>
                    <div className="DemandDetail-product-info">
                        <div className="profile-mini"
                             style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', marginTop: '14px'}}>
                            {detail.userImage ? (
                                <img
                                    src={detail.userImage}
                                    alt="프로필"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        border: '1px solid #ccc',
                                        objectFit: 'cover',
                                    }}
                                />
                            ) : (
                                <CgProfile
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        border: '1px solid #ccc',
                                        objectFit: 'cover',
                                    }}
                                />
                            )}
                            <span
                                style={{
                                    fontSize: '25px',
                                    color: '#000',
                                }}
                            >
                                {detail.userName || '작성자'}
                            </span>
                        </div>
                        <h2
                            className="DemandDetail-title"
                            style={{
                                fontSize: "2.2rem",
                                fontWeight: 600,
                                margin: 0,
                                lineHeight: 1.25,
                                paddingTop: 20,
                                paddingBottom: 20
                            }}
                        >
                            {detail.title}
                        </h2>
                        <div className="DemandDetail-stock-info">
                            <span className='DemandDetailInfoName'>
                                수요 조사 기간: {formatDate(detail.startTime)} ~ {formatDate(detail.endTime)}
                            </span>
                            <span className='DemandDetailInfoName'>카테고리: {detail.category}</span>
                            <span className='DemandDetailInfoName'>조회수: {detail.views}</span>
                        </div>
                        <p className="DemandDetail-hashtag" style={{margin: 0}}>
                            {detail.hashtag && detail.hashtag.split(' ').map((tag, i) =>
                                <span
                                    key={i}
                                    style={{
                                        background: "#dedede",
                                        display: "inline-block",
                                        borderRadius: "10px",
                                        padding: "4px 14px",
                                        fontSize: "18px",
                                        fontWeight: 550,
                                        marginRight: "8px",
                                        marginBottom: "20px",
                                        verticalAlign: "middle"
                                    }}
                                >
                                      #{tag}
                                    </span>
                            )}
                        </p>


                        <div className="DemandDetail-actions">
                            <button className="DemandDetail-report-btn" onClick={handleReport}>🚨 신고하기</button>
                            <button className="DemandDetail-chat-btn"
                                    onClick={handleChatClick}>
                                채팅하기
                            </button>
                            <button className={`detail-like-button ${isLike ? 'liked' : ''}`}
                                    onClick={handleLikeToggle}>
                                <FaHeart size={20}/>
                            </button>
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
                                            marginTop: "20px",
                                            border: activeIndex === i ? '2px solid #3498db' : '1px solid #eee'
                                        }}
                                    />
                                ))}
                            </div>
                        )}
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
                                    onClick={() => setActiveIndex(index)}
                                >
                                    <img
                                        src={getFullImageUrl(product.imageUrl)}
                                        alt={product.name}
                                        className="DemandDetailProduct-thumbnail"
                                        style={{cursor: 'pointer'}}
                                    />
                                    <div className="DemandDetailProduct-info">
                                        <p>{product.name}</p>
                                        <p>{product.price.toLocaleString()}원</p>
                                        <div className="demandDetail-controls">
                                            <div className="demandDetailQuantity">
                                                <button
                                                    onClick={() => {
                                                        if ((quantities[index] || 0) > 0) {
                                                            updateQuantity(index, (quantities[index] || 0) - 1);
                                                        }
                                                    }}
                                                >-
                                                </button>
                                                <input
                                                    type="number"
                                                    className="demandDetailQuantityInput"
                                                    value={quantities[index] || 0}
                                                    min={0}
                                                    max={10}
                                                    onChange={(e) => {
                                                        let value = parseInt(e.target.value) || 0;
                                                        value = Math.max(0, Math.min(10, value)); // 0~10 사이로 제한
                                                        updateQuantity(index, value);
                                                    }}
                                                    style={{
                                                        width: '50px',
                                                        textAlign: 'center',
                                                        fontSize: '16px',
                                                        padding: '6px',
                                                        borderRadius: '6px',
                                                        border: '1px solid #ccc',
                                                        position: 'relative',
                                                        top: '5px'  // 아래로 4px 이동
                                                    }}
                                                />
                                                <button
                                                    onClick={() => {
                                                        if ((quantities[index] || 0) < 10) {
                                                            updateQuantity(index, (quantities[index] || 0) + 1);
                                                        }
                                                    }}
                                                >+
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <p
                                            className="DemandDetailProduct-item-achivement"
                                            style={{
                                                backgroundColor: product.achievementRate >= 100 ? '#dcfce7' : '#e0edff',
                                                color: product.achievementRate >= 100 ? '#16a34a' : '#2563eb'
                                            }}
                                        >
                                            {Math.round(product.achievementRate)}%
                                        </p>
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
