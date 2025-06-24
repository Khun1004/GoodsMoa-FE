import React, { useCallback, useEffect, useState } from 'react';
import _ from 'lodash';
import { CgProfile } from 'react-icons/cg';
import { FaHeart } from 'react-icons/fa';
import { SlSocialDropbox } from 'react-icons/sl';
import { Link, useLocation } from 'react-router-dom';
import welcomeVideo from '../../../assets/demandWelcome.mp4';
import Demand1 from '../../../assets/demands/demand1.jpg';
import '../Demand/Demand.css';

// 새로 만든 컴포넌트 import
// import DemandSearchBar from '../DemandSearchBar/DemandSearchBar.jsx';

const categoryOptions = [
    { id: 0, name: '전체' },
    { id: 1, name: '애니메이션' },
    { id: 2, name: '아이돌' },
    { id: 3, name: '순수창작' },
    { id: 4, name: '게임' },
    { id: 5, name: '영화' },
    { id: 6, name: '드라마' },
    { id: 7, name: '웹소설' },
    { id: 8, name: '웹툰' },
];

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
    const [savedDemandFormData, setSavedDemandFormData] = useState(null);

    // ↓↓↓ 이 부분이 검색바에 넘겨줄 state
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState(0); // id가 number면 number로!
    const [orderBy, setOrderBy] = useState('old');
    const [includeExpired, setIncludeExpired] = useState(true);
    const [includeScheduled, setIncludeScheduled] = useState(true);
    // ↑↑↑

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 10;

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

    return (
        <div className="container">
            <div className="demand-container">
                {/* 검색/필터 컴포넌트 분리 */}
                {/*<DemandSearchBar*/}
                {/*    category={category}*/}
                {/*    setCategory={setCategory}*/}
                {/*    searchTerm={searchTerm}*/}
                {/*    setSearchTerm={setSearchTerm}*/}
                {/*    orderBy={orderBy}*/}
                {/*    setOrderBy={setOrderBy}*/}
                {/*    includeExpired={includeExpired}*/}
                {/*    setIncludeExpired={setIncludeExpired}*/}
                {/*    includeScheduled={includeScheduled}*/}
                {/*    setIncludeScheduled={setIncludeScheduled}*/}
                {/*    categoryOptions={categoryOptions}*/}
                {/*/>*/}

                {/* 이하 기존 코드 동일! */}
                <div className="demandProductFrame">
                    {/*<div className="demand-header">*/}
                    {/*    <div className="demand-icon">*/}
                    {/*        <SlSocialDropbox className="demandbox-icon"/>*/}
                    {/*        <FaHeart className="heart-icon"/>*/}
                    {/*    </div>*/}
                    {/*    <h2 className="demand-heading">수요조사</h2>*/}
                    {/*</div>*/}

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
                                                    className={`demand-like-button ${liked[globalIndex] ? 'liked' : ''}`}
                                                    onClick={() => {
                                                        const newLiked = [...liked];
                                                        newLiked[globalIndex] = !newLiked[globalIndex];
                                                        setLiked(newLiked);
                                                        localStorage.setItem('demandLiked', JSON.stringify(newLiked));
                                                    }}>
                                                    <FaHeart size={18}/>
                                                </button>
                                                <p
                                                    className="demand-product-name"
                                                    style={{
                                                        fontWeight: "bold",
                                                        fontSize: "1.5rem",
                                                        margin: 0,
                                                        lineHeight: 1.3,
                                                        maxWidth: "13em",         // 글자 10~11자 정도 너비 (글꼴 따라 조정)
                                                        overflow: "hidden",
                                                        whiteSpace: "nowrap",
                                                        textOverflow: "ellipsis",
                                                        display: "block",         // 필요 시 명확히 block으로
                                                    }}
                                                    title={item.title} // 전체 제목 툴팁
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
                                                                    marginRight: "8px",    // 태그끼리 간격
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

                {/*<div className="pagination" style={{textAlign: 'center', marginTop: '30px'}}>*/}
                {/*    {Array.from({length: totalPages}, (_, i) => (*/}
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
