import _ from 'lodash';
import api from '../api/api';

// 커미션용 숫자 ID 추출 함수
export const getNumericId = (id) => {
    if (typeof id === 'string' && id.startsWith('COMMISSION_')) {
        return Number(id.replace('COMMISSION_', ''));
    }
    return Number(id);
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
];

// 커미션 데이터 페칭 함수
export const fetchCommissionProducts = async ({
    searchType,
    searchQuery,
    category,
    orderBy,
    includeExpired,
    includeScheduled,
    page,
    pageSize,
    setCommissionProducts,
    setTotalPages,
    setLoading,
    setError
}) => {
    setLoading(true);
    setError(null);
    
    try {
        const apiParams = {
            search_type: (searchType || 'ALL').toUpperCase(),
            query: searchQuery || '',
            category: category ?? 0,
            order_by: orderBy || 'new',
            include_expired: includeExpired,
            include_scheduled: includeScheduled,
            page: page ?? 0,
            page_size: pageSize ?? 10,
        };
        
        console.log('commission API params:', apiParams);
        const res = await api.get('/commission/search', { params: apiParams });
        const data = res.data;
        const productsArr = Array.isArray(data.content) ? data.content : [];
        
        setCommissionProducts(productsArr);
        setTotalPages(data.totalPages || Math.ceil(data.totalElements / pageSize) || 1);
    } catch (err) {
        console.error('❌ 커미션 검색 실패:', err);
        setError(err.message || '커미션을 불러오는데 실패했습니다.');
    } finally {
        setLoading(false);
    }
};

// 디바운싱된 커미션 데이터 페칭 함수
export const createDebouncedFetchCommission = (fetchParams) => {
    return _.debounce(() => {
        fetchCommissionProducts(fetchParams);
    }, 500);
};

// 좋아요 처리 함수
export const handleCommissionLike = async ({
    postId,
    commissionProducts,
    setCommissionProducts
}) => {
    try {
        const numericId = getNumericId(postId);
        const currentProduct = commissionProducts.find(item => 
            getNumericId(item.id) === numericId
        );
        
        if (!currentProduct) return;
        
        const isLiked = currentProduct.liked;
        
        if (isLiked) {
            await api.delete(`/commission-like/${numericId}`);
        } else {
            await api.post(`/commission-like/${numericId}`);
        }
        
        // 로컬 상태 업데이트
        setCommissionProducts(prevProducts => 
            prevProducts.map(item => {
                const itemId = getNumericId(item.id);
                if (itemId === numericId) {
                    return { ...item, liked: !isLiked };
                }
                return item;
            })
        );
        
    } catch (err) {
        console.error('좋아요 처리 중 오류:', err);
        alert(err.response?.data?.message || err.message || '좋아요 처리에 실패했습니다.');
    }
};

// 검색 필터링 함수
export const filterCommissionProducts = (products, searchQuery) => {
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
        const id = getNumericId(item.id);
        acc[String(id)] = item.liked || false;
        return acc;
    }, {});
};

// 커미션 상태 포맷팅 함수
export const formatCommissionStatus = (status) => {
    const statusMap = {
        'OPEN': '모집중',
        'CLOSED': '마감',
        'IN_PROGRESS': '진행중',
        'COMPLETED': '완료'
    };
    return statusMap[status] || status;
};

// 가격 포맷팅 함수
export const formatPrice = (price) => {
    if (!price) return '가격 미정';
    return `${price.toLocaleString()}원`;
};

// 마감일 포맷팅 함수
export const formatDeadline = (deadline) => {
    if (!deadline) return '마감일 미정';
    
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffInDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 0) return '마감됨';
    if (diffInDays === 0) return '오늘 마감';
    if (diffInDays === 1) return '내일 마감';
    if (diffInDays <= 7) return `${diffInDays}일 후 마감`;
    
    return deadlineDate.toLocaleDateString('ko-KR');
}; 