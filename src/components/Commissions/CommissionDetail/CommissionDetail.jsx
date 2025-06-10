import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './CommissionDetail.css';

const CommissionDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { product, commission: commissionProp, description: descriptionProp } = location.state || {};
    
    const [commission] = useState(commissionProp || product);
    const [description] = useState(
        commission?.description || 
        descriptionProp || 
        "상품 설명이 없습니다."
    );
    
    const [activeTab, setActiveTab] = useState('상세 설명');
    
    if (!commission) {
        return <div className='container'><p>해당 커미션 정보를 불러올 수 없습니다.</p></div>;
    }

    const handleApplyClick = () => {
        navigate('/commissionApplyWrite', { 
            state: { 
                commission: {
                    ...commission,
                    description,
                    sections: commission.applicationForms?.map((form, idx) => ({
                        title: `${idx + 1}. ${form.title}`,
                        description: form.description
                    })) || []
                } 
            } 
        });
    };

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    return (
        <div className='container'>
            <div className="commission-detail">
                <div className="image-and-info">
                    <img src={commission.image} alt={commission.title} className="keyring-image" />

                    <div className='commissionDetail-info'>
                        <h2>{commission.title}</h2>
                        <div className="subtitle">
                            {commission?.image && (
                                <img src={commission.image} alt="썸네일" className="thumbnail-image" />
                            )}
                            {commission?.title}
                        </div>
                        
                        <div className="subtitle">카테고리 : {commission.category}</div>

                        <div className="tags">
                            {commission.tags?.map((tag, index) => (
                                <span key={index}>{tag}</span>
                            ))}
                        </div>

                        <div className="price-box-updated">
                            <div className="price-item">
                                <span>최소 신청 금액</span>
                                <strong>{commission.minPrice?.toLocaleString()}원</strong>
                            </div>
                            <span className="price-separator">~</span>
                            <div className="price-item">
                                <span>최대 신청 금액</span>
                                <strong>{commission.maxPrice?.toLocaleString()}원</strong>
                            </div>
                        </div>

                        <div className="commissionDetail-button-group">
                            <button className="btn-like">찜</button>
                            <button className="btn-chat">채팅하기</button>
                            <button className="btn-report">🚨 신고하기</button>
                        </div>

                        <button className="btn-apply" onClick={handleApplyClick}>
                            신청하기
                        </button>
                    </div>
                </div>
                
                <div className="instruction">
                    <p>신청자는 아래 양식에 따라 입력해 주세요.</p>
                </div>

                <div className="form-box">
                    <h4>커미션 신청 양식</h4>
                    <div className="example">
                        {commission.applicationForms?.map((form, idx) => (
                            <div key={idx}>
                                <p className='example-box'>
                                    <p className='exampleTitle'>{idx + 1}. {form.title}</p>
                                    <p className='examplDescription'>{form.description}</p>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs for 상세 설명 and 리뷰 */}
                <div className='commissionDetailTabs'>
                    <ul>
                        <li
                            className={activeTab === '상세 설명' ? 'active' : ''}
                            onClick={() => handleTabClick('상세 설명')}
                        >
                            상세 설명
                        </li>
                        <li
                            className={activeTab === '리뷰' ? 'active' : ''}
                            onClick={() => handleTabClick('리뷰')}
                        >
                            리뷰
                        </li>
                    </ul>
                </div>

                {/* Tab content */}
                <div className='commissionDetailTabContent'>
                    {activeTab === '상세 설명' ? (
                        <div className='commission-description'>
                            {description ? (
                                <div dangerouslySetInnerHTML={{ __html: description }} />
                            ) : (
                                <p>상품 설명이 없습니다.</p>
                            )}
                        </div>
                    ) : (
                        <div className="commission-review">
                            {/* Review section content */}
                            <div className="photo-review">
                                <p>포토 리뷰(1)</p>
                                <hr />
                                <img src={commission.image} alt="포토 리뷰" className="photo-review-img" />
                            </div>

                            <div className="review-box">
                                <div className="review-item">
                                    <p className="review-title">제품이 너무 좋습니다!</p>
                                    <div className="star-row">⭐⭐⭐⭐⭐</div>
                                    <div className="review-content">
                                        <img src={commission.image} alt="썸네일" className="thumbnail-image" />
                                        <div>
                                            <p>제품의 퀄리티가 좋습니다<br />감사히 잘 쓰겠습니다!</p>
                                        </div>
                                    </div>
                                    <p className="user">👤 사용자 1</p>
                                </div>

                                <div className="review-item">
                                    <p className="review-title">금손이에요!</p>
                                    <div className="star-row">⭐⭐⭐⭐☆</div>
                                    <p>잘 쓰겠습니다!</p>
                                    <p className="user">👤 사용자 2</p>
                                </div>

                                <div className="review-item">
                                    <p className="review-title">잘 쓰겠습니다.</p>
                                    <div className="star-row">⭐⭐⭐⭐☆</div>
                                    <p>감사합니다.</p>
                                    <p className="user">👤 사용자 3</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommissionDetail;