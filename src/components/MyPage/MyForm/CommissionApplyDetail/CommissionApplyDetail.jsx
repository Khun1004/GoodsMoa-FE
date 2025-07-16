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

    // 신청글 가져오기
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await api.get(`/commission/apply-detail/${applicationId}`);
                setApplication(res.data);
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

    // 수락, 거절
    const handleConfirm = async (isAccepted) => {
        try {
            await api.post('/commission/confirm', {
                id : applicationId,
                confirm: isAccepted, // true or false
            });

            alert(isAccepted ? '수락되었습니다.' : '거절되었습니다.');
            navigate(-1); // 목록으로 이동하거나 리프레시 등
        } catch (err) {
            console.error('확인 처리 실패:', err);
            alert('처리 중 오류가 발생했습니다.');
        }
    };

    // 완료버튼
    const handleFinish = async (isAccepted) => {
        try {
            await api.post('/commission/finish', {
                id: applicationId,
                confirm: isAccepted,
            });
            alert('완료되었습니다.');
            navigate(-1); // 목록으로 이동하거나 리프레시 등
        } catch (err) {
            console.error('확인 처리 실패:', err);
            alert('처리 중 오류가 발생했습니다.');
        }
    };

    // 채팅 버튼
    const handleChatClick = async () => {
        const isReceived = viewType === 'received';

        const buyerId = isReceived ? application.creatorId : application.clientId;
        const sellerId = isReceived ? application.clientId : application.creatorId;

        if (!buyerId || !sellerId) {
            alert("채팅 정보를 불러올 수 없습니다.");
            return;
        }

        if (buyerId === sellerId) {
            alert("자기 자신과는 채팅할 수 없습니다.");
            return;
        }

        try {
            const res = await api.post("/chatroom/create", {
                buyerId,
                sellerId,
            });
            const roomData = res.data;
            window.open(`/chat-app?roomId=${roomData.id}`, "_blank", "width=1000,height=800,resizable=yes");
        } catch (error) {
            if (error.response?.status === 409) {
                const roomData = error.response.data;
                window.open(`/chat-app?roomId=${roomData.id}`, "_blank", "width=1000,height=800,resizable=yes");
            } else {
                alert("채팅방 생성에 실패했습니다.");
            }
        }
    };

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
                <button onClick={handleChatClick} className="perfect-button perfect-button-primary">
                    채팅하기
                </button>

                {viewType === 'received' && application.requestStatus === '확인중' && (
                    <>
                        <button onClick={() => handleConfirm(false)} className="perfect-button reject-button">
                            거절하기
                        </button>
                        <button onClick={() => handleConfirm(true)} className="perfect-button accept-button">
                            수락하기
                        </button>
                    </>
                )}

                {viewType === 'received' && application.requestStatus === '진행중' && (
                    <button onClick={() => handleFinish(true)} className="perfect-button accept-button">
                        완료
                    </button>
                )}
            </div>

        </div>
    );

};

export default CommissionApplyDetail;
