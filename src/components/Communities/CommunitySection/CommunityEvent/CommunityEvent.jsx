import React, { useEffect, useState } from 'react';
import './CommunityEvent.css';

const originalPosts = [
    {
        id: 1,
        title: '인디밴드 페스티벌 "썸머 라이브" 티켓 오픈 안내',
        image: 'https://via.placeholder.com/100',
        content: '6월 15일부터 17일까지 열리는 인디밴드 페스티벌 "썸머 라이브" 티켓이 5월 1일 오후 2시부터 판매됩니다. 작년에는 오픈 30분 만에 매진되었으니 서두르세요!',
        viewCount: 2456,
        author: '이벤트매니저',
        date: '2025.04.12'
    },
    {
        id: 2,
        title: '서울 아트 페어 2025 - 신진 작가 공모전 안내',
        image: 'https://via.placeholder.com/100',
        content: '올해로 10회를 맞이하는 서울 아트 페어에서 신진 작가를 위한 특별 공모전을 개최합니다. 지원 마감은 5월 20일까지이며, 선정된 작품은 7월 전시 예정입니다.',
        viewCount: 1835,
        author: '아트페어운영진',
        date: '2025.04.14'
    },
    {
        id: 3,
        title: '제7회 독립영화 페스티벌 참가자 모집',
        image: 'https://via.placeholder.com/100',
        content: '제7회 독립영화 페스티벌이 8월 10일부터 15일까지 개최됩니다. 단편영화, 다큐멘터리, 실험영화 등 다양한 카테고리로 지원 가능합니다. 지원 마감은 6월 30일입니다.',
        viewCount: 1652,
        author: '영화제조직위',
        date: '2025.04.15'
    },
];

const CommunityEvent = () => {
    const [eventPosts, setEventPosts] = useState([]);
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
        const savedPosts = JSON.parse(localStorage.getItem('eventPosts')) || [];

        // ISO 날짜 형식 처리 (변환 필요 시만)
        const formattedPosts = savedPosts.map(post => ({
            ...post,
            date: post.date.includes('T') ? formatDate(new Date(post.date)) : post.date,
        }));

        setEventPosts([...originalPosts, ...formattedPosts]);
    }, []);

    useEffect(() => {
        const savedComments = JSON.parse(localStorage.getItem('eventComments')) || {};
        setComments(savedComments);
    }, []);

    const handlePostClick = (post) => {
        const updatedPosts = eventPosts.map(p =>
            p.id === post.id ? { ...p, viewCount: (p.viewCount || 0) + 1 } : p
        );
        setEventPosts(updatedPosts);

        const userPosts = updatedPosts.filter(p =>
            !originalPosts.some(original => original.id === p.id)
        );
        localStorage.setItem('eventPosts', JSON.stringify(userPosts));

        setSelectedPost({ ...post, viewCount: (post.viewCount || 0) + 1 });
    };

    let displayedPosts = [...eventPosts];
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
        localStorage.setItem('eventComments', JSON.stringify(updatedComments));
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
        localStorage.setItem('eventComments', JSON.stringify(updatedComments));
        setReplyInputs({ ...replyInputs, [key]: '' });
    };

    return (
        <div className="event-container">
            <div className="event-header">
                <h2 className="event-title">행사 / 이벤트 게시판</h2>
                <div className="event-select-wrapper">
                    <select onChange={handleFilterChange} value={filter}>
                        <option value="최신">최신</option>
                        <option value="목록">목록</option>
                        <option value="인기">인기</option>
                    </select>
                </div>
            </div>

            {selectedPost && filter !== '목록' && (
                <>
                    <div className="event-detail">
                        <h3>{selectedPost.title}</h3>
                        <div className="event-post-meta">
                            <span className="event-post-author">작성자: {selectedPost.author}</span>
                            <span className="event-post-date">작성일: {selectedPost.date}</span>
                            <span className="event-post-views">조회수: {selectedPost.viewCount}</span>
                        </div>
                        <img src={selectedPost.image} alt="event" className="event-detail-img" />
                        <p>{selectedPost.content}</p>
                    </div>
                    <div className="communityEventComment-form">
                        <input
                            type="text"
                            value={newComment}
                            onChange={handleCommentChange}
                            placeholder="댓글을 입력하세요"
                        />
                        <button onClick={handleAddComment}>등록</button>
                    </div>
                    <div className="event-comments">
                        <h4 className='eventCommentsTitle'>댓글</h4>
                        <ul>
                            {(comments[selectedPost.id] || []).map((cmt, idx) => (
                                <li className="eventCommentsNote" key={idx}>
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

                                    <div className="communityEventReply-form">
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
                                            <div key={ridx} className="communityEventReply-item">
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

            <table className="event-table">
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
                                <span className="event-link" onClick={() => handlePostClick(post)}>
                                    {post.title}
                                </span>
                            </td>
                            <td>{post.author}</td>
                            <td>{post.date}</td>
                            <td>
                                <img
                                    src={post.image}
                                    alt="event"
                                    className="event-thumbnail"
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

export default CommunityEvent;