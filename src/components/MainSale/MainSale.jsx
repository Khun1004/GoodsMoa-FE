import React from 'react';
import { FaHeart } from 'react-icons/fa';
import { SlSocialDropbox } from "react-icons/sl";
import { useNavigate } from 'react-router-dom';
import Sale from '../Sales/Sale/Sale';
import './MainSale.css';

const MainSale = () => {
    const navigate = useNavigate();

    return (
        <div>
            <div className="main-sale-container">
            
                <div className='container'>
                    <div className='sale-header'>
                        <div className='sale-icon'>
                            <SlSocialDropbox className='salebox-icon'/>
                            <FaHeart className='heart-icon'/>
                        </div>
                        <h2 className="sale-heading">판매</h2>
                    </div>
                </div>
            
                <Sale 
                    showBanner={false} 
                    showOrderButton={false} 
                    showCustomProducts={false}  // 이 prop을 추가
                />
                
                <button className='seeSale' 
                    onClick={() => navigate('/sale')}>
                    더 보기
                </button>
                <hr className="divider"></hr>
            </div>

            
        </div>
    );
};

export default MainSale;