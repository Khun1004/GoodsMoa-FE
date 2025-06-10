import React, { useEffect, useState } from 'react';
import { CgProfile } from "react-icons/cg";
import { FaHeart } from 'react-icons/fa';
import { SlSocialDropbox } from "react-icons/sl";
import { Link } from 'react-router-dom';
import welcomeVideo from '../../../assets/commissionWelcome.mp4';
import Sale1 from '../../../assets/sales/sale1.jpg';
import Sale10 from '../../../assets/sales/sale10.jpg';
import Sale2 from '../../../assets/sales/sale2.jpg';
import Sale3 from '../../../assets/sales/sale3.jpg';
import Sale4 from '../../../assets/sales/sale4.jpg';
import Sale5 from '../../../assets/sales/sale5.jpg';
import Sale6 from '../../../assets/sales/sale6.jpg';
import Sale7 from '../../../assets/sales/sale7.jpg';
import Sale8 from '../../../assets/sales/sale8.jpg';
import Sale9 from '../../../assets/sales/sale9.jpg';
import CommissionIcon from '../../CommissionIcon/CommissionIcon';
import './Commission.css';

const products1 = [
    { id: 1, src: Sale1, name: "상품 1" },
    { id: 2, src: Sale2, name: "상품 2" },
    { id: 3, src: Sale3, name: "상품 3" },
    { id: 4, src: Sale4, name: "상품 4" },
    { id: 5, src: Sale5, name: "상품 5" }
];

const products2 = [
    { id: 6, src: Sale6, name: "상품 6" },
    { id: 7, src: Sale7, name: "상품 7" },
    { id: 8, src: Sale8, name: "상품 8" },
    { id: 9, src: Sale9, name: "상품 9" },
    { id: 10, src: Sale10, name: "상품 10" }
];

const Commission = () => {
    const userName = "사용자";
    const [registeredCommissions, setRegisteredCommissions] = useState([]);
    const [liked, setLiked] = useState(() => {
        const savedLiked = localStorage.getItem('liked');
        return savedLiked ? JSON.parse(savedLiked) : Array(products1.length + products2.length).fill(false);
    });
    const [selectedProducts, setSelectedProducts] = useState(() => {
        const savedSelected = localStorage.getItem('selectedProducts');
        return savedSelected ? JSON.parse(savedSelected) : [];
    });

    useEffect(() => {
        const storedCommissions = JSON.parse(localStorage.getItem("commissions")) || [];
        setRegisteredCommissions(storedCommissions);
    }, []);

    useEffect(() => {
        const commissions = JSON.parse(localStorage.getItem('commissions')) || [];
        setRegisteredCommissions(commissions);
    }, []);

    useEffect(() => {
        // localStorage에서 등록된 커미션 불러오기
        const savedCommissions = JSON.parse(localStorage.getItem('commissions')) || [];
        setRegisteredCommissions(savedCommissions);
        
        // 좋아요 상태 저장
        localStorage.setItem('liked', JSON.stringify(liked));
        localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
    }, [liked, selectedProducts]);

    const handleLike = (index, product) => {
        const newLiked = [...liked];
        newLiked[index] = !newLiked[index];
        setLiked(newLiked);

        if (!liked[index]) {
            setSelectedProducts((prev) => [...prev, product]);
        } else {
            setSelectedProducts((prev) => prev.filter((p) => p.id !== product.id));
        }
    };

    return (
        <div className='container'>
            <div className="commission-container">

            <div className="commission-banner">
                <video 
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="commission-video"
                    disablePictureInPicture
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <source src={welcomeVideo} type="video/mp4" />
                </video>
                    <div className="commission-banner-content">
                    <h1 className="commission-title">😊 원하는 상품을 검색해 보세요 😊</h1>
                    <input
                        type="text"
                        placeholder="상품명 검색🎉🎉"
                        className="commission-search-input"
                    />
                </div>
            </div>

                {/* 카테고리 아이콘 섹션 */}
                <div>
                    <CommissionIcon />
                </div>

                {/* 커미션 상품 목록 */}
                <div className='commissionProductFrame'>
                    <div className='commission-header'>
                        <div className='commission-icon'>
                            <SlSocialDropbox className='commissionbox-icon'/>
                            <FaHeart className='heart-icon'/>
                        </div>
                        <h2 className="commission-heading">커미션</h2>
                    </div>

                    <div className='commissionFrame1'>
                        <div className="commission-grid">
                            {products1.map((product, index) => (
                                <div key={product.id} className="commission-card">
                                    <div className="profile-info">
                                        <CgProfile className="profile-pic" />
                                        <p className="user-name">{userName}</p>
                                    </div>
                                    <Link to={`/commissionDetail`} 
                                        state={{ product, description: product.description }}>
                                        <img src={product.src} alt={product.name} className="commission-image" />
                                    </Link>
                                    <span className="commission-label">커미션</span>
                                    <button
                                        className={`commission-like-button ${liked[index] ? 'liked' : ''}`}
                                        onClick={() => handleLike(index, product)}
                                    >
                                        <FaHeart size={18} />
                                    </button>
                                    <p className="commission-product-name">{product.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='commissionFrame2'>
                        <div className="commission-grid">
                            {products2.map((product, index) => (
                                <div key={product.id} className="commission-card">
                                    <div className="profile-info">
                                        <CgProfile className="profile-pic" />
                                        <p className="user-name">{userName}</p>
                                    </div>
                                    <Link to={`/commissionDetail`} 
                                        state={{ product, description: product.description }}>
                                        <img src={product.src} alt={product.name} className="commission-image" />
                                    </Link>
                                    <span className="commission-label">커미션</span>
                                    <button
                                        className={`commission-like-button ${liked[products1.length + index] ? 'liked' : ''}`}
                                        onClick={() => handleLike(products1.length + index, product)}
                                    >
                                        <FaHeart size={18} />
                                    </button>
                                    <p className="commission-product-name">{product.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 등록된 커미션 표시 */}
                <div className='commissionProductFrame'>
                    {registeredCommissions.length > 0 && (
                        <>
                            <div className='commission-header'>
                                <div className='commission-icon'>
                                    <SlSocialDropbox className='commissionbox-icon'/>
                                    <FaHeart className='heart-icon'/>
                                </div>
                                <h2 className="commission-heading">내가 등록한 커미션</h2>
                            </div>

                            <div className='commissionFrame1'>
                                <div className="commission-grid">
                                    {registeredCommissions.map((commission, index) => (
                                        <div key={index} className="commission-card">
                                            <div className="profile-info">
                                                <CgProfile className="profile-pic" />
                                                <p className="user-name">{userName}</p>
                                            </div>
                                            <Link to={`/commissionDetail`} 
                                                state={{ commission,  description: commission.editorContent}}>
                                                <img 
                                                    src={commission.image} 
                                                    alt={commission.title} 
                                                    className="commission-image"
                                                />
                                            </Link>
                                            <span className="commission-label">커미션</span>
                                            <button className="commission-like-button">
                                                <FaHeart size={18} />
                                            </button>
                                            <p className="commission-product-name">{commission.title}</p>
                                            <div className="tags-list">
                                                {commission.tags.map((tag, tagIndex) => (
                                                    <span key={tagIndex} className="tag-item">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
        
    );
};

export default Commission;