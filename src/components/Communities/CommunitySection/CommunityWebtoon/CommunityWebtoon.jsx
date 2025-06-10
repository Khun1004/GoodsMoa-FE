import React, { useEffect, useState } from 'react';
import './CommunityWebtoon.css';

const originalPosts = [
    {
        id: 1,
        title: '김풍 작가의 먹방 신작 공개 소식! 주인공 디자인 최초 공개',
        image: 'https://via.placeholder.com/100',
        content: '인기 웹툰 작가 김풍의 신작 먹방 웹툰이 곧 연재됩니다! 주인공의 디자인이 최초로 공개되었어요.',
        viewCount: 2345,
        author: '웹툰마니아',
        date: '2025.04.12'
    },
    {
        id: 2,
        title: '네이버 웹툰 <놓지마 정신줄> 드라마화 확정',
        image: 'https://via.placeholder.com/100',
        content: '인기 웹툰 <놓지마 정신줄>이 드라마화 확정 소식이 전해졌습니다. 캐스팅 소식도 곧 나올 예정이라고 합니다.',
        viewCount: 4200,
        author: '드라마덕후',
        date: '2025.04.14'
    },
    {
        id: 3,
        title: '카카오웹툰 <마음의 소리> 시즌2 시작!',
        image: 'https://via.placeholder.com/100',
        content: '국민 웹툰 <마음의 소리>가 시즌2로 돌아왔습니다! 조석 작가의 유머 센스는 여전합니다.',
        viewCount: 3560,
        author: '웹툰팬',
        date: '2025.04.15'
    },
];

const CommunityWebtoon = () => {
    const [webtoonPosts, setWebtoonPosts] = useState([]);
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
        const savedPosts = JSON.parse(localStorage.getItem('webtoonPosts')) || [];

        // ISO 날짜 형식 처리 (변환 필요 시만)
        const formattedPosts = savedPosts.map(post => ({
            ...post,
            date: post.date.includes('T') ? formatDate(new Date(post.date)) : post.date,
        }));

        setWebtoonPosts([...originalPosts, ...formattedPosts]);
    }, []);

    useEffect(() => {
        const savedComments = JSON.parse(localStorage.getItem('webtoonComments')) || {};
        setComments(savedComments);
    }, []);

    const handlePostClick = (post) => {
        const updatedPosts = webtoonPosts.map(p =>
            p.id === post.id ? { ...p, viewCount: (p.viewCount || 0) + 1 } : p
        );
        setWebtoonPosts(updatedPosts);

        const userPosts = updatedPosts.filter(p =>
            !originalPosts.some(original => original.id === p.id)
        );
        localStorage.setItem('webtoonPosts', JSON.stringify(userPosts));

        setSelectedPost({ ...post, viewCount: (post.viewCount || 0) + 1 });
    };

    let displayedPosts = [...webtoonPosts];
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
        localStorage.setItem('webtoonComments', JSON.stringify(updatedComments));
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
        localStorage.setItem('webtoonComments', JSON.stringify(updatedComments));
        setReplyInputs({ ...replyInputs, [key]: '' });
    };

    return (
        <div className="webtoon-container">
            <div className="webtoon-header">
                <h2 className="webtoon-title">웹툰 / 만화 게시판</h2>
                <div className="webtoon-select-wrapper">
                    <select onChange={handleFilterChange} value={filter}>
                        <option value="최신">최신</option>
                        <option value="목록">목록</option>
                        <option value="인기">인기</option>
                    </select>
                </div>
            </div>

            {selectedPost && filter !== '목록' && (
                <>
                    <div className="webtoon-detail">
                        <h3>{selectedPost.title}</h3>
                        <div className="webtoon-post-meta">
                            <span className="webtoon-post-author">작성자: {selectedPost.author}</span>
                            <span className="webtoon-post-date">작성일: {selectedPost.date}</span>
                            <span className="webtoon-post-views">조회수: {selectedPost.viewCount}</span>
                        </div>
                        <img src={selectedPost.image} alt="webtoon" className="webtoon-detail-img" />
                        <p>{selectedPost.content}</p>
                    </div>
                    <div className="communityWebtoonComment-form">
                        <input
                            type="text"
                            value={newComment}
                            onChange={handleCommentChange}
                            placeholder="댓글을 입력하세요"
                        />
                        <button onClick={handleAddComment}>등록</button>
                    </div>
                    <div className="webtoon-comments">
                        <h4 className='webtoonCommentsTitle'>댓글</h4>
                        <ul>
                            {(comments[selectedPost.id] || []).map((cmt, idx) => (
                                <li className="webtoonCommentsNote" key={idx}>
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

                                    <div className="communityWebtoonReply-form">
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
                                            <div key={ridx} className="communityWebtoonReply-item">
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

            <table className="webtoon-table">
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
                                <span className="webtoon-link" onClick={() => handlePostClick(post)}>
                                    {post.title}
                                </span>
                            </td>
                            <td>{post.author}</td>
                            <td>{post.date}</td>
                            <td>
                                <img
                                    src={post.image}
                                    alt="webtoon"
                                    className="webtoon-thumbnail"
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

export default CommunityWebtoon;