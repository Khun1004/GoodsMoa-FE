import React from 'react';
import { FaHandHolding } from "react-icons/fa";
import { FaBoxOpen } from "react-icons/fa6";
import { GiFoodTruck } from 'react-icons/gi';
import { GrSecure } from 'react-icons/gr';
import { IoFastFood } from 'react-icons/io5';
import BannerImg from '../../assets/women/women2.jpg';
import './MainTrade.css';

const MainTrade = () => {
    return (
        <div className="banner-container">
            <div className="container">

                <div className='mainTradeHeader'>
                    <div className='mainTradeIcon'>
                        <FaBoxOpen className='box' />
                        <FaHandHolding className='hand' />
                    </div>
                    <h1 className='mainTradeTitle'>중고거래</h1>
                </div>

                <div className="banner-grid">
                    {/* image section */}
                    <div data-aos="zoom-in">
                        <img src={BannerImg} alt="Banner" className="banner-image" />
                    </div>

                    {/* text details section */}
                    <div className="banner-text">
                        <h1 data-aos="fade-up" className="banner-title">
                            <span>*</span> 저렴한 상품을 구경해 보기 <span>*</span>
                        </h1>
                        
                        <div className="banner-features">
                            <div data-aos="fade-up" className="feature-item">
                                <GrSecure className="feature-icon bg-violet" />
                                <p>Quality Products</p>
                            </div>
                            <div data-aos="fade-up" className="feature-item">
                                <IoFastFood className="feature-icon bg-orange" />
                                <p>Fast Delivery</p>
                            </div>
                            <div data-aos="fade-up" className="feature-item">
                                <GiFoodTruck className="feature-icon bg-green" />
                                <p>Easy Payment Method</p>
                            </div>
                            <div data-aos="fade-up" className="feature-item">
                                <GiFoodTruck className="feature-icon bg-yellow" />
                                <p>Get Offers</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MainTrade;
