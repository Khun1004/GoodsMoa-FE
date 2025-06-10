import React, { useEffect, useState } from 'react';
import {
    FaBars,
    FaBell, FaBook, FaCalendarAlt, FaFeatherAlt,
    FaFilm,
    FaGamepad,
    FaPaw,
    FaRegSmile,
    FaStar,
    FaTimes,
    FaTv,
    FaUserAlt
} from 'react-icons/fa';
import CommunityLogoImg from '../../../assets/logo.png';
import CommunityAnimation from '../CommunitySection/CommunityAnimation/CommunityAnimation';
import CommunityDrama from '../CommunitySection/CommunityDrama/CommunityDrama';
import CommunityEvent from '../CommunitySection/CommunityEvent/CommunityEvent';
import CommunityGame from '../CommunitySection/CommunityGame/CommunityGame';
import CommunityIdol from '../CommunitySection/CommunityIdol/CommunityIdol';
import CommunityPureCreation from '../CommunitySection/CommunityPureCreation/CommunityPureCreation';
import RecentBoards from '../CommunitySection/CommunityRecentBoards/CommunityRecentBoards';
import CommunityVideo from '../CommunitySection/CommunityVideo/CommunityVideo';
import CommunityWebNovel from '../CommunitySection/CommunityWebNovel/CommunityWebNovel';
import CommunityWebtoon from '../CommunitySection/CommunityWebtoon/CommunityWebtoon';
import './Community.css';

const boardList = [
    { name: '최근 방문 게시판', icon: <FaStar style={{ color: '#FFD700' }} /> },
    { name: '아이돌 / 연예인', icon: <FaUserAlt style={{ color: '#FF69B4' }} /> },
    { name: '게임', icon: <FaGamepad style={{ color: '#8A2BE2' }} /> },
    { name: '영화', icon: <FaFilm style={{ color: '#4682B4' }} /> },
    { name: '웹소설', icon: <FaBook style={{ color: '#32CD32' }} /> },
    { name: '애니메이션', icon: <FaPaw style={{ color: '#FF8C00' }} /> },
    { name: '순수창작', icon: <FaFeatherAlt style={{ color: '#DC143C' }} /> },
    { name: '행사', icon: <FaCalendarAlt style={{ color: '#20B2AA' }} /> },
    { name: '드라마', icon: <FaTv style={{ color: '#9370DB' }} /> },
    { name: '웹툰', icon: <FaRegSmile style={{ color: '#00BFFF' }} /> },
];

const popularPosts = [
    {
        title: '반다이의 퇴물이 방지 대책',
        category: '웹소설',
        time: '1시간 전',
        likes: 36,
        thumbnail: 'https://via.placeholder.com/80',
    },
    {
        title: '남돌 신청성 근황임',
        category: '게임',
        time: '3시간 전',
        likes: 40,
        thumbnail: 'https://via.placeholder.com/80',
    },
    {
        title: '박효신 HERO 발매 ost from 소방관',
        category: '아이돌/연예인',
        time: '8시간 전',
        likes: 20,
        thumbnail: 'https://via.placeholder.com/80',
    },
    {
        title: '"기카자드! 니 딸따로 병원에 다녀오길 잘했어!"',
        category: '아이돌/연예인',
        time: '9시간 전',
        likes: 17,
        thumbnail: 'https://via.placeholder.com/80',
    },
    {
        title: '제 82회 골든 글로브 수상작 풀 리스트',
        category: '영화',
        time: '10시간 전',
        likes: 52,
        thumbnail: 'https://via.placeholder.com/80',
    },
];

