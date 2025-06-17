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

    // location.state 구조 분해
    const { formData, isEdit } = location.state || {};
    const isEditMode = !!isEdit;

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
        if (formData) {
            // 날짜 변환 함수
            const formatToDateInput = (dateStr) => {
                if (!dateStr) return "";
                return dateStr.split("T")[0] || dateStr.split(" ")[0];
            };

            setTitle(formData.title ?? "");
            setStartDate(formatToDateInput(formData.startTime));
            setEndDate(formatToDateInput(formData.endTime));
            setIsAlwaysOnSale(!formData.startTime && !formData.endTime);

            // categoryId(숫자) 또는 category(문자) 중에서 찾음
            if (typeof formData.categoryId === "number") {
                setCategoryId(formData.categoryId);
            } else if (typeof formData.category === "number") {
                setCategoryId(formData.category);
            } else if (typeof formData.category === "string") {
                // 카테고리 이름 -> id 변환
                const found = categoryOptions.find(opt => opt.name === formData.category);
                setCategoryId(found ? found.id : categoryOptions[0].id);
            } else {
                setCategoryId(categoryOptions[0].id);
            }

            setDescription(formData.description ?? "");
            setDescriptionImages(formData.descriptionImages ?? []);

            // 해시태그: 배열이 오면 그대로, 문자열 오면 파싱
            setHashtags(
                Array.isArray(formData.hashtag)
                    ? formData.hashtag
                    : Array.isArray(formData.hashtags)
                        ? formData.hashtags
                        : typeof formData.hashtag === "string"
                            ? formData.hashtag.split(/[\s,]+/).filter(Boolean)
                            : []
            );

            // 메인 썸네일
            if (formData.imageUrl) {
                setMainThumbnailPreview(
                    formData.imageUrl.startsWith("http")
                        ? formData.imageUrl
                        : `http://localhost:8080/${formData.imageUrl.replace(/^\/+/g, "")}`
                );
            } else {
                setMainThumbnailPreview(null);
            }

            // 상품들
            if (formData.products?.length > 0) {
                setProducts(
                    formData.products.map((p) => ({
                        name: p.name || "",
                        price: p.price || "",
                        targetCount: p.targetCount || "",
                        imageFile: null,
                        imagePreview: p.imageUrl
                            ? p.imageUrl.startsWith("http")
                                ? p.imageUrl
                                : `http://localhost:8080/${p.imageUrl.replace(/^\/+/g, "")}`
                            : null,
                    }))
                );
            } else {
                setProducts([{ name: "", price: "", imageFile: null, imagePreview: null, targetCount: "" }]);
            }
        }
    }, [formData]);

    const handleAddProduct = () => {
        setProducts([...products, { name: "", price: "", imageFile: null, imagePreview: null, targetCount: "" }]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(isEditMode ? "수정 완료" : "등록 완료");
        // 실제 제출 로직은 별도 구현
    };

    const handleNavigateToWrite = () => {
        navigate("/demandWrite", {
            state: {
                id: formData?.id,
                title,
                categoryId,
                startTime: startDate,
                endTime: endDate,
                hashtag: hashtags,
                products,
                description,
                descriptionImages,
                imageUrl: mainThumbnailPreview,
                isEdit: isEditMode,
            },
        });
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
        </div>
    );
};

export default DemandForm;
