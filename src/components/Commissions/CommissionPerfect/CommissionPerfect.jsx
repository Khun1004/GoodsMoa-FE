import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './CommissionPerfect.css';

const CommissionPerfect = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { commission, submissionData } = location.state || {};

    const handleGoToList = () => {
        navigate('/commissions');
    };

    const handleGoToChat = () => {
        navigate('/chat');
    };

    return (
        <div className='container'>
            <div className="perfect-container">
                <div className="perfect-commission-card">
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
                    
                    <h1 className="perfect-title">의뢰가 성공적으로 등록되었습니다!</h1>
                    
                    <div className="perfect-commission-info">
                        <div className="perfect-image-container">
                            {commission?.image && (
                            <img src={commission.image} alt={commission.title} className="perfect-image" />
                            )}
                        </div>
                        <div className="perfect-commission-details">
                            <h2 className="perfect-commission-title">{commission?.title}</h2>
                            <p className="perfect-commission-category">{commission?.category}</p>
                            <div className="perfect-price-range">
                            <span className='perfect-price'>의뢰 금액: </span>
                            <strong>
                                {commission?.minPrice?.toLocaleString()}원 ~ {commission?.maxPrice?.toLocaleString()}원
                            </strong>
                            </div>
                        </div>
                    </div>
                    
                    {/* 추가된 테이블 섹션 */}
                    <div className="comparison-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>작성자 요청사항</th>
                                    <th>신청자 작성내용</th>
                                </tr>
                            </thead>
                            <tbody>
                                {commission?.sections?.map((section, index) => (
                                    <tr key={index}>
                                        <td>
                                            <h4>{section.title}</h4>
                                            <p>{section.description}</p>
                                        </td>
                                        <td>
                                            <div dangerouslySetInnerHTML={{ 
                                                __html: submissionData?.[`${index === 0 ? 'designContent' : index === 1 ? 'colorContent' : 'requestContent'}`] || '내용 없음'
                                            }} />
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <td>
                                        <h4>환불 계좌 정보</h4>
                                        <p>의뢰 취소 시 환불을 위한 계좌 정보</p>
                                    </td>
                                    <td>
                                        {submissionData?.refundInfo && (
                                            <div>
                                                <p>은행: {submissionData.refundInfo.refund_bank}</p>
                                                <p>계좌번호: {submissionData.refundInfo.refund_account}</p>
                                                <p>예금주: {submissionData.refundInfo.refund_name}</p>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="perfect-notice">
                        <p>작가님이 의뢰 내용을 확인 후 연락드릴 예정입니다.</p>
                        <p>보통 1~3일 이내에 답변을 드리고 있습니다.</p>
                    </div>
                    
                    <div className="perfect-button-group">
                        <button 
                            className="perfect-button perfect-button-primary"
                            onClick={handleGoToChat}
                        >
                            채팅 바로가기
                        </button>
                        <button 
                            className="perfect-button perfect-button-secondary"
                            onClick={handleGoToList}
                        >
                            의뢰 목록 보기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommissionPerfect;