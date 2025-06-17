import React from 'react';
// 페이지 이동을 위한 useNavigate hook
import { useNavigate } from 'react-router-dom';

// 헤더에 사용할 아이콘
import { FaHandHolding } from "react-icons/fa";
import { FaBoxOpen } from "react-icons/fa6";

// 중고거래 상품 목록을 보여줄 컴포넌트 (프로젝트 구조에 맞게 경로를 설정해주세요)
import Trade from '../Trade/Trade/Trade'; 

// 이 컴포넌트를 위한 CSS 파일
import './MainTrade.css';

const MainTrade = () => {
    // navigate 함수 초기화
    const navigate = useNavigate();

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
                
                <Trade showBanner={false} />
                
                {/* '더 보기' 버튼: 클릭 시 /trade 경로로 이동합니다. */}
                <button className='seeTrade' 
                    onClick={() => navigate('/trade')}>
                    더 보기
                </button>
                <hr className="divider"></hr>
            </div>
        </div>
    );
};

export default MainTrade;