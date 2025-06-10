import React from 'react';
import './CommissionApplyDetail.css';

const CommissionApplyDetail = () => {
    return (
        <div className="apply-detail-container">
        <div className="report-section">
            <span>🚨 신고하기</span>
        </div>

        <div className="product-info">
            <img src="/images/keyring-sample.png" alt="키링 이미지" className="product-image" />
            <div className="product-text">
            <h2>캐릭터 키링 커미션</h2>
            <p className="creator-name">👩‍🎨 키링장인</p>
            <div className="price-range">
                <span>최소 신청 금액</span>
                <strong>4,000원</strong>
                <span>~</span>
                <strong>12,000원</strong>
            </div>
            <div className="tag-buttons">
                <button>순수창작</button>
                <button>#캐릭터</button>
                <button>#키링</button>
            </div>
            </div>
        </div>

        <div className="form-section">
            <label>신청자의 아이디</label>
            <input type="text" value="도우니" readOnly />

            <div className="input-group">
            <label>1. 디자인 외관</label>
            <textarea value="은은하고 고급스러운 투톤 계열의 열매 모양을 고급스럽게요" readOnly />
            </div>

            <div className="input-group">
            <label>2. 색감</label>
            <textarea value="전체적으로 따뜻한 색을 부탁드려요. 예: 노랑 계열 포인트와 베이지, 갈색계열" readOnly />
            </div>

            <div className="input-group">
            <label>3. 그 외 원하는 것</label>
            <textarea value="흔하지 않은 고유한 표현을 해주셨으면 좋겠어요. 작가님의 색이 잘 드러나는 디자인이었으면 해요!" readOnly />
            </div>
        </div>

        <div className="action-buttons">
            <button className="chat">채팅하기</button>
            <button className="accept">수락하기</button>
            <button className="reject">거절하기</button>
        </div>
        </div>
    );
};

export default CommissionApplyDetail;
