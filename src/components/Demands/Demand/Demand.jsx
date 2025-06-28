import React, { useCallback, useEffect, useState } from 'react';
import _ from 'lodash';
import { CgProfile } from 'react-icons/cg';
import { FaHeart } from 'react-icons/fa';
import { SlSocialDropbox } from 'react-icons/sl';
import { Link, useLocation } from 'react-router-dom';
import Demand1 from '../../../assets/demands/demand1.jpg';
import './Demand.css';
import Category from '../../public/Category/Category';
import SearchBanner from "../../public/SearchBanner.jsx";
import Spacer from "../../public/Spacer.jsx";
import api from '../../../api/api'; // axios 인스턴스

const getFullThumbnailUrl = (thumbnailUrl) =>
    thumbnailUrl
        ? thumbnailUrl.startsWith('http')
            ? thumbnailUrl
            : `http://localhost:8080/${thumbnailUrl.replace(/^\/+/,'')}`
        : Demand1;

// 숫자만 추출 (DEMAND_2 → 2)
const getNumericId = (id) => {
    if (typeof id === 'string' && id.startsWith('DEMAND_')) {
        return id.replace('DEMAND_', '');
    }
    return id;
};

const Demand = ({ showBanner = true }) => {
    const location = useLocation();
    const { formData } = location.state || {};

    const [demandProducts, setDemandProducts] = useState([]);
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

    // 상품 불러오기
    const fetchDemandProducts = useCallback(
        _.debounce(async () => {
            setLoading(true);
            setError(null);
            try {
                const params = {
                    query: searchTerm,
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
                // *** 상품 배열 전체 로그 찍기 ***
                console.log('[불러온 demandProducts]', productsArr);
                setDemandProducts(productsArr);
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

    // demandProducts가 갱신될 때마다 콘솔에 전체 로그 찍기
    useEffect(() => {
        console.log('[렌더 직전 demandProducts]', demandProducts);
    }, [demandProducts]);

    if (error) return <div>에러 발생: {error}</div>;

    const filteredProducts = demandProducts.filter(item => {
        const query = searchTerm.toLowerCase();
        return item.title?.toLowerCase().includes(query) ||
            item.hashtag?.toLowerCase().includes(query) ||
            item.nickname?.toLowerCase().includes(query);
    });

    const isSearching = searchTerm.trim().length > 0;

    // 좋아요 버튼 클릭 핸들러 (리스트의 liked를 직접 토글)
    const handleLike = async (id) => {
        const numericId = getNumericId(id);
        try {
            await api.post(`/demand/like/${numericId}`);
            setDemandProducts(prev =>
                prev.map(item =>
                    item.id === id
                        ? { ...item, liked: !item.liked }
                        : item
                )
            );
            // *** 좋아요 누른 뒤 해당 id, liked 상태 콘솔 출력 ***
            const target = demandProducts.find(item => item.id === id);
            console.log(`[좋아요 클릭] id: ${id}, liked(before): ${target ? target.liked : 'N/A'}`);
        } catch (err) {
            alert('좋아요 처리 실패: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="container">
            <div className="demand-container">
                {showBanner && (
                    <>
                        <Spacer height={20} />
                        <SearchBanner
                            title="수요조사 검색:"
                            placeholder="수요조사 검색"
                            searchQuery={searchTerm}
                            setSearchQuery={setSearchTerm}
                            handleSearchKeyPress={(e) => {
                                if (e.key === 'Enter') console.log('검색어:', searchTerm);
                            }}
                        />
                        <Category gap={90} />
                    </>
                )}
                <hr className="sale-divider" />

                {showBanner && !isSearching && (
                    <div className="demand-header">
                        <div className="demand-icon">
                            <SlSocialDropbox className="demandbox-icon" />
                            <FaHeart className="heart-icon" />
                        </div>
                        <h2 className="demand-heading">수요조사</h2>
                    </div>
                )}

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

                    {!loading && (isSearching ? filteredProducts : demandProducts).map((item, idx) => {
                        // *** 렌더링 시점에 각 item의 liked, id, title 로그 찍기 ***
                        console.log(`[렌더링] idx:${idx}, id:${item.id}, liked:${item.liked}, title:${item.title}`);
                        return (
                            <div key={item.id || idx} className="demand-card">
                                <Link to={`/demandDetail/${getNumericId(item.id)}`} state={{
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
                                    className={`demand-like-button${item.liked ? ' liked' : ''}`}
                                    onClick={() => handleLike(item.id)}
                                >
                                    <FaHeart size={18}/>
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
                        )})}
                </div>

                <div className="pagination" style={{ textAlign: 'center', marginTop: '30px' }}>
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
                                cursor: 'pointer'
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
