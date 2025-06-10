import React from 'react';
import './CheckReply.css';

const CheckReply = ({ inquiry, onConfirm }) => {

    const handleConfirm = () => {
        onConfirm(inquiry.id);
    };

    return (
        <div className="check-reply-container">
            <div className="check-reply-header">
                <h2>문의 내용 : </h2>
                <p className='question-content'>{inquiry.content}</p>
            </div>
            <div className="check-reply-body">
                <h2>답변 내용 : </h2>
                <p className="reply-content">{inquiry.replyContent}</p>
            </div>
            <button className="confirm-btn" onClick={handleConfirm}>확인</button>
        </div>
    );
};

export default CheckReply;
