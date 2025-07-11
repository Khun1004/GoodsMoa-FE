import React, { useContext, useEffect, useState } from 'react';
import { FaHeart } from 'react-icons/fa';
import { SlSocialDropbox } from "react-icons/sl";
import { useNavigate } from 'react-router-dom';
import { LoginContext } from "../../../contexts/LoginContext";
import SearchBanner from '../../public/SearchBanner';
import './Trade.css';
import Category from '../../public/Category/Category';
import BestsellerList from "../../public/BestsellerList.jsx";
import { getBestsellerByType } from "../../../api/publicService";
import SortSelect from "../../public/SortSelect.jsx";
import ProductCard from '../../common/ProductCard/ProductCard';
import Pagination from '../../common/Pagination/Pagination';
import _ from "lodash";
import { getNumericId, fetchTradeProducts, handleLike } from '../../../utils/tradeUtils';

const Trade = ({ showBanner = true, mainCategory, setMainCategory }) => {
    const { userInfo } = useContext(LoginContext);
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('ALL');
    const [tradeProducts, setTradeProducts] = useState([]);
    const [orderBy, setOrderBy] = useState('new');
    const [boardCategory, setBoardCategory] = useState(0);
    const [includeExpired, setIncludeExpired] = useState(true);
    const [includeScheduled, setIncludeScheduled] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const pageSize = 10;

    const sortOptions = [
        { label: '최신순', value: 'new' },
        { label: '오래된순', value: 'old' },
        { label: '조회수순', value: 'view' },
        { label: '좋아요순', value: 'like' }
    ];

    const category = mainCategory !== undefined ? mainCategory : boardCategory;
    const setCategory = setMainCategory !== undefined ? setMainCategory : setBoardCategory;

    // 디바운싱된 데이터 페칭
    useEffect(() => {
        console.log("Trade의 mainCategory:", mainCategory);
        const debounceFetch = _.debounce(() => {
            fetchTradeProducts({
                searchType,
                searchQuery,
                category,
                orderBy,
                includeExpired,
                includeScheduled,
                page,
                pageSize,
                setTradeProducts,
                setTotalPages,
                setLoading,
                setError
            });
        }, 500);
        debounceFetch();
        return () => debounceFetch.cancel();
    }, [searchType, searchQuery, category, orderBy, includeExpired, includeScheduled, page]);

    const handleSearchSubmit = () => {
        setPage(0);
    };

    const isSearching = searchQuery.trim().length > 0;

    // 클라이언트 사이드 검색 필터링
    const filteredProducts = tradeProducts.filter(item => {
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
                        placeholder="중고거래 검색"
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        searchType={searchType}
                        setSearchType={setSearchType}
                        handleSearchKeyPress={(e) => {
                            if (e.key === 'Enter') handleSearchSubmit();
                        }}
                    />
                    <Category
                        gap={60}
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
                            type="trade"
                            heading="인기 중고거래"
                            liked={tradeProducts.reduce((acc, item) => {
                                const id = getNumericId(item.id || item.tradePostId);
                                acc[id] = item.liked;
                                return acc;
                            }, {})}
                            onLike={(postId) => {
                                handleLike({
                                    id: postId,
                                    tradeProducts,
                                    setTradeProducts
                                });
                            }}
                            onCardClick={(item) =>
                                navigate(`/tradeDetail/${getNumericId(item.id || item.tradePostId)}`, {
                                    state: {product: item},
                                })
                            }
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
                        <h2 className="sale-heading">중고거래</h2>
                        <div style={{ marginLeft: 'auto' }}>
                            <SortSelect
                                options={sortOptions}
                                selected={orderBy}
                                onChange={setOrderBy}
                            />
                        </div>
                    </div>
                )}

                <div className="component-grid">
                    {loading && <div className="loading-box">🔄 로딩중입니다...</div>}
                    {error && <div className="error-box">❌ {error}</div>}
                    {!loading && !error && (isSearching ? filteredProducts : tradeProducts).length === 0 && (
                        <div className="no-search-result">
                            {isSearching 
                                ? `"${searchQuery}"에 대한 검색 결과가 없습니다.`
                                : "등록된 중고거래가 없습니다."
                            }
                        </div>
                    )}
                    {(isSearching ? filteredProducts : tradeProducts).map((item) => (
                        <ProductCard
                            key={item.id}
                            item={item}
                            onLike={(id) => handleLike({
                                id,
                                tradeProducts,
                                setTradeProducts
                            })}
                            products={tradeProducts}
                            detailPath="/tradeDetail"
                            label="중고거래"
                            saleLabel="중고거래"
                        />
                    ))}
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

export default Trade;
