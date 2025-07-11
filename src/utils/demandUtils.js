import _ from 'lodash';
import { searchBoardPosts } from '../api/publicService';

// 숫자 ID만 추출하는 함수 - 반드시 숫자 문자열로 리턴
export const getNumericId = (id) => {
    if (typeof id === 'string' && id.startsWith('DEMAND_')) {
        return id.replace('DEMAND_', '');
    }
    return String(id);
};

// 썸네일 URL을 완전한 URL로 변환하는 함수
export const getFullThumbnailUrl = (thumbnailUrl) =>
    thumbnailUrl
        ? thumbnailUrl.startsWith('http')
            ? thumbnailUrl
            : `${import.meta.env.VITE_API_BASE_URL}/${thumbnailUrl.replace(/^\/+/, '')}`
        : '';

// 정렬 옵션 상수
export const SORT_OPTIONS = [
    { label: '최신순', value: 'new' },      // 최신 등록순
    { label: '오래된순', value: 'old' },        // 오래된 등록순
    { label: '조회수순', value: 'view' },       // 조회수 많은 순
    { label: '좋아요순', value: 'like' },         // 좋아요(찜) 많은 순
    { label: '마감임박순', value: 'close' }, // 마감 임박 순
];

// 수요조사 데이터 페칭 함수
export const fetchDemandProducts = async ({
    searchType,
    searchQuery,
    category,
    orderBy,
    includeExpired,
    includeScheduled,
    page,
    pageSize,
    setDemandProducts,
    setTotalPages,
    setLoading,
    setError
}) => {
    setLoading(true);
    setError(null);
    
    try {
        const res = await searchBoardPosts({
            path: '/demand',
            board_type: 'DEMAND',
            search_type: searchType.toUpperCase(),
            query: searchQuery,
            category,
            order_by: orderBy,
            include_expired: includeExpired,
            include_scheduled: includeScheduled,
            page: page,
            page_size: pageSize
        });

        setDemandProducts(res.content);
        setTotalPages(Math.ceil(res.totalElements / pageSize));
    } catch (err) {
        console.error('❌ 수요조사 검색 실패:', err);
        setError(err.message || '수요조사를 불러오는데 실패했습니다.');
    } finally {
        setLoading(false);
    }
};

// 디바운싱된 수요조사 데이터 페칭 함수
export const createDebouncedFetchDemand = (fetchParams) => {
    return _.debounce(() => {
        fetchDemandProducts(fetchParams);
    }, 500);
};

// 좋아요 처리 함수
export const handleDemandLike = async ({
    postId,
    demandProducts,
    setDemandProducts,
    apiService
}) => {
    try {
        const numericId = getNumericId(postId);
        const currentProduct = demandProducts.find(item => 
            getNumericId(item.id || item.demandPostId) === numericId
        );
        
        if (!currentProduct) return;
        
        const isLiked = currentProduct.liked;
        
        if (isLiked) {
            await apiService.unlikeDemand(numericId);
        } else {
            await apiService.likeDemand(numericId);
        }
        
        // 로컬 상태 업데이트
        setDemandProducts(prevProducts => 
            prevProducts.map(item => {
                const itemId = getNumericId(item.id || item.demandPostId);
                if (itemId === numericId) {
                    return { ...item, liked: !isLiked };
                }
                return item;
            })
        );
        
    } catch (err) {
        console.error('좋아요 처리 중 오류:', err);
        alert(err.message || '좋아요 처리에 실패했습니다.');
    }
};

// 검색 필터링 함수
export const filterDemandProducts = (products, searchQuery) => {
    if (!searchQuery.trim()) return products;
    
    const query = searchQuery.toLowerCase();
    return products.filter(item => (
        item.title?.toLowerCase().includes(query) ||
        item.hashtag?.toLowerCase().includes(query) ||
        item.nickname?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
    ));
};

// 좋아요 상태 맵 생성 함수
export const createLikedMap = (products) => {
    return products.reduce((acc, item) => {
        const id = getNumericId(item.id || item.demandPostId);
        acc[id] = item.liked || false;
        return acc;
    }, {});
}; 