const Community = () => {
    const [selectedBoard, setSelectedBoard] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);

    useEffect(() => {
        // In a real app, this would be an API call
        const mockNotifications = [
            { id: 1, message: '새로운 쪽지가 도착했습니다', time: '5분 전', read: false },
            { id: 2, message: '회원님의 게시글에 댓글이 달렸습니다', time: '30분 전', read: false },
            { id: 3, message: '시스템 점검 안내', time: '2시간 전', read: true },
        ];
        setNotifications(mockNotifications);

        const handleResize = () => {
            setIsMobile(window.innerWidth <= 767);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleBoardClick = (name) => {
        setSelectedBoard(name);
        if (isMobile) {
            setShowMobileMenu(false);
        }
    };

    const handleLogoClick = () => {
        setSelectedBoard('인기글');
    };

    const handleSearch = () => {
        const match = boardList.find(board => board.name.replace(/\s/g, '') === searchTerm.replace(/\s/g, ''));
        if (match) {
            setSelectedBoard(match.name);
        } else {
            setSelectedBoard('인기글');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const markNotificationAsRead = (id) => {
        setNotifications(notifications.map(notification => 
            notification.id === id ? { ...notification, read: true } : notification
        ));
    };

    return (
        <div className='container'>
            <div className="community">
                <div className="community-header">
                    <img
                        src={CommunityLogoImg}
                        alt="CommunityLogoImg"
                        className="community-logo"
                        onClick={handleLogoClick}
                    />
                    <div className="communitySearch-bar">
                        <select>
                            <option>제목</option>
                        </select>
                        <input
                            type="text"
                            placeholder="전체 커뮤니티 내에서 검색"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button className="communitySearch-button" onClick={handleSearch}>🔍</button>
                    </div>
                    <div className="community-actions">
                        <button 
                            className="notification-button"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <FaBell />
                            {notifications.some(n => !n.read) && <span className="notification-badge"></span>}
                        </button>
                        {isMobile && (
                            <button 
                                className="mobile-menu-button"
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                            >
                                {showMobileMenu ? <FaTimes /> : <FaBars />}
                            </button>
                        )}
                    </div>
                </div>

                {showNotifications && (
                    <div className="notification-dropdown">
                        <h3>알림</h3>
                        <ul>
                            {notifications.map(notification => (
                                <li 
                                    key={notification.id} 
                                    className={notification.read ? 'read' : 'unread'}
                                    onClick={() => markNotificationAsRead(notification.id)}
                                >
                                    <div className="notification-message">{notification.message}</div>
                                    <div className="notification-time">{notification.time}</div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Mobile Menu */}
                {isMobile && showMobileMenu && (
                    <>
                        <div className="mobile-menu-overlay" onClick={() => setShowMobileMenu(false)} />
                        <div className="mobile-menu">
                            {boardList.map((board, index) => (
                                <button
                                    key={index}
                                    className={`mobile-menu-item ${selectedBoard === board.name ? 'active' : ''}`}
                                    onClick={() => handleBoardClick(board.name)}
                                >
                                    <span className="commuity-icon">{board.icon}</span>
                                    {board.name}
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* Desktop Menu */}
                {!isMobile && (
                    <div className="board-list-wrapper-horizontal">
                        {boardList.map((board, index) => (
                            <button
                                key={index}
                                className={`board-button-horizontal ${selectedBoard === board.name ? 'active' : ''}`}
                                onClick={() => handleBoardClick(board.name)}
                            >
                                <span className="commuity-icon">{board.icon}</span>
                                {board.name}
                            </button>
                        ))}
                    </div>
                )}

                <div className='commuityCategorMain'>
                    <div className="category-header">
                        <p className='categoryName'>{selectedBoard && selectedBoard}</p>
                        <p className='category-label'>카테고리</p>
                    </div>
                    <p className='line'></p>
                </div>

                {/* 선택된 게시판 렌더링 */}
                <div className="board-content-container">
                    <div className="category-content">
                        {selectedBoard === '최근 방문 게시판' ? (
                        <RecentBoards />
                        ) : selectedBoard === '아이돌 / 연예인' ? (
                        <CommunityIdol />
                        ) : selectedBoard === '게임' ? (
                        <CommunityGame />
                        ) : selectedBoard === '영화' ? (
                        <CommunityVideo />
                        ) : selectedBoard === '웹소설' ? (
                        <CommunityWebNovel />
                        ) : selectedBoard === '애니메이션' ? (
                        <CommunityAnimation />
                        ) : selectedBoard === '순수창작' ? (
                        <CommunityPureCreation />
                        ) : selectedBoard === '행사' ? (
                        <CommunityEvent />
                        ) : selectedBoard === '드라마' ? (
                        <CommunityDrama />
                        ) : selectedBoard === '웹툰' ? (
                        <CommunityWebtoon />
                        ) : (
                        <div className="popular-posts">
                            <h2 className='communityPopularTitle'>인기글</h2>
                            <ul>
                            {popularPosts.map((post, index) => (
                                <li key={index} className="post-item">
                                <div className="post-text">
                                    <strong>{post.title}</strong>
                                    <div className="post-meta">
                                    <span>{post.category}</span> · <span>{post.time}</span> · <span>추천 {post.likes}</span>
                                    </div>
                                </div>
                                <img src={post.thumbnail} alt="썸네일" className="thumbnail" />
                                </li>
                            ))}
                            </ul>
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Community;