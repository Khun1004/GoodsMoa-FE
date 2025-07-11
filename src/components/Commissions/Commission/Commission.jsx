import React, { useContext, useEffect, useState } from 'react';
import { FaHeart } from 'react-icons/fa';
import { SlSocialDropbox } from "react-icons/sl";
import { useLocation, useNavigate } from 'react-router-dom';
import { LoginContext } from "../../../contexts/LoginContext";
import './Commission.css';
import Category from '../../CommissionIcon/CommissionIcon';
import SearchBanner from '../../public/SearchBanner';
import BestsellerList from "../../public/BestsellerList.jsx";
import SortSelect from "../../public/SortSelect.jsx";
import ProductCard from '../../common/ProductCard/ProductCard';
import Pagination from '../../common/Pagination/Pagination';
import { getBestsellerByType} from "../../../api/publicService.jsx";
import _ from "lodash";
import { 
    getNumericId, 
    SORT_OPTIONS, 
    filterCommissionProducts, 
    createLikedMap,
    fetchCommissionProducts,
    handleCommissionLike 
} from '../../../utils/commissionUtils';

const Commission = ({ showBanner = true, mainCategory, setMainCategory }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { userInfo } = useContext(LoginContext);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('ALL');
    const [commissionProducts, setCommissionProducts] = useState([]);
    const [orderBy, setOrderBy] = useState('new');
    const [category, setCategory] = useState(0);
    const [includeExpired, setIncludeExpired] = useState(true);
    const [includeScheduled, setIncludeScheduled] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const pageSize = 10;

    // 디바운싱된 데이터 페칭
    useEffect(() => {
        console.log("Commission의 mainCategory:", mainCategory);
        const debounceFetch = _.debounce(() => {
            fetchCommissionProducts({
                searchType,
                searchQuery,
                category,
                orderBy,
                includeExpired,
                includeScheduled,
                page,
                pageSize,
                setCommissionProducts,
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
    const filteredProducts = filterCommissionProducts(commissionProducts, searchQuery);

    // 좋아요 상태 맵 생성
    const likedMap = createLikedMap(commissionProducts);

    return (
        <div className="component-container">
            {showBanner && (
                <>
                    <SearchBanner
                        placeholder="커미션 검색"
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
                            type="commission"
                            heading="인기 커미션"
                            liked={likedMap}
                            onLike={(postId) => {
                                handleCommissionLike({
                                    postId,
                                    commissionProducts,
                                    setCommissionProducts
                                });
                            }}
                            onCardClick={(item) => {
                                const numericId = getNumericId(item.id);
                                navigate(`/commissionDetail/${numericId}`, {
                                    state: {
                                        product: item,
                                        id: numericId
                                    },
                                });
                            }}
                        />
                    )}
                </>
            )}

            <div className='saleProductFrame'>
                {showBanner && (
                    <div className="commission-header">
                        <div className="commission-icon">
                            <SlSocialDropbox className="commissionbox-icon"/>
                            <FaHeart className="heart-icon"/>
                        </div>
                        <h2 className="commission-heading">커미션</h2>
                        <div style={{marginLeft: 'auto'}}>
                            <SortSelect options={SORT_OPTIONS} selected={orderBy} onChange={setOrderBy}/>
                        </div>
                    </div>
                )}

                <div className="component-grid">
                    {loading && <div className="loading-box">🔄 로딩중입니다...</div>}
                    {error && <div className="error-box">❌ {error}</div>}
                    {!loading && !error && (isSearching ? filteredProducts : commissionProducts).length === 0 && (
                        <div className="no-search-result">
                            {isSearching 
                                ? `"${searchQuery}"에 대한 검색 결과가 없습니다.`
                                : "등록된 커미션이 없습니다."
                            }
                        </div>
                    )}
                    {(isSearching ? filteredProducts : commissionProducts).map((item, idx) => (
                        <ProductCard
                            key={item.id || idx}
                            item={item}
                            onLike={(id) => handleCommissionLike({
                                postId: id,
                                commissionProducts,
                                setCommissionProducts
                            })}
                            products={commissionProducts}
                            detailPath="/commissionDetail"
                            label="커미션"
                            saleLabel="커미션"
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

export default Commission;
