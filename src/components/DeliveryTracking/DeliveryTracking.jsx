import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DeliveryTracking.css";

const trackingDataByStatus = {
  "신청완료": {
    trackingNumber: "500629607053",
    courier: "CJ대한통운",
    status: "신청완료",
    history: [
      { location: "대전HUB", status: "행낭포장", time: "2025-02-07 03:19:54" }
    ]
  },
  "상품이동": {
    trackingNumber: "500629607053",
    courier: "CJ대한통운",
    status: "상품이동중",
    history: [
      { location: "대전HUB", status: "행낭포장", time: "2025-02-07 03:19:54" },
      { location: "대전HUB", status: "간선하차", time: "2025-02-07 03:17:54" },
      { location: "대전HUB", status: "간선상차", time: "2025-02-07 03:17:07" }
    ]
  },
  "배송지도착": {
    trackingNumber: "500629607053",
    courier: "CJ대한통운",
    status: "배송지도착",
    history: [
      { location: "대전HUB", status: "행낭포장", time: "2025-02-07 03:19:54" },
      { location: "대전HUB", status: "간선하차", time: "2025-02-07 03:17:54" },
      { location: "대전HUB", status: "간선상차", time: "2025-02-07 03:17:07" },
      { location: "대구북구", status: "간선하차", time: "2025-02-07 08:25:33" },
      { location: "대구북구택배", status: "배송출발 (배달예정시간: 16~18시)", time: "2025-02-07 13:11:02" }
    ]
  },
  "배송완료": {
    trackingNumber: "500629607053",
    courier: "CJ대한통운",
    status: "배송완료",
    history: [
      { location: "대전HUB", status: "행낭포장", time: "2025-02-07 03:19:54" },
      { location: "대전HUB", status: "간선하차", time: "2025-02-07 03:17:54" },
      { location: "대전HUB", status: "간선상차", time: "2025-02-07 03:17:07" },
      { location: "대구북구", status: "간선하차", time: "2025-02-07 08:25:33" },
      { location: "대구북구택배", status: "배송출발 (배달예정시간: 16~18시)", time: "2025-02-07 13:11:02" },
      { location: "대구북구택배", status: "배송완료", time: "2025-02-07 16:16:19" }
    ]
  }
};

const statusStages = ["신청완료", "상품이동", "배송지도착", "배송완료"];

export default function DeliveryTracking({ setDeliveryTracking, selectedPurchase }) {
  const navigate = useNavigate();
  const [currentStage, setCurrentStage] = useState("배송완료");
  const [clickedItem, setClickedItem] = useState(null);
  const [visibleIcons, setVisibleIcons] = useState({});
  const trackingData = trackingDataByStatus[currentStage];

  const getProgressWidth = () => {
    const stageIndex = statusStages.indexOf(currentStage);
    return `${(stageIndex / (statusStages.length - 1)) * 100}%`;
  };

  const handleStageClick = (stage) => {
    setCurrentStage(stage);
    setClickedItem(stage);
    setVisibleIcons({ ...visibleIcons, [stage]: true });
    setTimeout(() => setClickedItem(null), 400);
  };

  const handleConfirm = () => {
    setDeliveryTracking(false);
  };

  const handleGoBack = () => {
    setDeliveryTracking(false);
  };

  const getIconForStage = (stage) => {
    if (!visibleIcons[stage] && stage !== currentStage && 
        statusStages.indexOf(stage) > statusStages.indexOf(currentStage)) {
      return null;
    }
    
    return (
      <>
        {stage === "신청완료" && "📦"}
        {stage === "상품이동" && "🚚"}
        {stage === "배송지도착" && "🏢"}
        {stage === "배송완료" && "📬"}
      </>
    );
  };

  return (
    <div className="tracking-container">
      {/* 뒤로 가기 버튼 추가 */}
      <button 
        className="DeliveryTrackingConfirm-back-button"
        onClick={handleGoBack}
      >
        &larr; 뒤로 가기
      </button>

      <div className="DeliveryTrackingConfirm-product">
        {selectedPurchase && (
          <div className="DeliveryTrackingConfirm-product-info-container">
            <div className="DeliveryTrackingConfirm-product-image-container">
              <img 
                src={selectedPurchase.products[0].image} 
                alt={selectedPurchase.products[0].name} 
                className="DeliveryTrackingConfirm-product-image"
              />
            </div>
            <div className="DeliveryTrackingConfirm-product-details">
              <h3 className="DeliveryTrackingConfirm-product-name">{selectedPurchase.products[0].name}</h3>
              <p className="DeliveryTrackingConfirm-product-price">
                {selectedPurchase.products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toLocaleString()}원
              </p>
              <p className="DeliveryTrackingConfirm-product-quantity">수량: {selectedPurchase.products.reduce((sum, p) => sum + p.quantity, 0)}개</p>
            </div>
          </div>
        )}
      </div>

      <div className="tracking-header">
        <div>
          <h2 className="tracking-number">{trackingData.trackingNumber}</h2>
          <p className="courier-name">{trackingData.courier}</p>
        </div>
        <div className="status-badge">
          <span className={`status-text ${trackingData.status === "배송완료" ? "delivered" : ""}`}>
            {trackingData.status}
          </span>
        </div>
      </div>

      <div className="status-timeline">
        <div className="status-progress-bar">
          <div className="progress-fill" style={{ width: getProgressWidth() }}></div>
        </div>
        <div className="status-icons">
          {statusStages.map((stage) => {
            const isCompleted = statusStages.indexOf(stage) <= statusStages.indexOf(currentStage);
            const isActive = stage === currentStage;
            
            return (
              <div 
                key={stage} 
                className={`delivery-status-item ${clickedItem === stage ? 'clicked' : ''}`}
                onClick={() => handleStageClick(stage)}
              >
                <div className={`delivery-status-circle ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                  {getIconForStage(stage)}
                </div>
                <p className="status-text">{stage}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="tracking-history">
        <h3 className="history-title">배송 상세 정보</h3>
        <div className="history-items">
          {trackingData.history.map((event, index) => (
            <div key={index} className="history-item">
              <div className="history-line"></div>
              <div className="history-dot"></div>
              <div className="history-content">
                <p className="history-location">{event.location}</p>
                <p className="history-status">{event.status}</p>
                <p className="history-time">{event.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="delivery-banner">
        <div className="delivery-banner-icon">📢</div>
        <div className="delivery-banner-content">
          <p className="delivery-banner-title">스마트택배 알림 서비스</p>
          <p className="delivery-banner-text">배송 상태가 변하면 즉시 알려드려요!</p>
        </div>
      </div>

      <button 
        className="DeliveryTrackingConfirm-button"
        onClick={handleConfirm}
      >
        확인
      </button>
    </div>
  );
}