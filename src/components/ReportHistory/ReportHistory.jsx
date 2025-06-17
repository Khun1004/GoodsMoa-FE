import React, { useEffect, useState } from "react";
import "./ReportHistory.css";

const ReportHistory = () => {
  const [reports, setReports] = useState([]);
  const [editData, setEditData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const fetchReports = async () => {
    try {
      const res = await fetch("http://localhost:8080/trade-report/reports", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("신고 내역 요청 실패");
      const data = await res.json();
      const reportList = data.content || [];

      const enriched = await Promise.all(
        reportList.map(async (report) => {
          let imageUrl =
            typeof report.imageUrl === "string"
              ? report.imageUrl.startsWith("http")
                ? report.imageUrl
                : `http://localhost:8080${report.imageUrl}`
              : null;

          const tradeId = report.tradeId;

          if (typeof tradeId === "number" && tradeId > 0) {
            try {
              const imgRes = await fetch(`http://localhost:8080/tradePost/${tradeId}`);
              if (imgRes.ok) {
                const tradeData = await imgRes.json();
                imageUrl = tradeData.thumbnailImage?.startsWith("http")
                  ? tradeData.thumbnailImage
                  : `http://localhost:8080${tradeData.thumbnailImage}`;
              }
            } catch (e) {
              console.error("❌ 썸네일 fetch 오류:", e);
            }
          }

          return { ...report, imageUrl };
        })
      );

      setReports(enriched);
    } catch (err) {
      console.error("❌ 신고 내역 불러오기 오류:", err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDeleteReport = async (id) => {
    if (window.confirm("정말로 이 신고를 삭제하시겠습니까?")) {
      try {
        const res = await fetch(`http://localhost:8080/trade-report/delete/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) throw new Error("삭제 실패");
        setReports((prev) => prev.filter((r) => r.id !== id));
      } catch (err) {
        console.error("❌ 신고 삭제 실패:", err);
      }
    }
  };

  const handleEditReport = (report) => {
    setEditData(report);
    setEditTitle(report.title);
    setEditContent(report.content);
    setIsEditing(true);
  };

  const handleUpdateSubmit = async () => {
    try {
      const res = await fetch(`http://localhost:8080/trade-report/update/${editData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
        }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("수정 실패");
      setIsEditing(false);
      await fetchReports();
    } catch (err) {
      console.error("❌ 수정 요청 실패:", err);
    }
  };

  return (
    <div className="report-history-container">
      {isEditing ? (
        <div className="report-edit-form">
          <h2 className="report-history-title">신고 수정하기</h2>
          <div className="report-edit-body">
            <div className="report-thumbnail-preview">
              {editData?.imageUrl ? (
                <img src={editData.imageUrl} alt="썸네일" className="report-history-image" />
              ) : (
                <p className="no-image">이미지가 없습니다.</p>
              )}
            </div>
            <div className="edit-fields">
              <div className="edit-field">
                <label htmlFor="edit-title">제목</label>
                <input
                  id="edit-title"
                  type="text"
                  className="edit-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>
              <div className="edit-field">
                <label htmlFor="edit-content">내용</label>
                <textarea
                  id="edit-content"
                  className="edit-textarea"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="edit-buttons">
            <button className="cancel-button" onClick={() => setIsEditing(false)}>
              취소하기
            </button>
            <button className="submit-button" onClick={handleUpdateSubmit}>
              수정 완료
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="report-header">
            <h2 className="report-history-title">신고 내역</h2>
          </div>

          {Array.isArray(reports) && reports.length > 0 ? (
            <div className="report-table-container">
              <table className="report-history-table">
                <thead>
                  <tr>
                    <th>신고 번호</th>
                    <th>신고 상품</th>
                    <th>판매글</th>
                    <th>신고 제목</th>
                    <th>신고 날짜</th>
                    <th>액션</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id}>
                      <td>{report.id ?? "번호 없음"}</td>
                      <td>
                        {typeof report.imageUrl === "string" && report.imageUrl !== "" ? (
                          <img
                            src={report.imageUrl}
                            alt="신고 이미지"
                            className="report-history-image"
                            onClick={() => window.open(report.imageUrl, "_blank")}
                          />
                        ) : (
                          <div className="no-image">이미지 없음</div>
                        )}
                      </td>
                      <td>{report.content ?? "내용 없음"}</td>
                      <td>{report.title ?? "제목 없음"}</td>
                      <td>
                        {report.createdAt
                          ? new Date(report.createdAt).toLocaleString()
                          : "정보 없음"}
                      </td>
                      <td className="action-buttons">
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
                      </td>
                      <td>
                        <span
                          className={`status-badge ${report.status?.replace(/\s+/g, "-") || "대기-중"}`}
                        >
                          {report.status || "대기 중"}
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
