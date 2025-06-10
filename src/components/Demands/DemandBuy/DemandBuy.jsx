import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './DemandBuy.css';

const DemandBuy = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const { selectedProducts, totalItems, totalPrice } = location.state || {};
    const [agreeTerms, setAgreeTerms] = useState(false);
    
    const handlePayment = () => {
        if (!agreeTerms) {
            alert("약관에 동의해주세요.");
            return;
        }
        
        // 현재 날짜 포맷팅
        const currentDate = new Date();
        const formattedDate = `${currentDate.getFullYear()}년 ${String(currentDate.getMonth() + 1).padStart(2, '0')}월 ${String(currentDate.getDate()).padStart(2, '0')}일`;
        
        // 마감일 계산 (30일 후)
        const deadlineDate = new Date();
        deadlineDate.setDate(currentDate.getDate() + 30);
        const formattedDeadline = `${deadlineDate.getFullYear()}년 ${String(deadlineDate.getMonth() + 1).padStart(2, '0')}월 ${String(deadlineDate.getDate()).padStart(2, '0')}일`;
        
        // 새로운 참여 데이터 생성
        const newParticipation = {
            id: Date.now(), // 고유 ID
            title: selectedProducts.length > 1 ? 
                `${selectedProducts[0].name} 외 ${selectedProducts.length - 1}건` : 
                selectedProducts[0].name,
            thumbnail: selectedProducts[0].thumbnail,
            status: "진행중",
            deadline: formattedDeadline,
            progress: 0, // 초기 진행률 0%
            price: totalPrice,
            date: formattedDate,
            products: selectedProducts // 전체 제품 정보 저장
        };
        
        // 기존 참여 데이터 가져오기
        const existingParticipations = JSON.parse(localStorage.getItem('participations') || '[]');
        
        // 새로운 참여 추가
        const updatedParticipations = [...existingParticipations, newParticipation];
        
        // localStorage에 저장
        localStorage.setItem('participations', JSON.stringify(updatedParticipations));
        
        alert("참여가 완료되었습니다!");
        
        // 완료 페이지로 이동
        navigate('/demandBuyPerfect', {
            state: { selectedProducts, totalPrice }
        });
    };
    
    return (
        <div className='container'>
            <div className="modalDetail-participation-modal-overlay">
                <div className="modalDetail-participation-modal">
                    <div className="modalDetail-modal-header">
                        <h2>수요조사 참여하기</h2>
                    </div>
                    
                    <div className="modalDetail-demandBuyModal-content">
                        <div className="modalDetail-order-summary">
                            <h3 className='demandBuyTitle'>참여 요약</h3>
                            <div className="modalDetail-order-items">
                            {selectedProducts && selectedProducts.map((product, idx) => (
                                <div key={idx} className="modalDetail-order-item">
                                    <img className='modalDetail-order-img' src={product.thumbnail} alt={product.name} />
                                    <div className="modalDetail-item-info">
                                        <p className="modalDetail-item-name">{product.name}</p>
                                        <p className="modalDetail-item-price">{product.price.toLocaleString()}원</p>
                                        <span className="modalDetail-terms-quantity">수량: {product.quantity}개</span>
                                    </div>
                                </div>
                            ))}
                            </div>
                            <div className="modalDetail-order-total">
                                <span className="modalDetail-terms-total">총 결제 금액</span>
                                <span className="modalDetail-total-price">{totalPrice?.toLocaleString()}원</span>
                            </div>
                        </div>
                        
                        <div className="modalDetail-terms-agreement">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={agreeTerms}
                                    onChange={(e) => setAgreeTerms(e.target.checked)}
                                />
                                <span className="modalDetail-terms-content">수요조사 참여 약관에 동의합니다 (필수)</span>
                            </label>
                            <div className="modalDetail-terms-content">
                                <p>수요조사 참여 시 결제는 즉시 진행되며, 목표 수량 달성 시 제작이 시작됩니다.</p>
                                <p>목표 수량 미달성 시 전액 환불됩니다.</p>
                                <p>제작 완료 후 배송까지 약 2~3주 소요될 수 있습니다.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="modalDetail-modal-footer">
                        <button className="modalDetail-confirm-btn" onClick={handlePayment}>참여하기</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemandBuy;