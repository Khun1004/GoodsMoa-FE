import React, { useEffect, useState } from 'react';
import './CommissionApplyDetail.css';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../../../api/api';

const CommissionApplyDetail = () => {
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const applicationId = queryParams.get('id');
    const viewType = queryParams.get('type');
    const [application, setApplication] = useState(null);
    const [accepted, setAccepted] = useState(false);

    // 신청글 가져오기
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await api.get(`/commission/apply-detail/${applicationId}`);
                setApplication(res.data);
                console.log('실행됨');
            } catch (err) {
                console.error('신청서 상세 불러오기 실패', err);
            }
        };

        if (applicationId) {
            fetchDetail();
        }
    }, []);

    if (!application) {
        return <div className="comApplyDetail-container">신청 정보를 불러오는 중입니다...</div>;
    }

    return (
        <div className="comApplyDetail-container">
            <button onClick={() => navigate(-1)} className="comApplyDetailBackBtn">
                <span className="comApplyDetailBackArrow">←</span> 목록으로 돌아가기
            </button>

            {/* 커미션 박스 */}
            <div className="perfect-commission-info">
                <div className="perfect-image-container">
                    {application.thumbnailImage && (
                        <img src={application.thumbnailImage} alt={application.title} className="perfect-image" />
                    )}
                </div>
                <div className="perfect-details">
                    <h2 className="perfect-commission-title">{application.title}</h2>
                    <p className="perfect-commission-category">{application.categoryName}</p>
                    <div className="perfect-price-range">
                        <span className='perfect-price'>의뢰 금액: </span>
                        <strong>
                            {application.minimumPrice?.toLocaleString()}원 ~ {application.maximumPrice?.toLocaleString()}원
                        </strong>
                    </div>
                </div>
            </div>

            {/* 비교 테이블 */}
            <div className="comparison-table">
                <table>
                    <thead>
                    <tr>
                        <th>작성자 요청사항</th>
                        <th>신청자 작성내용</th>
                    </tr>
                    </thead>
                    <tbody>
                    {application.commissionDetail?.map((section, index) => (
                        <tr key={index}>
                            <td>
                                <h4>{section.title}</h4>
                                <p>{section.reqContent}</p>
                            </td>
                            <td>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: application.resContent?.[index] || '내용 없음'
                                    }}
                                />
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* 액션 버튼 */}
            <div className="perfect-button-group">
                <button onClick={() => {}} className="perfect-button perfect-button-primary">
                    채팅하기
                </button>

                {viewType === 'received' && !accepted && (
                    <>
                        <button onClick={() => {}} className="perfect-button reject-button">
                            거절하기
                        </button>
                        <button
                            onClick={() => setAccepted(true)}
                            className="perfect-button accept-button"
                        >
                            수락하기
                        </button>
                    </>
                )}

                {viewType === 'received' && accepted && (
                    <button className="perfect-button accept-button">
                        완료
                    </button>
                )}
            </div>

        </div>
    );

};

export default CommissionApplyDetail;
