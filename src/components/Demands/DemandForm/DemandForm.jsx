import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./DemandForm.css";

const DemandForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");
    const [description, setDescription] = useState("");
    const [mainThumbnail, setMainThumbnail] = useState(null);
    const [title, setTitle] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isAlwaysOnSale, setIsAlwaysOnSale] = useState(false);
    const [category, setCategory] = useState("");

    const [productList, setProductList] = useState([]);
    const [productThumbnail, setProductThumbnail] = useState(null);
    const [productName, setProductName] = useState("");
    const [productPrice, setProductPrice] = useState("");
    const [productQuantity, setProductQuantity] = useState("");

    const handleAddTag = () => {
        if (tags.length < 5 && tagInput.trim()) {
            setTags([...tags, tagInput.trim()]);
            setTagInput("");
        }
    };

    useEffect(() => {
        if (location.state?.description !== undefined) {
            setDescription(location.state.description);
        }
    }, [location.state?.description]);    

    useEffect(() => {
        if (location.state?.description !== undefined) {
            setDescription(location.state.description);
        }
    }, [location.state?.description]);

    const handleMainThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setMainThumbnail(url);
        }
    };

    const handleProductThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setProductThumbnail(url);
        }
    };

    const handleAddProduct = () => {
        if (!productName || !productPrice || !productQuantity || !productThumbnail) {
            alert("모든 상품 정보를 입력해주세요.");
            return;
        }

        const newProduct = {
            name: productName,
            price: productPrice,
            quantity: productQuantity,
            thumbnail: productThumbnail
        };

        setProductList([...productList, newProduct]);
        setProductName("");
        setProductPrice("");
        setProductQuantity("");
        setProductThumbnail(null);
    };

    const handleDeleteProduct = (index) => {
        const updatedList = productList.filter((_, i) => i !== index);
        setProductList(updatedList);
    };

    const handleWriteClick = () => {
        navigate("/demandWrite", {
            state: {
                description,
                title,
                startDate,
                endDate,
                isAlwaysOnSale,
                category,
                tags,
                products: productList,
                mainThumbnail
            }
        });
    };
    
    const handleEditClick = () => {
        navigate("/demandWrite", {
            state: {
                description,
                title,
                startDate,
                endDate,
                isAlwaysOnSale,
                category,
                tags,
                products: productList,
                mainThumbnail
            }
        });
    };    

    useEffect(() => {
        if (location.state) {
            setDescription(location.state.description || "");
            setTitle(location.state.title || "");
            setStartDate(location.state.startDate || "");
            setEndDate(location.state.endDate || "");
            setIsAlwaysOnSale(location.state.isAlwaysOnSale || false);
            setCategory(location.state.category || "");
            setTags(location.state.tags || []);
            setProductList(location.state.products || []);
            setMainThumbnail(location.state.mainThumbnail || null);
        }
    }, [location.state]);
    

    const handleSubmit = (e) => {
        e.preventDefault();
    
        if (!mainThumbnail) {
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
    
        if (!category) {
            alert("카테고리를 선택해주세요.");
            return;
        }
    
        const formData = {
            title,
            startDate,
            endDate,
            isAlwaysOnSale,
            category,
            tags,
            description,
            products: productList,
            mainThumbnail
        };
    
        localStorage.setItem('demandFormData', JSON.stringify(formData));
        localStorage.setItem('isDemandSubmitted', 'true');
        navigate('/demand', { state: { formData } });
        alert("수요조사가 등록되었습니다!");
    };
    

    return (
        <div className="container">
            <form className="demand-form" onSubmit={handleSubmit}>
                <h2 className="demandFormTitle">수요조사 글 만들기</h2>

                {/* 썸네일 */}
                <div className="thumbnail-upload">
                    <label htmlFor="main-thumbnail" className="thumbnail-box">
                        {mainThumbnail ? (
                            <img src={mainThumbnail} alt="메인 썸네일" className="thumbnail-preview" />
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
                        onChange={handleMainThumbnailChange}
                        style={{ display: "none" }}
                    />
                </div>

                {/* 제목 */}
                <div className="demandForm-group">
                    <label>폼 제목</label>
                    <input 
                        className="demandText"
                        type="text" 
                        placeholder="제목을 입력해주세요." 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                {/* 수요조사 기간 */}
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
                                    onChange={(e) => setStartDate(e.target.value)}
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
                                    onChange={(e) => setEndDate(e.target.value)}
                                    disabled={isAlwaysOnSale}
                                    required={!isAlwaysOnSale}
                                />
                                <span className="calendar-icon"></span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="demandCheckbox-group">
                    <input 
                        type="checkbox" 
                        id="always" 
                        checked={isAlwaysOnSale}
                        onChange={(e) => setIsAlwaysOnSale(e.target.checked)}
                    />
                    <label htmlFor="always">상시 판매</label>
                </div>

                {/* 카테고리 */}
                <div className="demandForm-group">
                    <label>카테고리</label>
                    <select
                        className="demandFormSelect"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">카테고리를 선택해주세요</option>
                        <option value="전자제품">전자제품</option>
                        <option value="의류">의류</option>
                        <option value="식품">식품</option>
                        <option value="도서">도서</option>
                    </select>
                </div>

                {/* 해시태그 */}
                <div className="demandForm-group">
                    <label>해시 태그<span>({tags.length}/5)</span>(5개까지만 입력 가능합니다.)</label>
                    <div className="tag-input-area">
                        <input
                            className="demandText"
                            type="text"
                            placeholder="해시 태그를 입력해주세요. ex) #애니"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                        />
                        <button type="button" onClick={handleAddTag}>추가하기</button>
                    </div>
                    <div className="tag-list">
                        {tags.map((tag, idx) => (
                            <span key={idx} className="demandTag">
                                #{tag}
                                <button
                                    type="button"
                                    className="demandDelete-tag"
                                    onClick={() => {
                                        const updatedTags = tags.filter((_, i) => i !== idx);
                                        setTags(updatedTags);
                                    }}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* 상품 정보 입력 */}
                <h2>상품 정보 입력</h2>
                <div className="demandFormProduct-box">
                    <label htmlFor="product-thumbnail" className="demandFormProduct-thumbnail">
                        {productThumbnail ? (
                            <img src={productThumbnail} alt="제품 썸네일" className="thumbnail-preview" />
                        ) : (
                            <>
                                <span className="plus-sign">+</span>
                                <p>제품 썸네일 등록</p>
                            </>
                        )}
                    </label>
                    <input
                        type="file"
                        id="product-thumbnail"
                        accept="image/*"
                        onChange={handleProductThumbnailChange}
                        style={{ display: "none" }}
                    />
                    <div className="product-details">
                        <input
                            className="demandText"
                            type="text"
                            placeholder="상품 이름을 입력해주세요."
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="해당 상품의 예상 가격을 입력해주세요."
                            value={productPrice}
                            onChange={(e) => setProductPrice(e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="실제 목표 수량보다 여유 있게 기입하는 것이 좋습니다."
                            value={productQuantity}
                            onChange={(e) => setProductQuantity(e.target.value)}
                        />
                    </div>
                </div>
                <div className="addDemandProduct-wrapper">
                    <button type="button" className="add-product-btn" onClick={handleAddProduct}>
                        상품 추가하기
                    </button>
                </div>

                {/* 등록된 상품 리스트 */}
                {productList.length > 0 && (
                    <div className="product-list">
                        <h3>등록된 상품</h3>
                        {productList.map((product, idx) => (
                            <div key={idx} className="product-item">
                                <img src={product.thumbnail} alt="상품 썸네일" className="thumbnail-preview" />
                                <div className="product-info">
                                    <p><strong>이름:</strong> {product.name}</p>
                                    <p><strong>예상 가격:</strong> {product.price}원</p>
                                    <p><strong>재고 수량:</strong> {product.quantity}개</p>
                                </div>
                                <button 
                                    type="button" 
                                    className="delete-btn" 
                                    onClick={() => handleDeleteProduct(idx)}
                                >
                                    삭제
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* 상세설명 */}
                <h2 className="demandFormDesTitle">상세설명</h2>
                <div className="description-box">
                    {description ? (
                        <>
                            <div className="description-preview hidden" 
                                dangerouslySetInnerHTML={{ __html: description }} />
                            <button
                                type="button"
                                className="demandFormEditBtn"
                                onClick={handleEditClick}
                            >
                                수정하기
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            className="demandFormWriteBtn"
                            onClick={handleWriteClick}
                        >
                            작성하기
                        </button>
                    )}
                </div>

                {/* 등록 */}
                <button type="submit" className="submit-btn">등록하기</button>
            </form>
        </div>
    );
};

export default DemandForm;