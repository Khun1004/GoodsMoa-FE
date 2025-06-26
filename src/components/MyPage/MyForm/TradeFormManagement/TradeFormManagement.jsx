import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../../../../contexts/LoginContext";
import api from "../../../../api/api";
import "./TradeFormManagement.css";


const categoryOptions = [
  { id: 1, name: "애니메이션" }, { id: 2, name: "아이돌" }, { id: 3, name: "그림" },
  { id: 4, name: "순수" }, { id: 5, name: "영화" }, { id: 6, name: "드라마" },
  { id: 7, name: "웹소설" }, { id: 8, name: "웹툰" },
];

const TradeFormManagement = () => {
  const { userInfo } = useContext(LoginContext);
  const [tradeItems, setTradeItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo) return;

    const fetchMyPosts = async () => {
      try {
        const res = await api.get("/tradePost/post");
        const data = res.data;
        console.log("📦 응답 데이터:", data);
        setTradeItems(data.content || []);
      } catch (err) {
        console.error("내 글 요청 실패:", err);
      }
    };

    fetchMyPosts();
  }, [userInfo]);

  const handleItemClick = async (item) => {
    if (selectedItem?.id === item.id) {
      setSelectedItem(null);
      return;
    }

    try {
      const res = await api.get(`/tradePost/${item.id}`);
      console.log("🔍 상세 게시글 응답:", res.data); // ✅ 여기!
      setSelectedItem(res.data); // 상세 데이터에는 nickName 포함됨
      console.log("🧠 선택된 게시글 상세:", res.data);
    } catch (err) {
      console.error("상세 정보 요청 실패:", err);
      alert("상세 정보를 불러오지 못했습니다.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tradePost/delete/${id}`, { withCredentials: true });
      const updatedItems = tradeItems.filter((item) => item.id !== id);
      setTradeItems(updatedItems);
      setSelectedItem(null);
    } catch (err) {
      console.error("삭제 요청 실패:", err);
      // 서버에서 온 에러 메시지가 있다면 보여주는 것이 좋습니다.
      const errorMsg = err.response?.data?.message || "삭제 처리 중 오류가 발생했습니다.";
      alert(errorMsg);
    }
  };

  const handleEdit = async (item) => {
    try {
      const res = await api.get(`/tradePost/${item.id}`);
      const data = res.data;
      const matchedCategory = categoryOptions.find(option => option.name === data.categoryName);
      const productImages = (data.productImages || []).map((img) => ({
        id: img.id,
        imagePath: img.imagePath,
      }));

      const formTradeData = {
        id: data.id,
        title: data.title,
        categoryId: matchedCategory ? matchedCategory.id : null,
        categoryName: data.categoryName,
        tags: data.hashtag ? data.hashtag.split(",") : [],
        hashtag: data.hashtag,
        price: String(data.productPrice),
        productPrice: data.productPrice,
        condition: data.conditionStatus ? "중고" : "새상품",
        shipping: data.delivery ? "사용" : "비사용",
        directTrade: data.direct ? "직거래" : "택배",
        directTradeLocation: data.place || "",
        views: data.views,
        createdAt: data.createdAt,
        representativeImage: data.thumbnailImage,
        representativeImageFile: null,
        productImages,
        newDetailImages: [],
        content: data.content || "",
        contentImageObjects: [],
        deleteProductImageIds: [],
        user: data.user,
      };
      console.log('%cTradeFormManagement ➡️ TradeForm: 전송 직전 데이터', 'color: #007bff; font-weight: bold;', { isEditMode: true, formTradeData });

      navigate("/tradeForm", {
        state: { isEditMode: true, formTradeData }
      });
    } catch (err) {
      console.error("게시글 상세 fetch 실패:", err);
      alert("게시글 상세 정보를 불러오지 못했습니다.");
    }
  };

  if (!userInfo) {
    return (
      <div className="tradeManagement-container">
        <h2>로그인 후에 내 게시글을 확인할 수 있습니다.</h2>
      </div>
    );
  }

  return (
    <div className="tradeManagement-container">
      <h1 className="tradeManagement-title">내 중고거래 관리</h1>
      <div className="tradeManagement-content">
        <div className="tradeManagementItem-list">
          <h2>등록한 상품 목록</h2>
          {tradeItems.length === 0 ? (
            <p className="tradeManagementItemNo-items">
              등록된 상품이 없습니다.
            </p>
          ) : (
            <ul>
              {tradeItems.map((item) => (
                <li
                  key={item.id}
                  className={`tradeManagementItem-card ${
                    selectedItem?.id === item.id ? "selected" : ""
                  }`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="tradeManagementItem-header">
                    <h3>{item.title}</h3>
                    <span className="tradeManagementItem-status-badge">
                      판매중
                    </span>
                  </div>
                  <div className="tradeManagementItem-preview">
                    {item.thumbnailImage && (
                      <img
                        src={item.thumbnailImage}
                        alt={item.title}
                        className="tradeManagementItem-thumbnail"
                      />
                    )}
                    <div className="tradeManagementItem-info">
                      <p>
                        가격:{" "}
                        {item.productPrice !== undefined
                          ? Number(item.productPrice).toLocaleString() + "원"
                          : "가격 미정"}
                      </p>
                      <p>카테고리: {item?.categoryName || "미분류"}</p>
                      <p>조회수: {item.views}회</p>
                      <p>
                        등록일:{" "}
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : "등록일 미상"}
                      </p>
                    </div>
                  </div>
                  <div className="tradeFormManagItem-actions">
                    <button
                      className="tradeFormManagEditBtn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(item);
                      }}
                    >
                      수정
                    </button>
                    <button
                      className="tradeFormManagDeleteBtn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedItem && (
          <div className="item-detail">
            <h2>상품 상세 정보</h2>
            <div className="detail-content">
              <div className="image-gallery">
                <div className="main-image">
                  {selectedItem.thumbnailImage && (
                    <img
                      src={selectedItem.thumbnailImage}
                      alt={selectedItem.title}
                    />
                  )}
                </div>
                <div className="detail-images">
                  {selectedItem.productImages?.map((img, index) => (
                    <img
                      key={index}
                      src={img.imagePath}
                      alt={`상세 이미지 ${index}`}
                    />
                  ))}
                </div>
              </div>

              <div className="item-meta">
                <h3>{selectedItem.title}</h3>
                <p className="price">
                  {Number(selectedItem.productPrice).toLocaleString()}원
                </p>

                <div className="meta-section">
                  <h4>상품 정보</h4>
                  <p>카테고리: {selectedItem.categoryName || "미분류"}</p>
                  <p>작성자: {selectedItem.nickName || "알 수 없음"}</p>
                  <p>직거래: {selectedItem.direct ? "가능" : "불가능"}</p>
                  <p>장소: {selectedItem.place}</p>
                  <p>택배 거래: {selectedItem.delivery ? "가능" : "불가능"}</p>
                  {selectedItem.delivery && (
                    <p>
                      배송비:{" "}
                      {Number(selectedItem.deliveryPrice).toLocaleString()}원
                    </p>
                  )}
                  <p>조회수: {selectedItem.views}</p>
                </div>

                <div className="meta-section">
                  <h4>해시태그</h4>
                  <p>{selectedItem.hashtag}</p>
                </div>

                <div className="meta-section">
                  <h4>상품 설명</h4>
                  <div
                    className="description"
                    dangerouslySetInnerHTML={{
                      __html: selectedItem.content,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeFormManagement;
