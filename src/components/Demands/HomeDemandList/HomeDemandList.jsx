import React, { useCallback, useEffect, useState } from 'react';
import _ from 'lodash';
import { CgProfile } from 'react-icons/cg';
import { FaHeart } from 'react-icons/fa';
import { SlSocialDropbox } from 'react-icons/sl';
import { Link, useLocation } from 'react-router-dom';
import Demand1 from '../../../assets/demands/demand1.jpg';
import '../Demand/Demand.css';
// import Category from '../../public/Category/Category';
// import SearchBanner from "../../public/SearchBanner.jsx";
// import Spacer from "../../public/Spacer.jsx";

const getFullThumbnailUrl = (thumbnailUrl) =>
    thumbnailUrl
        ? thumbnailUrl.startsWith('http')
            ? thumbnailUrl
            : `http://localhost:8080/${thumbnailUrl.replace(/^\/+/,'')}`
        : Demand1;

const Demand = ({ showBanner = true }) => {
    const location = useLocation();
    const { formData } = location.state || {};

    const [demandProducts, setDemandProducts] = useState([]);
    const [liked, setLiked] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState(0);
    const [orderBy, setOrderBy] = useState('old');
    const [includeExpired, setIncludeExpired] = useState(true);
    const [includeScheduled, setIncludeScheduled] = useState(true);

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 10;

    // Sale와 동일하게, 검색/필터 변경마다 상품 불러오기
    const fetchDemandProducts = useCallback(
        _.debounce(async () => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams({
                    query: searchTerm,
                    category,
                    order_by: orderBy,
                    include_expired: includeExpired.toString(),
                    include_scheduled: includeScheduled.toString(),
                    page: page.toString(),
                    page_size: pageSize.toString(),
                });
                const url = `http://localhost:8080/demand?${params.toString()}`;
                const res = await fetch(url);
                if (!res.ok) throw new Error('서버 응답 에러');
                const data = await res.json();
                const productsArr = Array.isArray(data.content) ? data.content : [];
                setDemandProducts(productsArr);
                setLiked(new Array(productsArr.length).fill(false));
                setTotalPages(data.totalPages || 1);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }, 500),
        [searchTerm, category, orderBy, includeExpired, includeScheduled, page]
    );

    useEffect(() => {
        fetchDemandProducts();
        return fetchDemandProducts.cancel;
    }, [fetchDemandProducts]);

    useEffect(() => {
        const storedLiked = localStorage.getItem('demandLiked');
        if (storedLiked) setLiked(JSON.parse(storedLiked));
    }, [formData]);

    if (error) return <div>에러 발생: {error}</div>;

    const filteredProducts = demandProducts.filter(item => {
        const query = searchTerm.toLowerCase();
        return item.title?.toLowerCase().includes(query) ||
            item.hashtag?.toLowerCase().includes(query) ||
            item.nickname?.toLowerCase().includes(query);
    });

    const isSearching = searchTerm.trim().length > 0;

    return (
        <div className="container">
            <div className="demand-container">
                {/* 1. 검색, 카테고리, Divider */}
                {/*{showBanner && (*/}
                {/*    <>*/}
                {/*        <Spacer height={20} />*/}
                {/*        <SearchBanner*/}
                {/*            title="수요조사 검색:"*/}
                {/*            placeholder="수요조사 검색"*/}
                {/*            searchQuery={searchTerm}*/}
                {/*            setSearchQuery={setSearchTerm}*/}
                {/*            handleSearchKeyPress={(e) => {*/}
                {/*                if (e.key === 'Enter') console.log('검색어:', searchTerm);*/}
                {/*            }}*/}
                {/*        />*/}
                {/*        <Category gap={90} />*/}
                {/*    </>*/}
                {/*/!*)}*!/*/}
                {/*<hr className="sale-divider" />*/}

                {/* 2. 헤더 (Sale과 동일 위치) */}
                {showBanner && !isSearching && (
                    <div className="demand-header">
                        <div className="demand-icon">
                            <SlSocialDropbox className="demandbox-icon" />
                            <FaHeart className="heart-icon" />
                        </div>
                        <h2 className="demand-heading">수요조사</h2>
                    </div>
                )}

                {/* 3. 상품 그리드 (Sale의 sale-grid → demand-grid) */}
                <div className="demand-grid">
                    {loading && (
                        <div className="loading-box" style={{
                            textAlign: 'center',
                            margin: '40px 0',
                            fontSize: '18px',
                            color: '#888'
                        }}>🔄 로딩중입니다...</div>
                    )}
                    {!loading && (isSearching ? filteredProducts : demandProducts).length === 0 && (
                        <div className="no-search-result" style={{
                            textAlign: 'center',
                            margin: '40px 0',
                            fontSize: '18px',
                            color: '#888'
                        }}>
                            "{searchTerm}"에 대한 검색 결과가 없습니다.
                        </div>
                    )}

                    {!loading && (isSearching ? filteredProducts : demandProducts).map((item, idx) => (
                        <div key={item.id || idx} className="demand-card">
                            <Link to={`/demandDetail/${item.id.replace(/^DEMAND_/, '')}`} state={{
                                product: item,
                                saleLabel: '수요거래',
                                products: demandProducts
                            }}>
                                <img
                                    src={getFullThumbnailUrl(item.thumbnailUrl)}
                                    alt={item.title}
                                    className="demand-image"
                                />
                            </Link>
                            <span className="demand-label">수요조사</span>
                            <button
                                className={`demand-like-button ${liked[idx] ? 'liked' : ''}`}
                                onClick={() => {
                                    const newLiked = [...liked];
                                    newLiked[idx] = !newLiked[idx];
                                    setLiked(newLiked);
                                    localStorage.setItem('demandLiked', JSON.stringify(newLiked));
                                }}
                            >
                                <FaHeart size={18} />
                            </button>
                            <div className="demand-profile-block">
                                <div className="demand-profile-row">
                                    {item.profileUrl ? (
                                        <img
                                            src={item.profileUrl}
                                            alt="profile"
                                            className="profile-pic"
                                        />
                                    ) : (
                                        <CgProfile className="profile-pic" />
                                    )}
                                    <span className="demand-user-name-mini">{item.nickname}</span>
                                </div>
                                <div className="demand-product-title">{item.title}</div>
                            </div>
                            {item.hashtag && (
                                <div className="tags-container">
                                    <div className="tags-list">
                                        {item.hashtag
                                            .split(',')
                                            .map(tag => tag.trim())
                                            .filter(tag => tag.length > 0)
                                            .map((tag, tIdx) => (
                                                <span key={tIdx} className="tag-item">#{tag}</span>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* 4. 페이지네이션 */}
                {/*<div className="pagination" style={{ textAlign: 'center', marginTop: '30px' }}>*/}
                {/*    {Array.from({ length: totalPages }, (_, i) => (*/}
                {/*        <button*/}
                {/*            key={i}*/}
                {/*            onClick={() => setPage(i)}*/}
                {/*            style={{*/}
                {/*                margin: '0 5px',*/}
                {/*                padding: '6px 10px',*/}
                {/*                backgroundColor: i === page ? '#333' : '#eee',*/}
                {/*                color: i === page ? '#fff' : '#000',*/}
                {/*                border: 'none',*/}
                {/*                borderRadius: '4px',*/}
                {/*                cursor: 'pointer'*/}
                {/*            }}*/}
                {/*        >*/}
                {/*            {i + 1}*/}
                {/*        </button>*/}
                {/*    ))}*/}
                {/*</div>*/}
            </div>
        </div>
    );
};

export default Demand;
