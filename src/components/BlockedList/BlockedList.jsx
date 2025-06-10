import React, { useState } from "react";
import "./BlockedList.css";

const BlockedList = () => {
    const [blockedUsers, setBlockedUsers] = useState([
        { id: 1, name: "차단 유저1", date: "2024-05-01", avatar: null },
        { id: 2, name: "차단 유저2", date: "2024-05-02", avatar: null },
        { id: 3, name: "차단 유저3", date: "2024-05-03", avatar: null },
        { id: 4, name: "차단 유저4", date: "2024-05-04", avatar: null },
        { id: 5, name: "차단 유저5", date: "2024-05-05", avatar: null },
    ]);

    const unblockUser = (id) => {
        if (window.confirm("정말 차단을 해제하시겠습니까?")) {
            const updatedList = blockedUsers.filter(user => user.id !== id);
            setBlockedUsers(updatedList);
        }
    };

    return (
        <div className="blocked-list-container">
            <h2 className="blocked-list-title">차단 목록</h2>
            
            {blockedUsers.length === 0 ? (
                <div className="empty-message">차단된 사용자가 없습니다.</div>
            ) : (
                <ul className="blocked-users">
                    {blockedUsers.map((user) => (
                        <li key={user.id} className="user-item">
                            <div className="user-info">
                                <div className="user-avatar">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="프로필" />
                                    ) : (
                                        <span>{user.name.charAt(0)}</span>
                                    )}
                                </div>
                                <div className="user-details">
                                    <span className="user-name">{user.name}</span>
                                    <span className="block-date">차단 일자: {user.date}</span>
                                </div>
                            </div>
                            <button 
                                className="unblock-button" 
                                onClick={() => unblockUser(user.id)}
                            >
                                차단 해제
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <div className="pagination">
                <button className="page-btn">{"<"}</button>
                <button className="page-btn active">1</button>
                <button className="page-btn">2</button>
                <button className="page-btn">3</button>
                <button className="page-btn">{">"}</button>
            </div>

            <div className="actions">
                <button className="edit-btn">수정하기</button>
                <button className="cancel-btn">취소하기</button>
            </div>
        </div>
    );
};

export default BlockedList;