import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CommissionApplyDetail from "../CommissionApplyDetail/CommissionApplyDetail";
import "./CommissionFormManagement.css";

const CommissionFormManagement = () => {
    const [commissions, setCommissions] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [showNotification, setShowNotification] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedCommissions = JSON.parse(localStorage.getItem("commissions")) || [];
        setCommissions(storedCommissions);
        
        const storedNotifications = JSON.parse(localStorage.getItem("commissionNotifications")) || [];
        setNotifications(storedNotifications);
    }, []);

    const handleDelete = (id) => {
        const confirmed = window.confirm("정말로 커미션을 삭제하시겠습니까?");
        if (!confirmed) return;
    
        const updated = commissions.filter((c) => c.id !== id);
        setCommissions(updated);
        localStorage.setItem("commissions", JSON.stringify(updated));
    };    

    const handleEdit = (commission) => {
        localStorage.setItem("editingCommission", JSON.stringify(commission));
        navigate("/commissionForm");
    };

    const handleCheckApplications = () => {
        if (notifications.length > 0) {
            setShowNotification(true);
            
            setTimeout(() => {
                setShowNotification(false);
            }, 3000);
        } else {
            alert("새로운 신청이 없습니다.");
        }
    };

    const clearNotifications = () => {
        localStorage.removeItem("commissionNotifications");
        setNotifications([]);
        setShowNotification(false);
    };

    const handleNotificationClick = (notification) => {
        setSelectedApplication(notification);
        clearNotifications();
    };

    const handleBackToList = () => {
        setSelectedApplication(null);
    };

    return (
        <div className="container">
            <div className="management-container">
                <h1 className="management-title">내가 등록한 커미션 관리</h1>
                
                {/* 신청 확인 버튼과 알림 표시 영역 */}
                <div className="ComFormManagNotification-area">
                    <div className="ComFormManagNotification-badge-container">
                        <button 
                            className="ComFormManagCheck-applications-btn"
                            onClick={handleCheckApplications}
                        >
                            신청 등록 확인
                        </button>
                        <span className={`ComFormManagNotification-badge ${notifications.length > 0 ? 'has-notification' : ''}`}>
                            {notifications.length > 0 ? notifications.length : 0}
                        </span>
                    </div>
                    
                    {showNotification && (
                        <div className="ComFormManagNotification-box">
                            <div className="ComFormManagNotification-header">
                                <h3>새로운 신청 알림</h3>
                                <button onClick={clearNotifications}>×</button>
                            </div>
                            <ul>
                                {notifications.map((noti, index) => (
                                    <li 
                                        key={index} 
                                        onClick={() => handleNotificationClick(noti)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <strong>{noti.commissionTitle}</strong>에 새로운 신청이 있습니다.
                                        <p>신청자: {noti.applicantId}</p>
                                        <small>{new Date(noti.timestamp).toLocaleString()}</small>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {selectedApplication ? (
                    <CommissionApplyDetail 
                        application={selectedApplication} 
                        onBack={handleBackToList} 
                    />
                ) : (
                    <div className="comFormManag-list">
                        {commissions.length === 0 ? (
                            <p className="empty-message">등록된 커미션이 없습니다.</p>
                        ) : (
                            commissions.map((commission) => (
                                <div key={commission.id} className="comFormManag-card">
                                    <img src={commission.image} alt={commission.title} className="comFormManag-image-horizontal" />
                                    <div className="comFormManag-info-horizontal">
                                        <h2 className="comFormManag-title">{commission.title}</h2>
                                        <p className="comFormManag-category">카테고리: {commission.category}</p>
                                        <p className="comFormManag-prices">
                                            금액: {commission.minPrice.toLocaleString()}원 ~ {commission.maxPrice.toLocaleString()}원
                                        </p>
                                        <p className="comFormManag-max">최대 동시 진행: {commission.maxCount}개</p>
                                        <div className="comFormManag-tags">
                                            {commission.tags.map((tag, index) => (
                                                <span key={index} className="comFormManag-tag">#{tag}</span>
                                            ))}
                                        </div>
                                        <div className="comFormManag-actions">
                                            <button className="comFormManagEditBtn" onClick={() => handleEdit(commission)}>수정</button>
                                            <button className="comFormManagDeleteBtn" onClick={() => handleDelete(commission.id)}>삭제</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommissionFormManagement;