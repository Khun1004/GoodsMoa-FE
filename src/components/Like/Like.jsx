import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// ✅ 네가 사용한 CSS에 필요한 아이콘들을 lucide-react에서 가져온다고 가정
import { Package, Calendar, ChevronRight, Lock, Eye } from 'lucide-react';
import './Like.css'; // 네가 제공한 CSS 파일

// --- 헬퍼 함수 ---
const API_BASE_URL = 'http://localhost:8080';

// 이미지 경로를 완전한 URL로 만들고, 없을 경우 대체 이미지를 반환
const getImageUrl = (path) => {
    const fallbackImage = 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop';
    if (!path) return fallbackImage;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

// 날짜 포맷팅 (예: 2025-06-18)
const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
};


const Like = () => {
  const [likedPosts, setLikedPosts] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 12, totalPages: 0 }); // size를 그리드에 맞게 조정 (4열 기준)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log(likedPosts);
  useEffect(() => {
    const fetchLikes = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_BASE_URL}/trade-like/likes?page=${pageInfo.page}&size=${pageInfo.size}`;
        const res = await fetch(url, { credentials: 'include' });

        if (!res.ok) throw new Error(`서버 응답 오류 (상태: ${res.status})`);
        
        const data = await res.json();
        setLikedPosts(data.content || []);
        setPageInfo(prev => ({ ...prev, page: data.number, totalPages: data.totalPages }));

      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLikes();
  }, [pageInfo.page, pageInfo.size]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pageInfo.totalPages) {
      setPageInfo((prev) => ({ ...prev, page: newPage }));
    }
  };

  if (loading) {
    return (
        <div className="like-loading-container">
            <div className="like-loading-content">
                <div className="like-loading-spinner"></div>
                <p className="like-loading-text">찜한 목록을 불러오는 중...</p>
            </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="like-error-container">
            <div className="like-error-content">
                <p>오류가 발생했습니다: {error}</p>
            </div>
        </div>
    );
  }

  return (
    <div className="like-list-container">
      <div className="like-list-content">
        <div className="like-list-header">
          <h1 className="like-list-title">좋아요한 중고거래 목록</h1>
        </div>

        {likedPosts.length === 0 ? (
            <div className="like-empty-container">
                <div className="like-empty-content">
                    <h3 className="like-empty-title">좋아요한 게시글이 없습니다</h3>
                    <p className="like-empty-description">관심있는 게시글에 좋아요를 눌러보세요!</p>
                </div>
            </div>
        ) : (
          <>
          
            {/* ✅ .like-forms-grid: 상품 카드를 감싸는 그리드 */}
            <div className="like-forms-grid">
              {likedPosts.map((post, idx) => (
                 <Link
                 to={`/tradeDetail/${post.tradeId ?? idx}`}
                 key={post.tradeId ?? idx}
                 className="like-form-card"
               >
               
                  
                  {/* ✅ .like-form-thumbnail: 이미지 영역 */}
                  <div className="like-form-thumbnail">
                    <img
                      src={getImageUrl(post.thumbnailImage)}
                      alt={post.title}
                      className="like-thumbnail-img"
                      onError={(e) => { e.target.onerror = null; e.target.src = getImageUrl(null); }}
                    />
                    {/* ✅ .like-thumbnail-overlay: 마우스 호버 시 효과 */}
                    <div className="like-thumbnail-overlay">
                      <div className="like-overlay-icon">
                        <div className="like-icon-circle">
                          <ChevronRight className="like-icon-md" />
                        </div>
                      </div>
                    </div>
                    {/* ✅ .like-status-badge: 판매 상태 표시 */}
                    <div className="like-status-badge">
                        <span className={`like-status ${post.tradeStatus === '판매중' ? 'public' : 'private'}`}>
                            <Eye className="like-icon-xs" />
                            {post.tradeStatus}
                        </span>
                    </div>
                  </div>

                  {/* ✅ .like-card-content: 텍스트 정보 영역 */}
                  <div className="like-card-content">
                    <div className="like-card-header">
                      <h3 className="like-card-title">{post.title}</h3>
                    </div>
                    <div className="like-card-badges">
                      {post.categoryName && (
                        <span className="like-card-badge category">
                          <Package className="like-icon-xs" />
                          {post.categoryName}
                        </span>
                      )}
                      {post.createdAt && (
                         <span className="like-card-badge date">
                            <Calendar className="like-icon-xs" />
                            {formatDate(post.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* 페이지네이션 */}
            {pageInfo.totalPages > 1 && (
              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <button
                  onClick={() => handlePageChange(pageInfo.page - 1)}
                  disabled={pageInfo.page === 0}
                  className="like-btn-primary"
                  style={{ marginRight: '12px' }}
                >
                  이전
                </button>
                <span>{pageInfo.page + 1} / {pageInfo.totalPages}</span>
                <button
                  onClick={() => handlePageChange(pageInfo.page + 1)}
                  disabled={pageInfo.page + 1 >= pageInfo.totalPages}
                  className="like-btn-primary"
                  style={{ marginLeft: '12px' }}
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Like;