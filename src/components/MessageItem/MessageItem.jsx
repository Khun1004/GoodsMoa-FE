import React from 'react';

const MessageItem = ({ msg, myUserId, showSenderInfo }) => {
  console.log("수신 메시지:", msg);
  const isMine = String(msg.senderId) === String(myUserId);

  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (e) {
      console.error("날짜 포맷팅 에러:", e);
      return "";
    }
  };

  const defaultProfileImg = "/profile.jpeg";

  return (
    <div className={`message-wrapper ${isMine ? 'me' : 'other'} ${!showSenderInfo ? 'consecutive' : ''}`}>
      <div
        className="profile-image-container"
        style={!showSenderInfo ? { visibility: 'hidden' } : {}}
      >
        {showSenderInfo && (
          <img src={msg.senderImage || defaultProfileImg} alt="profile" className="profile-image" />
        )}
      </div>

      <div className="message-box">
        {/* 닉네임: 첫 메시지일 때만 렌더링 */}
        {showSenderInfo && (
          <p className="sender-nickname">{msg.senderNickname || 'Unknown User'}</p>
        )}
        
        <div className="message-content-wrapper">
          <div className="message-content">
            <p className="message-text">{msg.content}</p>
          </div>
          <div className="message-meta">
            {isMine && (
              <span className="read-status">
                {msg.isRead ? '' : '1'}
              </span>
            )}
            <span className="message-time">{formatTime(msg.sendAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
