import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../api/api";
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
    fetchDemandList();
    // eslint-disable-next-line
  }, [category, page]);

  const fetchDemandList = () => {
    setIsLoading(true);
    api.get('/demand/user', {
      params: {
        category,
        page,
        page_size: 10,
      },
      withCredentials: true,
    })
        .then((res) => {
          setDemandList(res.data.content);
          setTotalPages(res.data.totalPages);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("데이터 불러오기 실패", err);
          setIsLoading(false);
        });
  };

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

  async function urlToFile(url, filename = "image.jpg") {
    const response = await api.get(url, { responseType: 'blob' });
    const blob = response.data;
    return new File([blob], filename, { type: blob.type });
  }

  // 글 상세보기
  const handleDemandClick = async (post) => {
    try {
      const detailedPost = await api.get(`/demand/${post.id}`, { withCredentials: true });
      const data = detailedPost.data;
      navigate(`/demandDetail/${data.id}`);
    } catch (err) {
      alert('수요조사 정보를 불러오는 데 실패했습니다.');
      console.error('수요조사 상세 조회 실패:', err);
    }
  };


  const handlePull = async (id) => {
    try {
      const res = await api.post(`/demand/pull/${id}`);
      if (res.status === 200) {
        if (res.data && res.data.message) {
          alert(res.data.message);
        } else {
          alert("끌어올림 성공!");
        }
        fetchDemandList();
      } else if (res.status === 429) {
        alert("최근 5일 이내에 끌어올림을 사용하셨습니다.");
      } else {
        const msg = res.data?.message || `에러: status ${res.status}`;
        alert(msg);
      }
    } catch (err) {
      const status = err.response?.status;
      const msg =
          status === 429
              ? "최근 5일 이내에 끌어올림을 사용하셨습니다."
              : err.response?.data?.message || err.message;
      alert(msg);
      console.error("❌ [handlePull] 에러:", err);
    }
  };

  const handleConvert = async (id) => {
    try {
      const res = await api.post(`/demand/convert/${id}`, {}, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      });
      const data = res.data;

      const imageUrl = data.imageUrl ? `http://localhost:8080/${data.imageUrl.replace(/^\/+/, '')}` : null;
      const productImageUrls = (data.products || []).map(
          prod => prod.imageUrl ? `http://localhost:8080/${prod.imageUrl.replace(/^\/+/, '')}` : null
      );

      navigate('/saleform', {
        state: {
          from: 'demand',
          image: imageUrl,
          productImageUrls,
          title: data.title || "",
          description: data.description || "",
          category: getCategoryName(data.category),
          hashtag: typeof data.hashtag === "string"
              ? data.hashtag.split(',').map(tag => tag.trim()).filter(Boolean)
              : [],
          products: (data.products || []).map((prod, i) => ({
            id: `temp_${i + 1}`,
            name: prod.name,
            price: prod.price,
            quantity: 1,
            maxQuantity: 1,
            image: prod.imageUrl ? `http://localhost:8080/${prod.imageUrl.replace(/^\/+/, '')}` : null,
            images: prod.imageUrl ? [`http://localhost:8080/${prod.imageUrl.replace(/^\/+/, '')}`] : [],
            imageUpdated: false,
          })),
          start_time: data.startTime ? data.startTime.split(' ')[0] : "",
          end_time: data.endTime ? data.endTime.split(' ')[0] : "",
          contentImages: [],
          shippingMethods: [{ name: '택배', price: '3000' }],
          isPublic: true,
          privateCode: "",
          isPermanent: false,
          postId: data.id
        }
      });
      console.log("✅ [handleConvert] SaleForm으로 URL만 전달 완료!");
    } catch (err) {
      alert("판매글 변환에 실패했습니다: " + (err.response?.data?.message || err.message));
      console.error("❌ [handleConvert] 에러 발생:", err);
    }
  };

  const getCategoryName = (id) => {
    const map = {
      1: "애니메이션",
      2: "아이돌",
      3: "순수창작",
      4: "게임",
      5: "영화",
      6: "드라마",
      7: "웹소설",
      8: "웹툰",
    };
    return map[id] || "";
  };

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.")) return;

    try {
      await api.delete(`/demand/delete/${id}`, {
        withCredentials: true
      });
      alert("삭제되었습니다.");
      setDemandList(demandList.filter((item) => item.id !== id));
    } catch (err) {
      alert("삭제 중 오류 발생: " + (err.response?.data?.message || err.message));
    }
  };

  return (
      <div className="demandFormMandemand-management-container">
        <h1 className="demandFormMandemand-management-header-h1">
          내 수요조사 관리
        </h1>


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
                  <div key={idx}
                       className="demandFormMandemand-card"
                       onClick={() => handleDemandClick(formData)}
                       style={{ cursor: "pointer" }}>
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
                        <div className="demandFormManbutton-group"
                             style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                          {/* 끌어올림 버튼 */}
                          <button
                              style={{
                                background: "#fbbf24",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                padding: "8px 18px",
                                fontSize: "16px",
                                fontWeight: 500,
                                cursor: "pointer",
                                transition: "background 0.2s",
                              }}

                              onClick={(e) => {
                                  e.stopPropagation();
                                  handlePull(formData.id)
                              }}
                          >
                            끌어올림
                          </button>
                          {/* 수정 버튼 */}
                          <button
                              style={{
                                background: "#5288e3",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                padding: "8px 18px",
                                fontSize: "16px",
                                fontWeight: 500,
                                cursor: "pointer",
                                transition: "background 0.2s",
                              }}
                              onClick={() => {
                                // ...수정 기능 필요시 여기에 추가...
                              }}
                          >
                            수정
                          </button>
                          <button
                              style={{
                                background: "#26b37a",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                padding: "8px 18px",
                                fontSize: "16px",
                                fontWeight: 500,
                                cursor: "pointer",
                                transition: "background 0.2s",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConvert(formData.id)
                              }}
                          >
                            판매글 변환
                          </button>
                          <button
                              style={{
                                background: "#e05252",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                padding: "8px 18px",
                                fontSize: "16px",
                                fontWeight: 500,
                                cursor: "pointer",
                                transition: "background 0.2s",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(formData.id)
                              }}
                          >
                            삭제
                          </button>
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
