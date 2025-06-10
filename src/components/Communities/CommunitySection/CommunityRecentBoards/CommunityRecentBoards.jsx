import React from 'react';
import { FaStar } from 'react-icons/fa';
import './CommunityRecentBoards.css';

const recentBoards = [
    { name: '게임', path: '/boards/game' },
    { name: '웹소설', path: '/boards/webnovel' },
    { name: '아이돌 / 연예인', path: '/boards/celebrity' },
    { name: '애니메이션', path: '/boards/anime' },
];

const CommunityRecentBoards = () => {
    return (
        <div className="recent-boards">
            <h3><FaStar className="star-icon" /> 최근 방문 게시판</h3>
            <div className="recent-board-list">
                {recentBoards.map((board, index) => (
                    <a key={index} href={board.path} className="recent-board-card">
                        {board.name}
                    </a>
                ))}
            </div>
        </div>
    );
};

export default CommunityRecentBoards;
