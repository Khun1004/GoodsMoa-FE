import React, { useEffect, useState } from 'react';
import { CgProfile } from "react-icons/cg";
import { FaHeart } from 'react-icons/fa';
import { SlSocialDropbox } from "react-icons/sl";
import { Link, useLocation } from 'react-router-dom';
import welcomeVideo from '../../../assets/demandWelcome.mp4';
import Demand1 from '../../../assets/demands/demand1.jpg';
import Demand10 from '../../../assets/demands/demand10.jpg';
import Demand2 from '../../../assets/demands/demand2.jpg';
import Demand3 from '../../../assets/demands/demand3.jpg';
import Demand4 from '../../../assets/demands/demand4.jpg';
import Demand5 from '../../../assets/demands/demand5.jpg';
import Demand6 from '../../../assets/demands/demand6.jpg';
import Demand7 from '../../../assets/demands/demand7.jpg';
import Demand8 from '../../../assets/demands/demand8.jpg';
import Demand9 from '../../../assets/demands/demand9.jpg';
import './Demand.css';

const Demand = ({ showBanner = true }) => {
    const userName = "사용자";
    
    const demands1 = [
        { id: 1, src: Demand1, name: "수요거래_1" },
        { id: 2, src: Demand2, name: "수요거래_2" },
        { id: 3, src: Demand3, name: "수요거래_3" },
        { id: 4, src: Demand4, name: "수요거래_4" },
        { id: 5, src: Demand5, name: "수요거래_5" }
    ];

    const demands2 = [
        { id: 6, src: Demand6, name: "수요거래_6" },
        { id: 7, src: Demand7, name: "수요거래_7" },
        { id: 8, src: Demand8, name: "수요거래_8" },
        { id: 9, src: Demand9, name: "수요거래_9" },
        { id: 10, src: Demand10, name: "수요거래_10" }
    ];

    const location = useLocation();
    const { formData } = location.state || {};

    const [userDemands, setUserDemands] = useState([]);
    const [isDemandSubmitted, setIsDemandSubmitted] = useState(false);
    const [savedDemandFormData, setSavedDemandFormData] = useState(null);
    const [liked, setLiked] = useState(Array(demands1.length + demands2.length).fill(false));
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        // 로컬 스토리지에서 데이터 불러오기
        const storedLiked = localStorage.getItem('demandLiked');
        if (storedLiked) {
            setLiked(JSON.parse(storedLiked));
        }

        const storedSubmission = localStorage.getItem('isDemandSubmitted');
        if (storedSubmission === 'true') {
            setIsDemandSubmitted(true);
        }

        const storedFormData = localStorage.getItem('demandFormData');
        if (storedFormData) {
            const parsedData = JSON.parse(storedFormData);
            setSavedDemandFormData(parsedData);

            if (parsedData.products && parsedData.products.length > 0) {
                const newUserDemands = parsedData.products.map((product, index) => ({
                    id: `user-${index}`,
                    src: product.thumbnail || Demand1,
                    name: product.name,
                    price: product.price,
                    quantity: product.quantity
                }));
                setUserDemands(newUserDemands);
            }
        }

        // location.state로 전달된 formData 처리
        if (formData) {
            localStorage.setItem('demandFormData', JSON.stringify(formData));
            setSavedDemandFormData(formData);
            setIsDemandSubmitted(true);
            
            if (formData.products && formData.products.length > 0) {
                const newUserDemands = formData.products.map((product, index) => ({
                    id: `user-${index}`,
                    src: product.thumbnail || Demand1,
                    name: product.name,
                    price: product.price,
                    quantity: product.quantity
                }));
                setUserDemands(newUserDemands);
            }
        }
    }, [formData]);

    const handleLike = (index) => {
        const newLiked = [...liked];
        newLiked[index] = !newLiked[index];
        setLiked(newLiked);
        localStorage.setItem('demandLiked', JSON.stringify(newLiked));

        const demandList = [...demands1, ...demands2];
        const selectedDemand = demandList[index];

        let likedDemands = JSON.parse(localStorage.getItem('likedDemands')) || [];

        if (newLiked[index]) {
            likedDemands.push(selectedDemand);
        } else {
            likedDemands = likedDemands.filter((demand) => demand.id !== selectedDemand.id);
        }

        localStorage.setItem('likedDemands', JSON.stringify(likedDemands));
    };

    return (
        <div className='container'>
            <div className="demand-container">
            {showBanner && (
                <div className="demand-banner">
                    <video 
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="demand-video"
                        disablePictureInPicture
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        <source src={welcomeVideo} type="video/mp4" />
                    </video>
                    <div className="demand-banner-content">
                        <h1 className="demand-title">🔍 원하는 상품을 찾아보세요 🔍</h1>
                        <input type="text" placeholder="원하는 상품 검색하기" className="demand-search-input" />
                    </div>
                </div>
            )}

            <div className='demandProductFrame'>
                <div className='demand-header'>
                    <div className='demand-icon'>
                        <SlSocialDropbox className='demandbox-icon' />
                        <FaHeart className='heart-icon' />
                    </div>
                    <h2 className="demand-heading">수요거래 제품</h2>
                </div>

                <div className='demandFrame1'>
                    <div className="demand-grid">
                        {demands1.map((item, index) => (
                            <div key={item.id} className="demand-card">
                                <div className="profile-info">
                                    <CgProfile className="profile-pic" />
                                    <p className="user-name">{userName}</p>
                                </div>
                                <Link to={`/demandDetail`} state={{ product: item, saleLabel: "수요거래" }}>
                                    <img src={item.src} alt={item.name} className="demand-image" />
                                </Link>
                                <span className="demand-label">수요거래</span>
                                <button 
                                    className={`demand-like-button ${liked[index] ? 'liked' : ''}`} 
                                    onClick={() => handleLike(index)}
                                >
                                    <FaHeart size={18} />
                                </button>
                                <p className="demand-product-name">{item.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='demandFrame2'>
                    <div className="demand-grid">
                        {demands2.map((item, index) => (
                            <div key={item.id} className="demand-card">
                                <div className="profile-info">
                                    <CgProfile className="profile-pic" />
                                    <p className="user-name">{userName}</p>
                                </div>
                                <Link to={`/demandDetail`} state={{ product: item, saleLabel: "수요거래" }}>
                                    <img src={item.src} alt={item.name} className="demand-image" />
                                </Link>
                                <span className="demand-label">수요거래</span>
                                <button 
                                    className={`demand-like-button ${liked[demands1.length + index] ? 'liked' : ''}`} 
                                    onClick={() => handleLike(demands1.length + index)}
                                >
                                    <FaHeart size={18} />
                                </button>
                                <p className="demand-product-name">{item.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='demandFrame3'>
                    <div className='demand-header'>
                        <div className='demand-icon'>
                            <SlSocialDropbox className='demandbox-icon' />
                            <FaHeart className='heart-icon' />
                        </div>
                        <h2 className="demand-heading">내가 만든 수요거래 제품</h2>
                    </div>

                    {isDemandSubmitted && savedDemandFormData ? (
                        <div className="demand-grid">
                            {/* 단일 카드로만 표시하고 products는 숨김 */}
                            <div className="demand-card">
                                <div className="profile-info">
                                    <CgProfile className="profile-pic" />
                                    <p className="user-name">{userName}</p>
                                </div>
                                <Link 
                                    to="/demandDetail" 
                                    state={{
                                        product: savedDemandFormData.products[0],
                                        details: savedDemandFormData,
                                        products: savedDemandFormData.products,
                                        tags: savedDemandFormData.tags,
                                        category: savedDemandFormData.category,
                                        period: savedDemandFormData.isAlwaysOnSale 
                                            ? "상시 판매" 
                                            : `${new Date(savedDemandFormData.startDate).toLocaleDateString()} ~ ${new Date(savedDemandFormData.endDate).toLocaleDateString()}`,
                                        seller: userName
                                    }}
                                >
                                    <img 
                                        src={savedDemandFormData.mainThumbnail} 
                                        className="demand-image" 
                                        onClick={() => setShowDetails(!showDetails)}
                                    />
                                </Link>
                                <span className="demand-label">수요거래</span>
                                <button 
                                    className={`demand-like-button ${liked[0] ? 'liked' : ''}`} 
                                    onClick={() => handleLike(0)}
                                >
                                    <FaHeart size={18} />
                                </button>
                                <p className="demand-product-name">{savedDemandFormData.title}</p>
                                
                                {showDetails && savedDemandFormData && (
                                    <div className="demand-details">
                                        <p>카테고리: {savedDemandFormData.category}</p>
                                        <p>설명:</p>
                                        <div dangerouslySetInnerHTML={{ __html: savedDemandFormData.description }} />
                                        
                                        <div className="time-info">
                                            <h4>수요조사 기간</h4>
                                            {savedDemandFormData.isAlwaysOnSale ? (
                                                <p>상시 판매</p>
                                            ) : (
                                                <>
                                                    <p>시작일: {new Date(savedDemandFormData.startDate).toLocaleDateString()}</p>
                                                    <p>마감일: {new Date(savedDemandFormData.endDate).toLocaleDateString()}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {savedDemandFormData.tags && savedDemandFormData.tags.length > 0 && (
                                    <div className="tags-list">
                                        {savedDemandFormData.tags.map((tag, i) => (
                                            <span key={i} className="tag-item">#{tag}</span>
                                        ))}
                                    </div>
                                )}
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