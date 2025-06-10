import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import "./ReportFormEdit.css";

const ReportFormEdit = ({ setReportForm, onFormSubmit, editData }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [salePost, setSalePost] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const location = useLocation();
    const selectedProduct = location.state?.selectedProduct || {};

    useEffect(() => {
        if (editData) {
            setTitle(editData.title);
            setContent(editData.content || "");
            setSalePost(editData.salePost || "");
            setSelectedImage(editData.image || null); // 기존 신고 이미지 불러오기
        }
    }, [editData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const reportData = {
            id: editData ? editData.id : Math.floor(Math.random() * 1000),
            title,
            content,
            salePost,
            image: selectedImage,
            status: editData ? editData.status : "접수 완료",
            date: editData ? editData.date : new Date().toISOString().split('T')[0],
        };
        onFormSubmit(reportData);
        alert(editData ? "신고가 수정되었습니다." : "신고가 접수되었습니다.");
    };

    return (
        <div className="container">
            <div className="report-form-container">
                <h2 className="report-formTitle">{editData ? "신고 수정하기" : "신고하기"}</h2>
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
                            onClick={() => setReportForm()}
                        >
                            취소하기
                        </button>
                        <button type="submit" className="report-submit-btn">
                            {editData ? "수정 완료" : "신고하기"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportFormEdit;
