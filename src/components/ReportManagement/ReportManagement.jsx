import React, { useEffect, useState } from "react";
import ReportDetail from "../Reports/ReportDetail/ReportDetail";
import "./ReportManagement.css";

const ReportManagement = () => {
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        // 로컬 스토리지에서 데이터 불러오기 또는 더미 데이터 사용
        const savedReports = JSON.parse(localStorage.getItem("reports"));
        if (savedReports && savedReports.length > 0) {
            setReports(savedReports);
        } else {
            // 더미 데이터 사용 및 저장
            setReports(dummyReports);
            localStorage.setItem("reports", JSON.stringify(dummyReports));
        }
    }, []);

    const handleStatusChange = (id, newStatus) => {
        const updatedReports = reports.map(report => 
            report.id === id ? { ...report, status: newStatus } : report
        );
        setReports(updatedReports);
        localStorage.setItem("reports", JSON.stringify(updatedReports));
    };
    
    const handleProcessChange = (id, newProcess) => {
        const updatedReports = reports.map(report => 
            report.id === id ? { ...report, process: newProcess } : report
        );
        setReports(updatedReports);
        localStorage.setItem("reports", JSON.stringify(updatedReports));
    };
    
    const handleSubmit = (id, updatedData) => {
        console.log("신고 처리 완료:", id, updatedData);
        // 여기에 서버로 데이터를 전송하는 로직을 추가할 수 있습니다
    };

    const filteredReports = reports.filter(report => {
        if (filter === "all") return true;
        return report.status === filter;
    });

    return (
        <div className="reportManage-container">
            {/* ReportDetail을 독립적인 모달로 표시 */}
            {selectedReport ? (
                <ReportDetail 
                    selectedReport={selectedReport}
                    onClose={() => setSelectedReport(null)}
                    onStatusChange={handleStatusChange}
                    onProcessChange={handleProcessChange}
                    onSubmit={handleSubmit}
                />
            ) : (
                <>
                    <h2 className="reportManage-title">신고 관리</h2>
                    
                    <div className="reportManage-filter">
                        <label>상태 필터: </label>
                        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                            <option value="all">전체 보기</option>
                            <option value="확인">확인</option>
                            <option value="미확인">미확인</option>
                        </select>
                    </div>

                    <div className="reportManage-content">
                        <div className="reportManage-list">
                            <table className="reportManage-table">
                                <thead>
                                    <tr>
                                        <th>신고제목</th>
                                        <th>신고자</th>
                                        <th>피신고자</th>
                                        <th>채팅내역</th>
                                        <th>신고 날짜</th>
                                        <th>신고허용</th>
                                    </tr>
                                </thead>
                                {filteredReports.length > 0 ? (
                                    <tbody>
                                        {filteredReports.map(report => (
                                            <tr 
                                                key={report.id} 
                                                onClick={() => setSelectedReport(report)}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <td className="reportManage-ellipsis">{report.title}</td>
                                                <td>{report.reporter}</td>
                                                <td>{report.reportedPerson}</td>
                                                <td>
                                                    <span className={`reportManage-status-badge status-${report.status}`}>
                                                        {report.status}
                                                    </span>
                                                </td>
                                                <td>{report.date}</td>
                                                <td>
                                                    <span className={`reportManage-process-badge process-${report.process}`}>
                                                        {report.process}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                ) : (
                                    <tbody>
                                        <tr>
                                            <td colSpan="6" className="reportManage-no-reports">
                                                신고 내역이 없습니다.
                                            </td>
                                        </tr>
                                    </tbody>
                                )}
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ReportManagement;