import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

const DemandForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userInfo } = useContext(LoginContext);

    const demandData = location.state || null;
    const isEditMode = !!(demandData && demandData.id);

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
        if (demandData) {
            const formatToDateInput = (dateStr) => {
                if (!dateStr) return "";
                return dateStr.split("T")[0] || dateStr.split(" ")[0];
            };
            setTitle(demandData.title ?? "");
            setStartDate(formatToDateInput(demandData.startDate || demandData.startTime));
            setEndDate(formatToDateInput(demandData.endDate || demandData.endTime));
            setIsAlwaysOnSale(demandData.isAlwaysOnSale ?? false);
            setCategoryId(demandData.categoryId ?? demandData.category ?? categoryOptions[0].id);
            setDescription(demandData.description ?? "");
            setDescriptionImages(demandData.descriptionImages ?? []);
            setHashtags(
                Array.isArray(demandData.hashtags)
                    ? demandData.hashtags
                    : (demandData.hashtag ? demandData.hashtag.split(" ") : [])
            );

            if (demandData.mainThumbnail) {
                setMainThumbnail(demandData.mainThumbnail);
                setMainThumbnailPreview(
                    typeof demandData.mainThumbnail === "string"
                        ? demandData.mainThumbnail
                        : URL.createObjectURL(demandData.mainThumbnail)
                );
            }

            if (demandData.products && demandData.products.length > 0) {
                setProducts(
                    demandData.products.map((p) => ({
                        name: p.name || "",
                        price: p.price || "",
                        targetCount: p.targetCount || p.quantity || "",
                        imageFile: p.imageFile || null,
                        imagePreview: p.imageFile ? URL.createObjectURL(p.imageFile) : p.imagePreview || null,
                    }))
                );
            }
        }
    }, [demandData]);

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        setMainThumbnail(file);
        setMainThumbnailPreview(file ? URL.createObjectURL(file) : null);
    };

    const handleProductImageChange = (idx, file) => {
        setProducts(products.map((p, i) =>
            i === idx
                ? { ...p, imageFile: file, imagePreview: file ? URL.createObjectURL(file) : null }
                : p
        ));
    };

    const handleAddProduct = () => {
        setProducts([...products, { name: "", price: "", imageFile: null, imagePreview: null, targetCount: "" }]);
    };

    const handleProductChange = (idx, field, value) => {
        setProducts(products.map((p, i) => i === idx ? { ...p, [field]: value } : p));
    };

    const handleDeleteProduct = (idx) => {
        setProducts(products.filter((_, i) => i !== idx));
    };

    const addHashtag = () => {
        let tag = hashtagInput.trim().replace(/^#+/, "");
        if (!tag || hashtags.includes(tag) || hashtags.length >= 5) {
            setHashtagInput("");
            return;
        }
        setHashtags(prev => [...prev, tag]);
        setHashtagInput("");
    };

    const handleHashtagKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addHashtag();
        }
    };

    const removeHashtag = (idx) => {
        setHashtags(prev => prev.filter((_, i) => i !== idx));
    };

    const handleWriteClick = () => {
        navigate("/demandWrite", {
            state: {
                id: demandData?.id,
                title,
                startDate,
                endDate,
                isAlwaysOnSale,
                categoryId,
                products,
                mainThumbnail,
                description,
                descriptionImages,
                hashtags,
            },
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!mainThumbnail && !mainThumbnailPreview) {
            alert("메인 썸네일을 등록해주세요.");
            return;
        }
        if (!title.trim()) {
            alert("제목을 입력해주세요.");
            return;
        }
        if (!isAlwaysOnSale && (!startDate || !endDate)) {
            alert("수요조사 기간을 입력해주세요.");
            return;
        }
        if (!categoryId) {
            alert("카테고리를 선택해주세요.");
            return;
        }
        if (!userInfo || !userInfo.id) {
            alert("로그인이 필요합니다.");
            return;
        }

        const missingImageIdx = products.findIndex(p => !p.imageFile);
        if (missingImageIdx !== -1) {
            alert(`상품 ${missingImageIdx + 1}의 이미지를 등록해주세요.`);
            return;
        }

        const demandPostCreateRequest = {
            ...(isEditMode ? { id: demandData.id } : {}),
            title,
            description,
            startTime: isAlwaysOnSale ? null : new Date(startDate + "T09:00:00").toISOString(),
            endTime: isAlwaysOnSale ? null : new Date(endDate + "T09:00:00").toISOString(),
            imageUrl: mainThumbnail?.name || mainThumbnailPreview,
            hashtag: hashtags.join(" "),
            isSafePayment: false,
            categoryId: Number(categoryId),
            products: products.map((p) => ({
                name: p.name,
                price: Number(p.price),
                imageUrl: p.imageFile ? p.imageFile.name : p.imagePreview || "",
                targetCount: Number(p.targetCount),
            })),
            userId: userInfo.id,
        };

        let formData = null;
        let headers = {};
        let body = null;

        if (mainThumbnail instanceof File || products.some(p => p.imageFile)) {
            formData = new FormData();
            formData.append(
                "demandPostCreateRequest",
                new Blob([JSON.stringify(demandPostCreateRequest)], { type: "application/json" })
            );
            if (mainThumbnail instanceof File) {
                formData.append("thumbnailImage", mainThumbnail);
            }
            products.forEach((p) => {
                if (p.imageFile) {
                    formData.append("productImages", p.imageFile);
                }
            });
            descriptionImages.forEach(file => {
                formData.append("descriptionImages", file);
            });
            body = formData;
        } else {
            headers["Content-Type"] = "application/json";
            body = JSON.stringify(demandPostCreateRequest);
        }

        try {
            const apiUrl = isEditMode
                ? "http://localhost:8080/demand/update"
                : "http://localhost:8080/demand/create";
            const method = isEditMode ? "PUT" : "POST";
            const res = await fetch(apiUrl, {
                method,
                headers,
                body,
                credentials: "include",
            });
            const contentType = res.headers.get("content-type");
            const data = contentType && contentType.includes("application/json")
                ? await res.json()
                : await res.text();
            if (!res.ok) throw new Error((data && data.message) || (isEditMode ? "수정 실패" : "등록 실패"));
            alert(isEditMode ? "수정 성공!" : "등록 성공!");
            navigate("/demand");
        } catch (err) {
            alert("에러: " + err.message);
        }
    };

    return (
        <div className="container">
            <form className="demand-form" onSubmit={handleSubmit}>
                <h2 className="demandFormTitle">수요조사 글 {isEditMode ? "수정" : "등록"}</h2>
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
                    <input type="file" id="main-thumbnail" accept="image/*" onChange={handleThumbnailChange}
                           style={{ display: "none" }} />
                </div>
                <div className="demandForm-group">
                    <label>폼 제목</label>
                    <input
                        className="demandText"
                        type="text"
                        placeholder="제목을 입력해주세요."
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className="demandForm-group">
                    <label>카테고리</label>
                    <select
                        className="demandFormSelect"
                        value={categoryId ?? ""}
                        onChange={e => setCategoryId(Number(e.target.value))}
                    >
                        {categoryOptions.map(option => (
                            <option key={option.id} value={option.id}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="demandForm-group">
                    <h2>수요조사 기간</h2>
                    <div className="date-range-row">
                        <div className="date-field">
                            <label>수요조사 시작일</label>
                            <div className="date-input-wrapper">
                                <input
                                    type="date"
                                    className="demandStartDate"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    disabled={isAlwaysOnSale}
                                    required={!isAlwaysOnSale}
                                />
                                <span className="calendar-icon"></span>
                            </div>
                        </div>
                        <span className="demandFormSeparate">~</span>
                        <div className="date-field">
                            <label>수요조사 마감일</label>
                            <div className="date-input-wrapper">
                                <input
                                    type="date"
                                    className="demandEndDate"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    disabled={isAlwaysOnSale}
                                    required={!isAlwaysOnSale}
                                />
                                <span className="calendar-icon"></span>
                            </div>
                        </div>
                    </div>
                </div>
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
                            onChange={e => setHashtagInput(e.target.value)}
                            onKeyDown={handleHashtagKeyDown}
                            disabled={hashtags.length >= 5}
                        />
                        <button type="button" onClick={addHashtag} disabled={hashtags.length >= 5}>
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
                                    onClick={() => removeHashtag(idx)}
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
                            onChange={e => handleProductImageChange(idx, e.target.files[0])}
                            style={{ display: "none" }}
                        />
                        <div className="product-details">
                            <input
                                className="demandText"
                                type="text"
                                placeholder="상품 이름을 입력해주세요."
                                value={p.name}
                                onChange={e => handleProductChange(idx, "name", e.target.value)}
                            />
                            <input
                                type="number"
                                placeholder="해당 상품의 예상 가격을 입력해주세요."
                                value={p.price}
                                onChange={e => handleProductChange(idx, "price", e.target.value)}
                            />
                            <input
                                type="number"
                                placeholder="실제 목표 수량보다 여유 있게 기입하는 것이 좋습니다."
                                value={p.targetCount}
                                onChange={e => handleProductChange(idx, "targetCount", e.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            className="delete-btn"
                            onClick={() => handleDeleteProduct(idx)}
                            style={{ marginTop: 8 }}
                        >
                            삭제
                        </button>
                    </div>
                ))}
                <div className="addDemandProduct-wrapper">
                    <button type="button" className="add-product-btn" onClick={handleAddProduct}>
                        상품 추가하기
                    </button>
                </div>
                <h2 className="demandFormDesTitle">상세설명</h2>
                <div className="description-box">
                    {description ? (
                        <>
                            <div className="description-preview hidden"
                                 dangerouslySetInnerHTML={{ __html: description }} />
                            <button type="button" className="demandFormEditBtn" onClick={handleWriteClick}>
                                수정하기
                            </button>
                        </>
                    ) : (
                        <button type="button" className="demandFormWriteBtn" onClick={handleWriteClick}>
                            작성하기
                        </button>
                    )}
                </div>
                <button type="submit" className="submit-btn">
                    {isEditMode ? "수정하기" : "등록하기"}
                </button>
            </form>
        </div>
    );
};

export default DemandForm;
