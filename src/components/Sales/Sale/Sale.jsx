import React, { useContext, useEffect, useState } from 'react';
import { CgProfile } from "react-icons/cg";
import { FaHeart } from 'react-icons/fa';
import { SlSocialDropbox } from "react-icons/sl";
import { useNavigate } from 'react-router-dom';
import { default as placeholderImage } from '../../../assets/sales/sale1.jpg';
import { LoginContext } from "../../../contexts/LoginContext";
import SearchBanner from '../../Public/SearchBanner';
import './Sale.css';
import Category from '../../public/Category/Category';
import BestsellerList from "../../public/BestsellerList.jsx";
import { getBestsellerByType, searchBoardPosts } from "../../../api/publicService";
import productService from "../../../api/ProductService";
import SortSelect from "../../public/SortSelect.jsx";

const Sale = ({ showBanner = true, showCustomProducts = true }) => {
    const [userName, setUserName] = useState(() => localStorage.getItem('userName') || "사용자 이름");
    const { profileImage, userInfo } = useContext(LoginContext);
    const [liked, setLiked] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [posts, setPosts] = useState([]);
    const [sortOrder, setSortOrder] = useState('new');
    const [selectedCategory, setSelectedCategory] = useState(0); // ⭐️ 추가됨
    const navigate = useNavigate();

    const getPostIdKey = (id) => {
        if (typeof id === 'string' && id.includes('_')) {
            return id.split('_')[1];
        }
        return String(id);
    };

    const sortOptions = [
        { label: '최신순', value: 'new' },
        { label: '인기순', value: 'view' },
        { label: '찜순', value: 'like' },
        { label: '등록일순', value: 'old' }
    ];

    const fetchProductPosts = async () => {
        try {
            const res = await searchBoardPosts({
                path: '/product',
                board_type: 'PRODUCT',
                query: searchQuery,
                category: selectedCategory, // ⭐️ 반영됨
                order_by: sortOrder,
                page: 0,
                page_size: 20
            });

            const now = new Date();
            const filtered = res.content.filter(post => {
                const start = post.startTime ? new Date(post.startTime) : null;
                const end = post.endTime ? new Date(post.endTime) : null;
                if (start && now < start) return false;
                if (end && now > end) return false;
                return true;
            });

            setPosts(filtered);
        } catch (err) {
            console.error('❌ 상품글 검색 실패:', err);
        }
    };

    useEffect(() => {
        fetchProductPosts();
    }, [sortOrder, searchQuery, selectedCategory]); // ⭐️ 추가됨

    useEffect(() => {
        const fetchLikedPosts = async () => {
            const token = localStorage.getItem('userInfo');
            if (!token) return;

            try {
                const res = await productService.getLikedPosts();
                const likedMap = {};
                res.content.forEach(post => {
                    likedMap[String(post.postId)] = true;
                });
                setLiked(likedMap);
            } catch (err) {
                console.error("초기 좋아요 로딩 실패:", err);
            }
        };
        fetchLikedPosts();
    }, []);

    const handleLike = async (postIdRaw) => {
        const postId = getPostIdKey(postIdRaw);
        try {
            const isLiked = liked[postId];
            if (isLiked) {
                await productService.unlikeProduct(postId);
            } else {
                await productService.likeProduct(postId);
            }
            setLiked(prev => ({ ...prev, [postId]: !isLiked }));
        } catch (err) {
            console.error('좋아요 처리 중 오류:', err);
            alert(err.message);
        }
    };

    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') fetchProductPosts();
    };

    const handleProductClick = async (post) => {
        try {
            const detailedPost = post;
            const numericPostId = parseInt(getPostIdKey(post.id), 10);
            navigate('/person', {
                state: {
                    product: {
                        ...detailedPost,
                        id: numericPostId,
                        name: detailedPost.title,
                        price: detailedPost.price,
                        image: detailedPost.thumbnailUrl,
                        src: detailedPost.thumbnailUrl,
                        quantity: 10,
                        maxQuantity: 20,
                        shippingMethods: detailedPost.delivers || []
                    },
                    products: [{
                        ...detailedPost,
                        image: detailedPost.thumbnailUrl,
                        src: detailedPost.thumbnailUrl
                    }],
                    selectedImage: detailedPost.thumbnailUrl,
                    saleLabel: "판매",
                    userName,
                    profileImage: userInfo?.profileImage || profileImage,
                    from: 'sale',
                    productReviews: []
                }
            });
        } catch (err) {
            console.error('상품 상세 이동 에러:', err);
        }
    };

    const isSearching = searchQuery.trim().length > 0;

    return (
        <div className='container'>
            <div className="sale-container">
                {showBanner && (
                    <>
                        <SearchBanner
                            title="판매 상품 검색:"
                            placeholder=" 판매상품 검색"
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            handleSearchKeyPress={handleSearchKeyPress}
                        />
                        <Category
                            gap={90}
                            selectedId={selectedCategory}               // ⭐️ 현재 선택된 ID 전달
                            onCategoryClick={setSelectedCategory}       // ⭐️ 선택 시 변경
                        />
                        <hr className="sale-divider" />
                        {!isSearching && (
                            <BestsellerList
                                apiFn={getBestsellerByType}
                                type="product"
                                heading="인기 판매 제품"
                                liked={liked}
                                onLike={handleLike}
                                onCardClick={handleProductClick}
                            />
                        )}
                    </>
                )}

                <div className='saleProductFrame'>
                    {showBanner && !isSearching && (
                        <div className='sale-header'>
                            <div className='sale-icon'>
                                <SlSocialDropbox className='salebox-icon' />
                                <FaHeart className='heart-icon' />
                            </div>
                            <h2 className="sale-heading">판매 제품</h2>
                            <div style={{ marginLeft: 'auto' }}>
                                <SortSelect
                                    options={sortOptions}
                                    selected={sortOrder}
                                    onChange={setSortOrder}
                                />
                            </div>
                        </div>
                    )}

                    <div className="sale-grid">
                        {posts.map((post) => {
                            const postIdKey = getPostIdKey(post.id);
                            return (
                                <div key={post.id} className="sale-card">
                                    <div onClick={() => handleProductClick(post)}>
                                        <img
                                            src={post.thumbnailUrl || placeholderImage}
                                            alt={post.title}
                                            className="sale-image"
                                            onError={(e) => {
                                                e.target.src = placeholderImage;
                                            }}
                                        />
                                    </div>
                                    <span className="sale-label">판매</span>
                                    <button
                                        className={`sale-like-button ${liked[postIdKey] ? 'liked' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleLike(post.id);
                                        }}
                                    >
                                        <FaHeart size={18} />
                                    </button>

                                    <div className="sale-profile-block">
                                        <div className="sale-profile-row">
                                            {post.profileUrl ? (
                                                <img
                                                    src={post.profileUrl}
                                                    alt="작성자"
                                                    className="sale-profile-pic-mini"
                                                    onError={(e) => {
                                                        e.target.src = placeholderImage;
                                                    }}
                                                />
                                            ) : (
                                                <CgProfile className="sale-profile-pic-mini" />
                                            )}
                                            <span className="sale-user-name-mini">{post.nickname}</span>
                                        </div>
                                        <span className="view-count">조회수: {post.views || 0}</span>
                                    </div>
                                    <div className="sale-product-title">{post.title}</div>
                                    {post.hashtag && (
                                        <div className="tags-container">
                                            <div className="tags-list">
                                                {post.hashtag.split(",").map((tag, idx) => (
                                                    <span key={idx} className="tag-item">#{tag.trim()}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {searchQuery && posts.length === 0 && (
                    <div className="no-search-results">
                        <p style={{ textAlign: 'center', marginTop: '50px', fontSize: '18px', color: '#666' }}>
                            "{searchQuery}"에 대한 검색 결과가 없습니다.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sale;
