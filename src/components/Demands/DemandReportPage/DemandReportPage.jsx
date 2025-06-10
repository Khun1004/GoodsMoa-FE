import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./DemandReportPage.css";

const DemandReportPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");
    const item = location.state?.item || {};
    const representativeImage = location.state?.representativeImage || "https://via.placeholder.com/120";

    const [email, setEmail] = useState("");
    const [agree, setAgree] = useState(false);
    const [file, setFile] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!agree) {
            alert("개인정보 수집 동의가 필요합니다.");
            return;
        }
        alert(`신고가 접수되었습니다.\n작성자 이메일: ${email}`);
    
        navigate("/demandReportPerfect", {
            state: {
                item,
                representativeImage,
                email,
                reason,
                details,
                fileName: file?.name || null,
            },
        });        
    };

    return (
        <div className="report-page-container">
            <div className="report-container">
                <h2 className="report-title">🚨 신고하기</h2>
                <p className="report-description">아래 내용을 작성하여 신고 사유를 입력해주세요.</p>

                {/* 🚀 신고할 상품 정보 및 대표 이미지 표시 */}
                <div className="reported-item">
                    <img src={representativeImage} alt="신고할 상품 이미지" className="reported-item-image" />
                    <div className="reported-item-details">
                        <h3>{item.title || "상품 제목 없음"}</h3>
                        <p>가격: {item.price ? `${item.price}원` : "정보 없음"}</p>
                        <p>상태: {item.condition || "미상"}</p>
                    </div>
                </div>

                {/* 신고 폼 */}
                <form className="report-form" onSubmit={handleSubmit}>
                    {/* ✅ 이메일 입력 필드 추가 */}
                    <label className="report-label">작성자 이메일:</label>
                    <input
                        type="email"
                        className="report-input"
                        placeholder="이메일을 입력하세요"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label className="report-label">신고 사유:</label>
                    <select className="report-select" value={reason} onChange={(e) => setReason(e.target.value)} required>
                        <option value="">사유를 선택하세요</option>
                        <option value="허위 상품">허위 상품</option>
                        <option value="사기 의심">사기 의심</option>
                        <option value="기타">기타</option>
                    </select>

                    <label className="report-label">상세 내용:</label>
                    <textarea
                        className="report-textarea"
                        placeholder="신고에 대한 자세한 설명을 입력해주세요."
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        required
                    />

                    {/* 파일 첨부 */}
                    <div className="file-upload">
                        <label className="report-label">파일 첨부</label>
                        <input type="file" onChange={handleFileChange} className="file-input" />
                        {file && <p className="file-name">{file.name}</p>}
                        <p className="file-info">10MB 이하의 파일 1개까지 첨부 가능 (최대 50MB)</p>
                    </div>

                    {/* 개인정보 수집 및 동의 */}
                    <div className="privacy-policy">
                        <label className="report-label">개인정보 수집 및 동의 안내</label>
                        <p className="privacy-text">
                            작성해주시는 개인정보는 문의 접수 및 고객 불만 해결을 위해 <strong className="highlight">3년간 보관됩니다.</strong>
                        </p>
                        <div className="privacy-checkbox">
                            <input
                                type="checkbox"
                                id="agree"
                                checked={agree}
                                onChange={() => setAgree(!agree)}
                            />
                            <label htmlFor="agree">동의합니다.</label>
                        </div>
                    </div>

                    <button type="submit" className="report-submit">신고 제출</button>
                </form>
            </div>
        </div>
    );
};

export default DemandReportPage;
