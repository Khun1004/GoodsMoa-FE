import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../api/api";
import ProductService from "../../../../api/ProductService";
import ManagementPageLayout from '../../../public/management/ManagementPageLayout';
import ManagementCard from '../../../public/management/ManagementCard';
import ActionButton from '../../../public/management/ActionButton';
import { Eye, Calendar, Package } from 'lucide-react';
import Pagination from "../../../public/management/Pagination.jsx";

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
  if (!url) return 'https://via.placeholder.com/400x300?text=No+Image';
  return url.startsWith("http") ? url : `http://localhost:8080/${url.replace(/^\/+/g, "")}`;
};

const DemandFormManagement = () => {
  const navigate = useNavigate();
  const [demandList, setDemandList] = useState([]);
  const [category, setCategory] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchDemandList(); }, [category, page]);

  const fetchDemandList = () => {
    setIsLoading(true);
    api.get('/demand/user', {
      params: { category, page, page_size: 3 },
      withCredentials: true
    })
        .then(res => {
          setDemandList(res.data.content);
          setTotalPages(res.data.totalPages);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("데이터 불러오기 실패", err);
          setIsLoading(false);
        });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "상시 판매";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
  };

  const handleDemandClick = async (post) => {
    try {
      const detailedPost = await api.get(`/demand/${post.id}`, { withCredentials: true });
      navigate(`/demandDetail/${detailedPost.data.id}`);
    } catch (err) {
      alert('수요조사 정보를 불러오는 데 실패했습니다.');
    }
  };

  const handlePull = async (id) => {
    try {
      const res = await api.post(`/demand/pull/${id}`);
      alert(res.data?.message || "끌어올림 성공!");
      fetchDemandList();
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 429) {
        alert("최근 5일 이내에 끌어올림을 사용하셨습니다.");
      } else {
        alert(message || "에러 발생");
      }
    }
  };

  const getCategoryName = (id) => {
    const map = {
      1: "애니메이션", 2: "아이돌", 3: "순수창작", 4: "게임",
      5: "영화", 6: "드라마", 7: "웹소설", 8: "웹툰"
    };
    return map[id] || "";
  };

  const getCategoryId = (name) => {
    const map = {
      "애니메이션": 1,
      "아이돌": 2,
      "순수창작": 3,
      "게임": 4,
      "영화": 5,
      "드라마": 6,
      "웹소설": 7,
      "웹툰": 8
    };
    return map[name] || null;
  };
  function getImageExtension(fileOrImage) {
    // File 객체일 때
    if (fileOrImage && fileOrImage.name) {
      const match = fileOrImage.name.match(/\.([a-zA-Z0-9]+)$/);
      return match ? match[1].toLowerCase() : 'jpg';
    }
    // 문자열(파일명)일 때
    if (typeof fileOrImage === 'string') {
      const match = fileOrImage.match(/\.([a-zA-Z0-9]+)$/);
      return match ? match[1].toLowerCase() : 'jpg';
    }
    // 그 외에는 기본값
    return 'jpg';
  }

  const handleConvert = async (id) => {
    try {
      const res = await api.post(`/demand/convert/${id}`, {}, { withCredentials: true });
      const data = res.data;
      const imageUrl = getFullImageUrl(data.imageUrl);
      const categoryName = getCategoryName(data.category);
      const categoryId = getCategoryId(categoryName);

      // 1. 썸네일 처리 (기존과 동일)
      const proxyUrl = "https://cors-anywhere.herokuapp.com/";
      const thumbResponse = await fetch(proxyUrl + imageUrl);
      if (!thumbResponse.ok) throw new Error("썸네일 이미지 다운로드 실패");
      const thumbBlob = await thumbResponse.blob();
      const thumbnailFile = new File([thumbBlob], 'thumbnail.jpg', { type: thumbBlob.type });
      const processedThumbImage = await ProductService.processImageForUpload({ file: thumbnailFile });
      const thumbExtension = getImageExtension(processedThumbImage.file);

      // 2. 상품 이미지 처리 (새로 추가)
      const processedProducts = await Promise.all(
          (data.products || []).map(async (prod, i) => {
            // 2-1. 상품 이미지 다운로드
            const prodImageUrl = getFullImageUrl(prod.imageUrl);
            const prodResponse = await fetch(proxyUrl + prodImageUrl);
            if (!prodResponse.ok) throw new Error(`상품 이미지 ${i} 다운로드 실패`);

            // 2-2. 파일 변환
            const prodBlob = await prodResponse.blob();
            const prodFile = new File([prodBlob], `product_${i}.jpg`, { type: prodBlob.type });

            // 2-3. 이미지 최적화
            const processedProdImage = await ProductService.processImageForUpload({ file: prodFile });
            return {
              id: `temp_${i + 1}`,
              name: prod.name,
              price: prod.price,
              quantity: 1,
              maxQuantity: 1,
              image: { // 2-4. 썸네일과 동일한 구조
                file: processedProdImage.file,
                preview: URL.createObjectURL(processedProdImage.file),
                extension: getImageExtension(processedProdImage.file),
                uploadPath: 'productPost/product'
              },
              images: [{ // 2-5. images도 동일 구조 (배열 유지)
                file: processedProdImage.file,
                preview: URL.createObjectURL(processedProdImage.file),
                extension: getImageExtension(processedProdImage.file),
                uploadPath: 'productPost/product'
              }],
              imageUpdated: false
            };
          })
      );

      navigate('/saleform', {
        state: {
          from: 'management',
          image: {
            file: processedThumbImage.file,      // 최적화된 파일 객체
            preview: URL.createObjectURL(processedThumbImage.file), // Blob URL
            extension: thumbExtension,
            uploadPath: 'productPost/thumbnail'
          },
          title: data.title,
          description: data.description,
          category: categoryName,
          categoryId: categoryId,
          hashtag: (data.hashtag || '').split(',').map(t => t.trim()).filter(Boolean),
          products: processedProducts,
          start_time: data.startTime?.split(' ')[0] || '',
          end_time: data.endTime?.split(' ')[0] || '',
          contentImages: [],
          shippingMethods: [{ name: '택배', price: '3000' }],
          isPublic: true,
          privateCode: "",
          isPermanent: false,
          // postId: data.id
        }
      });
    } catch (err) {
      alert("판매글 변환 실패: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.")) return;
    try {
      await api.delete(`/demand/delete/${id}`, { withCredentials: true });
      setDemandList(demandList.filter(item => item.id !== id));
    } catch (err) {
      alert("삭제 오류: " + (err.response?.data?.message || err.message));
    }
  };

  return (
      <ManagementPageLayout
          pageTitle="내 수요조사 관리"
          isLoading={isLoading}
          error={null}
          data={demandList}
          emptyStateProps={{
            title: "등록된 수요조사가 없습니다",
            description: "수요조사를 등록해보세요!",
            buttonText: "새 수요조사 만들기",
            onButtonClick: () => navigate('/demandform'),
          }}
      >
        <div style={{ marginBottom: '1rem' }}>
          <label>카테고리: </label>
          <select value={category} onChange={(e) => { setCategory(Number(e.target.value)); setPage(0); }}>
            {categoryOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>
        </div>

        <div className="management-grid">
          {demandList.map((form) => (
              <ManagementCard
                  key={form.id}
                  item={{ ...form, thumbnailImage: getFullImageUrl(form.imageUrl) }}
                  statusIcon={<Eye size={14} />}
                  badges={[
                    { icon: <Package size={14} />, text: form.category },
                    { icon: <Calendar size={14} />, text: `${formatDate(form.startTime)} ~ ${formatDate(form.endTime)}` },
                    { icon: null, text: `상품 ${form.products.length}개` }
                  ]}
                  onCardClick={() => handleDemandClick(form)}
                  actionButtons={
                    <>
                      <ActionButton variant="pull" onClick={(e) => { handlePull(form.id); }}>끌어올림</ActionButton>
                      <ActionButton
                          variant="edit"
                          onClick={() => {
                            navigate('/demandform', {
                              state: {
                                isEdit: true,
                                formData: form
                              }
                            });
                          }}
                      >
                        수정
                      </ActionButton>

                      <ActionButton variant="convert" onClick={(e) => { handleConvert(form.id); }}>판매글 변환</ActionButton>
                      <ActionButton variant="delete" onClick={(e) => { handleDelete(form.id); }}>삭제</ActionButton>
                    </>
                  }
              />
          ))}
        </div>

        <div>
          <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
              groupSize={5}
          />
        </div>
      </ManagementPageLayout>
  );
};

export default DemandFormManagement;
