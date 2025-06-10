import React, { useEffect, useState } from 'react';
import './CommunityPureCreation.css';

const originalPosts = [
    {
        id: 1,
        title: '제 첫 단편소설을 공유합니다 "우주의 끝에서"',
        image: 'https://via.placeholder.com/100',
        content: '오랫동안 준비한 SF 단편소설입니다. 우주 탐사 도중 이상한 신호를 접한 주인공의 이야기를 담았습니다. 피드백 부탁드려요!',
        viewCount: 842,
        author: '별빛작가',
        date: '2025.04.11'
    },
    {
        id: 2,
        title: '그림 연습 중인데 평가 부탁드려요',
        image: 'https://via.placeholder.com/100',
        content: '디지털 일러스트 시작한지 3개월 되었습니다. 아직 많이 부족하지만 조언 부탁드려요.',
        viewCount: 1254,
        author: '그림쟁이',
        date: '2025.04.13'
    },
    {
        id: 3,
        title: '제가 작곡한 첫 곡 "봄의 멜로디" 공유합니다',
        image: 'https://via.placeholder.com/100',
        content: '피아노로 작곡한 첫 곡입니다. 봄 느낌을 담았는데 들어보시고 의견 주세요!',
        viewCount: 976,
        author: '음표수집가',
        date: '2025.04.15'
    },
];

const CommunityPureCreation = () => {
    const [creationPosts, setCreationPosts] = useState([]);
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
        const savedPosts = JSON.parse(localStorage.getItem('creationPosts')) || [];

        // ISO 날짜 형식 처리 (변환 필요 시만)
        const formattedPosts = savedPosts.map(post => ({
            ...post,
            date: post.date.includes('T') ? formatDate(new Date(post.date)) : post.date,
        }));

        setCreationPosts([...originalPosts, ...formattedPosts]);
    }, []);

    useEffect(() => {
        const savedComments = JSON.parse(localStorage.getItem('creationComments')) || {};
        setComments(savedComments);
    }, []);

    const handlePostClick = (post) => {
        const updatedPosts = creationPosts.map(p =>
            p.id === post.id ? { ...p, viewCount: (p.viewCount || 0) + 1 } : p
        );
        setCreationPosts(updatedPosts);

        const userPosts = updatedPosts.filter(p =>
            !originalPosts.some(original => original.id === p.id)
        );
        localStorage.setItem('creationPosts', JSON.stringify(userPosts));

        setSelectedPost({ ...post, viewCount: (post.viewCount || 0) + 1 });
    };

    let displayedPosts = [...creationPosts];
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
        localStorage.setItem('creationComments', JSON.stringify(updatedComments));
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
        localStorage.setItem('creationComments', JSON.stringify(updatedComments));
        setReplyInputs({ ...replyInputs, [key]: '' });
    };

    return (
        <div className="creation-container">
            <div className="creation-header">
                <h2 className="creation-title">순수창작 게시판</h2>
                <div className="creation-select-wrapper">
                    <select onChange={handleFilterChange} value={filter}>
                        <option value="최신">최신</option>
                        <option value="목록">목록</option>
                        <option value="인기">인기</option>
                    </select>
                </div>
            </div>

            {selectedPost && filter !== '목록' && (
                <>
                    <div className="creation-detail">
                        <h3>{selectedPost.title}</h3>
                        <div className="creation-post-meta">
                            <span className="creation-post-author">작성자: {selectedPost.author}</span>
                            <span className="creation-post-date">작성일: {selectedPost.date}</span>
                            <span className="creation-post-views">조회수: {selectedPost.viewCount}</span>
                        </div>
                        <img src={selectedPost.image} alt="creation" className="creation-detail-img" />
                        <p>{selectedPost.content}</p>
                    </div>
                    <div className="communityCreationComment-form">
                        <input
                            type="text"
                            value={newComment}
                            onChange={handleCommentChange}
                            placeholder="댓글을 입력하세요"
                        />
                        <button onClick={handleAddComment}>등록</button>
                    </div>
                    <div className="creation-comments">
                        <h4 className='creationCommentsTitle'>댓글</h4>
                        <ul>
                            {(comments[selectedPost.id] || []).map((cmt, idx) => (
                                <li className="creationCommentsNote" key={idx}>
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

                                    <div className="communityCreationReply-form">
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
                                            <div key={ridx} className="communityCreationReply-item">
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

            <table className="creation-table">
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
                                <span className="creation-link" onClick={() => handlePostClick(post)}>
                                    {post.title}
                                </span>
                            </td>
                            <td>{post.author}</td>
                            <td>{post.date}</td>
                            <td>
                                <img
                                    src={post.image}
                                    alt="creation"
                                    className="creation-thumbnail"
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

export default CommunityPureCreation;