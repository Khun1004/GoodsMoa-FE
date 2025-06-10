import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './DemandBuyPerfect.css';

const DemandBuyPerfect = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedProducts, totalPrice } = location.state || {};

    return (
        <div className="perfect-container">
            <div className="perfect-card">
                <div className="perfect-icon">
                    <svg className='svgPerfect' 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="80" height="80" 
                        viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" 
                        strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                </div>
                <h2>🎉 참여가 완료되었습니다!</h2>
                <p>수요조사 참여해 주셔서 감사합니다.</p>
                <div className="perfect-items">
                    {selectedProducts && selectedProducts.map((product, idx) => (
                        <div key={idx} className="perfect-item">
                            <img src={product.thumbnail} alt={product.name} className="perfect-img" />
                            <div className="perfect-info">
                                <p className="perfect-name">{product.name}</p>
                                <p>{product.price.toLocaleString()}원 × {product.quantity}개</p>
                                <p className="perfect-subtotal">소계: {(product.price * product.quantity).toLocaleString()}원</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="perfect-total">
                    <strong>총 결제 금액: {totalPrice?.toLocaleString()}원</strong>
                </div>
                <button className="perfect-btn" onClick={() => navigate('/')}>홈으로 가기</button>
            </div>
        </div>
    );
};

export default DemandBuyPerfect;
