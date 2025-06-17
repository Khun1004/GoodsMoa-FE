import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DemandFormManagement.css";

const categoryOptions = [
  { id: 0, name: '전체' },
  { id: 1, name: '애니메이션' },
  { id: 2, name: '아이돌' },
  { id: 3, name: '순수창작' },
  { id: 4, name: '게임' },
  { id: 5, name: '영화' },
  { id: 6, name: '드라마' },
  { id: 7, name: '웹소설' }
];

const getFullImageUrl = (url) => {
  if (!url) return null;
  return url.startsWith("http")
      ? url
      : `http://localhost:8080/${url.replace(/^\/+/, "")}`;
};

const DemandFormManagement = () => {
  const navigate = useNavigate();
  const [demandList, setDemandList] = useState([]);
  const [category, setCategory] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`http://localhost:8080/demand/user?category=${category}&page=${page}&page_size=10`, {
      credentials: "include",
    })
        .then((res) => res.json())
        .then((data) => {
          setDemandList(data.content);
          setTotalPages(data.totalPages);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("데이터 불러오기 실패", err);
          setIsLoading(false);
        });
  }, [category, page]);

  const handleCategoryChange = (e) => {
    setCategory(Number(e.target.value));
    setPage(0);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) setPage(newPage);
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

  return (
      <div className="demandFormMancontainer">
        <h1>내 수요조사 관리</h1>

        <div className="demandFormManfilter-bar">
          <label>카테고리: </label>
          <select value={category} onChange={handleCategoryChange}>
            {categoryOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
            ))}
          </select>
        </div>

        {isLoading ? (
            <p>불러오는 중...</p>
        ) : demandList.length === 0 ? (
            <p>등록된 수요조사가 없습니다.</p>
        ) : (
            <div className="demandFormManlist">
              {demandList.map((formData, idx) => (
                  <div key={idx} className="demandFormMandemand-card">
                    <div className="demandFormMandemand-card-header">
                      <div className="demandFormMandemand-main-thumbnail">
                        <img
                            src={getFullImageUrl(formData.imageUrl)}
                            alt="메인 썸네일"
                        />
                      </div>
                      <div className="demandFormMandemand-header-info">
                        <h2 className="demandFormMandemand-title">{formData.title}</h2>
                        <div className="demandFormMandemand-category">
                          <span className="demandFormMancategory-label">카테고리:</span> {formData.category}
                        </div>
                        <div className="demandFormMandemand-period">
                          <span className="demandFormManperiod-label">수요조사 기간:</span>{" "}
                          {`${formatDate(formData.startTime)} ~ ${formatDate(formData.endTime)}`}
                        </div>
                        <div className="demandFormMandemand-tags">
                          {formData.hashtag &&
                              formData.hashtag.split(",").map((tag, idx) => (
                                  <span key={idx} className="demandFormMantag">
                          #{tag.trim()}
                        </span>
                              ))}
                        </div>
                        <div className="demandFormManbutton-group">
                          <button
                              onClick={() => {
                                const refinedData = {
                                  id: formData.id,
                                  title: formData.title || '',
                                  category: formData.category || '',
                                  hashtag: formData.hashtag
                                      ? formData.hashtag.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
                                      : [],
                                  startTime: formData.startTime || null,
                                  endTime: formData.endTime || null,
                                  imageUrl: formData.imageUrl || null,
                                  products: Array.isArray(formData.products)
                                      ? formData.products.map((product) => ({
                                        id: product.id,
                                        name: product.name || '',
                                        price: Number(product.price) || 0,
                                        imageUrl: product.imageUrl || null,
                                        targetCount: Number(product.targetCount) || 0,
                                        achievementRate: Number(product.achievementRate) || 0,
                                      }))
                                      : [],
                                };

                                navigate("/demandform", {
                                  state: {
                                    formData: refinedData,
                                    isEdit: true,
                                  },
                                });
                              }}
                          >
                            수정
                          </button>
                          <button onClick={() => alert("삭제 기능은 별도 구현 필요")}>삭제</button>
                        </div>
                      </div>
                    </div>

                    <div className="demandFormMandemand-products-section">
                      <h3>등록된 상품 ({formData.products.length})</h3>
                      <div className="demandFormMandemand-products-grid">
                        {formData.products.map((product) => (
                            <div key={product.id} className="demandFormManproduct-card">
                              <img
                                  src={getFullImageUrl(product.imageUrl)}
                                  alt={product.name}
                              />
                              <h4>{product.name}</h4>
                              <p>{product.price.toLocaleString()}원</p>
                              <p>목표 수량: {product.targetCount}개</p>
                              <p>달성률: {product.achievementRate}%</p>
                            </div>
                        ))}
                      </div>
                    </div>
                  </div>
              ))}
            </div>
        )}

        <div className="demandFormManpagination">
          <button onClick={() => handlePageChange(page - 1)} disabled={page === 0}>
            &lt;
          </button>
          {[...Array(totalPages)].map((_, idx) => (
              <button
                  key={idx}
                  className={idx === page ? "active" : ""}
                  onClick={() => handlePageChange(idx)}
              >
                {idx + 1}
              </button>
          ))}
          <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages - 1}>
            &gt;
          </button>
        </div>
      </div>
  );
};

export default DemandFormManagement;
