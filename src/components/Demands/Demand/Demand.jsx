// 리액트 훅과 외부 라이브러리 import
import React, { useEffect, useState, useCallback } from 'react';
import { CgProfile } from 'react-icons/cg';
import { FaHeart } from 'react-icons/fa';
import { SlSocialDropbox } from 'react-icons/sl';
import { Link, useLocation } from 'react-router-dom';
import welcomeVideo from '../../../assets/demandWelcome.mp4';
import Demand1 from '../../../assets/demands/demand1.jpg';
import './Demand.css';
import _ from 'lodash';

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
            : `http://localhost:8080/${thumbnailUrl.replace(/^\/+/, '')}`
        : Demand1;

const Demand = ({ showBanner = true }) => {
    const location = useLocation();
    const { formData } = location.state || {};

    const [demandProducts, setDemandProducts] = useState([]);
    const [liked, setLiked] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('0');
    const [orderBy, setOrderBy] = useState('old');
    const [includeExpired, setIncludeExpired] = useState(true);
    const [includeScheduled, setIncludeScheduled] = useState(true);

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
                    page: '0',
                    page_size: '50',
                });
                const url = `http://localhost:8080/demand?${params.toString()}`;
                const res = await fetch(url);
                if (!res.ok) throw new Error('서버 응답 에러');
                const data = await res.json();
                const productsArr = Array.isArray(data.content) ? data.content : [];
                setDemandProducts(productsArr);
                setLiked(new Array(productsArr.length).fill(false));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }, 500),
        [searchTerm, category, orderBy, includeExpired, includeScheduled]
    );

    useEffect(() => {
        fetchDemandProducts();
        return fetchDemandProducts.cancel;
    }, [fetchDemandProducts]);

    useEffect(() => {
        const storedLiked = localStorage.getItem('demandLiked');
        if (storedLiked) setLiked(JSON.parse(storedLiked));
        const storedFormData = localStorage.getItem('demandFormData');
        if (storedFormData) setSavedDemandFormData(JSON.parse(storedFormData));
    }, [formData]);

    const handleSearchChange = (e) => setSearchTerm(e.target.value);
    const handleCategoryChange = (selectedCategory) => setCategory(selectedCategory);

    if (error) return <div>에러 발생: {error}</div>;

    return (
        <div className="container">
            <div className="demand-container">
                {showBanner && (
                    <div className="demand-banner">
                        <video autoPlay loop muted playsInline className="demand-video" disablePictureInPicture onContextMenu={(e) => e.preventDefault()}>
                            <source src={welcomeVideo} type="video/mp4" />
                        </video>
                    </div>
                )}

                <div className="search-bar-and-filters" style={{ marginTop: '20px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div className="filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {categoryOptions.map((option) => (
                            <button key={option.id} className={`category-button ${category === option.id ? 'selected' : ''}`} onClick={() => handleCategoryChange(option.id)}>
                                {option.name}
                            </button>
                        ))}
                    </div>
                    <input
                        type="text"
                        placeholder="원하는 상품 검색하기"
                        className="demand-search-input"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        style={{ flexGrow: 1, padding: '8px 12px', fontSize: '14px' }}
                    />
                </div>

                <div className="demandProductFrame">
                    <div className="demand-header">
                        <div className="demand-icon">
                            <SlSocialDropbox className="demandbox-icon" />
                            <FaHeart className="heart-icon" />
                        </div>
                        <h2 className="demand-heading">수요거래 제품</h2>
                    </div>

                    {loading && <div className="loading-box" style={{ textAlign: 'center', margin: '40px 0', fontSize: '18px', color: '#888' }}>🔄 로딩중입니다...</div>}
                    {!loading && demandProducts.length === 0 && <div className="no-search-result" style={{ textAlign: 'center', margin: '40px 0', fontSize: '18px', color: '#888' }}>검색결과 없음</div>}

                    {!loading && demandProducts.length > 0 && (
                        [...Array(Math.ceil(demandProducts.length / 5))].map((_, frameIndex) => (
                            <div key={frameIndex} className={`demandFrame demandFrame-${frameIndex}`}>
                                <div className="demand-grid">
                                    {demandProducts.slice(frameIndex * 5, frameIndex * 5 + 5).map((item, index) => {
                                        const globalIndex = frameIndex * 5 + index;
                                        return (
                                            <div key={item.id || globalIndex} className="demand-card">
                                                <div className="demand-profile-info">
                                                    {item.profileUrl ? (
                                                        <img src={item.profileUrl} alt="profile" className="profile-pic" />
                                                    ) : (
                                                        <CgProfile className="profile-pic" />
                                                    )}
                                                    <p className="user-name">{item.nickname}</p>
                                                </div>
                                                <Link to={`/demandDetail/${item.id.replace(/^DEMAND_/, '')}`} state={{ product: item, saleLabel: '수요거래', products: demandProducts }}>
                                                    <img src={getFullThumbnailUrl(item.thumbnailUrl)} alt={item.title} className="demand-image" />
                                                </Link>
                                                <span className="demand-label">수요거래</span>
                                                <button className={`demand-like-button ${liked[globalIndex] ? 'liked' : ''}`} onClick={() => {
                                                    const newLiked = [...liked];
                                                    newLiked[globalIndex] = !newLiked[globalIndex];
                                                    setLiked(newLiked);
                                                    localStorage.setItem('demandLiked', JSON.stringify(newLiked));
                                                }}>
                                                    <FaHeart size={18} />
                                                </button>
                                                <p className="demand-product-name">{item.title}</p>
                                                <p>{item.hashtag}</p>
                                                <p>조회수:{item.views}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Demand;
