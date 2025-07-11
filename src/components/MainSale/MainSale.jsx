import React from 'react';
import { FaHeart } from 'react-icons/fa';
import { SlSocialDropbox } from "react-icons/sl";
import { useNavigate } from 'react-router-dom';
import Sale from '../Sales/Sale/Sale';
import './MainSale.css';
import SeeMoreButton from "../Public/seeMoreButton.jsx";
import Divider from '../public/Divider';

const MainSale = ({ mainCategory, setMainCategory }) => {
    const navigate = useNavigate();

    return (
        <div>
            <div className="main-sale-container">

                <div className='container'>
                    {/* 아이콘+판매 텍스트 + 버튼을 같은 줄에 */}
                    <div className='sale-header-row'>
                        <div className='sale-title-group'>
                            <div className='sale-icon'>
                                <SlSocialDropbox className='salebox-icon' />
                                <FaHeart className='heart-icon' />
                            </div>
                            <h2 className="sale-heading">판매</h2>
                        </div>

                        <SeeMoreButton onClick={() => navigate('/sale')} />
                    </div>
                </div>

                <Sale
                    showBanner={false}
                    showOrderButton={false}
                    showCustomProducts={false}
                    mainCategory={mainCategory}
                    setMainCategory={setMainCategory}
                />
            </div>
            <Divider />

        </div>
    );
};

export default MainSale;
