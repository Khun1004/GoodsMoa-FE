import React, { useContext, useEffect, useState } from 'react';
import { FaHeart } from 'react-icons/fa';
import { SlSocialDropbox } from "react-icons/sl";
import { useLocation, useNavigate } from 'react-router-dom';
import { LoginContext } from "../../../contexts/LoginContext";
import './Demand.css';
import Category from '../../public/Category/Category';
import SearchBanner from "../../public/SearchBanner.jsx";
import BestsellerList from "../../public/BestsellerList.jsx";
import { getBestsellerByType } from "../../../api/publicService";
import SortSelect from "../../public/SortSelect.jsx";
import ProductCard from '../../common/ProductCard/ProductCard';
import Pagination from '../../common/Pagination/Pagination';
import _ from "lodash";
import { 
    getNumericId, 
    SORT_OPTIONS, 
    filterDemandProducts, 
    createLikedMap,
    fetchDemandProducts,
    handleDemandLike
} from '../../../utils/demandUtils';

const Demand = ({ showBanner = true, mainCategory, setMainCategory }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { userInfo } = useContext(LoginContext);

    const initialQueryFromLocation = new URLSearchParams(location.search).get("q") || "";
    const [searchQuery, setSearchQuery] = useState(initialQueryFromLocation);
    const [searchType, setSearchType] = useState('ALL');
    const [demandProducts, setDemandProducts] = useState([]);
    const [orderBy, setOrderBy] = useState('new');
    const [boardCategory, setBoardCategory] = useState(0);
    const [includeExpired, setIncludeExpired] = useState(true);
    const [includeScheduled, setIncludeScheduled] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const pageSize = 10;

    const category = mainCategory !== undefined ? mainCategory : boardCategory;
    const setCategory = setMainCategory !== undefined ? setMainCategory : setBoardCategory;

    // 디바운싱된 데이터 페칭
    useEffect(() => {
        console.log("Demand의 mainCategory:", mainCategory);
        const debounceFetch = _.debounce(() => {
            fetchDemandProducts({
                searchType,
                searchQuery,
                category,
                orderBy,
                includeExpired,
                includeScheduled,
                page,
                pageSize,
                setDemandProducts,
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
    const filteredProducts = filterDemandProducts(demandProducts, searchQuery);

    // 좋아요 상태 맵 생성
    const likedMap = createLikedMap(demandProducts);

    return (
        <div className="component-container">
            {showBanner && (
                <>
                    <SearchBanner
                        placeholder="수요조사 검색"
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
                            type="demand"
                            heading="인기 수요조사"
                            liked={likedMap}
                            onLike={(postId) => {
                                handleDemandLike({
                                    postId,
                                    demandProducts,
                                    setDemandProducts
                                });
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

            <div className='saleProductFrame'>
                {showBanner && (
                    <div className='sale-header'>
                        <div className='sale-icon'>
                            <SlSocialDropbox className='salebox-icon' />
                            <FaHeart className='heart-icon' />
                        </div>
                        <h2 className="sale-heading">수요조사</h2>
                        <div style={{ marginLeft: 'auto' }}>
                            <SortSelect
                                options={SORT_OPTIONS}
                                selected={orderBy}
                                onChange={setOrderBy}
                            />
                        </div>
                    </div>
                )}

                <div className="component-grid">
                    {loading && <div className="loading-box">🔄 로딩중입니다...</div>}
                    {error && <div className="error-box">❌ {error}</div>}
                    {!loading && !error && (isSearching ? filteredProducts : demandProducts).length === 0 && (
                        <div className="no-search-result">
                            {isSearching 
                                ? `"${searchQuery}"에 대한 검색 결과가 없습니다.`
                                : "등록된 수요조사가 없습니다."
                            }
                        </div>
                    )}
                    {(isSearching ? filteredProducts : demandProducts).map((item, idx) => (
                        <ProductCard
                            key={getNumericId(item.id || item.demandPostId) || idx}
                            item={item}
                            onLike={(postId) => handleDemandLike({
                                postId,
                                demandProducts,
                                setDemandProducts
                            })}
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
