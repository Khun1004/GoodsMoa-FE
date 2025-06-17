import React from 'react';
import { FaHeart } from 'react-icons/fa';
import { SlSocialDropbox } from "react-icons/sl";
import { useNavigate } from 'react-router-dom';
import Sale from '../Demands/Demand/Demand';
import './MainDemand.css';

const MainSale = () => {
    const navigate = useNavigate();

    return (
        <div>
            <div className="main-demand-container">
            
                <div className='container'>
                    <div className='demand-header'>
                        <div className='demand-icon'>
                            <SlSocialDropbox className='demandbox-icon'/>
                            <FaHeart className='heart-icon'/>
                        </div>
                        <h2 className="demand-heading">수요조사</h2>
                    </div>
                </div>
            
                <Sale showBanner={false} showOrderButton={false} />
                
                <button className='seeDemand' 
                    onClick={() => navigate('/demand')}>
                    더 보기
                </button>
                <hr className="divider"></hr>
            </div>

            
        </div>
    );
};

export default MainSale;
