import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../../api/api";
import WriteEditor from "../../common/WriteEditor/WriteEditor";
import "./CommissionForm.css";

const CommissionForm = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [image, setImage] = useState(null);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [maxCount, setMaxCount] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");
    const [editorContent, setEditorContent] = useState("");
    const [applicationForms, setApplicationForms] = useState([{ title: "", reqContent: "" }]);
    const [contentImages, setContentImages] = useState([]);
    const [deleteDetailIds, setDeleteDetailIds] = useState([]);
    const [showDescriptionModal, setShowDescriptionModal] = useState(false);

    useEffect(() => {
        const state = location.state;
        if (state) {
            // 수정 시 받는 값
            if (state.from === "management" && state.id) {
                setIsEditMode(true);
                setEditId(state.id);
                api.get(`/commission/post-detail/${state.id}`)
                    .then(res => {
                        const data = res.data;
                        setTitle(data.title || "");
                        setCategory(data.categoryName || "");
                        setMaxCount(data.requestLimited || "");
                        setMinPrice(data.minimumPrice || "");
                        setMaxPrice(data.maximumPrice || "");
                        setTags(data.hashtag ? data.hashtag.split(",") : []);
                        setEditorContent(state.content ?? data.content ?? ""); // ✅ state.content 우선 적용
                        setApplicationForms(
                            data.commissionDetail?.map(detail => ({
                                id: detail.id,
                                title: detail.title,
                                reqContent: detail.reqContent
                            })) || [{ title: "", reqContent: "" }]
                        );
                        setImage(state.image || data.thumbnailImage || null); // ✅ state.image 우선 적용
                        setContentImages(state.contentImages || []);
                    })
                    .catch(err => {
                        console.error(err);
                        alert("커미션 상세 정보를 불러오지 못했습니다.");
                    });
            } else if (state.from === "write") { // 상세설명 후 다시 왔을 때 받는 값
                setImage(state.image || null);
                setTitle(state.title || "");
                setCategory(state.category || "");
                setMaxCount(state.maxCount || "");
                setMinPrice(state.minPrice || "");
                setMaxPrice(state.maxPrice || "");
                setTags(state.tags || []);
                setApplicationForms(state.applicationForms || [{ title: "", reqContent: "" }]);
                setEditorContent(state.content || "");
                setContentImages(state.contentImages || []);
                if (state.id) {
                    setIsEditMode(true);
                    setEditId(state.id);
                }
            }
        }
    }, [location.state]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const preview = URL.createObjectURL(file);
            setImage({ file, preview });
        }
    };

    const handleAddTag = (e) => {
        e.preventDefault();
        if (tagInput.trim() !== "" && tags.length < 5) {
            setTags([...tags, tagInput.trim()]);
            setTagInput("");
        }
    };

    const handleRemoveTag = (index) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    const handleAddApplicationForm = () => {
        setApplicationForms([...applicationForms, { title: "", reqContent: "" }]);
    };

    const handleRemoveApplicationForm = (index) => {
        const removedForm = applicationForms[index];
        if (removedForm.id) {
            setDeleteDetailIds(prev => [...prev, removedForm.id]);
        }
        const updatedForms = applicationForms.filter((_, i) => i !== index);
        setApplicationForms(updatedForms.length > 0 ? updatedForms : [{ title: "", reqContent: "" }]);
    };

    const handleApplicationFormChange = (index, field, value) => {
        setApplicationForms(applicationForms.map((form, idx) =>
            idx === index ? { ...form, [field]: value } : form
        ));
    };

    const handleWriteClick = () => {
        setShowDescriptionModal(true);
    };

    const handleEditClick = () => {
        setShowDescriptionModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image?.file && !isEditMode) {
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
        if (applicationForms.some(form => !form.title || !form.reqContent)) {
            alert("모든 신청 양식을 작성해주세요.");
            return;
        }

        try {
            const formData = new FormData();
            const categoryMap = { "그림": 9, "글": 10, "기타": 11 };
            const postRequest = {
                id: isEditMode ? editId : null,
                title,
                content: editorContent,
                thumbnailImage: "",
                requestLimited: parseInt(maxCount),
                minimumPrice: parseInt(minPrice),
                maximumPrice: parseInt(maxPrice),
                hashtag: tags.join(","),
                categoryId: categoryMap[category] || 5,
                details: applicationForms.map(form => ({
                    id: form.id ?? null,
                    commissionId: isEditMode ? editId : null,
                    title: form.title,
                    reqContent: form.reqContent
                }))
            };

            formData.append(
                "postRequest",
                new Blob([JSON.stringify(postRequest)], { type: "application/json" })
            );

            // 이미지 추가 로그
            console.log('📸 [CommissionForm] 이미지 추가 시작:');
            console.log('📸 [CommissionForm] contentImages 개수:', contentImages.length);
            console.log('📸 [CommissionForm] contentImages 내용:', contentImages);
            
            if (isEditMode) {
                if (image?.file) {
                    console.log("📸 [CommissionForm] 썸네일 파일 추가:", image.file.name, '크기:', image.file.size);
                    formData.append("newThumbnailImage", image.file);
                }
                contentImages.forEach((img, idx) => {
                    if (img && img.file) {
                        console.log(`📸 [CommissionForm] contentImages[${idx}] 추가:`, img.file.name, '크기:', img.file.size);
                        formData.append("newContentImages", img.file);  // 수정 모드에서는 newContentImages
                    } else if (img instanceof File) {
                        console.log(`📸 [CommissionForm] contentImages[${idx}] 추가:`, img.name, '크기:', img.size);
                        formData.append("newContentImages", img);  // File 객체 자체
                    } else {
                        console.log(`📸 [CommissionForm] contentImages[${idx}] 건너뜀:`, img);
                    }
                });
                formData.append("deleteDetailIds", JSON.stringify(deleteDetailIds));
            } else {
                if (image?.file) {
                    console.log("📸 [CommissionForm] 썸네일 파일 추가:", image.file.name, '크기:', image.file.size);
                    formData.append("thumbnailImage", image.file);
                }
                contentImages.forEach((img, idx) => {
                    if (img && img.file) {
                        console.log(`📸 [CommissionForm] contentImages[${idx}] 추가:`, img.file.name, '크기:', img.file.size);
                        formData.append("contentImages", img.file);  // 생성 모드에서는 contentImages
                    } else if (img instanceof File) {
                        console.log(`📸 [CommissionForm] contentImages[${idx}] 추가:`, img.name, '크기:', img.size);
                        formData.append("contentImages", img);  // File 객체 자체
                    } else {
                        console.log(`📸 [CommissionForm] contentImages[${idx}] 건너뜀:`, img);
                    }
                });
            }

            // FormData 전체 key-value 로그
            console.log('📸 [CommissionForm] 서버로 보낼 FormData 내용:');
            for (let pair of formData.entries()) {
                if (pair[1] instanceof File) {
                    console.log(`📸 [CommissionForm] FormData[${pair[0]}]:`, pair[1].name, '크기:', pair[1].size, '타입:', pair[1].type);
                } else {
                    console.log(`📸 [CommissionForm] FormData[${pair[0]}]:`, pair[1]);
                }
            }

            const response = isEditMode
                ? await api.put("/commission/update", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                })
                : await api.post("/commission/create", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

            // 서버 응답에서 content가 있으면 플레이스홀더를 실제 S3 URL로 교체
            if (response.data && response.data.content) {
                let updatedContent = response.data.content;
                
                // 플레이스홀더를 실제 S3 URL로 교체
                if (contentImages.length > 0) {
                    contentImages.forEach((img, index) => {
                        const placeholder = `__IMAGE_PLACEHOLDER_${index}__`;
                        // 서버에서 반환된 이미지 URL 배열이 있다면 사용
                        if (response.data.contentImages && response.data.contentImages[index]) {
                            updatedContent = updatedContent.replace(placeholder, response.data.contentImages[index]);
                        }
                    });
                    
                    // 업데이트된 content를 response에 저장
                    response.data.content = updatedContent;
                }
            }

            alert(`커미션이 성공적으로 ${isEditMode ? "수정" : "등록"}되었습니다!`);
            navigate("/commission", { state: { response: response.data } });
        } catch (error) {
            console.error(error);
            alert(`커미션 ${isEditMode ? "수정" : "등록"}에 실패했습니다. 다시 시도해주세요.`);
        }
    };

    // WriteEditor에서 저장된 데이터를 처리하는 함수
    const handleDescriptionSave = (data) => {
        console.log('📸 [CommissionForm] handleDescriptionSave 호출:', data);
        console.log('📸 [CommissionForm] data.images:', data.images);
        console.log('📸 [CommissionForm] data.images 타입:', Array.isArray(data.images) ? 'Array' : typeof data.images);
        if (Array.isArray(data.images)) {
            data.images.forEach((img, idx) => {
                console.log(`📸 [CommissionForm] data.images[${idx}]:`, img);
                console.log(`📸 [CommissionForm] data.images[${idx}] instanceof File:`, img instanceof File);
            });
        }
        setEditorContent(data.content);
        setContentImages(data.images);
        setShowDescriptionModal(false);
    };

    const handleDescriptionCancel = () => {
        setShowDescriptionModal(false);
    };
    // 반환: 화면 렌더링 (폼 구성 및 상태 연동)
    return (
        <>
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
                            {applicationForms.length > 0 && (
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

            {/* WriteEditor 모달 */}
            {showDescriptionModal && (
                <WriteEditor
                    type="commission"
                    title="커미션 상세 설명 작성"
                    placeholder="커미션 상세 설명을 입력하세요..."
                    initialContent={editorContent}
                    initialImages={contentImages}
                    postId={editId}
                    isEditMode={isEditMode}
                    onSave={handleDescriptionSave}
                    onCancel={handleDescriptionCancel}
                />
            )}
        </>
    );
};

export default CommissionForm;
