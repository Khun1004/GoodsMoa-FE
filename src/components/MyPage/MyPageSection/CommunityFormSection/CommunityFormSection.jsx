import React, { useEffect, useState } from 'react';
import {
    FaBook,
    FaCalendarAlt,
    FaComment,
    FaEdit,
    FaFeatherAlt,
    FaFilm,
    FaGamepad,
    FaPaw,
    FaRegSmile,
    FaTrash,
    FaTv,
    FaUserAlt
} from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import './CommunityFormSection.css';

const boardList = [
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

const categoryToStorageKey = {
    '아이돌 / 연예인': 'idolPosts',
    '게임': 'gamePosts',
    '영화': 'videoPosts',
    '웹소설': 'novelPosts',
    '애니메이션': 'animePosts',
    '순수창작': 'creationPosts',
    '행사': 'eventPosts',
    '드라마': 'dramaPosts',
    '웹�': 'webtoonPosts'
};

const categoryToCommentsKey = {
    '아이돌 / 연예인': 'idolComments',
    '게임': 'gameComments',
    '영화': 'videoComments',
    '웹소설': 'novelComments',
    '애니메이션': 'animeComments',
    '순수창작': 'creationComments',
    '행사': 'eventComments',
    '드라마': 'dramaComments',
    '웹툰': 'webtoonComments'
};

const formatDate = (dateValue) => {
    if (!dateValue) return '';
    
    const date = new Date(dateValue);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}.${month}.${day}`;
};

const CommunityFormSection = () => {
    const [selectedBoard, setSelectedBoard] = useState('');
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [comments, setComments] = useState({});
    const navigate = useNavigate();
    const location = useLocation();
    
    const [currentUser, setCurrentUser] = useState({
        id: 'user123',
        username: '관리자',
        profileImage: '/assets/default-profile.png'
    });

    useEffect(() => {
        if (selectedBoard) {
            loadPosts(selectedBoard);
            loadComments(selectedBoard);
        }
    }, [selectedBoard]);

    const loadPosts = (boardName) => {
        const storageKey = categoryToStorageKey[boardName];
        const storedPosts = JSON.parse(localStorage.getItem(storageKey)) || [];
        const filtered = storedPosts.filter(post => post.category === boardName);
        setPosts(filtered);
    };

    const loadComments = (boardName) => {
        const commentsKey = categoryToCommentsKey[boardName];
        const commentsData = JSON.parse(localStorage.getItem(commentsKey)) || {};
        setComments(commentsData);
    };

    const handleBoardClick = (boardName) => {
        setSelectedBoard(boardName);
        setSelectedPost(null);
    };

    const handlePostClick = (post) => {
        setSelectedPost(post);
        updateViewCount(post);
    };

    const updateViewCount = (post) => {
        const storageKey = categoryToStorageKey[selectedBoard];
        const existingPosts = JSON.parse(localStorage.getItem(storageKey)) || [];
        const updatedPosts = existingPosts.map(p => {
            if (p.id === post.id) {
                return { ...p, viewCount: (p.viewCount || 0) + 1 };
            }
            return p;
        });
        localStorage.setItem(storageKey, JSON.stringify(updatedPosts));
        setSelectedPost({ ...post, viewCount: (post.viewCount || 0) + 1 });
    };

    const handleEdit = (post) => {
        if (post.authorId && post.authorId !== currentUser.id) {
            alert("작성자만 게시글을 수정할 수 있습니다.");
            return;
        }
        
        navigate('/communityForm', { 
            state: { 
                initialData: post 
            } 
        });
    };

    const handleDelete = (postId) => {
        const post = posts.find(p => p.id === postId);
        
        if (post.authorId && post.authorId !== currentUser.id && currentUser.role !== 'admin') {
            alert("작성자만 게시글을 삭제할 수 있습니다.");
            return;
        }
        
        if (window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
            const storageKey = categoryToStorageKey[selectedBoard];
            const commentsKey = categoryToCommentsKey[selectedBoard];
            
            const existingPosts = JSON.parse(localStorage.getItem(storageKey)) || [];
            const updatedPosts = existingPosts.filter(p => p.id !== postId);
            localStorage.setItem(storageKey, JSON.stringify(updatedPosts));
            
            const existingComments = JSON.parse(localStorage.getItem(commentsKey)) || {};
            delete existingComments[postId];
            localStorage.setItem(commentsKey, JSON.stringify(existingComments));
            
            loadPosts(selectedBoard);
            setSelectedPost(null);
        }
    };

    const getCommentCount = (postId) => {
        const postComments = comments[postId] || [];
        let totalCount = postComments.length;
        
        postComments.forEach(comment => {
            if (comment.replies) {
                totalCount += comment.replies.length;
            }
        });
        
        return totalCount;
    };

    const handleWriteNewPost = () => {
        navigate('/communityForm', { 
            state: { 
                category: selectedBoard,
                author: {
                    id: currentUser.id,
                    username: currentUser.username,
                    profileImage: currentUser.profileImage
                }
            } 
        });
    };

    return (
        <div className="communityFormSection">
            <h2 className="communityFormSection-title">커뮤니티 관리</h2>
            <div className="communityFormSectionBoard-list">
                {boardList.map((board, index) => (
                    <div
                        key={index}
                        className={`communityFormSectionBoard-item ${selectedBoard === board.name ? 'active' : ''}`}
                        onClick={() => handleBoardClick(board.name)}
                    >
                        <div className="communityFormSectionBoard-icon">{board.icon}</div>
                        <span className="communityFormSectionBoard-name">{board.name}</span>
                    </div>
                ))}
            </div>

            <div className="communityFormSectionCategorMain-header">
                <p className='communityFormSectionCategorMainName'>{selectedBoard}</p>
                <p className='communityFormSectionCategorMain-label'>카테고리</p>
                {selectedBoard && !selectedPost && (
                    <button 
                        className="write-new-post-btn"
                        onClick={handleWriteNewPost}
                    >
                        새 게시글 작성
                    </button>
                )}
            </div>
            <p className='line'></p>

            <div className='communityFormSectionCategorMain'>
                {selectedPost ? (
                    <div className="post-detail-view">
                        <button 
                            className="back-to-list-btn" 
                            onClick={() => setSelectedPost(null)}
                        >
                            목록으로 돌아가기
                        </button>
                        
                        <div className="post-detail-header">
                            <h3>{selectedPost.title}</h3>
                            <div className="post-author-info">
                                {selectedPost.authorProfileImage && (
                                    <img 
                                        src={selectedPost.authorProfileImage} 
                                        alt="작성자 프로필" 
                                        className="post-author-profile" 
                                    />
                                )}
                                <span className="post-author-name">
                                    {selectedPost.author || '익명'}
                                </span>
                            </div>
                            <div className="post-meta">
                                <span>작성일: {formatDate(selectedPost.date)}</span>
                                <span>조회수: {selectedPost.viewCount || 0}</span>
                            </div>
                        </div>
                        
                        {selectedPost.image && (
                            selectedPost.image.includes('video') ? (
                                <video src={selectedPost.image} controls className="post-detail-media" />
                            ) : (
                                <img src={selectedPost.image} alt="게시글 이미지" className="post-detail-media" />
                            )
                        )}
                        
                        <div 
                            className="post-detail-content"
                            dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                        />
                        
                        <div className="post-detail-actions">
                            <button 
                                onClick={() => handleEdit(selectedPost)} 
                                className="post-edit-btn"
                                disabled={selectedPost.authorId && selectedPost.authorId !== currentUser.id}
                            >
                                <FaEdit /> 수정
                            </button>
                            <button 
                                onClick={() => handleDelete(selectedPost.id)} 
                                className="post-delete-btn"
                                disabled={selectedPost.authorId && selectedPost.authorId !== currentUser.id && currentUser.role !== 'admin'}
                            >
                                <FaTrash /> 삭제
                            </button>
                        </div>
                        
                        <div className="post-comments-section">
                            <h4>댓글 ({getCommentCount(selectedPost.id)})</h4>
                            {comments[selectedPost.id] && comments[selectedPost.id].length > 0 ? (
                                <ul className="post-comments-list">
                                    {comments[selectedPost.id].map((comment, index) => (
                                        <li key={index} className="post-comment-item">
                                            <div className="post-comment-header">
                                                <img src={comment.profile} alt="프로필" className="post-comment-profile" />
                                                <div className="post-comment-info">
                                                    <span className="post-comment-author">{comment.nickname}</span>
                                                    <span className="post-comment-date">{comment.timestamp}</span>
                                                </div>
                                            </div>
                                            <div className="post-comment-content">{comment.content}</div>
                                            
                                            {comment.replies && comment.replies.length > 0 && (
                                                <ul className="post-replies-list">
                                                    {comment.replies.map((reply, replyIndex) => (
                                                        <li key={replyIndex} className="post-reply-item">
                                                            <div className="post-comment-header">
                                                                <img src={reply.profile} alt="프로필" className="post-comment-profile" />
                                                                <div className="post-comment-info">
                                                                    <span className="post-comment-author">{reply.nickname}</span>
                                                                    <span className="post-comment-date">{reply.timestamp}</span>
                                                                </div>
                                                            </div>
                                                            <div className="post-comment-content">{reply.content}</div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="post-no-comments">댓글이 없습니다.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    selectedBoard && (
                        <div className="communityFormSectionPosts">
                            {posts.length > 0 ? (
                                posts.map((post) => (
                                    <div key={post.id} className="communityFormSectionPost">
                                        {post.image && (
                                            post.image.includes('video') ? (
                                                <video src={post.image} controls width="150" />
                                            ) : (
                                                <img src={post.image} alt="preview" width="150" />
                                            )
                                        )}
                                        <div className="communityFormSectionPost-info" onClick={() => handlePostClick(post)}>
                                            <h4>{post.title}</h4>
                                            <div className="post-author-info-small">
                                                <span className="post-author-name-small">
                                                    {post.author || '익명'}
                                                </span>
                                            </div>
                                            <div 
                                                className="communityFormSectionPost-content"
                                                dangerouslySetInnerHTML={{ __html: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '') }} 
                                            />
                                            <div className="post-meta-info">
                                                <small>{formatDate(post.date)}</small>
                                                <span className="communityFormSectionPost-views">조회수: {post.viewCount || 0}</span>
                                                <div className="post-comment-count">
                                                    <FaComment /> {getCommentCount(post.id)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="communityFormSectionPost-actions">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(post);
                                                }} 
                                                className="comFormSecEditBtn"
                                                disabled={post.authorId && post.authorId !== currentUser.id}
                                            >
                                                <FaEdit /> 수정
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(post.id);
                                                }} 
                                                className="comFormSecDeleteBtn"
                                                disabled={post.authorId && post.authorId !== currentUser.id && currentUser.role !== 'admin'}
                                            >
                                                <FaTrash /> 삭제
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="communityFormSectionNoPosts">
                                    <p>📭 {selectedBoard} 카테고리에 게시글이 없습니다.</p>
                                </div>
                            )}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default CommunityFormSection;