import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../../../../contexts/LoginContext";
import api from "../../../../api/api";
import ManagementPageLayout from '../../../public/management/ManagementPageLayout';
import ManagementCard from '../../../public/management/ManagementCard';
import ActionButton from '../../../public/management/ActionButton';
import { Eye, Calendar, Package } from 'lucide-react';

const categoryOptions = [
  { id: 1, name: "애니메이션" }, { id: 2, name: "아이돌" }, { id: 3, name: "그림" },
  { id: 4, name: "순수" }, { id: 5, name: "영화" }, { id: 6, name: "드라마" },
  { id: 7, name: "웹소설" }, { id: 8, name: "웹툰" },
];

const TradeFormManagement = () => {
  const { userInfo } = useContext(LoginContext);
  const [tradeItems, setTradeItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo) return;

    const fetchMyPosts = async () => {
      try {
        const res = await api.get("/tradePost/post");
        setTradeItems(res.data.content || []);
      } catch (err) {
        console.error("내 글 요청 실패:", err);
      }
    };

    fetchMyPosts();
  }, [userInfo]);

  const handleItemClick = (item) => {
    navigate(`/tradeDetail/${item.id}`);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tradePost/delete/${id}`, { withCredentials: true });
      setTradeItems(tradeItems.filter((item) => item.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "삭제 중 오류 발생");
    }
  };

  const handleEdit = async (item) => {
    try {
      const res = await api.get(`/tradePost/${item.id}`);
      const data = res.data;
      const matchedCategory = categoryOptions.find(option => option.name === data.categoryName);
      const productImages = (data.productImages || []).map((img) => ({ id: img.id, imagePath: img.imagePath }));

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

      navigate("/tradeForm", {
        state: { isEditMode: true, formTradeData }
      });
    } catch (err) {
      alert("수정 정보를 불러오는 데 실패했습니다.");
    }
  };

  if (!userInfo) {
    return <div className="tradeManagement-container"><h2>로그인 후에 내 게시글을 확인할 수 있습니다.</h2></div>;
  }

  return (
      <ManagementPageLayout
          pageTitle="내 중고거래 관리"
          isLoading={false}
          error={null}
          data={tradeItems}
          emptyStateProps={{
            title: "등록된 상품이 없습니다",
            description: "상품을 등록해보세요!",
            buttonText: "새 상품 등록",
            onButtonClick: () => navigate('/tradeForm'),
          }}
      >
        <div className="management-grid">
          {tradeItems.map((item) => (
              <ManagementCard
                  key={item.id}
                  item={{ title: item.title, thumbnailImage: item.thumbnailImage }}
                  statusType="selling"
                  statusIcon={<Eye size={14} />}
                  statusText="판매중"
                  badges={[
                    { icon: <Package size={14} />, text: item.categoryName },
                    { icon: <Calendar size={14} />, text: new Date(item.createdAt).toLocaleDateString() },
                    { icon: null, text: `조회수 ${item.views}` }
                  ]}
                  onCardClick={() => handleItemClick(item)}
                  actionButtons={
                    <>
                      <ActionButton variant="edit" onClick={() => { handleEdit(item); }}>수정</ActionButton>
                      <ActionButton variant="delete" onClick={() => { handleDelete(item.id); }}>삭제</ActionButton>
                    </>
                  }
              />
          ))}
        </div>
      </ManagementPageLayout>
  );
};

export default TradeFormManagement;