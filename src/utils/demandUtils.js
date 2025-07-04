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
            : `http://localhost:8080/${thumbnailUrl.replace(/^\/+/, '')}`
        : '';

// 정렬 옵션 상수
export const SORT_OPTIONS = [
    { label: '최신순', value: 'new' },      // 최신 등록순
    { label: '오래된순', value: 'old' },        // 오래된 등록순
    { label: '조회수순', value: 'view' },       // 조회수 많은 순
    { label: '좋아요순', value: 'like' },         // 좋아요(찜) 많은 순
    { label: '마감임박순', value: 'close' }, // 마감 임박 순
]; 