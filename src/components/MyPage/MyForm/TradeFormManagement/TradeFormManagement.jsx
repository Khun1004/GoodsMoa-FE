  import React, { useEffect, useState, useContext } from "react";
  import { useNavigate } from "react-router-dom";
  import { LoginContext } from "../../../../contexts/LoginContext";

  import "./TradeFormManagement.css";

  const TradeFormManagement = () => {
    const { userInfo } = useContext(LoginContext);
    const [tradeItems, setTradeItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
      if (!userInfo) return;

      const fetchMyPosts = async () => {
        try {
          const res = await fetch("http://localhost:8080/tradePost/post", {
            method: "GET",
            credentials: "include",
          });

          if (!res.ok) throw new Error("내 게시글 불러오기 실패");

          const data = await res.json();
  console.log("📦 응답 데이터:", data);

          setTradeItems(data.content || []);
        } catch (err) {
          console.error("내 글 요청 실패:", err);
        }
      };

      fetchMyPosts();
    }, [userInfo]);
    
  console.log("👤 로그인된 사용자 정보:", userInfo);

    const handleItemClick = (item) => {
      setSelectedItem(selectedItem?.id === item.id ? null : item);
    };

    const handleDelete = async (id) => {
      try {
        const res = await fetch(`http://localhost:8080/tradePost/delete/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) throw new Error("삭제 실패");

        const updatedItems = tradeItems.filter((item) => item.id !== id);
        setTradeItems(updatedItems);
        setSelectedItem(null);
      } catch (err) {
        console.error("삭제 요청 실패:", err);
      }
    };

  const handleEdit = async (item) => {
  try {
    const res = await fetch(`http://localhost:8080/tradePost/${item.id}`, {
      credentials: "include",
    });

    if (!res.ok) throw new Error("게시글 상세정보 조회 실패");

    const data = await res.json();

    const formTradeData = {
      id: data.id,
      title: data.title,
      categoryId: data.categoryId,
      tags: data.hashtag ? data.hashtag.split(",") : [],
      price: String(data.productPrice),
      conditionStatus: data.conditionStatus,
      shipping: data.delivery ? "사용" : "비사용",
      directTrade: data.direct ? "직거래" : "택배",
      directTradeLocation: data.place || "",
      views: data.views,
      description: data.description || [],
      thumbnailImage: data.thumbnailImage?.startsWith("http")
        ? data.thumbnailImage
        : `http://localhost:8080${data.thumbnailImage}`,
      representativeImageFile: null,
      detailImages: (data.imageUrl || []).map(img =>
        img.imagePath.startsWith("http")
          ? img.imagePath
          : `http://localhost:8080${img.imagePath.startsWith("/") ? "" : "/"}${img.imagePath}`
      ),
      imageUrl: data.imageUrl || [],
      detailImageFiles: [],
      contentImageFiles: [],
      userId: data.userId
    };

    navigate("/tradeForm", {
      state: {
        formTradeData,
        isEditMode: true
      }
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
              <p className="tradeManagementItemNo-items">등록된 상품이 없습니다.</p>
            ) : (
              <ul>
                {tradeItems.map((item) => (
                  <li
                    key={item.id}
                    className={`tradeManagementItem-card ${selectedItem?.id === item.id ? "selected" : ""}`}
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="tradeManagementItem-header">
                      <h3>{item.title}</h3>
                      <span className="tradeManagementItem-status-badge">판매중</span>
                    </div>
                    <div className="tradeManagementItem-preview">
                      {item.thumbnailImage && (
                        <img
                          src={`http://localhost:8080${item.thumbnailImage.startsWith("/") ? "" : "/"}${item.thumbnailImage}`}
                          alt={item.title}
                          className="tradeManagementItem-thumbnail"
                        />
                      )}
                      <div className="tradeManagementItem-info">
                      <p>가격: {item.productPrice !== undefined ? Number(item.productPrice).toLocaleString() + "원" : "가격 미정"}</p>

                      <p>카테고리: {item?.categoryName || "미분류"}</p>
                        <p>조회수: {item.views}회</p>
                        <p>등록일: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "등록일 미상"}</p>
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
                        src={`http://localhost:8080${selectedItem.thumbnailImage.startsWith("/") ? "" : "/"}${selectedItem.thumbnailImage}`}
                        alt={selectedItem.title}
                      />
                    )}
                  </div>
                  <div className="detail-images">
                    {selectedItem.imageUrl?.map((img, index) => (
                      <img
                        key={index}
                        src={`http://localhost:8080${img.imagePath?.startsWith("/") ? "" : "/"}${img.imagePath}`}
                        alt={`상세 이미지 ${index}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="item-meta">
                  <h3>{selectedItem.title}</h3>
                  <p className="price">{Number(selectedItem.productPrice).toLocaleString()}원</p>

                  <div className="meta-section">
                    <h4>상품 정보</h4>
                    <p>카테고리: {selectedItem.categoryName || "미분류"}</p>
                    <p>작성자: {selectedItem.nickName}</p>
                    <p>직거래: {selectedItem.direct ? "가능" : "불가능"}</p>
                    <p>장소: {selectedItem.place}</p>
                    <p>택배 거래: {selectedItem.delivery ? "가능" : "불가능"}</p>
                    {selectedItem.delivery && (
                      <p>배송비: {Number(selectedItem.deliveryPrice).toLocaleString()}원</p>
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
                      dangerouslySetInnerHTML={{ __html: selectedItem.content }}
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
