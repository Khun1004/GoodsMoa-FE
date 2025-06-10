import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ReportForm.css";

const ReportForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedProduct = location.state?.selectedProduct || {};
    const selectedImage = selectedProduct.image || null; // 이미지 가져오기

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [salePost, setSalePost] = useState(selectedProduct.name || "");

    const handleSubmit = (e) => {
        e.preventDefault();
        const reportData = {
            id: Math.floor(Math.random() * 1000),
            title,
            content,
            salePost,
            status: "접수 완료",
            date: new Date().toISOString().split("T")[0],
            image: selectedImage,
        };

        // 기존 신고 내역 가져와서 추가 후 localStorage에 저장
        const existingReports = JSON.parse(localStorage.getItem("reports")) || [];
        const updatedReports = [...existingReports, reportData];
        localStorage.setItem("reports", JSON.stringify(updatedReports));

        alert("신고가 접수되었습니다. 신고 내용은 마이페이지에서 확인할 수 있습니다.");
        navigate(-1);
    };

    return (
        <div className="container">
            <div className="report-form-container">
                <h2 className="report-formTitle">신고하기</h2>
                <form onSubmit={handleSubmit}>
                    
                    {/* 선택한 이미지와 상품명 표시 */}
                    <div className="reportFormImage">
                        <div className="report-selected-image">
                            {selectedImage ? (
                                <img src={selectedImage} alt="신고할 상품" className="report-image" />
                            ) : (
                                <p>이미지가 없습니다.</p>
                            )}
                        </div>
                        <div className="report-selected-name">
                            <p>{salePost || "상품명이 없습니다."}</p>
                        </div>
                    </div>

                    <div className="report-form-group">
                        <label>제목</label>
                        <input
                            type="text"
                            placeholder="제목을 입력해주세요."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="report-form-group">
                        <label>내용</label>
                        <textarea
                            placeholder="신고 내용을 작성해주세요."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                        />
                    </div>

                    <div className="report-form-buttons">
                        <button 
                            type="button" 
                            className="report-cancel-btn"
                            onClick={() => navigate(-1)}
                        >
                            취소하기
                        </button>
                        <button type="submit" className="report-submit-btn">
                            신고 등록
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportForm;
