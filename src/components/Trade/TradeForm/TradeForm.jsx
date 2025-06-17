import React, { useContext, useEffect, useState } from "react"; // useContext 추가
import { useLocation, useNavigate } from "react-router-dom";
import { LoginContext } from "../../../contexts/LoginContext"; // 경로 수정
import "./TradeForm.css";

const TradeForm = () => {
  const { userInfo, isLogin } = useContext(LoginContext);  // useContext로 로그인 정보 가져오기
  const [searchLocationInput, setSearchLocationInput] = useState("");
  const [map, setMap] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [marker, setMarker] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [category, setCategory] = useState("");
  const contentImageFiles = location.state?.formTradeData?.contentImageFiles || [];



  const [formTradeData, setFormTradeData] = useState({
    title: "",
    categoryId: "", // ✅ 추가
    tags: [],
     description: [],
    price: "",
    condition: "중고",
    shipping: "사용",
    directTrade: "직거래",
    directTradeLocation: "",
    representativeImage: null,
    detailImages: [],
    contentImageFiles: [],
    representativeImageFile: null, // ✅ 필수
  detailImageFiles: [], // ✅ 필수
  userId: userInfo?.id, 
  });

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
  
  

useEffect(() => {
  if (location.state?.formTradeData) {
    const incoming = location.state.formTradeData;
    const isEdit = location.state?.isEditMode ?? !!incoming?.id;

    console.log("📷 incoming.imageUrl:", incoming.imageUrl);

    const detailImages = incoming.imageUrl?.map(img =>
      img.imagePath.startsWith("http")
        ? img.imagePath
        : `http://localhost:8080${img.imagePath}`
    ) || [];

    const representativeImage = incoming.thumbnailImage?.startsWith("http")
      ? incoming.thumbnailImage
      : `http://localhost:8080${incoming.thumbnailImage}`;

    const mergedData = {
      ...formTradeData,
      ...incoming,
      tags: Array.isArray(incoming.tags)
        ? incoming.tags
        : incoming.hashtag?.split(",") || [],
      detailImages, // ✅ 이미지 미리보기용 URL
      detailImageFiles: [], // ✅ 업로드용 File 객체는 따로 초기화
      imageUrl: incoming.imageUrl || [], // ✅ 이미지 ID 추적용 원본 객체 유지
      representativeImage: representativeImage || null,
      representativeImageFile: null,
      deleteProductImageIds: [],
      condition: incoming.conditionStatus === "새상품" ? "새상품" : "중고",
      shipping: incoming.delivery === false ? "비사용" : "사용",
      directTrade: incoming.direct === false ? "택배" : "직거래",
      price: incoming.productPrice?.toString() || "",
      categoryId: incoming.categoryId?.toString() || "",
    };

    console.log("📦 mergedData (setFormTradeData):", mergedData);
    console.log("🧩 detailImages:", detailImages);
    console.log("🧩 imageUrl:", incoming.imageUrl); 
    console.log("✅ formTradeData.detailImages:", formTradeData.detailImages);
    setFormTradeData(mergedData);
    setIsEditMode(isEdit);
  }
}, [location.state?.formTradeData]);










  useEffect(() => {
    if (!map) return;

    const geocoder = new window.kakao.maps.services.Geocoder();

    const handleMapClick = (mouseEvent) => {
      const latlng = mouseEvent.latLng;

      // 기존 마커 제거
      if (marker) {
        marker.setMap(null);
      }

      // 새 마커 생성
      const newMarker = new window.kakao.maps.Marker({
        position: latlng,
        map: map,
      });

      setMarker(newMarker); // 현재 마커를 state에 저장

      // 좌표 → 주소 변환
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

    // 지도 클릭 이벤트 등록
    window.kakao.maps.event.addListener(map, "click", handleMapClick);

    // cleanup
    return () => {
      window.kakao.maps.event.removeListener(map, "click", handleMapClick);
    };
  }, [map, marker]);

  useEffect(() => {
    const loadKakaoMap = () => {
      if (window.kakao && window.kakao.maps) {
        const container = document.getElementById("map");
        if (!container) return;

        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
          level: 3,
        };

        const newMap = new window.kakao.maps.Map(container, options);
        setMap(newMap);
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

  // useEffect(() => {
  //   console.log("Location state changed:", location.state);
  //   if (location.state?.description) {
  //     console.log("Updating description:", location.state.description);
  //     setFormTradeData(prev => ({
  //       ...prev,
  //       description: location.state.description
  //     }));
  //   }
  // }, [location.state]);

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
   
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setFormTradeData((prev) => ({ ...prev, category: e.target.value }));
  };

  const handleInputChange = (e) => {
    setFormTradeData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
      representativeImageFile: file, // 🔥 이걸 추가해야 나중에 POST 시점에 접근 가능
    }));
  };
  

const handleDetailImagesUpload = (e) => {
  const files = Array.from(e.target.files);

  const newFilesCount = files.length;
  const existingFilesCount = formTradeData.detailImageFiles.length;

  if (existingFilesCount + newFilesCount > 10) {
    alert("최대 10개의 이미지만 업로드할 수 있습니다.");
    return;
  }

  const newImageUrls = files.map((file) => URL.createObjectURL(file));

  setFormTradeData((prev) => ({
    ...prev,
    detailImages: [...prev.detailImages, ...newImageUrls],
    detailImageFiles: [...prev.detailImageFiles, ...files]
  }));
}


const handleRemoveExistingImage = (index) => {
  setFormTradeData((prev) => {
    const newImages = [...prev.detailImages];
    const [removed] = newImages.splice(index, 1); // 이미지 제거

    const idToDelete = prev.imageUrl?.[index]?.id; // 삭제할 이미지 ID 추출
    const newDeleteIds = idToDelete
      ? [...(prev.deleteProductImageIds || []), idToDelete]
      : prev.deleteProductImageIds;

    return {
      ...prev,
      detailImages: newImages,
      deleteProductImageIds: newDeleteIds,
    };
  });
};


    
  const handleAddTag = () => {
    if (tagInput.trim() && formTradeData.tags.length < 3) {
        const newTag = `#${tagInput.trim().replace(/^#+/, "")}`;
        setFormTradeData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
        setTagInput("");  // 입력란 비우기
    } else {
        alert("최대 3개의 태그만 추가할 수 있습니다.");
    }
};
// 이미지 업로드 함수
const uploadImageAndGetUrl = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("http://localhost:8080/upload/image", {
    method: "POST",
    body: formData,
    credentials: "include", // 세션 쿠키 필요 시
  });

  if (!res.ok) throw new Error("이미지 업로드 실패");

  const data = await res.json();
  return data.imageUrl; // 서버 응답에 따라 필드명 확인
};

console.log(" tradeForm에서 받은 이미지들:", contentImageFiles);


const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formTradeData.title || !formTradeData.price) {
      alert("상품명과 가격은 필수입니다.");
      return;
    }

    if (!isLogin) {
      alert("로그인 후 작성할 수 있습니다.");
      return;
    }

    const categoryId = Number(formTradeData.categoryId);
    if (!categoryId || isNaN(categoryId)) {
      alert("카테고리를 선택해주세요.");
      return;
    }

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

    const detailImageFiles = formTradeData.detailImageFiles || [];

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
      descriptions: Array.isArray(formTradeData.description)
        ? formTradeData.description.map((desc, idx) => ({
            type: desc.type,
            value: desc.value || "",
            sequence: idx
          }))
        : []
    };
    console.log("🚀 tradePostData to send:", tradePostData);

    const formData = new FormData();
    formData.append(
      "request",
      new Blob([JSON.stringify(tradePostData)], { type: "application/json" })
    );

    if (repImageFile) {
      formData.append(isEditMode ? "newThumbnailImage" : "thumbnailImage", repImageFile);
    }

    detailImageFiles.forEach((file) =>
      formData.append(isEditMode ? "newProductImages" : "productImages", file)
    );

    (formTradeData.contentImageFiles || []).forEach((file) =>
      formData.append(isEditMode ? "newContentImages" : "contentImages", file)
    );

    (formTradeData.deleteProductImageIds || []).forEach((id) =>
      formData.append("deleteProductImageIds", id)
    );

    const url = isEditMode
      ? `http://localhost:8080/tradePost/update/${formTradeData.id}`
      : `http://localhost:8080/tradePost/create`;
    const method = "POST";

    try {
      const res = await fetch(url, {
        method,
        body: formData,
        credentials: "include"
      });

      if (!res.ok) throw new Error("서버 오류");
      alert(isEditMode ? "글이 수정되었습니다." : "글이 작성되었습니다.");
      navigate("/trade");
    } catch (error) {
      console.error(isEditMode ? "글 수정 중 오류:" : "글 작성 중 오류:", error);
      alert(isEditMode ? "글 수정에 실패했습니다." : "글 작성에 실패했습니다.");
    }
  };

console.log(
  "description 길이 (문자 수):",
  typeof formTradeData.description === "string"
    ? formTradeData.description.length
    : Array.isArray(formTradeData.description)
    ? formTradeData.description.length
    : 0
);

console.log("description 길이 (바이트):", new Blob([formTradeData.description]).size);
console.log("✅ 로그인 상태:", isLogin);
console.log("👤 로그인된 사용자 정보:", userInfo);


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
  {(formTradeData.detailImages || []).map((image, index) => (
    <div key={index} className="preview-wrapper">
      <img src={image} alt={`상세 이미지 ${index}`} className="preview-image" />
      {isEditMode && (
        <button
          type="button"
          className="delete-button"
          onClick={() => handleRemoveExistingImage(index)}
        >
          ×
        </button>
      )}
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
  {formTradeData.description ? (
    <>
      <div 
        className="description-display hidden" 
        dangerouslySetInnerHTML={{ __html: Array.isArray(formTradeData.description)
          ? formTradeData.description.map(desc =>
              desc.type === "IMAGE"
                ? `<img src="${desc.value}" alt="image" />`
                : `<p>${desc.value}</p>`
            ).join("")
          : ""
        }} 
      />
      <button 
        type="button"
        className="edited-button" 
        onClick={() => navigate("/tradeWrite", {
          state: {
            formTradeData: {
              ...formTradeData
            }
          }
        })}
      >
        수정하기
      </button>
    </>
  ) : (
    <button 
      type="button"
      className="saleFormWriteBtn" 
      onClick={() => navigate("/tradeWrite", {
        state: {
          formTradeData: {
            ...formTradeData
          }
        }
      })}
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
                onChange={(e) => setTagInput(e.target.value)}
              />
              <button type="button" onClick={handleAddTag}>+</button>
            </div>
            <div className="tag-list">
              {formTradeData.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
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
    </div>
  );
};

export default TradeForm;
