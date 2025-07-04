import { useEffect } from 'react';
import api from '../api/api';
import { getNumericId } from '../utils/demandUtils';

export const useDemandLikes = (demandProducts, setDemandProducts) => {
    // 좋아요 초기값 가져오기
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
            await api.post(`/demand/like/${numericId}`);
            setDemandProducts(prev =>
                prev.map(item => {
                    const numericItemId = getNumericId(item.id);
                    if (numericItemId === numericId) {
                        return { ...item, liked: !item.liked };
                    }
                    return item;
                })
            );
        } catch (err) {
            alert('좋아요 처리 실패: ' + (err.response?.data?.message || err.message));
        }
    };

    return { handleLike };
}; 