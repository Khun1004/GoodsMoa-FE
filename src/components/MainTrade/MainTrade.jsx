import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHandHolding } from "react-icons/fa";
import { FaBoxOpen } from "react-icons/fa6";
import Trade from '../Trade/Trade/Trade';
import './MainTrade.css';
import SeeMoreButton from '../Public/seeMoreButton.jsx';
import Divider from '../Public/Divider';
const MainTrade = () => {
    const navigate = useNavigate();

    return (
        <div className="banner-container">
            <div className="container">
                {/* 아이콘+제목+버튼 한 줄 정렬 */}
                <div className="mainTradeHeaderRow">
                    <div className='mainTradeHeader'>
                        <div className='mainTradeIcon'>
                            <FaBoxOpen className='box' />
                            <FaHandHolding className='hand' />
                        </div>
                        <h1 className='mainTradeTitle'>중고거래</h1>
                    </div>

                    <SeeMoreButton onClick={() => navigate('/trade')} />

                </div>

                <Trade showBanner={false} />

                <Divider />

            </div>

        </div>
    );
};

export default MainTrade;
