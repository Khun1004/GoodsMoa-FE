import { searchBoardPosts } from '../api/publicService';
import productService from '../api/ProductService';

// ID 키 추출 함수
export const getPostIdKey = (id) => {
    if (typeof id === 'string' && id.includes('_')) {
        return id.split('_')[1];
    }
    return String(id);
};

// 상품 데이터 페칭 함수
export const fetchSaleProducts = async ({
    searchType,
    searchQuery,
    category,
    sortOrder,
    page,
    pageSize,
    setPosts,
    setTotalPages,
    setLoading,
    setError
}) => {
    setLoading(true);
    setError(null);
    
    try {
        const res = await searchBoardPosts({
            path: '/product',
            board_type: 'PRODUCT',
            search_type: searchType.toUpperCase(),
            query: searchQuery,
            category,
            order_by: sortOrder,
            page: page,
            page_size: pageSize
        });

        const now = new Date();
        const filtered = res.content.filter(post => {
            const start = post.startTime ? new Date(post.startTime) : null;
            const end = post.endTime ? new Date(post.endTime) : null;
            if (start && now < start) return false;
            if (end && now > end) return false;
            return true;
        });

        setPosts(filtered);
        const calculatedTotalPages = res.totalPages || Math.ceil(res.totalElements / pageSize) || 1;
        console.log('Sale totalPages 계산:', {
            totalElements: res.totalElements,
            totalPages: res.totalPages,
            calculatedTotalPages,
            pageSize
        });
        setTotalPages(calculatedTotalPages);
    } catch (err) {
        console.error('❌ 상품글 검색 실패:', err);
        setError(err.message || '상품을 불러오는데 실패했습니다.');
    } finally {
        setLoading(false);
    }
};

// 좋아요 처리 함수
export const handleSaleLike = async ({
    postId,
    liked,
    setLiked,
    posts,
    setPosts
}) => {
    const postIdKey = getPostIdKey(postId);
    
    try {
        const isLiked = liked[postIdKey];
        
        if (isLiked) {
            await productService.unlikeProduct(postIdKey);
        } else {
            await productService.likeProduct(postIdKey);
        }
        
        // 로컬 상태 업데이트
        setLiked(prev => ({ ...prev, [postIdKey]: !isLiked }));
        
        // posts 배열의 해당 아이템도 업데이트
        setPosts(prevPosts => 
            prevPosts.map(post => {
                const currentPostId = getPostIdKey(post.id);
                if (currentPostId === postIdKey) {
                    return { ...post, liked: !isLiked };
                }
                return post;
            })
        );
        
    } catch (err) {
        console.error('좋아요 처리 중 오류:', err);
        alert(err.message || '좋아요 처리에 실패했습니다.');
    }
};

// 좋아요 상태 초기화 함수
export const initializeLikedStatus = async (setLiked) => {
    const token = localStorage.getItem('userInfo');
    if (!token) return;

    try {
        const res = await productService.getLikedPosts();
        const likedMap = {};
        res.content.forEach(post => {
            likedMap[String(post.postId)] = true;
        });
        setLiked(likedMap);
    } catch (err) {
        console.error("초기 좋아요 로딩 실패:", err);
    }
}; 