import React, { useCallback, useEffect, useState } from 'react';
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
import api from '../../../api/api'; // axios 인스턴스

const getFullThumbnailUrl = (thumbnailUrl) =>
    thumbnailUrl
        ? thumbnailUrl.startsWith('http')
            ? thumbnailUrl
            : `http://localhost:8080/${thumbnailUrl.replace(/^\/+/, '')}`
        : Demand1;

const getNumericId = (id) => {
    if (typeof id === 'string' && id.startsWith('DEMAND_')) {
        return id.replace('DEMAND_', '');
    }
    return id;
};

const Demand = ({ showBanner = true }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { formData } = location.state || {};

    const [demandProducts, setDemandProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState(0);
    const [orderBy, setOrderBy] = useState('latest');
    const [includeExpired, setIncludeExpired] = useState(true);
    const [includeScheduled, setIncludeScheduled] = useState(true);

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 10;

    const sortOptions = [
        { label: '최신순', value: 'latest' },
        { label: '인기순', value: 'popular' },
        { label: '찜순', value: 'likes' },
        { label: '등록일순', value: 'createdAt' },
        { label: '마감임박순', value: 'deadline' }, // ✅ 추가됨
    ];

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

    const filteredProducts = demandProducts.filter(item => {
        const query = searchTerm.toLowerCase();
        return item.title?.toLowerCase().includes(query) ||
            item.hashtag?.toLowerCase().includes(query) ||
            item.nickname?.toLowerCase().includes(query);
    });

    const isSearching = searchTerm.trim().length > 0;

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
                        <hr className="sale-divider" />

                        {!isSearching && (
                            <BestsellerList
                                apiFn={getBestsellerByType}
                                type="demand"
                                heading="인기 수요조사"
                                liked={{}} // 수요조사는 server liked 따로 없음
                                onLike={handleLike}
                                onCardClick={(item) => navigate(`/demandDetail/${getNumericId(item.id)}`, { state: { product: item } })}
                            />
                        )}
                    </>
                )}

                <div className="demand-header">
                    <div className="demand-icon">
                        <SlSocialDropbox className="demandbox-icon" />
                        <FaHeart className="heart-icon" />
                    </div>
                    <h2 className="demand-heading">수요조사</h2>
                    <div style={{ marginLeft: 'auto' }}>
                        <SortSelect
                            options={sortOptions}
                            selected={orderBy}
                            onChange={setOrderBy}
                        />
                    </div>
                </div>

                <div className="demand-grid">
                    {loading && (
                        <div className="loading-box">🔄 로딩중입니다...</div>
                    )}
                    {!loading && (isSearching ? filteredProducts : demandProducts).length === 0 && (
                        <div className="no-search-result">
                            "{searchTerm}"에 대한 검색 결과가 없습니다.
                        </div>
                    )}

                    {!loading && (isSearching ? filteredProducts : demandProducts).map((item, idx) => (
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
                                <FaHeart size={18} />
                            </button>

                            <div className="demand-profile-block">
                                <div className="demand-profile-line">
                                    <div className="demand-profile-row">
                                        {item.userImage ? (
                                            <img
                                                src={item.userImage}
                                                alt="profile"
                                                className="profile-pic"
                                            />
                                        ) : (
                                            <CgProfile className="profile-pic"/>
                                        )}
                                        <span className="demand-user-name-mini">{item.userNickName || '작성자'}</span>
                                    </div>
                                    <span className="view-count">조회 {item.views || 0}</span>
                                </div>

                                <div className="demand-product-title">{item.title}</div>

                                {item.hashtag && item.hashtag.trim() && (
                                    <div className="tags-list">
                                        {item.hashtag
                                            .split(',')
                                            .map(tag => tag.trim())
                                            .filter(tag => tag.length > 0)
                                            .map((tag, idx) => (
                                                <span key={idx} className="tag-item">#{tag}</span>
                                            ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pagination">
                    {Array.from({length: totalPages}, (_, i) => (
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
