import React from 'react';
import './CommissionApplyDetail.css';

const CommissionApplyDetail = ({
                                   application,
                                   onBack,
                                   onChat,
                                   onAccept,
                                   onReject
                               }) => {
    if (!application) {
        return <div className="comApplyDetail-container">신청 정보를 불러오는 중입니다...</div>;
    }

    return (
        <div className="comApplyDetail-container">
            <button onClick={onBack} className="comApplyDetailBackBtn">
                <span className="comApplyDetailBackArrow">←</span> 목록으로 돌아가기
            </button>

            <div className="comApplyDetailHeaderSection">
                <h2>{application.commissionTitle}</h2>
                <p className="comApplyDetailSubtitle">신청 상세 정보</p>
            </div>

            <div className="comApplyDetailApplicant-info">
                <div className="comApplyDetailInfo-item">
                    <span className="comApplyDetailInfo-label">신청자</span>
                    <span className="comApplyDetailInfo-value">{application.applicantId}</span>
                </div>
                <div className="comApplyDetailInfo-item">
                    <span className="comApplyDetailInfo-label">신청 일시</span>
                    <span className="comApplyDetailInfo-value">
                        {new Date(application.timestamp).toLocaleString()}
                    </span>
                </div>
            </div>

            <div className="comApplyDetailRefund-section">
                <h3 className="comApplyDetailRefund-title">환불 계좌 정보</h3>
                <table className="comApplyDetailRefund-table">
                    <thead>
                    <tr>
                        <th colSpan="2">환불 계좌 정보</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td className="comApplyDetailTable-label">은행</td>
                        <td>{application.submissionData?.refundInfo?.refund_bank ?? "정보 없음"}</td>
                    </tr>
                    <tr>
                        <td className="comApplyDetailTable-label">계좌번호</td>
                        <td>{application.submissionData?.refundInfo?.refund_account ?? "정보 없음"}</td>
                    </tr>
                    <tr>
                        <td className="comApplyDetailTable-label">예금주</td>
                        <td>{application.submissionData?.refundInfo?.refund_name ?? "정보 없음"}</td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <div className="comApplyDetailApplication-sections">
                {application.sections?.map((section, index) => (
                    <div key={index} className="comApplyDetailApplication-section">
                        <h3 className="comApplyDetailSection-title">{section.title}</h3>
                        {section.description && (
                            <p className="comApplyDetailSection-description">{section.description}</p>
                        )}
                        <div
                            className="comApplyDetailSection-content"
                            dangerouslySetInnerHTML={{ __html: section.content }}
                        />
                    </div>
                ))}
            </div>

            <div className="comApplyDetailAction-buttons">
                <button onClick={onChat} className="comApplyDetailAction-button chat-button">
                    <i className="icon-chat"></i> 채팅하기
                </button>
                <button onClick={onReject} className="comApplyDetailAction-button reject-button">
                    <i className="icon-reject"></i> 거절하기
                </button>
                <button onClick={onAccept} className="comApplyDetailAction-button accept-button">
                    <i className="icon-accept"></i> 수락하기
                </button>
            </div>
        </div>
    );
};

export default CommissionApplyDetail;
