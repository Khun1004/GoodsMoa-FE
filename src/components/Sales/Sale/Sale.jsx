import React, { useContext, useEffect, useState, useCallback } from 'react';
import { CgProfile } from "react-icons/cg";
import { FaHeart } from 'react-icons/fa';
import { SlSocialDropbox } from "react-icons/sl";
import { useNavigate } from 'react-router-dom';
import { default as placeholderImage } from '../../../assets/sales/sale1.jpg';
import { LoginContext } from "../../../contexts/LoginContext";
import SearchBanner from '../../public/SearchBanner';
import './Sale.css';
import Category from '../../public/Category/Category';
import BestsellerList from "../../public/BestsellerList.jsx";
import { getBestsellerByType, searchBoardPosts } from "../../../api/publicService";
import productService from "../../../api/ProductService";
import SortSelect from "../../public/SortSelect.jsx";
import ProductCard from '../../common/ProductCard/ProductCard';
import Pagination from '../../common/Pagination/Pagination';

const Sale = ({ showBanner = true, showCustomProducts = true, mainCategory, setMainCategory  }) => {
    const [userName, setUserName] = useState(() => localStorage.getItem('userName') || "사용자 이름");
    const { profileImage, userInfo } = useContext(LoginContext);
    const [liked, setLiked] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [searchType, setSearchType] = useState('ALL');
    const [posts, setPosts] = useState([]);
    const [sortOrder, setSortOrder] = useState('new');
    const [boardCategory, setBoardCategory] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState(0); // ⭐️ 추가됨
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 10;

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

    const category = mainCategory !== undefined ? mainCategory : boardCategory;
    const setCategory = setMainCategory !== undefined ? setMainCategory : setBoardCategory;

    const fetchProductPosts = useCallback(async () => {
        try {
            const res = await searchBoardPosts({
                path: '/product',
                board_type: 'PRODUCT',
                search_type: searchType.toUpperCase(),
                query: searchQuery,
                category, // ⭐️ 반영됨
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
    }, [searchType, sortOrder, searchQuery, category]);

    useEffect(() => {
        fetchProductPosts();
    }, [fetchProductPosts]);

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

    const handleProductClick = (post) => {
        navigate(`/person/${post.id}`);
    };

    const handleSearchSubmit = () => {
        setPage(0);
    };
    const isSearching = searchQuery.trim().length > 0;

    return (
        <div className='container'>
            <div className="sale-container">
                {showBanner && (
                    <>
                        <SearchBanner
                            placeholder="판매상품 검색"
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            searchType={searchType}
                            setSearchType={setSearchType}
                            handleSearchKeyPress={(e) => {
                                if (e.key === 'Enter') handleSearchSubmit();
                            }}
                        />
                        <Category
                            gap={90}
                            selectedId={category}
                            onCategoryClick={(id) => {
                                setCategory(id);
                                setPage(0);
                            }}
                        />
                        <hr className="sale-divider" />
                        {!isSearching && (
                            <BestsellerList
                                apiFn={getBestsellerByType}
                                type="product"
                                heading="인기 판매 제품"
                                liked={posts.reduce((acc, item) => {
                                    const id = getPostIdKey(item.id);
                                    acc[id] = liked[id] || false;
                                    return acc;
                                }, {})}
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
                            const isLiked = liked[postIdKey] || false;
                            return (
                                <ProductCard
                                    key={post.id}
                                    item={{...post, liked: isLiked}}
                                    onLike={() => handleLike(post.id)}
                                    products={posts}
                                    detailPath="/person"
                                    label="판매"
                                    saleLabel="판매"
                                />
                            );
                        })}
                    </div>
                </div>

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />

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
