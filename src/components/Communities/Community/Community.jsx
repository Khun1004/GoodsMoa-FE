import React, { useEffect, useState } from 'react';
import {
    FaBars, FaBell, FaTimes
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

import Category from '../../public/Category/Category';
import SearchBanner from '../../public/SearchBanner';
import './Community.css';
import Spacer from "../../public/Spacer.jsx";
import { 
    COMMUNITY_BOARDS, 
    SEARCH_OPTIONS, 
    SORT_OPTIONS,
    getBoardCategoryId,
    getCategoryBoardName,
    filterCommunityPosts,
    getPopularPosts
} from '../../../utils/communityUtils';
import { useCommunityPosts } from '../../../hooks/useCommunityPosts';

const Community = ({ showBanner = true }) => {
    const [selectedBoard, setSelectedBoard] = useState('인기글');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOption, setSelectedOption] = useState("제목");
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
    const [orderBy, setOrderBy] = useState('new');
    const [page, setPage] = useState(0);
    const pageSize = 10;

    // 커스텀 훅 사용
    const { posts, setPosts, loading, error, totalPages } = useCommunityPosts(
        selectedOption, searchTerm, getBoardCategoryId(selectedBoard), orderBy, page, pageSize
    );

    useEffect(() => {
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

    const handleSearchSubmit = () => {
        console.log("검색 조건:", selectedOption, "검색어:", searchTerm);

        const match = COMMUNITY_BOARDS.find(board =>
            board.replace(/\s/g, '') === searchTerm.replace(/\s/g, '')
        );
        if (match) {
            setSelectedBoard(match);
        } else {
            setSelectedBoard('인기글');
        }
        setPage(0);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearchSubmit();
    };

    const markNotificationAsRead = (id) => {
        setNotifications(notifications.map(notification =>
            notification.id === id ? { ...notification, read: true } : notification
        ));
    };

    const handleBoardChange = (boardName) => {
        setSelectedBoard(boardName);
        setPage(0);
    };

    const isSearching = searchTerm.trim().length > 0;

    // 클라이언트 사이드 검색 필터링
    const filteredPosts = filterCommunityPosts(posts, searchTerm);

    // 인기 게시글 목록
    const popularPosts = getPopularPosts();

    return (
        <div className="component-container">
            {showBanner && (
                <>
                    <Spacer height={22} />
                    <SearchBanner
                        placeholder="커뮤니티 내에서 검색"
                        searchQuery={searchTerm}
                        setSearchQuery={setSearchTerm}
                        handleSearchKeyPress={handleKeyDown}
                        selectedOption={selectedOption}
                        setSelectedOption={setSelectedOption}
                        selectOptions={SEARCH_OPTIONS.map(option => option.label)}
                    />
                    <Category gap={90} />
                </>
            )}

            <div className="community-actions">
                {isMobile && (
                    <button
                        className="mobile-menu-button"
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                    >
                        {showMobileMenu ? <FaTimes /> : <FaBars />}
                    </button>
                )}
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

            <div className='commuityCategorMain'>
                <div className="category-header">
                    <p className='categoryName'>{selectedBoard}</p>
                    <p className='category-label'>카테고리</p>
                </div>
                <p className='line'></p>
            </div>

            <div className="board-content-container">
                <div className="category-content">
                    {loading && <div className="loading-box">🔄 로딩중입니다...</div>}
                    {error && <div className="error-box">❌ {error}</div>}
                    
                    {!loading && !error && (
                        <>
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
                                    {isSearching && filteredPosts.length === 0 ? (
                                        <div className="no-search-result">
                                            `"${searchTerm}"에 대한 검색 결과가 없습니다.`
                                        </div>
                                    ) : (
                                        <ul>
                                            {(isSearching ? filteredPosts : popularPosts).map((post, index) => (
                                                <li key={post.id || index} className="post-item">
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
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Community;
