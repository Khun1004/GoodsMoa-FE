import React, { useCallback, useEffect, useState } from 'react';
import _ from 'lodash';
import { CgProfile } from 'react-icons/cg';
import { FaHeart } from 'react-icons/fa';
import { SlSocialDropbox } from 'react-icons/sl';
import { Link, useLocation } from 'react-router-dom';
import Demand1 from '../../../assets/demands/demand1.jpg';
import './Demand.css';

import api from '../../../api/api';

import Category from '../../public/Category/Category';
import SearchBanner from "../../public/SearchBanner.jsx";
import Spacer from "../../public/Spacer.jsx";

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

    // 좋아요 상태는 demandProducts의 liked 값을 직접 사용
    // 단, 토글 시 해당 demandProducts를 직접 수정
    const getDemandProducts = useCallback(
        _.debounce(async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await api.get('/demand', {
                    params: {
                        query: searchTerm,
                        category,
                        order_by: orderBy,
                        include_expired: includeExpired.toString(),
                        include_scheduled: includeScheduled.toString(),
                        page: page.toString(),
                        page_size: pageSize.toString(),
                    }
                });
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
        getDemandProducts();
        return getDemandProducts.cancel;
    }, [getDemandProducts]);

    if (error) return <div>에러 발생: {error}</div>;

    // 좋아요 토글 함수 (제품 배열 직접 카피 & 수정)
    const handleLikeClick = async (product, idx) => {
        const demandId = product.id.replace(/^DEMAND_/, '');
        // 1. optimistic update
        const newProducts = [...demandProducts];
        const prevLiked = newProducts[idx].liked;
        newProducts[idx] = { ...newProducts[idx], liked: !prevLiked };
        setDemandProducts(newProducts);

        try {
            // 2. POST 요청 (항상 POST만)
            await api.post(`/demand/like/${demandId}`);
        } catch (err) {
            // 3. 실패시 롤백
            newProducts[idx] = { ...newProducts[idx], liked: prevLiked };
            setDemandProducts(newProducts);
            alert('좋아요 처리 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="container">
            <div className="demand-container">
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
                <Category
                    gap={90}
                    onCategoryClick={(id) => setCategory(id)}
                    selectedId={category}
                />

                <hr className="sale-divider" />

                <div className="demandProductFrame">
                    <div className="demand-header">
                        <div className="demand-icon">
                            <SlSocialDropbox className="demandbox-icon"/>
                            <FaHeart className="heart-icon"/>
                        </div>
                        <h2 className="demand-heading">수요조사</h2>
                    </div>

                    {loading && <div className="loading-box"
                                     style={{textAlign: 'center', margin: '40px 0', fontSize: '18px', color: '#888'}}>🔄
                        로딩중입니다...</div>}
                    {!loading && demandProducts.length === 0 && <div className="no-search-result" style={{
                        textAlign: 'center',
                        margin: '40px 0',
                        fontSize: '18px',
                        color: '#888'
                    }}>검색결과 없음</div>}

                    {!loading && demandProducts.length > 0 && (
                        [...Array(Math.ceil(demandProducts.length / 5))].map((_, frameIndex) => (
                            <div key={frameIndex} className={`demandFrame demandFrame-${frameIndex}`}>
                                <div className="demand-grid">
                                    {demandProducts.slice(frameIndex * 5, frameIndex * 5 + 5).map((item, index) => {
                                        const globalIndex = frameIndex * 5 + index;
                                        return (
                                            <div key={item.id || globalIndex} className="demand-card">

                                                <Link to={`/demandDetail/${item.id.replace(/^DEMAND_/, '')}`} state={{
                                                    product: item,
                                                    saleLabel: '수요거래',
                                                    products: demandProducts
                                                }}>
                                                    <img src={getFullThumbnailUrl(item.thumbnailUrl)} alt={item.title}
                                                         className="demand-image"/>
                                                </Link>
                                                <span className="demand-label">수요조사</span>
                                                <button
                                                    className={`demand-like-button ${item.liked ? 'liked' : ''}`}
                                                    onClick={() => handleLikeClick(item, globalIndex)}
                                                >
                                                    <FaHeart size={18}/>
                                                </button>
                                                <p
                                                    className="demand-product-name"
                                                    style={{
                                                        fontWeight: "bold",
                                                        fontSize: "1.5rem",
                                                        margin: 0,
                                                        lineHeight: 1.3,
                                                        maxWidth: "13em",
                                                        overflow: "hidden",
                                                        whiteSpace: "nowrap",
                                                        textOverflow: "ellipsis",
                                                        display: "block",
                                                    }}
                                                    title={item.title}
                                                >
                                                    {item.title}
                                                </p>

                                                <div>
                                                    {item.hashtag
                                                        .split(',')
                                                        .map(tag => tag.trim())
                                                        .filter(tag => tag.length > 0)
                                                        .map((tag, idx) => (
                                                            <span
                                                                key={idx}
                                                                style={{
                                                                    background: "#dedede",
                                                                    display: "inline-block",
                                                                    borderRadius: "20px",
                                                                    padding: "2px 10px",
                                                                    fontSize: "24px",
                                                                    textAlign: "center",
                                                                    minWidth: "80px",
                                                                    marginRight: "8px",
                                                                    fontWeight: "400",
                                                                }}
                                                            >
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                </div>

                                                <div className="demand-profile-info">
                                                    {item.profileUrl ? (
                                                        <img src={item.profileUrl} alt="profile"
                                                             className="profile-pic"/>
                                                    ) : (
                                                        <CgProfile className="profile-pic"/>
                                                    )}
                                                    {item.nickname}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="pagination" style={{textAlign: 'center', marginTop: '30px'}}>
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
