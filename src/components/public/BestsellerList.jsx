import React, { useEffect, useState } from 'react';
import { CgProfile } from "react-icons/cg";
import { SlSocialDropbox } from "react-icons/sl";
import { FaHeart } from 'react-icons/fa';
import { default as placeholderImage } from '../../assets/sales/sale1.jpg';
import '../Sales/Sale/Sale.css';
import Spacer from "./Spacer.jsx";

// ✅ 문자열 ID에서 숫자 postId 추출하는 함수
const extractPostId = (fullId) => {
    if (typeof fullId === 'string' && fullId.includes('_')) {
        return Number(fullId.split('_')[1]);
    }
    return Number(fullId);
};

const BestsellerList = ({ apiFn, type, heading, liked = {}, onLike, onCardClick }) => {
    const [posts, setPosts] = useState([]);


    // BestsellerList.jsx
    useEffect(() => {
        console.log("✅ BestsellerList received liked props:", liked);
    }, [liked]);
    // 베스트셀러 리스트 가져오기
    useEffect(() => {
        const fetchBestsellers = async () => {
            try {
                const result = await apiFn(type);
                setPosts(result);
            } catch (err) {
                console.error("🔥 베스트셀러 조회 실패:", err);
            }
        };
        fetchBestsellers();
    }, [apiFn, type]);

    return (
        <div className='saleProductFrame'>
            <div className='sale-header'>
                <div className='sale-icon'>
                    <SlSocialDropbox className='salebox-icon' />
                    <FaHeart className='heart-icon' />
                </div>
                <h2 className="sale-heading">{heading}</h2>
            </div>

            <div className="sale-grid">
                {posts.map((post) => {
                    const postId = extractPostId(post.id);
                    return (
                        <div key={post.id} className="sale-card"  onClick={() => onCardClick({ ...post, id: extractPostId(post.id) })} >
                            <img
                                src={post.thumbnailUrl || placeholderImage}
                                alt={post.title}
                                className="sale-image"
                                onError={(e) => { e.target.src = placeholderImage; }}
                            />
                            <span className="sale-label">인기</span>

                            {onLike && (
                                <button
                                    className={`sale-like-button ${liked[postId] ? 'liked' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onLike(postId);
                                    }}
                                >
                                    <FaHeart size={18} />
                                </button>
                            )}

                            <div className="sale-profile-block">
                                <div className="sale-profile-row">
                                    <CgProfile className="sale-profile-pic-mini" />
                                    <span className="sale-user-name-mini">{post.nickname || '익명'}</span>
                                </div>
                                <div className="sale-product-title">{post.title}</div>
                            </div>

                            {post.hashtag && (
                                <div className="tags-container">
                                    <div className="tags-list">
                                        {post.hashtag.split(',').map((tag, idx) => (
                                            <span key={idx} className="tag-item">#{tag.trim()}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {posts.length === 0 && (
                <div className="no-search-results">
                    <p style={{ textAlign: 'center', marginTop: '50px', fontSize: '18px', color: '#666' }}>
                        상품이 없습니다.
                    </p>
                </div>
            )}

            <div className="bestseller-divider" />
        </div>
    );
};

export default BestsellerList;
