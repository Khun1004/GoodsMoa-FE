import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DemandWrite from "../DemandWrite/DemandWrite.jsx";
import { LoginContext } from "../../../contexts/LoginContext";
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

const API_HOST = "http://localhost:8080/";

const patchDescriptionToRelative = (html) =>
    html
        ? html.replace(
            /(<img\s+[^>]*src=['"]?)https?:\/\/localhost:8080\/([^'">]+)(['"]?[^>]*>)/g,
            (match, p1, p2, p3) => `${p1}${p2}${p3}`
        )
        : "";

const stripHostFromUrl = (url) => {
    if (!url) return "";
    return url.replace(/^https?:\/\/localhost:8080\//, "");
};

const DemandForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userInfo } = useContext(LoginContext);

    const [showDescriptionModal, setShowDescriptionModal] = useState(false);


    // 등록/수정 모드 구분
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
            // 항상 formData 기반으로 상태 세팅!
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

            // 서버 주소는 수정모드(isEditMode)에서만 붙이기!
            if (f.imageUrl) {
                setMainThumbnailPreview(
                    (location.state.isEdit === true && !f.imageUrl.startsWith("http"))
                        ? `${API_HOST}${f.imageUrl.replace(/^\/+/g, "")}`
                        : f.imageUrl
                );
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
                        imagePreview: p.imageUrl
                            ? ((location.state.isEdit === true && !p.imageUrl.startsWith("http"))
                                ? `${API_HOST}${p.imageUrl.replace(/^\/+/g, "")}`
                                : p.imageUrl)
                            : null,
                    }))
                );
            } else {
                setProducts([{ name: "", price: "", imageFile: null, imagePreview: null, targetCount: "" }]);
            }
        } else {
            // 완전 새로 폼 진입(아무 state 없이 진입)일 때만 빈 폼으로 초기화
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


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isEditMode && !mainThumbnail) {
            alert("썸네일 이미지는 필수입니다.");
            return;
        }

        const productsForRequest = products.map((p) => ({
            name: p.name,
            price: Number(p.price),
            targetCount: Number(p.targetCount),
            imageUrl: stripHostFromUrl(p.imagePreview),
            imageUpdated: true,
        }));

        const mainImageUrlForRequest = stripHostFromUrl(mainThumbnailPreview);
        const descriptionForRequest = patchDescriptionToRelative(description);
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
                url = `http://localhost:8080/demand/update/${formData.id}`;
                method = "PUT";
                key = "demandPostUpdateRequest";
            } else {
                url = "http://localhost:8080/demand/create";
                method = "POST";
                key = "demandPostCreateRequest";
            }

            const formDataToSend = new FormData();
            formDataToSend.append(
                key,
                new Blob([JSON.stringify(payload)], { type: "application/json" })
            );

            if (mainThumbnail) {
                formDataToSend.append(isUpdate ? "newThumbnailImage" : "thumbnailImage", mainThumbnail);
            }

            products.forEach((p) => {
                if (p.imageFile) {
                    formDataToSend.append(isUpdate ? "newProductImages" : "productImages", p.imageFile);
                }
            });

            descriptionImages.forEach((file) => {
                formDataToSend.append(isUpdate ? "newDescriptionImages" : "descriptionImages", file);
            });

            // ==== 서버 전송 데이터 로그 =====
            console.log("====== [서버 전송 정보] ======");
            console.log("[payload - JSON]", payload);
            console.log("[메인 썸네일]", mainThumbnail);
            console.log("[상품 이미지 리스트]", products.map((p) => p.imageFile));
            console.log("[상세설명 이미지 리스트]", descriptionImages);
            console.log("[FormData] imageUrl:", mainImageUrlForRequest);
            console.log("[FormData] hashtag:", hashtagString);
            console.log("[FormData] startTime, endTime:", startTime, endTime);
            for (let [key, value] of formDataToSend.entries()) {
                console.log(`[FormDataToSend] ${key}:`, value);
            }
            console.log("================================");
            // =============================

            const res = await fetch(url, {
                method,
                body: formDataToSend,
                credentials: "include",
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`서버 오류: ${res.status} ${res.statusText} - ${errorText}`);
            }

            alert(isEditMode ? "수정 완료" : "등록 완료");
            if (isEditMode) {
                navigate("/mypage?page=demandFormManagement");
            } else {
                navigate("/demand");
            }
        } catch (err) {
            alert("저장 중 오류 발생: " + err.message);
        }
    };

    const handleAddProduct = () => {
        setProducts([...products, { name: "", price: "", imageFile: null, imagePreview: null, targetCount: "" }]);
    };

    const handleNavigateToWrite = () => {
        setShowDescriptionModal(true);
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
                            <button type="button" className="demandFormEditBtn" onClick={handleNavigateToWrite}>
                                수정하기
                            </button>
                        </>
                    ) : (
                        <button type="button" className="demandFormWriteBtn" onClick={handleNavigateToWrite}>
                            작성하기
                        </button>
                    )}
                </div>
                <button type="submit" className="submit-btn">
                    {isEditMode ? "수정하기" : "등록하기"}
                </button>
            </form>
            {/* 모달은 여기! */}
            {showDescriptionModal && (
                <DemandWrite
                    description={description}
                    setDescription={setDescription}
                    descriptionImages={descriptionImages}
                    setDescriptionImages={setDescriptionImages}
                    onClose={() => setShowDescriptionModal(false)}
                />
            )}
        </div>
    );
};


export default DemandForm;
