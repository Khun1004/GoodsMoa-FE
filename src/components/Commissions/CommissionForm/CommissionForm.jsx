import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../../api/api";
import "./CommissionForm.css";

const CommissionForm = () => {
    // 라우팅 관련 훅 선언
    const navigate = useNavigate();
    const location = useLocation();

    // 상태값 선언 (커미션 작성 및 수정용)
    const [isEditMode, setIsEditMode] = useState(false); // 수정 모드 여부
    const [editId, setEditId] = useState(null); // 수정 시 사용될 id
    const [image, setImage] = useState(null); // 썸네일 이미지
    const [title, setTitle] = useState(""); // 커미션 제목
    const [category, setCategory] = useState(""); // 카테고리
    const [maxCount, setMaxCount] = useState(""); // 최대 진행 개수
    const [minPrice, setMinPrice] = useState(""); // 최소 금액
    const [maxPrice, setMaxPrice] = useState(""); // 최대 금액
    const [tags, setTags] = useState([]); // 해시태그 배열
    const [tagInput, setTagInput] = useState(""); // 태그 입력 필드
    const [editorContent, setEditorContent] = useState(location.state?.content || ""); // 상세 설명 내용
    const [applicationForms, setApplicationForms] = useState([{ title: "", reqContent: "" }]); // 신청 양식 배열
    const [contentImages, setContentImages] = useState(location.state?.contentImages || []); // 상세 이미지 배열

    // TODO 글 상세조회 만들면 수정 시 상세조회로 가져오게 만들기
    // 수정 시 state에서 값 가져오기
    useEffect(() => {
        const state = location.state;
        if (state) {
            state.image && setImage(state.image);
            state.title && setTitle(state.title);
            state.category && setCategory(state.category);
            state.maxCount && setMaxCount(state.maxCount);
            state.minPrice && setMinPrice(state.minPrice);
            state.maxPrice && setMaxPrice(state.maxPrice);
            state.tags && setTags(state.tags);
            state.applicationForms && setApplicationForms(state.applicationForms);
            state.content && setEditorContent(state.content);
            state.contentImages && setContentImages(state.contentImages);
        }
    }, [location.state]);

    // 썸네일 이미지 변경 핸들러
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const preview = URL.createObjectURL(file);
            setImage({ file, preview });
        }
    };

    // 태그 추가 핸들러
    const handleAddTag = (e) => {
        e.preventDefault();
        if (tagInput.trim() !== "" && tags.length < 5) {
            setTags([...tags, tagInput.trim()]);
            setTagInput("");
        }
    };

    // 태그 삭제 핸들러
    const handleRemoveTag = (index) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    // 상세 설명 작성 버튼 핸들러 (글쓰기 페이지로 이동)
    const handleWriteClick = () => {
        navigate("/commissionWrite", {
            state: {
                image,
                title,
                category,
                maxCount,
                minPrice,
                maxPrice,
                tags,
                applicationForms,
                content: editorContent,
                contentImages,
            },
        });
    };

    // 상세 설명 수정 버튼 핸들러 (같은 로직 사용)
    const handleEditClick = handleWriteClick;

    // 신청 양식 추가 핸들러
    const handleAddApplicationForm = () => {
        setApplicationForms([...applicationForms, { title: "", reqContent: "" }]);
    };

    // 신청 양식 삭제 핸들러
    const handleRemoveApplicationForm = (index) => {
        if (applicationForms.length > 1) {
            setApplicationForms(applicationForms.filter((_, i) => i !== index));
        }
    };

    // 신청 양식 내용 변경 핸들러
    const handleApplicationFormChange = (index, field, value) => {
        const updatedForms = [...applicationForms];
        updatedForms[index][field] = value;
        setApplicationForms(updatedForms);
    };

    // 폼 제출 핸들러 (커미션 등록 처리)
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 유효성 검사
        if (!image?.file) {
            alert("썸네일 이미지를 업로드해주세요.");
            return;
        }
        if (!title || !category || !maxCount || !minPrice || !maxPrice) {
            alert("모든 필수 항목을 입력해주세요.");
            return;
        }
        if (parseInt(minPrice) > parseInt(maxPrice)) {
            alert("최소 금액은 최대 금액보다 클 수 없습니다.");
            return;
        }
        for (const form of applicationForms) {
            if (!form.title || !form.reqContent) {
                alert("모든 신청 양식을 작성해주세요.");
                return;
            }
        }

        try {
            // FormData 생성 및 데이터 구성
            const formData = new FormData();
            const categoryMap = {"그림": 9, "글": 10, "기타": 11};

            const postRequest = {
                id: null,
                title,
                content: editorContent,
                thumbnailImage: "",
                requestLimited: parseInt(maxCount),
                minimumPrice: parseInt(minPrice),
                maximumPrice: parseInt(maxPrice),
                hashtag: tags.join(","),
                categoryId: categoryMap[category] || 5,
                details: applicationForms.map(form => ({
                    commissionId: null,
                    title: form.title,
                    reqContent: form.reqContent
                })),
            };

            formData.append(
                "postRequest",
                new Blob([JSON.stringify(postRequest)], { type: "application/json" })
            );
            formData.append("thumbnailImage", image.file);

            // 상세 이미지 추가
            contentImages.forEach(img => {
                if (img.file) {
                    formData.append("contentImages", img.file);
                }
            });

            // API 요청 및 전송
            const response = await api.post("/commission/create", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            alert("커미션이 성공적으로 등록되었습니다!");
            navigate("/commission", { state: { response: response.data } });
        } catch (error) {
            console.error("커미션 등록 실패:", error);
            alert("커미션 등록에 실패했습니다. 다시 시도해주세요.");
        }
    };

    // 반환: 화면 렌더링 (폼 구성 및 상태 연동)
    return (
        <div className="container">
            <h1 className="commissionForm-title">커미션 폼 작성</h1>
            <form className="commission-form" onSubmit={handleSubmit}>
                <div className="image-upload">
                    <label className="upload-box">
                        {image ? (
                            <img
                                src={typeof image === 'string' ? image : image.preview}
                                alt="업로드"
                                className="uploaded-image"
                            />
                        ) : (
                            <span className="upload-text">+ 사진 등록</span>
                        )}
                        <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                    </label>
                </div>

                <label className="form-label">커미션 제목</label>
                <input type="text" className="form-input" placeholder="제목을 입력해주세요." value={title} onChange={(e) => setTitle(e.target.value)} />

                <label className="form-label">카테고리</label>
                <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">카테고리를 선택해주세요</option>
                    <option value="그림">그림</option>
                    <option value="문학">글</option>
                    <option value="기타">기타</option>
                </select>

                <label className="form-label">상세 설명</label>
                <div className="description-box">
                    {editorContent ? (
                        <button type="button" className="commFormEditBtn" onClick={handleEditClick}>수정하기</button>
                    ) : (
                        <button type="button" className="commFormWriteBtn" onClick={handleWriteClick}>작성하기</button>
                    )}
                </div>

                <label className="form-label">최대 진행 개수</label>
                <div className="con-input-group">
                    <input type="number" className="small-input" placeholder="개수" value={maxCount} onChange={(e) => setMaxCount(e.target.value)} min="1" />
                    <span className="unit-text">개</span>
                </div>

                <label className="form-label">해시태그</label>
                <div className="tag-input-box">
                    <input type="text" className="form-input tag-input" placeholder="#태그 입력" value={tagInput} onChange={(e) => setTagInput(e.target.value)} />
                    <button type="button" className="conAdd-tag-button" onClick={handleAddTag}>추가</button>
                </div>
                <div className="tag-list">
                    {tags.map((tag, idx) => (
                        <span key={idx} className="tag-item" onClick={() => handleRemoveTag(idx)}>#{tag} ×</span>
                    ))}
                </div>

                <h2 className="section-title">신청 양식</h2>
                {applicationForms.map((form, idx) => (
                    <div key={idx} className="application-form-container">
                        <label className="form-label">제목</label>
                        <input type="text" className="form-input" placeholder="제목 입력" value={form.title} onChange={(e) => handleApplicationFormChange(idx, 'title', e.target.value)} />
                        <label className="form-label">내용</label>
                        <textarea className="form-input description-textarea" placeholder="내용 입력" value={form.reqContent} onChange={(e) => handleApplicationFormChange(idx, 'reqContent', e.target.value)} />
                        {applicationForms.length > 1 && (
                            <button type="button" className="remove-form-button" onClick={() => handleRemoveApplicationForm(idx)}>삭제</button>
                        )}
                    </div>
                ))}
                <button type="button" className="add-form-button" onClick={handleAddApplicationForm}>+ 신청 양식 추가</button>

                <div className="price-input-group">
                    <div className="price-box">
                        <label className="form-label">최소 금액</label>
                        <input type="number" className="form-input" placeholder="최소 금액" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} min="0" />
                    </div>
                    <span className="price-separator">~</span>
                    <div className="price-box">
                        <label className="form-label">최대 금액</label>
                        <input type="number" className="form-input" placeholder="최대 금액" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} min="0" />
                    </div>
                </div>

                <h2 className="section-title">상세 이미지 미리보기</h2>
                <div className="commissionImage-preview-container">
                    {contentImages.map((img, idx) => (
                        <div key={idx} className="commissionImage-preview-item">
                            <img src={img.preview || img.url} alt={`업로드 이미지 ${idx + 1}`} />
                        </div>
                    ))}
                </div>

                <button type="submit" className="submit-button">{isEditMode ? "수정 등록하기" : "등록하기"}</button>
            </form>
        </div>
    );
};

export default CommissionForm;
