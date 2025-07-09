import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import WriteEditor from "../../common/WriteEditor/WriteEditor";
import { LoginContext } from "../../../contexts/LoginContext";
import api from "../../../api/api"; // ★ api 인스턴스 import!
import "./DemandForm.css";

const categoryOptions = [
    { id: 1, name: "애니메이션" },
    { id: 2, name: "아이돌" },
    { id: 3, name: "순수창작" },
    { id: 4, name: "게임" },
    { id: 5, name: "영화" },
    { id: 6, name: "드라마" },
    { id: 7, name: "웹소설" },
    { id: 8, name: "웹툰" },
];



const DemandForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userInfo } = useContext(LoginContext);

    // ref for focus
    const titleRef = useRef();
    const startDateRef = useRef();
    const endDateRef = useRef();
    const hashtagInputRef = useRef();
    const descButtonRef = useRef();

    const [showDescriptionModal, setShowDescriptionModal] = useState(false);

    const isEditMode = !!(location.state && location.state.isEdit === true);
    const formData = location.state && location.state.formData ? location.state.formData : {};

    const [mainThumbnail, setMainThumbnail] = useState(null);
    const [mainThumbnailPreview, setMainThumbnailPreview] = useState(null);
    const [title, setTitle] = useState("");
    const [categoryId, setCategoryId] = useState(categoryOptions[0].id);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isAlwaysOnSale, setIsAlwaysOnSale] = useState(false);
    const [hashtagInput, setHashtagInput] = useState("");
    const [hashtags, setHashtags] = useState([]);
    const [products, setProducts] = useState([
        { name: "", price: "", imageFile: null, imagePreview: null, targetCount: "" },
    ]);
    const [description, setDescription] = useState("");
    const [descriptionImages, setDescriptionImages] = useState([]);

    useEffect(() => {
        if (location.state && location.state.formData) {
            const f = location.state.formData;
            const formatToDateInput = (dateStr) => {
                if (!dateStr) return "";
                if (dateStr.includes("T")) return dateStr.split("T")[0];
                if (dateStr.includes(" ")) return dateStr.split(" ")[0];
                return dateStr;
            };

            setTitle(f.title ?? "");
            setStartDate(formatToDateInput(f.startTime));
            setEndDate(formatToDateInput(f.endTime));
            setIsAlwaysOnSale(!f.startTime && !f.endTime);

            if (typeof f.categoryId === "number") {
                setCategoryId(f.categoryId);
            } else if (typeof f.category === "number") {
                setCategoryId(f.category);
            } else if (typeof f.category === "string") {
                const found = categoryOptions.find(opt => opt.name === f.category);
                setCategoryId(found ? found.id : categoryOptions[0].id);
            } else {
                setCategoryId(categoryOptions[0].id);
            }

            setDescription(f.description ?? "");
            setDescriptionImages(f.descriptionImages ?? []);

            setHashtags(
                Array.isArray(f.hashtag)
                    ? f.hashtag
                    : Array.isArray(f.hashtags)
                        ? f.hashtags
                        : typeof f.hashtag === "string"
                            ? f.hashtag.split(/[\s,]+/).filter(Boolean)
                            : []
            );

            if (f.imageUrl) {
                setMainThumbnailPreview(f.imageUrl);
            } else {
                setMainThumbnailPreview(null);
            }

            if (f.products?.length > 0) {
                setProducts(
                    f.products.map((p) => ({
                        name: p.name || "",
                        price: p.price || "",
                        targetCount: p.targetCount || "",
                        imageFile: null,
                        imagePreview: p.imageUrl || null,
                    }))
                );
            } else {
                setProducts([{ name: "", price: "", imageFile: null, imagePreview: null, targetCount: "" }]);
            }
        } else {
            setMainThumbnailPreview(null);
            setProducts([{ name: "", price: "", imageFile: null, imagePreview: null, targetCount: "" }]);
            setTitle("");
            setCategoryId(categoryOptions[0].id);
            setStartDate("");
            setEndDate("");
            setIsAlwaysOnSale(false);
            setHashtagInput("");
            setHashtags([]);
            setDescription("");
            setDescriptionImages([]);
        }
    }, [location.state]);

    // ====== 유효성 검사 함수 ======
    const validateForm = () => {
        if (!title.trim()) {
            alert("제목을 입력해주세요.");
            titleRef.current?.focus();
            return false;
        }
        if (!categoryId) {
            alert("카테고리를 선택해주세요.");
            return false;
        }
        if (!isAlwaysOnSale) {
            if (!startDate) {
                alert("수요조사 시작일을 입력해주세요.");
                startDateRef.current?.focus();
                return false;
            }
            if (!endDate) {
                alert("수요조사 종료일을 입력해주세요.");
                endDateRef.current?.focus();
                return false;
            }
        }
        if (hashtags.length === 0) {
            alert("해시태그를 1개 이상 입력해주세요.");
            hashtagInputRef.current?.focus();
            return false;
        }
        if (hashtags.length > 5) {
            alert("해시태그는 최대 5개까지 입력 가능합니다.");
            hashtagInputRef.current?.focus();
            return false;
        }
        for (let tag of hashtags) {
            if (tag.length === 0) {
                alert("빈 해시태그가 있습니다.");
                hashtagInputRef.current?.focus();
                return false;
            }
        }
        if (!products.length) {
            alert("상품 정보를 1개 이상 입력해주세요.");
            return false;
        }
        for (let i = 0; i < products.length; i++) {
            const p = products[i];
            if (!p.name.trim()) {
                alert(`상품 ${i + 1}의 이름을 입력해주세요.`);
                return false;
            }
            if (!p.price || isNaN(p.price) || Number(p.price) <= 0) {
                alert(`상품 ${i + 1}의 가격을 입력해주세요. (0보다 큰 숫자)`);
                return false;
            }
            if (!p.targetCount || isNaN(p.targetCount) || Number(p.targetCount) <= 0) {
                alert(`상품 ${i + 1}의 목표 수량을 입력해주세요. (0보다 큰 숫자)`);
                return false;
            }
            // 등록 모드에서는 반드시 상품 이미지가 필요
            if (!isEditMode && !p.imageFile) {
                alert(`상품 ${i + 1}의 이미지를 등록해주세요.`);
                return false;
            }
        }
        // 등록 모드에서는 반드시 썸네일 필요
        if (!isEditMode && !mainThumbnail) {
            alert("메인 썸네일 이미지를 등록해주세요.");
            return false;
        }
        if (!description || description.trim().length < 5) {
            alert("상세 설명을 입력해주세요.");
            descButtonRef.current?.focus();
            return false;
        }
        return true;
    };

    // ====== submit ======
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const productsForRequest = products.map((p) => ({
            name: p.name,
            price: Number(p.price),
            targetCount: Number(p.targetCount),
            imageUrl: p.imagePreview,
            imageUpdated: true,
        }));

        const mainImageUrlForRequest = mainThumbnailPreview;
        const descriptionForRequest = description;
        const hashtagString = Array.isArray(hashtags) ? hashtags.join(",") : hashtags;

        const startTime = startDate ? `${startDate}T09:00:00` : null;
        const endTime = endDate ? `${endDate}T18:00:00` : null;

        const payload = {
            title,
            description: descriptionForRequest,
            startTime,
            endTime,
            imageUrl: mainImageUrlForRequest,
            hashtag: hashtagString,
            isSafePayment: false,
            categoryId,
            products: productsForRequest,
        };

        try {
            let url, method, key;
            let isUpdate = isEditMode && formData?.id;

            if (isUpdate) {
                url = `/demand/update/${formData.id}`;
                method = "put";
                key = "demandPostUpdateRequest";
            } else {
                url = "/demand/create";
                method = "post";
                key = "demandPostCreateRequest";
            }

            const formDataToSend = new FormData();
            formDataToSend.append(
                key,
                new Blob([JSON.stringify(payload)], { type: "application/json" })
            );

            if (mainThumbnail) {
                console.log("[Demand] 썸네일 파일:", mainThumbnail);
                formDataToSend.append(isUpdate ? "newThumbnailImage" : "thumbnailImage", mainThumbnail);
            }
            products.forEach((p, idx) => {
                if (p.imageFile) {
                    console.log(`[Demand] 상품이미지[${idx}]:`, p.imageFile);
                    formDataToSend.append(isUpdate ? "newProductImages" : "productImages", p.imageFile);
                }
            });
            descriptionImages.forEach((file, idx) => {
                console.log(`[DemandForm] FormData append: descriptionImages[${idx}]`, file);
                formDataToSend.append(isUpdate ? "newDescriptionImages" : "descriptionImages", file);
            });

            // FormData 전체 key-value 로그
            for (let pair of formDataToSend.entries()) {
                if (pair[1] instanceof File) {
                    console.log(`[DemandForm] [FormData] ${pair[0]}:`, pair[1].name, pair[1]);
                } else {
                    console.log(`[DemandForm] [FormData] ${pair[0]}:`, pair[1]);
                }
            }

            // ★ fetch → api 인스턴스로 변경
            const res = await api[method](url, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true,
            });

            if (!(res.status >= 200 && res.status < 300)) {
                throw new Error(`서버 오류: ${res.status} ${res.statusText}`);
            }

            alert(isEditMode ? "수정 완료" : "등록 완료");
            if (isEditMode) {
                navigate("/mypage?page=demandFormManagement");
            } else {
                navigate("/demand");
            }
        } catch (err) {
            alert("저장 중 오류 발생: " + (err.response?.data?.message || err.message));
        }
    };

    const handleAddProduct = () => {
        setProducts([...products, { name: "", price: "", imageFile: null, imagePreview: null, targetCount: "" }]);
    };

    const handleNavigateToWrite = () => {
        setShowDescriptionModal(true);
    };

    const handleDescriptionSave = (data) => {
        console.log('[DemandForm] handleDescriptionSave 호출:', data);
        setDescription(data.content);
        setDescriptionImages(data.images);
        setShowDescriptionModal(false);
    };

    return (
        <div className="container">
            <form className="demand-form" onSubmit={handleSubmit}>
                <h2 className="demandFormTitle">수요조사 글 {isEditMode ? "수정" : "등록"}</h2>

                {/* 썸네일 업로드 */}
                <div className="thumbnail-upload">
                    <label htmlFor="main-thumbnail" className="thumbnail-box">
                        {mainThumbnailPreview ? (
                            <img src={mainThumbnailPreview} alt="메인 썸네일" className="thumbnail-preview" />
                        ) : (
                            <>
                                <span className="plus-sign">+</span>
                                <p>메인 썸네일 등록</p>
                            </>
                        )}
                    </label>
                    <input
                        type="file"
                        id="main-thumbnail"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            setMainThumbnail(file);
                            setMainThumbnailPreview(file ? URL.createObjectURL(file) : null);
                        }}
                        style={{ display: "none" }}
                    />
                </div>

                <div className="demandForm-group">
                    <label>폼 제목</label>
                    <input
                        className="demandText"
                        type="text"
                        placeholder="제목을 입력해주세요."
                        value={title}
                        ref={titleRef}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="demandForm-group">
                    <label>카테고리</label>
                    <select
                        className="demandFormSelect"
                        value={categoryId}
                        onChange={(e) => setCategoryId(Number(e.target.value))}
                    >
                        {categoryOptions.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                                {opt.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="demandForm-group">
                    <label>수요조사 기간</label>
                    <div className="date-range-row">
                        <div className="date-field">
                            <label>시작일</label>
                            <div className="date-input-wrapper">
                                <input
                                    type="date"
                                    className="demandStartDate"
                                    value={startDate}
                                    ref={startDateRef}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    disabled={isAlwaysOnSale}
                                />
                                <span className="calendar-icon"></span>
                            </div>
                        </div>
                        <span className="demandFormSeparate">~</span>
                        <div className="date-field">
                            <label>마감일</label>
                            <div className="date-input-wrapper">
                                <input
                                    type="date"
                                    className="demandEndDate"
                                    value={endDate}
                                    ref={endDateRef}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    disabled={isAlwaysOnSale}
                                />
                                <span className="calendar-icon"></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 해시태그 입력 */}
                <div className="demandForm-group">
                    <label>
                        해시 태그<span>({hashtags.length}/5)</span>(5개까지만 입력 가능합니다.)
                    </label>
                    <div className="tag-input-area">
                        <input
                            className="demandText"
                            type="text"
                            placeholder="해시 태그를 입력해주세요. ex) #애니"
                            value={hashtagInput}
                            ref={hashtagInputRef}
                            onChange={(e) => setHashtagInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    const newTag = hashtagInput.trim();
                                    if (newTag && !hashtags.includes(newTag)) {
                                        setHashtags([...hashtags, newTag]);
                                        setHashtagInput("");
                                    }
                                }
                            }}
                            disabled={hashtags.length >= 5}
                        />
                        <button type="button" onClick={() => {
                            const newTag = hashtagInput.trim();
                            if (newTag && !hashtags.includes(newTag)) {
                                setHashtags([...hashtags, newTag]);
                                setHashtagInput("");
                            }
                        }} disabled={hashtags.length >= 5}>
                            추가하기
                        </button>
                    </div>
                    <div className="tag-list">
                        {hashtags.map((tag, idx) => (
                            <span key={idx} className="demandTag">
                                #{tag}
                                <button
                                    type="button"
                                    className="demandDelete-tag"
                                    onClick={() => setHashtags(hashtags.filter((_, i) => i !== idx))}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                <h2>상품 정보 입력</h2>
                {products.map((p, idx) => (
                    <div key={idx} className="demandFormProduct-box">
                        <label htmlFor={`product-thumbnail-${idx}`} className="demandFormProduct-thumbnail">
                            {p.imagePreview ? (
                                <img src={p.imagePreview} alt="제품 썸네일" className="thumbnail-preview" />
                            ) : (
                                <>
                                    <span className="plus-sign">+</span>
                                    <p>제품 썸네일 등록</p>
                                </>
                            )}
                        </label>
                        <input
                            type="file"
                            id={`product-thumbnail-${idx}`}
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                setProducts(
                                    products.map((prod, i) =>
                                        i === idx
                                            ? {
                                                ...prod,
                                                imageFile: file,
                                                imagePreview: file ? URL.createObjectURL(file) : null,
                                            }
                                            : prod
                                    )
                                );
                            }}
                            style={{ display: "none" }}
                        />
                        <div className="product-details">
                            <input
                                className="demandText"
                                type="text"
                                placeholder="상품 이름을 입력해주세요."
                                value={p.name}
                                onChange={(e) =>
                                    setProducts(products.map((prod, i) => (i === idx ? { ...prod, name: e.target.value } : prod)))
                                }
                            />
                            <input
                                className="demandText"
                                type="number"
                                placeholder="해당 상품의 예상 가격을 입력해주세요."
                                value={p.price}
                                onChange={(e) =>
                                    setProducts(products.map((prod, i) => (i === idx ? { ...prod, price: e.target.value } : prod)))
                                }
                            />
                            <input
                                className="demandText"
                                type="number"
                                placeholder="실제 목표 수량보다 여유 있게 기입하는 것이 좋습니다."
                                value={p.targetCount}
                                onChange={(e) =>
                                    setProducts(products.map((prod, i) => (i === idx ? { ...prod, targetCount: e.target.value } : prod)))
                                }
                            />
                        </div>
                        <button type="button" className="delete-btn" onClick={() => setProducts(products.filter((_, i) => i !== idx))}>
                            삭제
                        </button>
                    </div>
                ))}
                <div className="addDemandProduct-wrapper">
                    <button type="button" className="add-product-btn" onClick={handleAddProduct}>
                        상품 추가하기
                    </button>
                </div>

                <h2 className="demandFormDesTitle">상세 설명</h2>
                <div className="description-box">
                    {description ? (
                        <>
                            <button type="button" ref={descButtonRef} className="demandFormEditBtn" onClick={handleNavigateToWrite}>
                                수정하기
                            </button>
                        </>
                    ) : (
                        <button type="button" ref={descButtonRef} className="demandFormWriteBtn" onClick={handleNavigateToWrite}>
                            작성하기
                        </button>
                    )}
                </div>
                <button type="submit" className="submit-btn">
                    {isEditMode ? "수정하기" : "등록하기"}
                </button>
            </form>
            {showDescriptionModal && (
                <WriteEditor
                    type="demand"
                    title="수요조사 상세 설명 작성"
                    placeholder="수요조사에 대한 상세한 설명을 입력해주세요..."
                    initialContent={description}
                    initialImages={descriptionImages}
                    postId={formData.id}
                    isEditMode={isEditMode}
                    onSave={handleDescriptionSave}
                    onCancel={() => setShowDescriptionModal(false)}
                />
            )}
        </div>
    );
};

export default DemandForm;
