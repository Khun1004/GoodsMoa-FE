import { Award, Bell, Calendar, ChevronRight, Clock, FileText, Heart, Package, Settings, ShoppingBag, User } from 'lucide-react';
import React, {useContext, useEffect, useState} from 'react';
import api from "../../../api/api";
import { useNavigate } from 'react-router-dom';
import './DemandParticipate.css';

// Import placeholder images
import placeholder100 from '../../../assets/demandPa/1.jpg';
import placeholder80 from '../../../assets/demandPa/2.jpg';
import { LoginContext } from "../../../contexts/LoginContext";
import DemandService from '../../../api/DemandService.jsx';

const DemandParticipate = () => {
    const [editTarget, setEditTarget] = useState(null);

    const {userInfo} = useContext(LoginContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('participations');
    const [userData, setUserData] = useState({
        name: `${userInfo.nickname} 님`,
        email: `${userInfo.email}`,
        profileImage: placeholder100,
        participations: [],
        favorites: 0,
        notifications: 3
    });


    const fetchParticipations = async () => {
        try {
            const data = await DemandService.getMyOrders();
            const participations = data.content.map(item => ({
                id: item.id,
                originalId: item.demandPostOmittedResponse.id,
                title: item.demandPostOmittedResponse.title,
                thumbnail: item.demandPostOmittedResponse.imageUrl,
                state: item.demandPostOmittedResponse.state,
                category: item.demandPostOmittedResponse.category, // 추가
                products: item.demandOrderProducts.map(product => ({
                    id: product.id,
                    name: product.name,
                    image: product.image, // 이미지 경로 수정
                    quantity: product.quantity
                })),
                date: item.creatAt || '날짜 정보 없음' // 서버 응답 필드명 확인
            }));
            setUserData(prevData => ({
                ...prevData,
                participations, // 참여내역 업데이트!
            }));
        } catch (e) {
            console.error("참여내역 불러오기 실패:", e);
        }
    };


    useEffect(() => {
        fetchParticipations();
    }, []);

    // 글 상세보기
    const handleDemandClick = async (originalId) => {
        try {
            const detailedPost = await api.get(`/demand/${originalId}`, { withCredentials: true });
            navigate(`/demandDetail/${originalId}`);
        } catch (err) {
            alert('수요조사 정보를 불러오는 데 실패했습니다.');
            console.error('수요조사 상세 조회 실패:', err);
        }
    };

    const getFullImageUrl = (url) => {
        if (!url) return null;
        return url.startsWith("http")
            ? url
            : `http://localhost:8080/${url.replace(/^\/+/, "")}`;
    };

    const handleDelete = async (orderId) => {
        if(window.confirm('정말 삭제하시겠습니까?')) {
            try {
                await DemandService.deleteOrder(orderId);
                alert('삭제되었습니다.');
                fetchParticipations(); // ✅ 정상 동작
            } catch (e) {
                alert('삭제 중 오류가 발생했습니다.',e);
            }
        }
    };

    // 수정 함수
    const handleEdit = (participation) => {
        setEditTarget(participation);
    };

    // 실제 수정 요청 함수 (예: 모달에서 호출)
    const handleUpdate = async (orderId, updatedProducts) => {
        try {
            await DemandService.updateOrder(orderId, updatedProducts);
            alert('수정되었습니다.');
            fetchParticipations();
        } catch (e) {
            alert('수정 중 오류가 발생했습니다.',e);
        }
    };


    // const getStatusColor = (status) => {
    //     switch(status) {
    //         case "진행중": return "status-in-progress";
    //         case "목표달성": return "status-complete";
    //         case "마감실패": return "status-failed";
    //         default: return "status-default";
    //     }
    // };
    //
    // const getDeliveryStatusColor = (status) => {
    //     switch(status) {
    //         case "배송준비중": return "delivery-preparing";
    //         case "배송중": return "delivery-in-progress";
    //         case "배송완료": return "delivery-complete";
    //         default: return "delivery-default";
    //     }
    // };

    return (
        <div className="demandParti-container">
            <div className="demandParti-content">
                <h1
                    style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        color: '#1f2937',
                        margin: '0 0 8px 0'
                    }}
                >
                    참여한 수요조사 관리
                </h1>
                {/* 헤더 섹션 */}
                <div className="demandParti-header-card">
                    <div className="demandParti-profile-section">
                        <div className="demandParti-profile-image">
                            <img src={userData.profileImage} alt={userData.name}/>
                        </div>
                        <div className="demandParti-profile-info">
                            <h1>{userData.name}</h1>
                            <p>{userData.email}</p>
                        </div>
                    </div>

                    <div className="demandParti-stats-grid">
                        <div className="demandParti-stat-item">
                            <div className="demandParti-stat-icon">
                                <ShoppingBag size={24}/>
                            </div>
                            <p className="demandParti-stat-label">진행 중인 수요조사</p>
                            <p className="demandParti-stat-value">
                                {userData.participations.filter(
                                    p => p.state === "진행중"
                                ).length}건
                            </p>
                        </div>

                        <div className="demandParti-stat-item">
                            <div className="demandParti-stat-icon">
                                <Heart size={24}/>
                            </div>
                            <p className="demandParti-stat-label">마감된 수요조사</p>
                            <p className="demandParti-stat-value">
                                {userData.participations.filter(
                                    p => p.state === "마감"
                                ).length}건
                            </p>
                        </div>

                        {/*<div className="demandParti-stat-item">*/}
                        {/*    <div className="demandParti-stat-icon">*/}
                        {/*        <Bell size={24}/>*/}
                        {/*    </div>*/}
                        {/*    <p className="demandParti-stat-label">관심 상품</p>*/}
                        {/*    <p className="demandParti-stat-value">{userData.favorites}개</p>*/}
                        {/*    /!*<p className="demandParti-stat-label">새 알림</p>*!/*/}
                        {/*    /!*<p className="demandParti-stat-value">{userData.notifications}개</p>*!/*/}
                        {/*</div>*/}
                    </div>
                </div>

                {/* 탭 네비게이션 */}
                <div className="demandParti-tab-card">
                    <div className="demandParti-tab-header">
                        <button
                            className={`demandParti-tab-button ${activeTab === 'participations' ? 'active' : ''}`}
                            onClick={() => setActiveTab('participations')}
                        >
                            진행 중
                        </button>
                        <button
                            className={`demandParti-tab-button ${activeTab === 'favorites' ? 'active' : ''}`}
                            onClick={() => setActiveTab('favorites')}
                        >
                            마감
                        </button>
                        {/*<button*/}
                        {/*    className={`demandParti-tab-button ${activeTab === 'notifications' ? 'active' : ''}`}*/}
                        {/*    onClick={() => setActiveTab('notifications')}*/}
                        {/*>*/}
                        {/*    알림*/}
                        {/*</button>*/}
                    </div>

                    {/* 수요조사 참여내역 탭 */}
                    {activeTab === 'participations' && (
                        <div className="demandParti-tab-content">
                            {/* 수정 모달 추가 */}
                            {editTarget && (
                                <div className="edit-modal">
                                    <h3>참여내역 수정</h3>
                                    {editTarget.products.map((product, idx) => (
                                        <div key={product.id} className="edit-product-item">
                                            <span>{product.name}</span>
                                            <input
                                                type="number"
                                                value={product.quantity}
                                                min="1"
                                                onChange={(e) => {
                                                    const newProducts = [...editTarget.products];
                                                    newProducts[idx].quantity = Number(e.target.value);
                                                    setEditTarget({...editTarget, products: newProducts});
                                                }}
                                            />
                                        </div>
                                    ))}
                                    <div className="edit-modal-buttons">
                                        <button
                                            className="confirm-btn"
                                            onClick={async () => {
                                                await handleUpdate(
                                                    editTarget.id,
                                                    editTarget.products.map(p => ({
                                                        postProductId: p.id,
                                                        quantity: p.quantity
                                                    }))
                                                );
                                                setEditTarget(null);
                                            }}
                                        >
                                            저장
                                        </button>
                                        <button
                                            className="cancel-btn"
                                            onClick={() => setEditTarget(null)}
                                        >
                                            취소
                                        </button>
                                    </div>
                                </div>
                            )}

                            <h2 className="demandParti-section-title">진행 중인 수요조사</h2>

                            <div className="demandParti-items-list">
                                {userData.participations.filter(p => p.state === "진행중").length > 0 ? (
                                    userData.participations
                                        .filter(participation => participation.state === "진행중")
                                        .map(participation => (
                                            <div
                                                key={participation.id}
                                                className="participation-item"
                                                style={{
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '12px',
                                                    padding: '20px',
                                                    marginBottom: '24px',
                                                    background: '#fff'
                                                }}
                                            >
                                                {/* 1. 윗줄: 이미지 + 제목/카테고리/참여일자 */}
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    marginBottom: '14px'
                                                }}>
                                                    <img
                                                        src={
                                                            participation.thumbnail
                                                                ? participation.thumbnail.startsWith('http')
                                                                    ? participation.thumbnail
                                                                    : `/api/file/${participation.thumbnail}`
                                                                : placeholder100
                                                        }
                                                        alt={participation.title || ''}
                                                        style={{
                                                            width: '230px',
                                                            height: '140px',
                                                            objectFit: 'cover',
                                                            borderRadius: '8px',
                                                            flexShrink: 0,
                                                            marginRight: '24px'
                                                        }}
                                                    />
                                                    <div>
                                                        <h3 style={{
                                                            fontSize: '2rem',
                                                            fontWeight: 700,
                                                            margin: 0,
                                                            marginBottom: '6px'
                                                        }}>
                                                            {participation.title}
                                                        </h3>
                                                        <p style={{margin: '0 0 4px 0'}}>카테고리: {participation.category}</p>
                                                        <p style={{margin: 0}}>참여 일자: {participation.date}</p>
                                                    </div>
                                                    <div style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '8px',
                                                        marginLeft: 'auto'
                                                    }}>
                                                        <button
                                                            className="edit-btn"
                                                            onClick={() => handleDemandClick(participation.originalId)}
                                                        >
                                                            수정
                                                        </button>
                                                        <button
                                                            className="delete-btn"
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                handleDelete(participation.id);
                                                            }}
                                                        >
                                                            삭제
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* 2. 아랫줄: 상품목록 */}
                                                <div className="demandFormMandemand-products-section">
                                                    <h3>구매 희망 상품 ({participation.products.length})</h3>
                                                    <div className="demandFormMandemand-products-grid">
                                                        {participation.products.map((product) => (
                                                            <div key={product.id} className="demandFormManproduct-card">
                                                                <img
                                                                    src={getFullImageUrl(product.image)}
                                                                    alt={product.name}
                                                                />
                                                                <p>{product.name}</p>
                                                                <p>{product.quantity}개</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                ) : (
                                    <div
                                        className="demandParti-empty-state"
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            textAlign: 'center',
                                            padding: '40px 0',
                                            width: '100%',
                                            minHeight: '200px' // 필요시 높이 추가
                                        }}
                                    >
                                        <Heart size={40}/>
                                        <p style={{marginTop: '16px', fontSize: '1.2rem', color: '#6b7280'}}>
                                            참여한 수요조사 목록이 표시됩니다.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}


                    {/* 마감된 수요조사 탭 */}
                    {activeTab === 'favorites' && (
                        <div className="demandParti-tab-content">
                            <h2 className="demandParti-section-title">마감된 수요조사</h2>

                            <div className="demandParti-items-list">
                                {userData.participations.filter(p => p.state === "마감").length > 0 ? (
                                   userData.participations
                                       .filter(participation => participation.state === "마감")
                                       .map(participation => (
                                           <div
                                               key={participation.id}
                                               className="participation-item"
                                               style={{
                                                   border: '1px solid #e5e7eb',
                                                   borderRadius: '12px',
                                                   padding: '20px',
                                                   marginBottom: '24px',
                                                   background: '#fff'
                                               }}
                                               onClick={() => handleDemandClick(participation.originalId)}
                                           >
                                               {/* 1. 윗줄: 이미지 + 제목/카테고리/참여일자 */}
                                               <div style={{
                                                   display: 'flex',
                                                   alignItems: 'center',
                                                   marginBottom: '14px'
                                               }}>
                                                   <img
                                                       src={
                                                           participation.thumbnail
                                                               ? participation.thumbnail.startsWith('http')
                                                                   ? participation.thumbnail
                                                                   : `/api/file/${participation.thumbnail}`
                                                               : placeholder100
                                                       }
                                                       alt={participation.title || ''}
                                                       style={{
                                                           width: '110px',
                                                           height: '110px',
                                                           objectFit: 'cover',
                                                           borderRadius: '8px',
                                                           flexShrink: 0,
                                                           marginRight: '24px'
                                                       }}
                                                   />
                                                   <div>
                                                       <h3 style={{
                                                           fontSize: '2rem',
                                                           fontWeight: 700,
                                                           margin: 0,
                                                           marginBottom: '6px'
                                                       }}>
                                                           {participation.title}
                                                       </h3>
                                                       <p style={{margin: '0 0 4px 0'}}>카테고리: {participation.category}</p>
                                                       <p style={{margin: 0}}>참여 일자: {participation.date}</p>
                                                   </div>
                                                   <div style={{
                                                       display: 'flex',
                                                       flexDirection: 'column',
                                                       gap: '8px',
                                                       marginLeft: 'auto'
                                                   }}>
                                                       <button
                                                           className="edit-btn"
                                                           onClick={e => {
                                                               e.stopPropagation();
                                                               handleEdit(participation);
                                                           }}
                                                       >
                                                           수정
                                                       </button>
                                                       <button
                                                           className="delete-btn"
                                                           onClick={e => {
                                                               e.stopPropagation();
                                                               handleDelete(participation.id);
                                                           }}
                                                       >
                                                           삭제
                                                       </button>
                                                   </div>
                                               </div>
                                               {/* 2. 아랫줄: 상품목록 */}
                                               <div className="demandFormMandemand-products-section">
                                                   <h3>구매 희망 상품 ({participation.products.length})</h3>
                                                   <div className="demandFormMandemand-products-grid">
                                                       {participation.products.map((product) => (
                                                           <div key={product.id} className="demandFormManproduct-card">
                                                               <img
                                                                   src={getFullImageUrl(product.image)}
                                                                   alt={product.name}
                                                               />
                                                               <h4>{product.name}</h4>
                                                               <p>수량: {product.quantity}개</p>
                                                           </div>
                                                       ))}
                                                   </div>
                                               </div>
                                               </div>
                                               ))
                                               ) : (
                                               <div
                                                   className="demandParti-empty-state"
                                                   style={{
                                                       display: 'flex',
                                                       flexDirection: 'column',
                                                       alignItems: 'center',
                                                       justifyContent: 'center',
                                                       textAlign: 'center',
                                                       padding: '40px 0',
                                                       width: '100%',
                                                       minHeight: '200px' // 필요시 높이 추가
                                                   }}
                                               >
                                                   <Heart size={40}/>
                                                   <p style={{marginTop: '16px', fontSize: '1.2rem', color: '#6b7280'}}>
                                                       마감된 수요조사 목록이 표시됩니다.
                                                   </p>
                                               </div>
                                               )}
                                           </div>
                                    </div>
                                    )}

                                {/*/!* 알림 탭 *!/*/}
                                {/*{activeTab === 'notifications' && (*/}
                                {/*    <div className="demandParti-tab-content">*/}
                                {/*        <h2 className="demandParti-section-title">알림</h2>*/}
                                {/*        <div className="demandParti-placeholder">*/}
                                {/*            <Bell size={40}/>*/}
                                {/*            <p>이 탭에서는 새로운 알림이 표시됩니다.</p>*/}
                                {/*        </div>*/}
                                {/*    </div>*/}
                                {/*)}*/}
                            </div>

                            {/* 계정 관리 섹션 */}
                            <div className="demandParti-account-card">
                                <h2 className="demandParti-section-title">계정 관리</h2>

                                <div className="demandParti-account-menu">
                                <button className="demandParti-menu-item">
                            <div className="demandParti-menu-icon">
                                <User size={20}/>
                            </div>
                            <span>개인정보 관리</span>
                            <ChevronRight size={20} className="demandParti-menu-arrow"/>
                        </button>

                        <button className="demandParti-menu-item">
                            <div className="demandParti-menu-icon">
                                <FileText size={20}/>
                            </div>
                            <span>주문 내역</span>
                            <ChevronRight size={20} className="demandParti-menu-arrow"/>
                        </button>

                        <button className="demandParti-menu-item">
                            <div className="demandParti-menu-icon">
                                <Award size={20}/>
                            </div>
                            <span>친환경 활동 포인트</span>
                            <ChevronRight size={20} className="demandParti-menu-arrow"/>
                        </button>

                        <button className="demandParti-menu-item">
                            <div className="demandParti-menu-icon">
                                <Settings size={20}/>
                            </div>
                            <span>설정</span>
                            <ChevronRight size={20} className="demandParti-menu-arrow"/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemandParticipate;