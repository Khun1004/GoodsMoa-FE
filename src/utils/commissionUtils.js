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
            : `http://localhost:8080/${thumbnailUrl.replace(/^\/+/, '')}`
        : ''; 