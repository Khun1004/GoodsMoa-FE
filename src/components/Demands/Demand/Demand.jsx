import React, { useEffect, useState, useCallback } from 'react';
import { CgProfile } from "react-icons/cg";
import { FaHeart } from 'react-icons/fa';
import { SlSocialDropbox } from "react-icons/sl";
import { Link, useLocation } from 'react-router-dom';
import welcomeVideo from '../../../assets/demandWelcome.mp4';
import Demand1 from '../../../assets/demands/demand1.jpg';
import './Demand.css';
import _ from 'lodash';

const categoryOptions = [
    { id: 0, name: "전체" },
    { id: 1, name: "애니메이션" },
    { id: 2, name: "아이돌" },
    { id: 3, name: "순수창작" },
    { id: 4, name: "게임" },
    { id: 5, name: "영화" },
    { id: 6, name: "드라마" },
    { id: 7, name: "웹소설" },
    { id: 8, name: "웹툰" },
];

// 썸네일 경로에 항상 백엔드 주소 붙이기
const getFullThumbnailUrl = (thumbnailUrl) =>
    thumbnailUrl
        ? thumbnailUrl.startsWith('http')
            ? thumbnailUrl
            : `http://localhost:8080/${thumbnailUrl.replace(/^\/+/, '')}`
        : Demand1;

