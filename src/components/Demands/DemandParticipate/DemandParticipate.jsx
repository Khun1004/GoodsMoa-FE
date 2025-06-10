import { Award, Bell, Calendar, ChevronRight, Clock, FileText, Heart, Package, Settings, ShoppingBag, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DemandParticipate.css';

// Import placeholder images
import placeholder100 from '../../../assets/demandPa/1.jpg';
import placeholder80 from '../../../assets/demandPa/2.jpg';

const DemandParticipate = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('participations');
    const [userData, setUserData] = useState({
        name: "김지민",
        email: "jimin@example.com",
        profileImage: placeholder100,
        participations: [],
        favorites: 12,
        notifications: 3
    });
    
    useEffect(() => {
        // localStorage에서 참여 데이터 가져오기
        const savedParticipations = JSON.parse(localStorage.getItem('participations') || '[]');
        
        // 더미 데이터 (기존 참여 내역이 없을 때만 표시)
        const dummyParticipations = savedParticipations.length === 0 ? [
            {
                id: 1,
                title: "친환경 생활용품 세트",
                thumbnail: placeholder100,
                status: "진행중",
                deadline: "2025년 5월 31일",
                progress: 68,
                price: 74500,
                date: "2025년 4월 20일"
            },
            {
                id: 2,
                title: "업사이클링 가방 시리즈",
                thumbnail: placeholder80,
                status: "목표달성",
                deadline: "2025년 4월 15일",
                progress: 100,
                price: 32000,
                date: "2025년 3월 25일",
                deliveryStatus: "배송준비중"
            }
        ] : [];
        
        // 참여 데이터 병합 (최근 참여가 먼저 오도록 정렬)
        const allParticipations = [...savedParticipations, ...dummyParticipations]
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setUserData(prevData => ({
            ...prevData,
            participations: allParticipations
        }));
    }, []);
    
    const getStatusColor = (status) => {
        switch(status) {
            case "진행중": return "status-in-progress";
            case "목표달성": return "status-complete";
            case "마감실패": return "status-failed";
            default: return "status-default";
        }
    };
    
    const getDeliveryStatusColor = (status) => {
        switch(status) {
            case "배송준비중": return "delivery-preparing";
            case "배송중": return "delivery-in-progress";
            case "배송완료": return "delivery-complete";
            default: return "delivery-default";
        }
    };

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
                            <p className="demandParti-stat-label">참여 중인 수요조사</p>
                            <p className="demandParti-stat-value">
                                {userData.participations.filter(p => p.status === "진행중").length}건
                            </p>
                        </div>
                        
                        <div className="demandParti-stat-item">
                            <div className="demandParti-stat-icon">
                                <Heart size={24} />
                            </div>
                            <p className="demandParti-stat-label">관심 상품</p>
                            <p className="demandParti-stat-value">{userData.favorites}개</p>
                        </div>
                        
                        <div className="demandParti-stat-item">
                            <div className="demandParti-stat-icon">
                                <Bell size={24} />
                            </div>
                            <p className="demandParti-stat-label">새 알림</p>
                            <p className="demandParti-stat-value">{userData.notifications}개</p>
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
                            <h2 className="demandParti-section-title">수요조사 참여내역</h2>
                            
                            <div className="demandParti-items-list">
                                {userData.participations.length > 0 ? (
                                    userData.participations.map((item) => (
                                        <div key={item.id} className="demandParti-item-card">
                                            <div className="demandParti-item-header">
                                                <div className="demandParti-item-image">
                                                    <img src={item.thumbnail} alt={item.title} />
                                                </div>
                                                
                                                <div className="demandParti-item-details">
                                                    <div className="demandParti-item-title-row">
                                                        <h3>{item.title}</h3>
                                                        <span className={`demandParti-status-badge ${getStatusColor(item.status)}`}>
                                                            {item.status}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="demandParti-item-info">
                                                        <div className="demandParti-info-row">
                                                            <Calendar size={16} />
                                                            <span>참여일: {item.date}</span>
                                                        </div>
                                                        
                                                        <div className="demandParti-info-row">
                                                            <Clock size={16} />
                                                            <span>마감일: {item.deadline}</span>
                                                        </div>
                                                        
                                                        {item.deliveryStatus && (
                                                            <div className="demandParti-info-row">
                                                                <Package size={16} />
                                                                <span className={`demandParti-delivery-badge ${getDeliveryStatusColor(item.deliveryStatus)}`}>
                                                                    {item.deliveryStatus}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {item.status === "진행중" && (
                                                <div className="demandParti-progress-section">
                                                    <div className="demandParti-progress-header">
                                                        <span>목표 달성률</span>
                                                        <span>{item.progress}%</span>
                                                    </div>
                                                    <div className="demandParti-progress-bar">
                                                        <div 
                                                            className="demandParti-progress-fill" 
                                                            style={{ width: `${item.progress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="demandParti-item-footer">
                                                <p className="demandParti-item-price">{item.price.toLocaleString()}원</p>
                                                <button 
                                                    className="demandParti-detail-button"
                                                    onClick={() => navigate('/demandDetail', { state: { participation: item } })}
                                                >
                                                    <span>상세보기</span>
                                                    <ChevronRight size={16} />
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