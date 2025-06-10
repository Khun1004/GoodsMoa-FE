import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReportFormEdit from "../ReportFormEdit/ReportFormEdit";
import "./ReportHistory.css";

const ReportHistory = () => {
    const [reports, setReports] = useState([]);
    const [editData, setEditData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const savedReports = JSON.parse(localStorage.getItem("reports")) || [];
        setReports(savedReports);
    }, []);

    const handleDeleteReport = (id) => {
        if (window.confirm("정말로 이 신고를 삭제하시겠습니까?")) {
            const updatedReports = reports.filter((report) => report.id !== id);
            setReports(updatedReports);
            localStorage.setItem("reports", JSON.stringify(updatedReports));
        }
    };

    const handleEditReport = (report) => {
        setEditData(report);
        setIsEditing(true);
    };

    const handleFormSubmit = (updatedReport) => {
        const updatedReports = reports.map((report) =>
            report.id === updatedReport.id ? updatedReport : report
        );
        setReports(updatedReports);
        localStorage.setItem("reports", JSON.stringify(updatedReports));
        setIsEditing(false);
    };

    return (
        <div className="report-history-container">
            {isEditing ? (
                <ReportFormEdit
                    editData={editData}
                    onFormSubmit={handleFormSubmit}
                    setReportForm={() => setIsEditing(false)}
                />
            ) : (
                <>
                    <div className="report-header">
                        <h2 className="report-history-title">신고 내역</h2>
                    </div>
                    
                    {reports.length > 0 ? (
                        <div className="report-table-container">
                            <table className="report-history-table">
                                <thead>
                                    <tr>
                                        <th className="column-id">신고 번호</th>
                                        <th className="column-image">신고 상품</th>
                                        <th className="column-post">판매글</th>
                                        <th className="column-title">신고 제목</th>
                                        <th className="column-date">신고 날짜</th>
                                        <th className="column-actions">액션</th>
                                        <th className="column-status">현재 상태</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((report) => (
                                        <tr key={report.id}>
                                            <td className="column-id">{report.id}</td>
                                            <td className="column-image">
                                                {report.image ? (
                                                    <img 
                                                        src={report.image} 
                                                        alt="신고된 상품" 
                                                        className="report-history-image" 
                                                        onClick={() => window.open(report.image, '_blank')}
                                                    />
                                                ) : (
                                                    <div className="no-image">이미지 없음</div>
                                                )}
                                            </td>
                                            <td className="column-post">{report.salePost}</td>
                                            <td className="column-title">{report.title}</td>
                                            <td className="column-date">{report.date}</td>
                                            <td className="column-actions">
                                                <div className="action-buttons">
                                                    <button
                                                        className="report-edit-btn"
                                                        onClick={() => handleEditReport(report)}
                                                    >
                                                        수정
                                                    </button>
                                                    <button
                                                        className="report-delete-btn"
                                                        onClick={() => handleDeleteReport(report.id)}
                                                        disabled={report.status === "처리 완료"}
                                                    >
                                                        삭제
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="column-status">
                                                <span className={`status-badge ${report.status.replace(/\s+/g, '-')}`}>
                                                    {report.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="no-reports-message">
                            <p>신고 내역이 없습니다.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ReportHistory;