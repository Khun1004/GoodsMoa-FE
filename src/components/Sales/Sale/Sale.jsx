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
import { getBestsellerByType } from "../../../api/publicService";
import SortSelect from "../../public/SortSelect.jsx";
import ProductCard from '../../common/ProductCard/ProductCard';
import Pagination from '../../common/Pagination/Pagination';
import _ from "lodash";
import { getPostIdKey, fetchSaleProducts, handleSaleLike, initializeLikedStatus } from '../../../utils/saleUtils';

const Sale = ({ showBanner = true, showCustomProducts = true, mainCategory, setMainCategory  }) => {
    const [userName, setUserName] = useState(() => localStorage.getItem('userName') || "사용자 이름");
    const { profileImage, userInfo } = useContext(LoginContext);
    const [liked, setLiked] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [searchType, setSearchType] = useState('ALL');
    const [posts, setPosts] = useState([]);
    const [sortOrder, setSortOrder] = useState('new');
    const [boardCategory, setBoardCategory] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState(0);
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const pageSize = 10;

    const sortOptions = [
        { label: '최신순', value: 'new' },
        { label: '인기순', value: 'view' },
        { label: '찜순', value: 'like' },
        { label: '등록일순', value: 'old' }
    ];

    const category = mainCategory !== undefined ? mainCategory : boardCategory;
    const setCategory = setMainCategory !== undefined ? setMainCategory : setBoardCategory;

    // 디바운싱된 데이터 페칭
    useEffect(() => {
        console.log("Sale의 mainCategory:", mainCategory);
        const debounceFetch = _.debounce(() => {
            fetchSaleProducts({
                searchType,
                searchQuery,
                category,
                sortOrder,
                page,
                pageSize,
                setPosts,
                setTotalPages,
                setLoading,
                setError
            });
        }, 500);
        debounceFetch();
        return () => debounceFetch.cancel();
    }, [searchType, sortOrder, searchQuery, category, page]);

    // 좋아요 상태 초기화
    useEffect(() => {
        initializeLikedStatus(setLiked);
    }, []);

    // 좋아요 상태 동기화 (posts가 바뀔 때)
    useEffect(() => {
        if (userInfo && posts.length > 0) {
            const postIds = posts.map(post => getPostIdKey(post.id));
            // 좋아요 상태를 posts 배열과 동기화
            setPosts(prevPosts => 
                prevPosts.map(post => ({
                    ...post,
                    liked: liked[getPostIdKey(post.id)] || false
                }))
            );
        }
    }, [userInfo, posts.length, liked]);

    const handleSearchSubmit = () => {
        setPage(0);
    };

    const isSearching = searchQuery.trim().length > 0;

    // 클라이언트 사이드 검색 필터링 (Trade.jsx와 동일하게)
    const filteredProducts = posts.filter(item => {
        const query = searchQuery.toLowerCase();
        return (
            item.title?.toLowerCase().includes(query) ||
            item.hashtag?.toLowerCase().includes(query) ||
            item.nickname?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="component-container">
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
                            onLike={(postId) => {
                                handleSaleLike({
                                    postId,
                                    liked,
                                    setLiked,
                                    posts,
                                    setPosts
                                });
                            }}
                            onCardClick={(post) => {
                                const numericId = getPostIdKey(post.id);
                                navigate(`/person/${numericId}`);
                            }}
                        />
                    )}
                </>
            )}

            <div className='saleProductFrame'>
                {showBanner && (
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

                <div className="component-grid">
                    {loading && <div className="loading-box">🔄 로딩중입니다...</div>}
                    {error && <div className="error-box">❌ {error}</div>}
                    {!loading && !error && (isSearching ? filteredProducts : posts).length === 0 && (
                        <div className="no-search-result">
                            {isSearching 
                                ? `"${searchQuery}"에 대한 검색 결과가 없습니다.`
                                : "등록된 판매 상품이 없습니다."
                            }
                        </div>
                    )}
                    {(isSearching ? filteredProducts : posts).map((post) => {
                        const postIdKey = getPostIdKey(post.id);
                        const isLiked = liked[postIdKey] || false;
                        return (
                            <ProductCard
                                key={post.id}
                                item={{...post, liked: isLiked}}
                                onLike={() => handleSaleLike({
                                    postId: post.id,
                                    liked,
                                    setLiked,
                                    posts,
                                    setPosts
                                })}
                                products={posts}
                                detailPath="/person"
                                label="판매"
                                saleLabel="판매"
                            />
                        );
                    })}
                </div>

                {showBanner && totalPages > 1 && (
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                )}
            </div>
        </div>
    );
};

export default Sale;
