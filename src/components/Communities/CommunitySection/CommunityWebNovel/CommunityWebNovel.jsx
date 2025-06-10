import React, { useEffect, useState } from 'react';
import './CommunityWebNovel.css';

const originalPosts = [
    {
        id: 1,
        title: '최신 웹소설 추천해주세요!',
        image: 'https://via.placeholder.com/100',
        content: '요즘 뜨는 웹소설 중에서 추천받고 싶어요. 판타지, 로맨스 장르 좋아합니다!',
        viewCount: 856,
        author: '소설러버',
        date: '2025.04.08'
    },
    {
        id: 2,
        title: '연재 중인 웹소설 중 명작 추천',
        image: 'https://via.placeholder.com/100',
        content: '장편 웹소설 중에서 완결까지 믿고 볼 수 있는 작품들 알려주세요.',
        viewCount: 1200,
        author: '북마니아',
        date: '2025.04.10'
    },
    {
        id: 3,
        title: '웹소설 원고 써보신 분 계신가요?',
        image: 'https://via.placeholder.com/100',
        content: '처음 웹소설을 써보려는데 조언 구해봅니다. 플랫폼 추천도 부탁드려요.',
        viewCount: 980,
        author: '작가지망생',
        date: '2025.04.12'
    },
];

const CommunityWebNovel = () => {
    const [novelPosts, setNovelPosts] = useState([]);
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
        const savedPosts = JSON.parse(localStorage.getItem('novelPosts')) || [];

        const formattedPosts = savedPosts.map(post => ({
            ...post,
            date: post.date.includes('T') ? formatDate(new Date(post.date)) : post.date,
        }));

        setNovelPosts([...originalPosts, ...formattedPosts]);
    }, []);

    useEffect(() => {
        const savedComments = JSON.parse(localStorage.getItem('novelComments')) || {};
        setComments(savedComments);
    }, []);

    const handlePostClick = (post) => {
        const updatedPosts = novelPosts.map(p =>
            p.id === post.id ? { ...p, viewCount: (p.viewCount || 0) + 1 } : p
        );
        setNovelPosts(updatedPosts);

        const userPosts = updatedPosts.filter(p =>
            !originalPosts.some(original => original.id === p.id)
        );
        localStorage.setItem('novelPosts', JSON.stringify(userPosts));

        setSelectedPost({ ...post, viewCount: (post.viewCount || 0) + 1 });
    };

    let displayedPosts = [...novelPosts];
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
        localStorage.setItem('novelComments', JSON.stringify(updatedComments));
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
        localStorage.setItem('novelComments', JSON.stringify(updatedComments));
        setReplyInputs({ ...replyInputs, [key]: '' });
    };

    return (
        <div className="novel-container">
            <div className="novel-header">
                <h2 className="novel-title">웹소설 / 웹툰 게시판</h2>
                <div className="novel-select-wrapper">
                    <select onChange={handleFilterChange} value={filter}>
                        <option value="최신">최신</option>
                        <option value="목록">목록</option>
                        <option value="인기">인기</option>
                    </select>
                </div>
            </div>

            {selectedPost && filter !== '목록' && (
                <>
                    <div className="novel-detail">
                        <h3>{selectedPost.title}</h3>
                        <div className="novel-post-meta">
                            <span className="novel-post-author">작성자: {selectedPost.author}</span>
                            <span className="novel-post-date">작성일: {selectedPost.date}</span>
                            <span className="novel-post-views">조회수: {selectedPost.viewCount}</span>
                        </div>
                        <img src={selectedPost.image} alt="novel" className="novel-detail-img" />
                        <p>{selectedPost.content}</p>
                    </div>
                    <div className="communityNovelComment-form">
                        <input
                            type="text"
                            value={newComment}
                            onChange={handleCommentChange}
                            placeholder="댓글을 입력하세요"
                        />
                        <button onClick={handleAddComment}>등록</button>
                    </div>
                    <div className="novel-comments">
                        <h4 className='novelCommentsTitle'>댓글</h4>
                        <ul>
                            {(comments[selectedPost.id] || []).map((cmt, idx) => (
                                <li className="novelCommentsNote" key={idx}>
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

                                    <div className="communityNovelReply-form">
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
                                            <div key={ridx} className="communityNovelReply-item">
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

            <table className="novel-table">
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
                                <span className="novel-link" onClick={() => handlePostClick(post)}>
                                    {post.title}
                                </span>
                            </td>
                            <td>{post.author}</td>
                            <td>{post.date}</td>
                            <td>
                                <img
                                    src={post.image}
                                    alt="novel"
                                    className="novel-thumbnail"
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

export default CommunityWebNovel;