const Demand = ({ showBanner = true }) => {
    const userName = "사용자";
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

    const [isDemandSubmitted, setIsDemandSubmitted] = useState(false);
    const [savedDemandFormData, setSavedDemandFormData] = useState(null);

    // 서버 데이터 fetch (파라미터 및 변수명 모두 서버에 맞춤)
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
                    page_size: '10'
                });

                const url = `http://localhost:8080/demand?${params.toString()}`;
                const res = await fetch(url);
                if (!res.ok) throw new Error('서버 응답 에러');

                const data = await res.json();
                // 서버 응답이 { content: [...] } 형태임
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

    const handleSearchChange = (e) => setSearchTerm(e.target.value);
    const handleCategoryChange = (selectedCategory) => setCategory(selectedCategory);
    const handleOrderByChange = (e) => setOrderBy(e.target.value);
    const handleIncludeExpiredChange = (e) => setIncludeExpired(e.target.checked);
    const handleIncludeScheduledChange = (e) => setIncludeScheduled(e.target.checked);

    useEffect(() => {
        const storedLiked = localStorage.getItem('demandLiked');
        if (storedLiked) setLiked(JSON.parse(storedLiked));
        const storedFormData = localStorage.getItem('demandFormData');
        if (storedFormData) setSavedDemandFormData(JSON.parse(storedFormData));
    }, [formData]);

    const firstFive = demandProducts.slice(0, 5);
    const nextFive = demandProducts.slice(5, 10);

    if (loading) return <div>로딩중...</div>;
    if (error) return <div>에러 발생: {error}</div>;

    return (
        <div className='container'>
            <div className="demand-container">
                {showBanner && (
                    <div className="demand-banner">
                        <video
                            autoPlay loop muted playsInline
                            className="demand-video"
                            disablePictureInPicture
                            onContextMenu={(e) => e.preventDefault()}
                        >
                            <source src={welcomeVideo} type="video/mp4" />
                        </video>
                    </div>
                )}

                <div className="search-bar-and-filters" style={{ marginTop: '20px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div className="filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {categoryOptions.map(option => (
                            <button
                                key={option.id}
                                className={`category-button ${category === option.id ? 'selected' : ''}`}
                                onClick={() => handleCategoryChange(option.id)}
                            >
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
                <div className='demandProductFrame'>
                    <div className='demand-header'>
                        <div className='demand-icon'>
                            <SlSocialDropbox className='demandbox-icon' />
                            <FaHeart className='heart-icon' />
                        </div>
                        <h2 className="demand-heading">수요거래 제품</h2>
                    </div>
                    {/* 검색 결과 없을 때 메시지 */}
                    {demandProducts.length === 0 ? (
                        <div className="no-search-result" style={{ textAlign: 'center', margin: '40px 0', fontSize: '18px', color: '#888' }}>
                            검색결과 없음
                        </div>
                    ) : (
                        <>
                            {/* 첫 줄 */}
                            <div className='demandFrame1'>
                                <div className="demand-grid">
                                    {firstFive.map((item, index) => (
                                        <div key={item.id || index} className="demand-card">
                                            <div className="demand-profile-info">
                                                {item.profileUrl ? (
                                                    <img src={item.profileUrl} alt="profile" className="profile-pic" />
                                                ) : (
                                                    <CgProfile className="profile-pic" />
                                                )}
                                                <p className="user-name">{item.nickname}</p>
                                            </div>
                                            <Link
                                                to={`/demandDetail/${item.id.replace(/^DEMAND_/, '')}`}
                                                state={{ product: item, saleLabel: "수요거래", products: demandProducts }}
                                            >
                                                <img src={getFullThumbnailUrl(item.thumbnailUrl)} alt={item.title} className="demand-image" />
                                            </Link>
                                            <span className="demand-label">수요거래</span>
                                            <button
                                                className={`demand-like-button ${liked[index] ? 'liked' : ''}`}
                                                onClick={() => {
                                                    const newLiked = [...liked];
                                                    newLiked[index] = !newLiked[index];
                                                    setLiked(newLiked);
                                                    localStorage.setItem('demandLiked', JSON.stringify(newLiked));
                                                }}
                                            >
                                                <FaHeart size={18} />
                                            </button>
                                            <p className="demand-product-name">{item.title}</p>
                                            <p>{item.hashtag}</p>
                                            <p>조회수:{item.views}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* 두 번째 줄 */}
                            <div className='demandFrame2'>
                                <div className="demand-grid">
                                    {nextFive.map((item, index) => (
                                        <div key={item.id || index} className="demand-card">
                                            <div className="demand-profile-info">
                                                {item.profileUrl ? (
                                                    <img src={item.profileUrl} alt="profile" className="profile-pic" />
                                                ) : (
                                                    <CgProfile className="profile-pic" />
                                                )}
                                                <p className="user-name">{item.nickname}</p>
                                            </div>
                                            <Link
                                                to={`/demandDetail/${item.id.replace(/^DEMAND_/, '')}`}
                                                state={{ product: item, saleLabel: "수요거래", products: demandProducts }}
                                            >
                                                <img src={getFullThumbnailUrl(item.thumbnailUrl)} alt={item.title} className="demand-image" />
                                            </Link>
                                            <span className="demand-label">수요거래</span>
                                            <button
                                                className={`demand-like-button ${liked[5 + index] ? 'liked' : ''}`}
                                                onClick={() => {
                                                    const newLiked = [...liked];
                                                    newLiked[5 + index] = !newLiked[5 + index];
                                                    setLiked(newLiked);
                                                    localStorage.setItem('demandLiked', JSON.stringify(newLiked));
                                                }}
                                            >
                                                <FaHeart size={18} />
                                            </button>
                                            <p className="demand-product-name">{item.title}</p>
                                            <p>{item.hashtag}</p>
                                            <p>조회수:{item.views}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* "내가 만든 수요조사 제품" 섹션 */}
                    <div className='demandFrame3'>
                        <div className='demand-header'>
                            <div className='demand-icon'>
                                <SlSocialDropbox className='demandbox-icon' />
                                <FaHeart className='heart-icon' />
                            </div>
                            <h2 className="demand-heading">내가 만든 수요조사 제품</h2>
                        </div>

                        {isDemandSubmitted && savedDemandFormData ? (
                            <div className="demand-grid">
                                <div className="demand-card">
                                    <div className="profile-info">
                                        <CgProfile className="profile-pic" />
                                        <p className="user-name">{userName}</p>
                                    </div>
                                    <img
                                        src={savedDemandFormData.mainThumbnail || Demand1}
                                        className="demand-image"
                                        alt={savedDemandFormData.title || "내 수요조사"}
                                    />
                                    <span className="demand-label">수요거래</span>
                                    <button
                                        className={`demand-like-button ${liked[0] ? 'liked' : ''}`}
                                        onClick={() => {
                                            const newLiked = [...liked];
                                            newLiked[0] = !newLiked[0];
                                            setLiked(newLiked);
                                            localStorage.setItem('demandLiked', JSON.stringify(newLiked));
                                        }}
                                    >
                                        <FaHeart size={18} />
                                    </button>
                                    <p className="demand-product-name">{savedDemandFormData.title || "내 수요조사"}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="no-demand-message">
                                <p>아직 등록한 수요조사 상품이 없습니다.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Demand;
