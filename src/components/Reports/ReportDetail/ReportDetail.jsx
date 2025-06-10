import React, { useEffect, useState } from "react";
import "./ReportDetail.css";

const ReportDetail = ({ 
    selectedReport, 
    onClose, 
    onStatusChange, 
    onProcessChange,
    onSubmit
}) => {
    if (!selectedReport) return null;
    
    const [reportData, setReportData] = useState({
        status: selectedReport.status,
        process: selectedReport.process
    });
    
    const [isChanged, setIsChanged] = useState(false);
    
    useEffect(() => {
        // 변경 사항이 있는지 확인
        setIsChanged(
            reportData.status !== selectedReport.status || 
            reportData.process !== selectedReport.process
        );
    }, [reportData, selectedReport]);
    
    const updateStatus = (status) => {
        setReportData(prev => ({ ...prev, status }));
    };
    
    const updateProcess = (process) => {
        setReportData(prev => ({ ...prev, process }));
    };
    
    const handleSubmit = () => {
        if (reportData.status !== selectedReport.status) {
            onStatusChange(selectedReport.id, reportData.status);
        }
        
        if (reportData.process !== selectedReport.process) {
            onProcessChange(selectedReport.id, reportData.process);
        }
        
        if (onSubmit) {
            onSubmit(selectedReport.id, reportData);
        }

        onClose();
    };

    return (
        <div className="report-detail-modal">
            <div className="report-detail-container">
                <div className="report-detail-header">
                    <h3>신고 상세 정보</h3>
                </div>

                <div className="report-detail-content">
                    <div className="report-detail-grid">
                        <div className="report-detail-group">
                            <label>신고 번호</label>
                            <div className="report-detail-value">{selectedReport.id}</div>
                        </div>

                        <div className="report-detail-group">
                            <label>판매글</label>
                            <div className="report-detail-value">{selectedReport.salePost}</div>
                        </div>
                        
                        <div className="report-detail-group">
                            <label>신고자</label>
                            <div className="report-detail-value">{selectedReport.reporter}</div>
                        </div>
                        
                        <div className="report-detail-group">
                            <label>피신고자</label>
                            <div className="report-detail-value">{selectedReport.reportedPerson}</div>
                        </div>

                        <div className="report-detail-group">
                            <label>신고 날짜</label>
                            <div className="report-detail-value">{selectedReport.date}</div>
                        </div>

                        <div className="report-detail-group">
                            <label>확인 상태</label>
                            <div className="report-detail-value">
                                <span className={`report-detail-status-badge status-${reportData.status}`}>
                                    {reportData.status}
                                </span>
                            </div>
                        </div>
                        
                        <div className="report-detail-group">
                            <label>처리 상태</label>
                            <div className="report-detail-value">
                                <span className={`report-detail-process-badge process-${reportData.process}`}>
                                    {reportData.process}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="report-detail-group">
                        <label>상품 이미지</label>
                        <div className="report-detail-value">
                            {selectedReport.image ? (
                                <img 
                                    src={selectedReport.image} 
                                    alt="신고된 상품" 
                                    className="report-detail-image"
                                    onClick={() => window.open(selectedReport.image, '_blank')}
                                />
                            ) : (
                                <span className="no-image">이미지 없음</span>
                            )}
                        </div>
                    </div>

                    <div className="report-detail-group">
                        <label>제목</label>
                        <div className="report-detail-value title">{selectedReport.title}</div>
                    </div>

                    <div className="report-detail-group">
                        <label>내용</label>
                        <div className="report-detail-text">{selectedReport.content}</div>
                    </div>

                    <div className="report-detail-actions">
                        <div className="action-section">
                            <h4>확인 상태 변경</h4>
                            <div className="button-group">
                                <button
                                    className={`status-btn ${reportData.status === '확인' ? 'active' : ''}`}
                                    onClick={() => updateStatus('확인')}
                                >
                                    확인
                                </button>
                                <button
                                    className={`status-btn ${reportData.status === '미확인' ? 'active' : ''}`}
                                    onClick={() => updateStatus('미확인')}
                                >
                                    미확인
                                </button>
                            </div>
                        </div>
                        
                        <div className="action-section">
                            <h4>처리 상태 변경</h4>
                            <div className="button-group">
                                <button
                                    className={`process-btn ${reportData.process === '유효' ? 'active' : ''}`}
                                    onClick={() => updateProcess('유효')}
                                >
                                    유효
                                </button>
                                <button
                                    className={`process-btn ${reportData.process === '무효' ? 'active' : ''}`}
                                    onClick={() => updateProcess('무효')}
                                >
                                    무효
                                </button>
                                <button
                                    className={`process-btn ${reportData.process === '미처리' ? 'active' : ''}`}
                                    onClick={() => updateProcess('미처리')}
                                >
                                    미처리
                                </button>
                            </div>
                        </div>
                        
                        <div className="submit-area">
                            <button className="reportDetailCancelBtn" onClick={onClose}>
                                취소
                            </button>
                            <button 
                                className="reportDetailSubmitBtn" 
                                onClick={handleSubmit}
                                disabled={!isChanged}
                                style={{ opacity: isChanged ? 1 : 0.6 }}
                            >
                                변경 사항 저장
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportDetail;