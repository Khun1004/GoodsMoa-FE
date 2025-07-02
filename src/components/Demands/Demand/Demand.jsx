import React, { useCallback, useEffect, useState, useMemo } from 'react';
import _ from 'lodash';
import { CgProfile } from 'react-icons/cg';
import { FaHeart } from 'react-icons/fa';
import { SlSocialDropbox } from 'react-icons/sl';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Demand1 from '../../../assets/demands/demand1.jpg';
import './Demand.css';
import Category from '../../public/Category/Category';
import SearchBanner from "../../public/SearchBanner.jsx";
import Spacer from "../../public/Spacer.jsx";
import SortSelect from "../../public/SortSelect.jsx";
import BestsellerList from "../../public/BestsellerList.jsx";
import { getBestsellerByType } from "../../../api/publicService";
import api from '../../../api/api';
import {IoMdSearch} from "react-icons/io";
import Trade1 from "../../../assets/demands/demand1.jpg"; // axios 인스턴스



// 숫자 ID만 추출하는 함수 - 반드시 숫자 문자열로 리턴
const getNumericId = (id) => {
    if (typeof id === 'string' && id.startsWith('DEMAND_')) {
        return id.replace('DEMAND_', '');
    }
    return String(id);
};

const Demand = ({ showBanner = true }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const [demandProducts, setDemandProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const initialQueryFromLocation = new URLSearchParams(location.search).get("q") || "";
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);

    const [category, setCategory] = useState(0);
    const [orderBy, setOrderBy] = useState('new');
    const [includeExpired, setIncludeExpired] = useState(true);
    const [includeScheduled, setIncludeScheduled] = useState(true);

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 10;

    const sortOptions = [
        { label: '최신순', value: 'new' },      // 최신 등록순
        { label: '오래된순', value: 'old' },        // 오래된 등록순
        { label: '조회수순', value: 'view' },       // 조회수 많은 순
        { label: '좋아요순', value: 'like' },         // 좋아요(찜) 많은 순
        { label: '마감임박순', value: 'close' }, // 마감 임박 순
    ];


    // fetch 함수 - debounce 빼고 useEffect에서 직접 debounce 적용 권장
    const fetchDemandProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                search_type: searchType.toUpperCase(),
                query: searchQuery,
                category,
                order_by: orderBy,
                include_expired: includeExpired,
                include_scheduled: includeScheduled,
                page,
                page_size: pageSize,
            };
            const res = await api.get('/demand', { params });
            const data = res.data;
            const productsArr = Array.isArray(data.content) ? data.content : [];

            // demandProducts에 liked 정보 유지하면서 업데이트 하려면 서버에서 liked 정보 같이 받아야 함.
            // 없으면 기존 liked 유지
            setDemandProducts(productsArr);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            setError(err.message || '데이터를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    }, [searchType, searchQuery, category, orderBy, includeExpired, includeScheduled, page]);

    // debounce 효과용 useEffect
    useEffect(() => {
        const debounceFetch = _.debounce(() => {
            fetchDemandProducts();
        }, 500);
        debounceFetch();
        return () => debounceFetch.cancel();
    }, [fetchDemandProducts]);

    // 좋아요 초기값 가져오기
    useEffect(() => {
        const fetchLikes = async () => {
            try {
                const res = await api.get('/demand/liked'); // 예시, 좋아요 목록 API
                const likedMap = {};
                (res.data?.content || []).forEach((item) => {
                    // 숫자 id 기준으로 저장
                    likedMap[getNumericId(item.id || item.demandPostId)] = true;
                });
                setDemandProducts((prev) =>
                    prev.map((item) => {
                        const id = getNumericId(item.id || item.demandPostId);
                        return {
                            ...item,
                            liked: !!likedMap[id],
                        };
                    })
                );
            } catch (err) {
                console.error('좋아요 초기값 불러오기 실패:', err.message);
            }
        };
        fetchLikes();
    }, []);

    const handleLike = async (id) => {
        const numericId = getNumericId(id);
        try {
            await api.post(`/demand/like/${numericId}`);
            setDemandProducts(prev =>
                prev.map(item => {
                    const numericItemId = getNumericId(item.id);
                    if (numericItemId === numericId) {
                        return { ...item, liked: !item.liked };
                    }
                    return item;
                })
            );
        } catch (err) {
            alert('좋아요 처리 실패: ' + (err.response?.data?.message || err.message));
        }
    };


    const filteredProducts = demandProducts.filter(item => {
        const query = searchQuery.toLowerCase();
        return (
            item.title?.toLowerCase().includes(query) ||
            item.hashtag?.toLowerCase().includes(query) ||
            item.nickname?.toLowerCase().includes(query)
        );
    });

    const getFullThumbnailUrl = (thumbnailUrl) =>
        thumbnailUrl
            ? thumbnailUrl.startsWith('http')
                ? thumbnailUrl
                : `http://localhost:8080/${thumbnailUrl.replace(/^\/+/, '')}`
            : '';

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

                <div className="demand-header">
                    <div className="demand-icon">
                        <SlSocialDropbox className="demandbox-icon"/>
                        <FaHeart className="heart-icon"/>
                    </div>
                    <h2 className="demand-heading">수요조사</h2>
                    <div style={{marginLeft: 'auto'}}>
                        <SortSelect options={sortOptions} selected={orderBy} onChange={setOrderBy}/>
                    </div>
                </div>

                <div className="demand-grid">
                    {loading && <div className="loading-box">🔄 로딩중입니다...</div>}
                    {!loading && (isSearching ? filteredProducts : demandProducts).length === 0 && (
                        <div className="no-search-result">"{searchQuery}"에 대한 검색 결과가 없습니다.</div>
                    )}

                    {!loading &&
                         (isSearching ? filteredProducts : demandProducts).map((item, idx) => {
                            const id = getNumericId(item.id || item.demandPostId);
                            return (
                                <div key={id || idx} className="demand-card">
                                <Link
                                        to={`/demandDetail/${id}`}
                                        state={{
                                            product: item,
                                            saleLabel: '수요거래',
                                            products: demandProducts,
                                        }}
                                    >
                                        <img
                                            src={getFullThumbnailUrl(item.thumbnailUrl)}
                                            alt={item.title}
                                            className="demand-image"
                                        />
                                    </Link>
                                    <span className="demand-label">수요조사</span>
                                    <button
                                        className={`demand-like-button${item.liked ? ' liked' : ''}`}
                                        onClick={() => handleLike(id)}
                                    >
                                        <FaHeart size={18} />
                                    </button>

                                    <div className="demand-profile-block">
                                        <div className="demand-profile-line">
                                            <div className="demand-profile-row">
                                                {item.userImage ? (
                                                    <img src={item.userImage} alt="profile" className="profile-pic" />
                                                ) : (
                                                    <CgProfile className="profile-pic" />
                                                )}
                                                <span className="demand-user-name-mini">{item.nickname || '작성자'}</span>
                                            </div>
                                            <span className="view-count">조회수: {item.views || 0}</span>
                                        </div>

                                        <div className="demand-product-title">{item.title}</div>

                                        {item.hashtag && item.hashtag.trim() && (
                                            <div className="tags-list">
                                                {item.hashtag
                                                    .split(',')
                                                    .map((tag) => tag.trim())
                                                    .filter((tag) => tag.length > 0)
                                                    .map((tag, idx) => (
                                                        <span key={idx} className="tag-item">
                              #{tag}
                            </span>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                </div>

                <div className="pagination">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i)}
                            style={{
                                margin: '0 5px',
                                padding: '6px 10px',
                                backgroundColor: i === page ? '#333' : '#eee',
                                color: i === page ? '#fff' : '#000',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Demand;
