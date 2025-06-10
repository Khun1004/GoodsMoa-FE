import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DemandFormManagement.css";

const DemandFormManagement = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    // Retrieve saved form data from localStorage
    const savedFormData = localStorage.getItem("demandFormData");
    const isSubmitted = localStorage.getItem("isDemandSubmitted");

    if (savedFormData && isSubmitted === "true") {
      setFormData(JSON.parse(savedFormData));
    }
    
    setIsLoading(false);
  }, []);

  const handleEditClick = () => {
    navigate("/demandform", { state: formData });
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    localStorage.removeItem("demandFormData");
    localStorage.removeItem("isDemandSubmitted");
    setFormData(null);
    setShowDeleteModal(false);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "상시 판매";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return <div className="demandFormManloading-container">로딩 중...</div>;
  }

  if (!formData) {
    return (
      <div className="demandFormManno-data-container">
        <h2>등록된 수요조사가 없습니다.</h2>
        <button 
          className="demandFormMannew-demand-btn"
          onClick={() => navigate("/demandform")}
        >
          새 수요조사 등록하기
        </button>
      </div>
    );
  }

  return (
    <div className="demandFormMandemand-management-container">
      {showDeleteModal && (
        <div className="demandFormManmodal-overlay">
          <div className="demandFormManmodal-content">
            <h3>수요조사를 삭제하시겠습니까?</h3>
            <p>삭제한 수요조사는 복구할 수 없습니다.</p>
            <div className="demandFormManmodal-buttons">
              <button className="demandFormManmodal-confirm-btn" onClick={confirmDelete}>
                삭제
              </button>
              <button className="demandFormManmodal-cancel-btn" onClick={cancelDelete}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="demandFormMandemand-management-header">
        <h1>수요조사 관리</h1>
        <div>
          <button className="demandFormManedit-demand-btn" onClick={handleEditClick}>
            수정하기
          </button>
          <button className="demandFormMandelete-demand-btn" onClick={handleDeleteClick}>
            삭제하기
          </button>
        </div>
      </div>

      <div className="demandFormMandemand-card">
        <div className="demandFormMandemand-card-header">
          <div className="demandFormMandemand-main-thumbnail">
            <img src={formData.mainThumbnail} alt="메인 썸네일" />
          </div>
          <div className="demandFormMandemand-header-info">
            <h2 className="demandFormMandemand-title">{formData.title}</h2>
            <div className="demandFormMandemand-category">
              <span className="demandFormMancategory-label">카테고리:</span> {formData.category}
            </div>
            <div className="demandFormMandemand-period">
              <span className="demandFormManperiod-label">수요조사 기간:</span>{" "}
              {formData.isAlwaysOnSale
                ? "상시 판매"
                : `${formatDate(formData.startDate)} ~ ${formatDate(formData.endDate)}`}
            </div>
            <div className="demandFormMandemand-tags">
              {formData.tags.map((tag, idx) => (
                <span key={idx} className="demandFormMantag">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="demandFormMandemand-products-section">
          <h3>등록된 상품 ({formData.products.length})</h3>
          <div className="demandFormMandemand-products-grid">
            {formData.products.map((product, idx) => (
              <div key={idx} className="demandFormManproduct-card">
                <div className="demandFormManproduct-thumbnail">
                  <img src={product.thumbnail} alt={product.name} />
                </div>
                <div className="demandFormManproduct-info">
                  <h4 className="demandFormManproduct-name">{product.name}</h4>
                  <p className="demandFormManproduct-price">{Number(product.price).toLocaleString()}원</p>
                  <p className="demandFormManproduct-quantity">수량: {product.quantity}개</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="demandFormMandemand-description-section">
          <h3>상세 설명</h3>
          <div 
            className="demandFormMandemand-description-content"
            dangerouslySetInnerHTML={{ __html: formData.description }}
          />
        </div>

        <div className="demandFormMandemand-stats-section">
          <div className="demandFormManstat-card">
            <div className="demandFormManstat-value">0</div>
            <div className="demandFormManstat-label">누적 조회수</div>
          </div>
          <div className="demandFormManstat-card">
            <div className="demandFormManstat-value">0</div>
            <div className="demandFormManstat-label">누적 구매자</div>
          </div>
          <div className="demandFormManstat-card">
            <div className="demandFormManstat-value">0%</div>
            <div className="demandFormManstat-label">달성률</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandFormManagement;