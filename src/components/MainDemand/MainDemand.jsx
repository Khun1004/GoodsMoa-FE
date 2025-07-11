import React from 'react';
import { FaHeart } from 'react-icons/fa';
import { SlSocialDropbox } from "react-icons/sl";
import { useNavigate } from 'react-router-dom';
import Demand from '../Demands/Demand/Demand'
import './MainDemand.css';
import SeeMoreButton from '../Public/seeMoreButton.jsx'; // 버튼 컴포넌트 추가!
import Divider from '../public/Divider';

const MainSale = ({ mainCategory, setMainCategory }) => {
    const navigate = useNavigate();

    return (
        <div>
            <div className="main-demand-container">

                <div className='container'>
                    {/* 아이콘+제목+버튼 한 줄 */}
                    <div className='demand-header-row'>
                        <div className='demand-header'>
                            <div className='demand-icon'>
                                <SlSocialDropbox className='demandbox-icon' />
                                <FaHeart className='heart-icon' />
                            </div>
                            <h2 className="demand-heading">수요조사</h2>
                        </div>

                        <SeeMoreButton onClick={() => navigate('/demand')} />
                    </div>
                </div>

                <Demand showBanner={false} showOrderButton={false} mainCategory={mainCategory} setMainCategory={setMainCategory}  />

            </div>
            <Divider/>
        </div>
    );
};

export default MainSale;
