import React from 'react';
import './ManagementComponents.css'; // 공통 CSS

/**
 * 관리 페이지 목록에 사용되는 공통 카드 컴포넌트
 * * @param {object} item - 카드에 표시될 데이터 객체 (title, thumbnailImage, imageUrl 등 포함)
 * @param {string} statusType - 'public', 'private', 'selling' 등 카드 상태에 따른 스타일 클래스
 * @param {React.ReactNode} statusIcon - 상태 뱃지에 표시될 아이콘
 * @param {string} statusText - 상태 뱃지에 표시될 텍스트
 * @param {Array<object>} badges - [{ icon: <Icon/>, text: '뱃지' }] 형태의 객체 배열
 * @param {string} footerText - 카드 하단에 표시될 텍스트 (예: "상품 5개", "조회수 100회")
 * @param {function} onCardClick - 카드 전체를 클릭했을 때 실행될 함수
 * @param {React.ReactNode} actionButtons - 카드 하단에 표시될 액션 버튼들의 JSX 뭉치
 */
const ManagementCard = ({
    item,
    statusType,
    statusIcon,
    statusText,
    badges,
    footerText,
    onCardClick,
    actionButtons, // 👈 onEdit, onDelete 대신 이 prop을 사용!
}) => {
    
    // thumbnailImage, imageUrl 등 다양한 키 값을 모두 처리할 수 있도록 수정
    const thumbnailUrl = item.thumbnailImage || item.imageUrl || 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop';

    return (
        <div className="mgmt-card" onClick={() => onCardClick(item)}>
            <div className="mgmt-card-thumbnail">
                <img 
                    src={thumbnailUrl} 
                    alt={item.title} 
                    className="mgmt-card-thumbnail-img" 
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop'; }} 
                />
                {statusText && (
                    <span className={`mgmt-card-status status-${statusType}`}>
                        {statusIcon}
                        {statusText}
                    </span>
                )}
            </div>
            <div className="mgmt-card-content">
                <h3 className="mgmt-card-title">{item.title}</h3>
                
                <div className="mgmt-card-badges">
                    {badges.map((badge, index) => (
                        <span key={index} className="badge">
                            {badge.icon}
                            {badge.text}
                        </span>
                    ))}
                </div>

                <div className="mgmt-card-footer">
                    <span className="mgmt-card-footer-text">{footerText}</span>
                    
                    {/* 👇 여기가 핵심! 버튼을 직접 그리는 대신, 받은 그대로 렌더링! */}
                    <div className="mgmt-card-actions">
                        {actionButtons}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagementCard;