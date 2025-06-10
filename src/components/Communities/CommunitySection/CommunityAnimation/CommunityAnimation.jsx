import React, { useEffect, useState } from 'react';
import './CommunityAnimation.css';

const originalPosts = [
    {
        id: 1,
        title: '원피스 최신화 후기 및 리뷰',
        image: 'https://via.placeholder.com/100',
        content: '원피스 최신화가 정말 놀라운 전개를 보여줬어요! 루피의 새로운 기술이 등장했는데요...',
        viewCount: 2345,
        author: '원피스덕후',
        date: '2025.04.14'
    },
    {
        id: 2,
        title: '짱구는 못말려 25주년 기념 이벤트',
        image: 'https://via.placeholder.com/100',
        content: '짱구는 못말려 25주년을 맞아 특별 에피소드가 방영될 예정입니다. 많은 기대 부탁드려요!',
        viewCount: 1870,
        author: '짱구팬',
        date: '2025.04.11'
    },
    {
        id: 3,
        title: '귀멸의 칼날 새 시즌 제작 소식',
        image: 'https://via.placeholder.com/100',
        content: '귀멸의 칼날 신작 시즌이 곧 제작된다는 소식이 전해졌습니다. 공식 발표를 기다리고 있어요.',
        viewCount: 4100,
        author: '애니메이션매니아',
        date: '2025.04.15'
    },
];

const CommunityAnimation = () => {
    const [animePosts, setAnimePosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [filter, setFilter] = useState('최신');
    const [comments, setComments] = useState({});
    const [newComment, setNewComment] = useState('');
    const [replyInputs, setReplyInputs] = useState({});

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    };

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
        setSelectedPost(null);
    };

    useEffect(() => {
        const savedPosts = JSON.parse(localStorage.getItem('animePosts')) || [];

        // ISO 날짜 형식 처리 (변환 필요 시만)
        const formattedPosts = savedPosts.map(post => ({
            ...post,
            date: post.date.includes('T') ? formatDate(new Date(post.date)) : post.date,
        }));

        setAnimePosts([...originalPosts, ...formattedPosts]);
    }, []);

    useEffect(() => {
        const savedComments = JSON.parse(localStorage.getItem('animeComments')) || {};
        setComments(savedComments);
    }, []);

    const handlePostClick = (post) => {
        const updatedPosts = animePosts.map(p =>
            p.id === post.id ? { ...p, viewCount: (p.viewCount || 0) + 1 } : p
        );
        setAnimePosts(updatedPosts);

        const userPosts = updatedPosts.filter(p =>
            !originalPosts.some(original => original.id === p.id)
        );
        localStorage.setItem('animePosts', JSON.stringify(userPosts));

        setSelectedPost({ ...post, viewCount: (post.viewCount || 0) + 1 });
    };

    let displayedPosts = [...animePosts];
    if (filter === '인기') {
        displayedPosts.sort((a, b) => b.viewCount - a.viewCount);
    } else if (filter === '최신') {
        displayedPosts.sort((a, b) => b.id - a.id);
    }

    const handleCommentChange = (e) => setNewComment(e.target.value);

    const handleAddComment = () => {
        if (!selectedPost || newComment.trim() === '') return;

        const commentObj = {
            nickname: '사용자닉네임',
            profile: 'https://via.placeholder.com/30',
            content: newComment,
            timestamp: formatDate(new Date()),
        };

        const updatedComments = {
            ...comments,
            [selectedPost.id]: [...(comments[selectedPost.id] || []), commentObj],
        };

        setComments(updatedComments);
        localStorage.setItem('animeComments', JSON.stringify(updatedComments));
        setNewComment('');
    };

    const handleReplyInputChange = (postId, commentIndex, value) => {
        setReplyInputs({
            ...replyInputs,
            [`${postId}-${commentIndex}`]: value,
        });
    };

    const handleAddReply = (postId, commentIndex) => {
        const key = `${postId}-${commentIndex}`;
        const replyContent = replyInputs[key];
        if (!replyContent || replyContent.trim() === '') return;

        const reply = {
            nickname: '사용자닉네임',
            profile: 'https://via.placeholder.com/30',
            content: replyContent,
            timestamp: formatDate(new Date()),
        };

        const updatedPostComments = [...(comments[postId] || [])];
        updatedPostComments[commentIndex].replies = [
            ...(updatedPostComments[commentIndex].replies || []),
            reply,
        ];

        const updatedComments = {
            ...comments,
            [postId]: updatedPostComments,
        };

        setComments(updatedComments);
        localStorage.setItem('animeComments', JSON.stringify(updatedComments));
        setReplyInputs({ ...replyInputs, [key]: '' });
    };

    return (
        <div className="anime-container">
            <div className="anime-header">
                <h2 className="anime-title">애니메이션 / 만화 게시판</h2>
                <div className="anime-select-wrapper">
                    <select onChange={handleFilterChange} value={filter}>
                        <option value="최신">최신</option>
                        <option value="목록">목록</option>
                        <option value="인기">인기</option>
                    </select>
                </div>
            </div>

            {selectedPost && filter !== '목록' && (
                <>
                    <div className="anime-detail">
                        <h3>{selectedPost.title}</h3>
                        <div className="anime-post-meta">
                            <span className="anime-post-author">작성자: {selectedPost.author}</span>
                            <span className="anime-post-date">작성일: {selectedPost.date}</span>
                            <span className="anime-post-views">조회수: {selectedPost.viewCount}</span>
                        </div>
                        <img src={selectedPost.image} alt="anime" className="anime-detail-img" />
                        <p>{selectedPost.content}</p>
                    </div>
                    <div className="communityAnimeComment-form">
                        <input
                            type="text"
                            value={newComment}
                            onChange={handleCommentChange}
                            placeholder="댓글을 입력하세요"
                        />
                        <button onClick={handleAddComment}>등록</button>
                    </div>
                    <div className="anime-comments">
                        <h4 className='animeCommentsTitle'>댓글</h4>
                        <ul>
                            {(comments[selectedPost.id] || []).map((cmt, idx) => (
                                <li className="animeCommentsNote" key={idx}>
                                    <div className="comment-header">
                                        <img src={cmt.profile} alt="profile" className="comment-profile" />
                                        <div className="comment-bubble">
                                            <div className="comment-nickname">
                                                {cmt.nickname}
                                                <span className="comment-timestamp"> · {cmt.timestamp}</span>
                                            </div>
                                            <div className="comment-content">{cmt.content}</div>
                                        </div>
                                    </div>

                                    <div className="communityAnimeReply-form">
                                        <input
                                            type="text"
                                            placeholder="답글을 입력하세요"
                                            value={replyInputs[`${selectedPost.id}-${idx}`] || ''}
                                            onChange={(e) =>
                                                handleReplyInputChange(selectedPost.id, idx, e.target.value)
                                            }
                                        />
                                        <button onClick={() => handleAddReply(selectedPost.id, idx)}>답글 등록</button>
                                    </div>

                                    {cmt.replies &&
                                        cmt.replies.map((reply, ridx) => (
                                            <div key={ridx} className="communityAnimeReply-item">
                                                <img src={reply.profile} alt="profile" className="replyComment-profile" />
                                                <div>
                                                    <div className="replyComment-nickname">
                                                        {reply.nickname}
                                                        <span className="replyComment-timestamp"> · {reply.timestamp}</span>
                                                    </div>
                                                    <div className="replyComment-content">{reply.content}</div>
                                                </div>
                                            </div>
                                        ))}
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}

            <table className="anime-table">
                <thead>
                    <tr>
                        <th>번호</th>
                        <th>제목</th>
                        <th>작성자</th>
                        <th>작성일</th>
                        <th>사진</th>
                        <th>조회</th>
                    </tr>
                </thead>
                <tbody>
                    {displayedPosts.map((post, index) => (
                        <tr key={post.id}>
                            <td>{index + 1}</td>
                            <td>
                                <span className="anime-link" onClick={() => handlePostClick(post)}>
                                    {post.title}
                                </span>
                            </td>
                            <td>{post.author}</td>
                            <td>{post.date}</td>
                            <td>
                                <img
                                    src={post.image}
                                    alt="anime"
                                    className="anime-thumbnail"
                                    onClick={() => handlePostClick(post)}
                                    style={{ cursor: 'pointer' }}
                                />
                            </td>
                            <td>{post.viewCount || 0}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CommunityAnimation;