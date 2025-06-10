import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
    const [editorContent, setEditorContent] = useState(location.state?.description || "");
    const [applicationForms, setApplicationForms] = useState([
        { title: "", description: "" }
    ]);

    // 이미지 업로드 핸들러
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setImage(imageUrl);
        }
    };

    useEffect(() => {
        const state = location.state;
        if (state) {
            if (state.image) setImage(state.image);
            if (state.title) setTitle(state.title);
            if (state.category) setCategory(state.category);
            if (state.maxCount) setMaxCount(state.maxCount);
            if (state.minPrice) setMinPrice(state.minPrice);
            if (state.maxPrice) setMaxPrice(state.maxPrice);
            if (state.tags) setTags(state.tags);
            if (state.applicationForms) setApplicationForms(state.applicationForms);
            if (state.description) setEditorContent(state.description);
        }
    }, [location.state]);
    
    useEffect(() => {
        const editingCommission = JSON.parse(localStorage.getItem("editingCommission"));
        if (editingCommission) {
            setIsEditMode(true);
            setEditId(editingCommission.id); // ID 저장!
            setImage(editingCommission.image || null);
            setTitle(editingCommission.title || "");
            setCategory(editingCommission.category || "");
            setMaxCount(editingCommission.maxCount || "");
            setMinPrice(editingCommission.minPrice || "");
            setMaxPrice(editingCommission.maxPrice || "");
            setTags(editingCommission.tags || []);
            setApplicationForms(editingCommission.applicationForms || [{ title: "", description: "" }]);
            setEditorContent(editingCommission.description || "");
            localStorage.removeItem("editingCommission");
        }
    }, []);
    
    // 해시태그 추가 핸들러
    const handleAddTag = (e) => {
        e.preventDefault();
        if (tagInput.trim() !== "" && tags.length < 5) {
            setTags([...tags, tagInput.trim()]);
            setTagInput("");
        }
    };

    // 해시태그 삭제 핸들러
    const handleRemoveTag = (index) => {
        setTags(tags.filter((_, i) => i !== index));
    };

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
                description: editorContent,
            }
        });
    };

    const handleEditClick = () => {
        navigate("/commissionWrite", { 
            state: { 
                description: editorContent 
            } 
        });
    };

    // 신청 양식 추가 핸들러
    const handleAddApplicationForm = () => {
        setApplicationForms([...applicationForms, { title: "", description: "" }]);
    };

    // 신청 양식 제거 핸들러
    const handleRemoveApplicationForm = (index) => {
        if (applicationForms.length > 1) {
            setApplicationForms(applicationForms.filter((_, i) => i !== index));
        }
    };

    // 신청 양식 변경 핸들러
    const handleApplicationFormChange = (index, field, value) => {
        const updatedForms = [...applicationForms];
        updatedForms[index][field] = value;
        setApplicationForms(updatedForms);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!image) {
            alert("이미지를 업로드해주세요.");
            return;
        }
        
        if (!title || !category || !maxCount || !minPrice || !maxPrice) {
            alert("모든 필수 항목을 입력해주세요.");
            return;
        }
        
        if (minPrice < maxPrice) {
            alert("최소 금액은 최대 금액보다 클 수 없습니다.");
            return;
        }
        
        for (const form of applicationForms) {
            if (!form.title || !form.description) {
                alert("모든 신청 양식을 작성해주세요.");
                return;
            }
        }
        
        const commissionData = {
            id: isEditMode ? editId : Date.now(), // 수정이면 기존 ID 유지
            image,
            title,
            category,
            maxCount: parseInt(maxCount),
            minPrice: parseInt(minPrice),
            maxPrice: parseInt(maxPrice),
            tags,
            applicationForms,
            description: editorContent,
            createdAt: new Date().toISOString()
        };
    
        const existingCommissions = JSON.parse(localStorage.getItem('commissions')) || [];
    
        let updatedCommissions;
    
        if (isEditMode) {
            updatedCommissions = existingCommissions.map(item =>
                item.id === editId ? commissionData : item
            );
            alert("커미션이 수정되었습니다!");
        } else {
            updatedCommissions = [...existingCommissions, commissionData];
            alert("커미션이 성공적으로 등록되었습니다!");
        }
    
        localStorage.setItem('commissions', JSON.stringify(updatedCommissions));
        navigate("/commission");
    };
    
    return (
        <div className="container">
            <h1 className="commissionForm-title">커미션 폼목 만들기</h1>

            <form className="commission-form" onSubmit={handleSubmit}>
                {/* 이미지 업로드 */}
                <div className="image-upload">
                    <label className="upload-box">
                        {image ? (
                        <img src={image} alt="Uploaded" className="uploaded-image" />
                        ) : (
                        <span className="upload-text">+ 사진 등록</span>
                        )}
                        <input 
                            type="file" 
                            className="hidden" 
                            onChange={handleImageChange} 
                            accept="image/*"
                            style={{ display: "none" }}
                        />
                    </label>
                </div>

                {/* 제목 입력 */}
                <label className="form-label">커미션 타입(제목)</label>
                <input
                    type="text"
                    placeholder="타입을 입력해주세요."
                    className="form-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />

                {/* 카테고리 선택 */}
                <label className="form-label">카테고리</label>
                <select
                    className="form-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                >
                    <option value="">카테고리를 선택해주세요</option>
                    <option value="그림">그림</option>
                    <option value="사진">사진</option>
                    <option value="공예">공예</option>
                    <option value="문학">문학</option>
                    <option value="기타">기타</option>
                </select>

                 {/* 상세 설명 */}
                <div>
                    <label className="form-label">상세설명</label>
                    <div className="description-box">
                        {editorContent ? (
                            <>
                                <div 
                                    className="description-display hidden" 
                                    dangerouslySetInnerHTML={{ __html: editorContent }} 
                                />
                                <button 
                                    type="button"
                                    className="commFormEditBtn" 
                                    onClick={handleEditClick}
                                >
                                    수정하기
                                </button>
                            </>
                        ) : (
                            <button 
                                type="button"
                                className="commFormWriteBtn" 
                                onClick={handleWriteClick}
                            >
                                작성하기
                            </button>
                        )}
                    </div>
                </div>

                {/* 최대 동시 진행 개수 */}
                <label className="form-label">최대 동시 진행 커미션 개수</label>
                <div className="con-input-group">
                    <input
                        type="number"
                        className="small-input"
                        value={maxCount}
                        onChange={(e) => setMaxCount(e.target.value)}
                        placeholder="개수"
                        min="1"
                        required
                    />
                    <span className="unit-text">개</span>
                </div>

                {/* 해시태그 입력 */}
                <label className="form-label">
                    해시 태그 <span className="tag-limit">( {tags.length}/5 ) 5개까지 입력 가능합니다.</span>
                </label>
                <div className="tag-input-box">
                    <input
                        type="text"
                        placeholder="해시 태그를 입력해주세요. (ex: #캐릭터)"
                        className="form-input tag-input"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
                    />
                    <button 
                        type="button"
                        className="conAdd-tag-button" 
                        onClick={handleAddTag}
                        disabled={tags.length >= 5}
                    >
                        추가하기
                    </button>
                </div>
                <div className="tag-list">
                    {tags.map((tag, index) => (
                        <span key={index} className="tag-item" onClick={() => handleRemoveTag(index)}>
                            #{tag} ×
                        </span>
                    ))}
                </div>

                {/* 커미션 신청 양식들 */}
                <h2 className="section-title">커미션 신청 양식</h2>
                {applicationForms.map((form, index) => (
                    <div key={index} className="application-form-container">
                        <div className="form-header">
                            <h3 className="form-subtitle">신청 양식 {index + 1}</h3>
                            {applicationForms.length > 1 && (
                                <button 
                                    type="button"
                                    className="remove-form-button"
                                    onClick={() => handleRemoveApplicationForm(index)}
                                >
                                    삭제
                                </button>
                            )}
                        </div>
                        
                        <label className="form-label">제목</label>
                        <input
                            type="text"
                            placeholder="제목을 입력하세요."
                            className="form-input"
                            value={form.title}
                            onChange={(e) => handleApplicationFormChange(index, 'title', e.target.value)}
                            required
                        />

                        <label className="form-label">설명</label>
                        <textarea
                            className="form-input description-textarea"
                            placeholder="설명에 대한 정보를 적어주세요."
                            value={form.description}
                            onChange={(e) => handleApplicationFormChange(index, 'description', e.target.value)}
                            rows="5"
                            required
                        />
                    </div>
                ))}

                {/* 신청 양식 추가 버튼 */}
                <button 
                    type="button"
                    className="add-form-button"
                    onClick={handleAddApplicationForm}
                >
                    + 신청 양식 추가하기
                </button>

                {/* 최소/최대 신청 금액 */}
                <div className="price-input-group">
                    <div className="price-box">
                        <label className="form-label">최소 신청금액</label>
                        <div className="price-input-wrapper">
                            <input
                                type="number"
                                placeholder="최소금액을 적어주세요"
                                className="form-input"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                min="0"
                                required
                            />
                            <span className="unit-text">원</span>
                        </div>
                    </div>
                    <span className="price-separator">~</span>
                    <div className="price-box">
                        <label className="form-label">최대 신청금액</label>
                        <div className="price-input-wrapper">
                            <input
                                type="number"
                                placeholder="최대금액을 입력해주세요"
                                className="form-input"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                min="0"
                                required
                            />
                            <span className="unit-text">원</span>
                        </div>
                    </div>
                </div>

                {/* 등록 버튼 */}
                <button type="submit" className="submit-button">
                    {isEditMode ? "수정 등록하기" : "등록하기"}
                </button>
            </form>
        </div>
    );
};

export default CommissionForm;