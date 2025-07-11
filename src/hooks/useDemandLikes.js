import { useEffect } from 'react';
import api from '../api/api';
import { getNumericId } from '../utils/demandUtils';

export const useDemandLikes = (demandProducts, setDemandProducts) => {
    // 좋아요 초기값 가져오기 (필요시 주석 해제)
    // useEffect(() => {
    //     const fetchLikes = async () => {
    //         try {
    //             const res = await api.get('/demand/liked');
    //             const likedMap = {};
    //             (res.data?.content || []).forEach((item) => {
    //                 likedMap[getNumericId(item.id || item.demandPostId)] = true;
    //             });
    //             setDemandProducts((prev) =>
    //                 prev.map((item) => {
    //                     const id = getNumericId(item.id || item.demandPostId);
    //                     return {
    //                         ...item,
    //                         liked: !!likedMap[id],
    //                     };
    //                 })
    //             );
    //         } catch (err) {
    //             console.error('좋아요 초기값 불러오기 실패:', err.message);
    //         }
    //     };
    //     fetchLikes();
    // }, []);

    const handleLike = async (id) => {
        const numericId = getNumericId(id);
        
        try {
            // 현재 아이템의 좋아요 상태 확인
            const currentItem = demandProducts.find(item => 
                getNumericId(item.id || item.demandPostId) === numericId
            );
            
            if (!currentItem) {
                console.error('좋아요할 아이템을 찾을 수 없습니다:', numericId);
                return;
            }
            
            const isLiked = currentItem.liked;
            
            // API 호출
            if (isLiked) {
                await api.delete(`/demand/like/${numericId}`);
            } else {
                await api.post(`/demand/like/${numericId}`);
            }
            
            // 로컬 상태 업데이트
            setDemandProducts(prev =>
                prev.map(item => {
                    const numericItemId = getNumericId(item.id || item.demandPostId);
                    if (numericItemId === numericId) {
                        return { ...item, liked: !isLiked };
                    }
                    return item;
                })
            );
            
        } catch (err) {
            console.error('좋아요 처리 중 오류:', err);
            const errorMessage = err.response?.data?.message || err.message || '좋아요 처리에 실패했습니다.';
            alert(errorMessage);
        }
    };

    return { handleLike };
}; 