import { Award, Bell, Calendar, ChevronRight, Clock, FileText, Heart, Package, Settings, ShoppingBag, User } from 'lucide-react';
import React, {useContext, useEffect, useState} from 'react';
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
        favorites: 12,
        notifications: 3
    });

    const fetchParticipations = async () => {
        try {
            const data = await DemandService.getMyOrders();
            const participations = data.content.map(item => ({
                id: item.id,
                title: item.demandPostOmittedResponse.title,
                thumbnail: item.demandPostOmittedResponse.imageUrl
                    ? `/api/file/${item.demandPostOmittedResponse.imageUrl}`
                    : placeholder100,
                state: item.demandPostOmittedResponse.state,
                category: item.demandPostOmittedResponse.category, // 추가
                products: item.demandOrderProducts.map(product => ({
                    id: product.id,
                    name: product.name,
                    image: `/api/file/${product.image}`, // 이미지 경로 수정
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
                {/* 헤더 섹션 */}
                <div className="demandParti-header-card">
                    <div className="demandParti-profile-section">
                        <div className="demandParti-profile-image">
                            <img src={userData.profileImage} alt={userData.name} />
                        </div>
                        <div className="demandParti-profile-info">
                            <h1>{userData.name}</h1>
                            <p>{userData.email}</p>
                        </div>
                    </div>
                    
                    <div className="demandParti-stats-grid">
                        <div className="demandParti-stat-item">
                            <div className="demandParti-stat-icon">
                                <ShoppingBag size={24} />
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

                        <div className="demandParti-stat-item">
                            <div className="demandParti-stat-icon">
                            <Bell size={24}/>
                            </div>
                            <p className="demandParti-stat-label">관심 상품</p>
                            <p className="demandParti-stat-value">{userData.favorites}개</p>
                            {/*<p className="demandParti-stat-label">새 알림</p>*/}
                            {/*<p className="demandParti-stat-value">{userData.notifications}개</p>*/}
                        </div>
                    </div>
                </div>

                {/* 탭 네비게이션 */}
                <div className="demandParti-tab-card">
                    <div className="demandParti-tab-header">
                        <button 
                            className={`demandParti-tab-button ${activeTab === 'participations' ? 'active' : ''}`}
                            onClick={() => setActiveTab('participations')}
                        >
                            수요조사 참여내역
                        </button>
                        <button 
                            className={`demandParti-tab-button ${activeTab === 'favorites' ? 'active' : ''}`}
                            onClick={() => setActiveTab('favorites')}
                        >
                            관심 상품
                        </button>
                        <button 
                            className={`demandParti-tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
                            onClick={() => setActiveTab('notifications')}
                        >
                            알림
                        </button>
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

                            <h2 className="demandParti-section-title">수요조사 참여내역</h2>

                            <div className="demandParti-items-list">
                                {userData.participations.length > 0 ? (
                                    userData.participations.map(participation => (
                                        <div key={participation.id} className="participation-item">
                                            <img src={participation.thumbnail} alt={participation.title}/>

                                            <div className="participation-info">
                                                <h3>{participation.title}</h3>
                                                <p>카테고리: {participation.category}</p>
                                                <p>참여 일자: {participation.date}</p>

                                                {/* 상품 목록 */}
                                                <div className="participation-products">
                                                    {participation.products.map(product => (
                                                        <div key={product.id} className="product-item">
                                                            <img src={product.image} alt={product.name} />
                                                            <div>
                                                                <p>{product.name}</p>
                                                                <p>수량: {product.quantity}개</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => handleEdit(participation)}
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => handleDelete(participation.id)}
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="demandParti-empty-state">
                                        <p>참여한 상품이 없습니다.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/*{activeTab === 'participations' && (*/}
                    {/*    <div className="demandParti-tab-content">*/}
                    {/*        <h2 className="demandParti-section-title">수요조사 참여내역</h2>*/}
                    {/*        */}
                    {/*        <div className="demandParti-items-list">*/}
                    {/*            {userData.participations.length > 0 ? (*/}
                    {/*                userData.participations.map(participation => (*/}
                    {/*                        <div key={participation.id} className="participation-item">*/}
                    {/*                            <img src={participation.thumbnail} alt={participation.title} />*/}
                    {/*                            <div className="participation-info">*/}
                    {/*                                <h3>{participation.title}</h3>*/}
                    {/*                                <p>카테고리: {participation.category}</p>*/}
                    {/*                                <p>참여 일자: {participation.date}</p>*/}

                    {/*                                <div className="participation-products">*/}
                    {/*                                    {participation.products.map(product => (*/}
                    {/*                                        <div key={product.id} className="product-item">*/}
                    {/*                                            <img src={product.image} alt={product.name}/>*/}
                    {/*                                            <div>*/}
                    {/*                                                <p>{product.name}</p>*/}
                    {/*                                                <p>수량: {product.quantity}개</p>*/}
                    {/*                                            </div>*/}
                    {/*                                        </div>*/}
                    {/*                                    ))}*/}
                    {/*                                </div>*/}
                    {/*                                <button onClick={() => handleEdit(participation)}>수정</button>*/}
                    {/*                                <button onClick={() => handleDelete(participation.id)}>삭제</button>*/}
                    {/*                            </div>*/}
                    {/*                        </div>*/}
                    {/*                ))*/}
                    {/*                // userData.participations.map((item) => (*/}
                    {/*                //     <div key={item.id} className="demandParti-item-card">*/}
                    {/*                //         <div className="demandParti-item-header">*/}
                    {/*                //             <div className="demandParti-item-image">*/}
                    {/*                //                 <img src={item.thumbnail} alt={item.title} />*/}
                    {/*                //             </div>*/}
                    {/*                //*/}
                    {/*                //             <div className="demandParti-item-details">*/}
                    {/*                //                 <div className="demandParti-item-title-row">*/}
                    {/*                //                     <h3>{item.title}</h3>*/}
                    {/*                //                     <span className={`demandParti-status-badge ${getStatusColor(item.status)}`}>*/}
                    {/*                //                         {item.status}*/}
                    {/*                //                     </span>*/}
                    {/*                //                 </div>*/}
                    {/*                //*/}
                    {/*                //                 <div className="demandParti-item-info">*/}
                    {/*                //                     <div className="demandParti-info-row">*/}
                    {/*                //                         <Calendar size={16} />*/}
                    {/*                //                         <span>참여일: {item.date}</span>*/}
                    {/*                //                     </div>*/}
                    {/*                //*/}
                    {/*                //                     <div className="demandParti-info-row">*/}
                    {/*                //                         <Clock size={16} />*/}
                    {/*                //                         <span>마감일: {item.deadline}</span>*/}
                    {/*                //                     </div>*/}
                    {/*                //*/}
                    {/*                //                     {item.deliveryStatus && (*/}
                    {/*                //                         <div className="demandParti-info-row">*/}
                    {/*                //                             <Package size={16} />*/}
                    {/*                //                             <span className={`demandParti-delivery-badge ${getDeliveryStatusColor(item.deliveryStatus)}`}>*/}
                    {/*                //                                 {item.deliveryStatus}*/}
                    {/*                //                             </span>*/}
                    {/*                //                         </div>*/}
                    {/*                //                     )}*/}
                    {/*                //                 </div>*/}
                    {/*                //             </div>*/}
                    {/*                //         </div>*/}
                    {/*                //*/}
                    {/*                //         {item.status === "진행중" && (*/}
                    {/*                //             <div className="demandParti-progress-section">*/}
                    {/*                //                 <div className="demandParti-progress-header">*/}
                    {/*                //                     <span>목표 달성률</span>*/}
                    {/*                //                     <span>{item.progress}%</span>*/}
                    {/*                //                 </div>*/}
                    {/*                //                 <div className="demandParti-progress-bar">*/}
                    {/*                //                     <div*/}
                    {/*                //                         className="demandParti-progress-fill"*/}
                    {/*                //                         style={{ width: `${item.progress}%` }}*/}
                    {/*                //                     ></div>*/}
                    {/*                //                 </div>*/}
                    {/*                //             </div>*/}
                    {/*                //         )}*/}
                    {/*                //*/}
                    {/*                //         <div className="demandParti-item-footer">*/}
                    {/*                //             <p className="demandParti-item-price">{item.price.toLocaleString()}원</p>*/}
                    {/*                //             <button*/}
                    {/*                //                 className="demandParti-detail-button"*/}
                    {/*                //                 onClick={() => navigate('/demandDetail', { state: { participation: item } })}*/}
                    {/*                //             >*/}
                    {/*                //                 <span>상세보기</span>*/}
                    {/*                //                 <ChevronRight size={16} />*/}
                    {/*                //             </button>*/}
                    {/*                //         </div>*/}
                    {/*                //     </div>*/}
                    {/*                // ))*/}
                    {/*            ) : (*/}
                    {/*                <div className="demandParti-empty-state">*/}
                    {/*                    <p>참여한 상품이 없습니다.</p>*/}
                    {/*                </div>*/}
                    {/*            )}*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*)}*/}
                    
                    {/* 관심 상품 탭 */}
                    {activeTab === 'favorites' && (
                        <div className="demandParti-tab-content">
                            <h2 className="demandParti-section-title">관심 상품</h2>
                            <div className="demandParti-placeholder">
                                <Heart size={40} />
                                <p>이 탭에서는 관심 상품 목록이 표시됩니다.</p>
                            </div>
                        </div>
                    )}
                    
                    {/* 알림 탭 */}
                    {activeTab === 'notifications' && (
                        <div className="demandParti-tab-content">
                            <h2 className="demandParti-section-title">알림</h2>
                            <div className="demandParti-placeholder">
                                <Bell size={40} />
                                <p>이 탭에서는 새로운 알림이 표시됩니다.</p>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* 계정 관리 섹션 */}
                <div className="demandParti-account-card">
                    <h2 className="demandParti-section-title">계정 관리</h2>
                    
                    <div className="demandParti-account-menu">
                        <button className="demandParti-menu-item">
                            <div className="demandParti-menu-icon">
                                <User size={20} />
                            </div>
                            <span>개인정보 관리</span>
                            <ChevronRight size={20} className="demandParti-menu-arrow" />
                        </button>
                        
                        <button className="demandParti-menu-item">
                            <div className="demandParti-menu-icon">
                                <FileText size={20} />
                            </div>
                            <span>주문 내역</span>
                            <ChevronRight size={20} className="demandParti-menu-arrow" />
                        </button>
                        
                        <button className="demandParti-menu-item">
                            <div className="demandParti-menu-icon">
                                <Award size={20} />
                            </div>
                            <span>친환경 활동 포인트</span>
                            <ChevronRight size={20} className="demandParti-menu-arrow" />
                        </button>
                        
                        <button className="demandParti-menu-item">
                            <div className="demandParti-menu-icon">
                                <Settings size={20} />
                            </div>
                            <span>설정</span>
                            <ChevronRight size={20} className="demandParti-menu-arrow" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemandParticipate;