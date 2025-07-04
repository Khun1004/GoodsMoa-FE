import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Demand.css';
import Category from '../../public/Category/Category';
import SearchBanner from "../../public/SearchBanner.jsx";
import Spacer from "../../public/Spacer.jsx";
import BestsellerList from "../../public/BestsellerList.jsx";
import { getBestsellerByType } from "../../../api/publicService";
import { getNumericId } from '../../../utils/demandUtils';
import { useDemandProducts } from '../../../hooks/useDemandProducts';
import { useDemandLikes } from '../../../hooks/useDemandLikes';
import ProductCard from '../../common/ProductCard/ProductCard';
import DemandHeader from '../DemandHeader/DemandHeader';
import Pagination from '../../common/Pagination/Pagination';

const Demand = ({ showBanner = true, mainCategory, setMainCategory }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const initialQueryFromLocation = new URLSearchParams(location.search).get("q") || "";
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('ALL');
    const [boardCategory, setBoardCategory] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const [orderBy, setOrderBy] = useState('new');
    const [includeExpired, setIncludeExpired] = useState(true);
    const [includeScheduled, setIncludeScheduled] = useState(true);

    const [page, setPage] = useState(0);
    const pageSize = 10;

    const category = mainCategory !== undefined ? mainCategory : boardCategory;
    const setCategory = setMainCategory !== undefined ? setMainCategory : setBoardCategory;

    // 커스텀 훅 사용
    const { demandProducts, setDemandProducts, loading, error, totalPages } = useDemandProducts(
        searchType, searchQuery, category, orderBy, includeExpired, includeScheduled, page, pageSize
    );
    
    const { handleLike } = useDemandLikes(demandProducts, setDemandProducts);


    const filteredProducts = demandProducts.filter(item => {
        const query = searchQuery.toLowerCase();
        return (
            item.title?.toLowerCase().includes(query) ||
            item.hashtag?.toLowerCase().includes(query) ||
            item.nickname?.toLowerCase().includes(query)
        );
    });

    const handleSearchSubmit = () => {
        setPage(0);
    };

    const isSearching = searchQuery.trim().length > 0;

    return (
        <div className="container">
            <div className="demand-container">
                {showBanner && (
                    <>
                        <Spacer height={20}/>
                        <SearchBanner
                            placeholder="수요조사 검색"
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            searchType={searchType}
                            setSearchType={setSearchType}
                            handleSearchKeyPress={(e) => {
                                if (e.key === 'Enter') handleSearchSubmit();
                            }}
                            // handleSearchSubmit={handleSearchSubmit}
                        />
                        <Category
                            gap={60}
                            selectedId={category}
                            onCategoryClick={(id) => {
                                setCategory(id);
                                setPage(0);
                            }}
                        />

                        <hr className="sale-divider"/>

                        {!isSearching && (
                            <BestsellerList
                                apiFn={getBestsellerByType}
                                type="demand"
                                heading="인기 수요조사"
                                liked={demandProducts.reduce((acc, item) => {
                                    const id = getNumericId(item.id || item.demandPostId);
                                    acc[id] = item.liked;
                                    return acc;
                                }, {})}
                                onLike={(postId) => {
                                    handleLike(postId);
                                }}
                                onCardClick={(item) =>
                                    navigate(`/demandDetail/${getNumericId(item.id || item.demandPostId)}`, {
                                        state: {product: item},
                                    })
                                }
                            />
                        )}
                    </>
                )}

                {showBanner && (
                    <DemandHeader orderBy={orderBy} setOrderBy={setOrderBy} />
                )}

                <div className="demand-grid">
                    {loading && <div className="loading-box">🔄 로딩중입니다...</div>}
                    {!loading && (isSearching ? filteredProducts : demandProducts).length === 0 && (
                        <div className="no-search-result">"{searchQuery}"에 대한 검색 결과가 없습니다.</div>
                    )}

                    {!loading &&
                        (isSearching ? filteredProducts : demandProducts).map((item, idx) => (
                            <ProductCard
                                key={getNumericId(item.id || item.demandPostId) || idx}
                                item={item}
                                onLike={handleLike}
                                products={demandProducts}
                                detailPath="/demandDetail"
                                label="수요조사"
                                saleLabel="수요거래"
                            />
                        ))}
                </div>

                {showBanner && (
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

export default Demand;
