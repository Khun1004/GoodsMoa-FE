import React, { useEffect, useState, useContext } from "react";  // useContext 추가
import { useLocation, useNavigate } from "react-router-dom";
import "./TradeForm.css";
import { LoginContext } from "../../../contexts/LoginContext"; // 경로 수정
import api from "../../../api/api";
import WriteEditor from "../../common/WriteEditor/WriteEditor";


const categoryOptions = [
  { id: 1, name: "애니메이션" },
  { id: 2, name: "아이돌" },
  { id: 3, name: "그림" },
  { id: 4, name: "순수" },
  { id: 5, name: "영화" },
  { id: 6, name: "드라마" },
  { id: 7, name: "웹소설" },
  { id: 8, name: "웹툰" },
];

const TradeForm = () => {
  const { isLogin } = useContext(LoginContext);
  const navigate = useNavigate();
  const location = useLocation();
  console.group('--- TradeForm 렌더링 시작 ---');
  console.log('도착한 location.state:', location.state);
  
  const isEditMode = location.state?.isEditMode === true;
  console.log('isEditMode 상태:', isEditMode);
  console.groupEnd();

  const [formTradeData, setFormTradeData] = useState(() => {
    const incomingData = location.state?.formTradeData;
    console.log('%cuseState 초기화 함수 실행, incomingData:', 'color: #28a745;', incomingData);
    if (incomingData) {
      return {
        id: incomingData.id || null,
        title: incomingData.title || "",
        price: incomingData.price || "",
        condition: incomingData.condition || "중고",
        shipping: incomingData.shipping || "사용",
        directTrade: incomingData.directTrade || "직거래",
        directTradeLocation: incomingData.directTradeLocation || "",
        representativeImage: incomingData.representativeImage || null,
        representativeImageFile: incomingData.representativeImageFile || null,
        productImages: incomingData.productImages || [],
        newDetailImages: incomingData.newDetailImages || [],
        content: incomingData.content || "",
        // ## 핵심 수정 1: contentImages -> contentImageObjects ##
        // 이제부터 에디터 이미지는 ID와 File 객체를 함께 관리합니다.
        contentImageObjects: incomingData.contentImageObjects || [],
        deleteProductImageIds: incomingData.deleteProductImageIds || [],
        tags: incomingData.tags || [],
        categoryId: incomingData.categoryId || null,
      };
    } else {
      return { // 새 글 작성 기본값
        id: null,
        title: "",
        price: "",
        condition: "중고",
        shipping: "사용",
        directTrade: "직거래",
        directTradeLocation: "",
        representativeImage: null,
        representativeImageFile: null,
        productImages: [],
        newDetailImages: [],
        content: "",
        contentImageObjects: [], // 초기값 변경
        deleteProductImageIds: [],
        tags: [],
        categoryId: null,
      };
    }
  });
  
  const [tagInput, setTagInput] = useState("");
  const [searchLocationInput, setSearchLocationInput] = useState(() => formTradeData.directTradeLocation || "");
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  
  useEffect(() => {
    if (!map) return;

    const geocoder = new window.kakao.maps.services.Geocoder();

    const handleMapClick = (mouseEvent) => {
      const latlng = mouseEvent.latLng;

      if (marker) {
        marker.setMap(null);
      }

      const newMarker = new window.kakao.maps.Marker({
        position: latlng,
        map: map,
      });

      setMarker(newMarker);

      geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const address = result[0].road_address?.address_name || result[0].address?.address_name;
          if (address) {
            setFormTradeData((prev) => ({
              ...prev,
              directTradeLocation: address,
            }));
            setSearchLocationInput(address);
          }
        }
      });
    };

    window.kakao.maps.event.addListener(map, "click", handleMapClick);

    return () => {
      window.kakao.maps.event.removeListener(map, "click", handleMapClick);
    };
  }, [map, marker]);

  useEffect(() => {
    const loadKakaoMap = () => {
      if (window.kakao && window.kakao.maps) {
        setTimeout(() => {
          const container = document.getElementById("map");
          if (!container) return;

          const options = {
            center: new window.kakao.maps.LatLng(37.5665, 126.978),
            level: 3,
          };

          const newMap = new window.kakao.maps.Map(container, options);
          setMap(newMap);
        }, 300);
      } else {
        setTimeout(loadKakaoMap, 1000);
      }
    };

    if (document.readyState === "complete") {
      loadKakaoMap();
    } else {
      window.addEventListener("load", loadKakaoMap);
      return () => window.removeEventListener("load", loadKakaoMap);
    }
  }, []);

  const searchLocation = () => {
    const searchQuery = searchLocationInput || formTradeData.directTradeLocation;
    if (!searchQuery) {
      alert("검색할 위치를 입력해주세요.");
      return;
    }

    if (!window.kakao || !window.kakao.maps || !map) {
      alert("지도가 아직 로드되지 않았습니다.");
      return;
    }

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(searchQuery, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
        map.setCenter(coords);

        if (marker) marker.setMap(null);
        const newMarker = new window.kakao.maps.Marker({
          position: coords,
          map: map,
        });

        setMarker(newMarker);

        setFormTradeData((prev) => ({
          ...prev,
          directTradeLocation: result[0].place_name || searchQuery,
        }));
      } else {
        alert("장소를 찾을 수 없습니다.");
      }
    });
  };

  const handleRemoveTag = (indexToRemove) => {
    setFormTradeData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, index) => index !== indexToRemove),
    }));
  };

  // 카테고리 변경은 formTradeData.categoryId만 사용하도록 통일
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'price') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormTradeData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormTradeData((prev) => ({ ...prev, [name]: value }));
    }
  };


  const handleOptionChange = (field, value) => {
    setFormTradeData(prev => ({ ...prev, [field]: value }));
  };

  const handleRepresentativeImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);

    setFormTradeData((prev) => ({
      ...prev,
      representativeImage: imageUrl,
      representativeImageFile: file,
    }));
  };

  const handleDetailImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageObjects = files.map(file => ({
      preview: URL.createObjectURL(file),
      file: file,
    }));
    setFormTradeData(prev => ({
      ...prev,
      newDetailImages: [...(prev.newDetailImages || []), ...imageObjects],
    }));
  };

  const handleRemoveNewImage = (indexToRemove) => {
    setFormTradeData(prev => ({
      ...prev,
      newDetailImages: (prev.newDetailImages || []).filter((_, index) => index !== indexToRemove),
    }));
  };

  // 수정: id를 받아서 삭제 처리
  const handleRemoveExistingImage = (idToRemove) => {
    console.group(`--- 기존 이미지 삭제 (ID: ${idToRemove}) ---`);
    console.log('삭제 전 productImages:', formTradeData.productImages);
    console.log('삭제 전 deleteProductImageIds:', formTradeData.deleteProductImageIds);
    
    setFormTradeData(prev => {
      const updatedProductImages = prev.productImages.filter(img => img.id !== idToRemove);
      const updatedDeleteIds = [...prev.deleteProductImageIds, idToRemove];
      
      console.log('삭제 후 productImages:', updatedProductImages);
      console.log('삭제 후 deleteProductImageIds:', updatedDeleteIds);
      console.groupEnd();
      
      return {
        ...prev,
        productImages: updatedProductImages,
        deleteProductImageIds: updatedDeleteIds,
      };
    });
  };

  const handleAddTag = () => {
    const newTag = tagInput.trim().replace(/^#+/, "");
    if (newTag && formTradeData.tags.length < 3) {
      if (!formTradeData.tags.includes(newTag)) {
        setFormTradeData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      }
      setTagInput("");
    } else if (formTradeData.tags.length >= 3) {
      alert("태그는 최대 3개까지 추가할 수 있습니다.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.group('%c--- 최종 제출 (handleSubmit) ---', 'color: #dc3545; font-weight: bold;');
    console.log('현재 formTradeData 전체 상태:', formTradeData);
    if (!isLogin) {
      alert("로그인 후 작성할 수 있습니다.");
      return;
    }
    if (!formTradeData.title.trim()) return alert("상품명을 입력해주세요.");
    if (!formTradeData.categoryId) return alert("카테고리를 선택해주세요.");
    if (!formTradeData.price) return alert("가격을 입력해주세요.");

    const price = Number(formTradeData.price);
    if (isNaN(price)) {
      alert("가격은 숫자만 입력해주세요.");
      return;
    }

    const repImageFile = formTradeData.representativeImageFile;
    if (!repImageFile && !isEditMode) {
      alert("대표 이미지를 등록해주세요.");
      return;
    }
    const categoryId = Number(formTradeData.categoryId);
    const tradePostData = {
      title: formTradeData.title,
      productPrice: price,
      conditionStatus: formTradeData.condition,
      tradeStatus: "판매중",
      delivery: formTradeData.shipping === "사용",
      deliveryPrice: 0,
      direct: formTradeData.directTrade === "직거래",
      categoryId: categoryId,
      place: formTradeData.directTradeLocation || "",
      views: 0,
      hashtag: formTradeData.tags.join(","),
      content: formTradeData.content || "",
      deleteProductImageIds: formTradeData.deleteProductImageIds || [],
    };
    console.log('서버로 보낼 JSON (request):', tradePostData);
    const formData = new FormData();
    formData.append("request", new Blob([JSON.stringify(tradePostData)], { type: "application/json" }));

    if (formTradeData.representativeImageFile) {
      console.log("[Trade] 썸네일 파일:", formTradeData.representativeImageFile);
      formData.append(isEditMode ? "newThumbnailImage" : "thumbnailImage", formTradeData.representativeImageFile);
    }
    
    (formTradeData.newDetailImages || []).forEach((imageObj, idx) => {
      console.log(`[Trade] 상품이미지[${idx}]:`, imageObj.file);
      formData.append(isEditMode ? "newProductImages" : "productImages", imageObj.file);
    });
    
    console.log('[TradeForm] contentImageObjects 전체:', formTradeData.contentImageObjects);
    formTradeData.contentImageObjects.forEach((imgObj, idx) => {
      console.log(`[TradeForm] FormData append: contentImageObjects[${idx}]`, imgObj);
      console.log(`[TradeForm] FormData append: contentImageObjects[${idx}].file:`, imgObj.file);
      console.log(`[TradeForm] FormData append: contentImageObjects[${idx}].file instanceof File:`, imgObj.file instanceof File);
      formData.append(isEditMode ? "newContentImages" : "contentImages", imgObj.file);
    });
    
    for (let pair of formData.entries()) {
      if (pair[1] instanceof File) {
        console.log(`[TradeForm] [FormData] ${pair[0]}:`, pair[1].name, pair[1]);
      } else {
        console.log(`[TradeForm] [FormData] ${pair[0]}:`, pair[1]);
      }
    }
    
    const url = isEditMode ? `/tradePost/update/${formTradeData.id}` : "/tradePost/create";
    try {
      const response = await api.post(url, formData, { withCredentials: true });
      console.log('response ::: ', response);
      // 서버 응답에서 content가 있으면 플레이스홀더를 실제 S3 URL로 교체
      if (response.data && response.data.content) {
        let updatedContent = response.data.content;
        
        // 플레이스홀더를 실제 S3 URL로 교체
        (formTradeData.contentImageObjects || []).forEach((imgObj, index) => {
          const placeholder = `__IMAGE_PLACEHOLDER_${index}__`;
          // 서버에서 반환된 이미지 URL 배열이 있다면 사용
          if (response.data.contentImages && response.data.contentImages[index]) {
            updatedContent = updatedContent.replace(placeholder, response.data.contentImages[index]);
          }
        });
        
        // 업데이트된 content를 response에 저장
        response.data.content = updatedContent;
      }
      
      alert(isEditMode ? "수정 완료!" : "등록 완료!");
      navigate("/trade");
    } catch (error) {
      console.error("전송 오류:", error);
      alert("요청 처리 중 오류가 발생했습니다.");
    }
  };

  // WriteEditor에서 저장된 데이터를 처리하는 함수
  const handleDescriptionSave = (data) => {
    console.log('[TradeForm] handleDescriptionSave 호출:', data);
    console.log('[TradeForm] data.images 타입:', Array.isArray(data.images) ? 'Array' : typeof data.images);
    console.log('[TradeForm] data.images 내용:', data.images);
    
    const newContentImageObjects = data.images.map((img, index) => {
      console.log(`[TradeForm] 매핑 중 img[${index}]:`, img);
      console.log(`[TradeForm] 매핑 중 img[${index}] instanceof File:`, img instanceof File);
      return {
        id: `img-${Date.now()}-${index}`,
        file: img  // img.file이 아니라 img 자체가 File 객체
      };
    });
    
    console.log('[TradeForm] 새로 생성된 contentImageObjects:', newContentImageObjects);
    
    setFormTradeData(prev => ({
      ...prev,
      content: data.content,
      contentImageObjects: newContentImageObjects
    }));
    setShowDescriptionModal(false);
  };

  const handleDescriptionCancel = () => {
    setShowDescriptionModal(false);
  };

  return (
    <div className="container">
      {isEditMode && (
        <div className="edit-mode-banner">
          ✏️ 현재 게시글을 수정 중입니다.
        </div>
      )}
      <h1 className="trade-form-title">중고거래 폼 만들기</h1>
      <div className="trade-form-container">
        <form onSubmit={handleSubmit}>
          {/* 대표 이미지 */}
          <div className="mainImgForm-group">
            <label>대표 이미지 (필수)</label>
            <div className="mainImage-upload-box" onClick={() => document.getElementById("repImageInput").click()}>
              {formTradeData.representativeImage ? (
                <img src={formTradeData.representativeImage} alt="대표 이미지" className="preview-image" />
              ) : (
                <span className="upload-text">+ 사진 등록</span>
              )}
            </div>
            <input
              id="repImageInput"
              type="file"
              accept="image/*"
              onChange={handleRepresentativeImageUpload}
              style={{ display: "none" }}
            />
          </div>

          {/* 상세 이미지 */}
          <div className="form-group">
            <label>상세 이미지 (최대 10개)</label>
            <div className="image-upload-box" onClick={() => document.getElementById("detailImageInput").click()}>
              <span className="upload-text">+ 사진 등록</span>
            </div>
            <input
              id="detailImageInput"
              type="file"
              multiple
              accept="image/*"
              onChange={handleDetailImagesUpload}
              style={{ display: "none" }}
            />
            <div className="image-preview-container">
              {/* 기존 서버 이미지 렌더링 */}
              {(formTradeData.productImages || []).map((imageObj) => (
                <div key={imageObj.id} className="preview-wrapper">
                  <img src={imageObj.imagePath} alt="상세 이미지" className="preview-image" />
                  {isEditMode && (
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => handleRemoveExistingImage(imageObj.id)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              {/* 새로 추가한 이미지 렌더링 */}
              {(formTradeData.newDetailImages || []).map((imageObj, index) => (
                <div key={`new-${index}`} className="preview-wrapper">
                  <img src={imageObj.preview} alt={`새 이미지 ${index}`} className="preview-image" />
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => handleRemoveNewImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 상품명 */}
          <div className="form-group">
            <label>상품명</label>
            <input
              type="text"
              name="title"
              value={formTradeData.title}
              onChange={handleInputChange}
            />
          </div>

          {/* 상세 설명 */}
          <div>
            <label className="form-label">상세설명</label>
            <div className="description-box">
              {formTradeData.content && formTradeData.content.trim() !== '<p><br></p>' ? (
                <button
                  type="button"
                  className="edited-button"
                  onClick={() => setShowDescriptionModal(true)}
                >
                  수정하기
                </button>
              ) : (
                <button
                  type="button"
                  className="saleFormWriteBtn"
                  onClick={() => setShowDescriptionModal(true)}
                >
                  작성하기
                </button>
              )}
            </div>
          </div>

          {/* 가격 입력 */}
          <div className="form-group">
            <label>가격 (원)</label>
            <input
              type="text"
              name="price"
              value={formTradeData.price}
              onChange={handleInputChange}
              placeholder="숫자만 입력 가능"
            />
          </div>

          {/* 카테고리 선택 */}
          <div>
            <label className="form-label">카테고리</label>
            <select
              className="form-input"
              value={formTradeData.categoryId || ""}
              onChange={(e) => {
                const selectedValue = e.target.value;
                setFormTradeData((prev) => ({
                  ...prev,
                  categoryId: selectedValue === "" ? null : Number(selectedValue),
                }));
              }}
            >
              <option value="">카테고리를 선택해주세요</option>
              {categoryOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          {/* 태그 입력 */}
          <div className="form-group">
            <label>태그 (최대 3개)</label>
            <div className="tag-input-container">
              <input
                type="text"
                placeholder="태그를 입력해 주세요."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); }}}
              />
              <button type="button" onClick={handleAddTag}>+</button>
            </div>
            <div className="tag-list">
              {formTradeData.tags.map((tag, index) => (
                <span key={index} className="tag">
                  #{tag}
                  <button type="button" onClick={() => handleRemoveTag(index)}>x</button>
                </span>
              ))}
            </div>
          </div>


          {/* 상품 상태 */}
          <div className="form-group">
            <label>상품 상태</label>
            <div className="option-group">
              {["중고", "새상품"].map((option) => (
                <button
                  type="button"
                  key={option}
                  className={`option-button ${formTradeData.condition === option ? "selected" : ""}`}
                  onClick={() => handleOptionChange("condition", option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* 택배 거래 여부 */}
          <div className="form-group">
            <label>택배 거래</label>
            <div className="option-group">
              {["사용", "비사용"].map((option) => (
                <button
                  type="button"
                  key={option}
                  className={`option-button ${formTradeData.shipping === option ? "selected" : ""}`}
                  onClick={() => handleOptionChange("shipping", option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* 거래 방법 */}
          <div className="form-group">
            <label>거래 방법</label>
            <div className="option-group">
              {["직거래", "택배"].map((option) => (
                <button
                  type="button"
                  key={option}
                  className={`option-button ${formTradeData.directTrade === option ? "selected" : ""}`}
                  onClick={() => handleOptionChange("directTrade", option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* 직거래 희망 장소 입력 */}
          {formTradeData.directTrade === "직거래" && (
            <div className="locationFormGroup">
              <label>거래 희망 장소</label>
              <div className="input-button-wrapper">
                <input
                  type="text"
                  name="location"
                  value={searchLocationInput}
                  onChange={(e) => setSearchLocationInput(e.target.value)}
                  placeholder={formTradeData.directTradeLocation || "장소 입력 (예: 서울 강남역)"}
                />
                <button type="button" className="tradeFormSerchBtn" onClick={searchLocation}>
                  검색
                </button>
              </div>
              <div className="map-container">
                <div id="map" className="map"></div>
              </div>
            </div>
          )}

          {/* 등록 버튼 */}
          <div className="button-container">
            <button type="submit" className="tradeFormsubmit">
              {isEditMode ? "수정 등록하기" : "등록하기"}
            </button>
          </div>
        </form>
      </div>

      {/* WriteEditor 모달 */}
      {showDescriptionModal && (
        <WriteEditor
          type="trade"
          title="거래 상세 설명 작성"
          placeholder="거래 상세 설명을 입력하세요..."
          initialContent={formTradeData.content}
          initialImages={formTradeData.contentImageObjects?.map(obj => ({
            file: obj.file,
            preview: URL.createObjectURL(obj.file),
            url: URL.createObjectURL(obj.file)
          })) || []}
          postId={formTradeData.id}
          isEditMode={isEditMode}
          onSave={handleDescriptionSave}
          onCancel={handleDescriptionCancel}
        />
      )}
    </div>
  );
};

export default TradeForm;