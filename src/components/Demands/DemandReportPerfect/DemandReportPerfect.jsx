import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./DemandReportPerfect.css";

const DemandReportPerfect = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { item = {}, representativeImage = "https://via.placeholder.com/120", email = "", reason = "", content  = "", fileName = "" } = location.state || {};
    
    return (
        <div className="perfect-container">
            <div className="perfect-box">
                <div className="perfect-icon">
                    <svg className='svgPerfect' 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="80" height="80" 
                        viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" 
                        strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                </div>

                <h2 className="perfect-title">🎉 신고가 완료되었습니다!</h2>
                <p className="perfect-subtitle">신고해주셔서 감사합니다. 아래는 신고하신 상품 정보입니다.</p>

                <div className="perfect-item">
                    <img src={representativeImage} alt="신고한 상품 이미지" className="perfect-image" />
                    <div className="perfect-details">
                        <h3>{item.title || "상품 제목 없음"}</h3>
                        <p>💰 가격: {item.price ? `${item.price}원` : "정보 없음"}</p>
                        <p>📦 상태: {item.condition || "미상"}</p>
                    </div>
                </div>

                <div className="perfect-extra-info">
                    <p>📧 신고자 이메일: {email}</p>
                    <p>🚨 신고 사유: {reason}</p>
                    <p>📝 상세 내용: {content }</p>
                    {fileName && <p>📎 첨부 파일: {fileName}</p>}
                </div>

                <div className="perfect-thankyou">
                    빠른 시일 내에 검토 후 처리하겠습니다. 감사합니다. 🙏
                </div>
                <button className="perfect-home-button" onClick={() => navigate("/")}>
                    🏠 홈으로 가기
                </button>
            </div>
        </div>
    );
};

export default DemandReportPerfect;
