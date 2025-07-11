import _ from 'lodash';
import { searchBoardPosts } from '../api/publicService';

// 커뮤니티 게시판 목록
export const COMMUNITY_BOARDS = [
    '최근 방문 게시판',
    '아이돌 / 연예인',
    '게임',
    '영화',
    '웹소설',
    '애니메이션',
    '순수창작',
    '행사',
    '드라마',
    '웹툰',
];

// 검색 옵션
export const SEARCH_OPTIONS = [
    { label: '제목', value: 'TITLE' },
    { label: '내용', value: 'CONTENT' },
    { label: '글쓴이', value: 'AUTHOR' },
    { label: '전체', value: 'ALL' }
];

// 정렬 옵션
export const SORT_OPTIONS = [
    { label: '최신순', value: 'new' },
    { label: '인기순', value: 'popular' },
    { label: '조회수순', value: 'view' },
    { label: '댓글순', value: 'comment' }
];

// 커뮤니티 게시글 데이터 페칭 함수
export const fetchCommunityPosts = async ({
    searchType,
    searchQuery,
    category,
    orderBy,
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
            path: '/community',
            board_type: 'COMMUNITY',
            search_type: searchType.toUpperCase(),
            query: searchQuery,
            category,
            order_by: orderBy,
            page: page,
            page_size: pageSize
        });

        setPosts(res.content);
        setTotalPages(Math.ceil(res.totalElements / pageSize));
    } catch (err) {
        console.error('❌ 커뮤니티 게시글 검색 실패:', err);
        setError(err.message || '게시글을 불러오는데 실패했습니다.');
    } finally {
        setLoading(false);
    }
};

// 디바운싱된 커뮤니티 데이터 페칭 함수
export const createDebouncedFetchCommunity = (fetchParams) => {
    return _.debounce(() => {
        fetchCommunityPosts(fetchParams);
    }, 500);
};

// 게시판 이름을 카테고리 ID로 변환
export const getBoardCategoryId = (boardName) => {
    const boardMap = {
        '아이돌 / 연예인': 1,
        '게임': 2,
        '영화': 3,
        '웹소설': 4,
        '애니메이션': 5,
        '순수창작': 6,
        '행사': 7,
        '드라마': 8,
        '웹툰': 9
    };
    return boardMap[boardName] || 0;
};

// 카테고리 ID를 게시판 이름으로 변환
export const getCategoryBoardName = (categoryId) => {
    const categoryMap = {
        1: '아이돌 / 연예인',
        2: '게임',
        3: '영화',
        4: '웹소설',
        5: '애니메이션',
        6: '순수창작',
        7: '행사',
        8: '드라마',
        9: '웹툰'
    };
    return categoryMap[categoryId] || '인기글';
};

// 게시글 검색 필터링 함수
export const filterCommunityPosts = (posts, searchQuery) => {
    if (!searchQuery.trim()) return posts;
    
    const query = searchQuery.toLowerCase();
    return posts.filter(post => (
        post.title?.toLowerCase().includes(query) ||
        post.content?.toLowerCase().includes(query) ||
        post.author?.toLowerCase().includes(query) ||
        post.nickname?.toLowerCase().includes(query)
    ));
};

// 좋아요 처리 함수
export const handleCommunityLike = async ({
    postId,
    posts,
    setPosts,
    apiService
}) => {
    try {
        const currentPost = posts.find(post => post.id === postId);
        
        if (!currentPost) return;
        
        const isLiked = currentPost.liked;
        
        if (isLiked) {
            await apiService.unlikeCommunity(postId);
        } else {
            await apiService.likeCommunity(postId);
        }
        
        // 로컬 상태 업데이트
        setPosts(prevPosts => 
            prevPosts.map(post => {
                if (post.id === postId) {
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

// 시간 포맷팅 함수
export const formatTime = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}일 전`;
    
    return postDate.toLocaleDateString('ko-KR');
};

// 인기 게시글 목록 (임시 데이터)
export const getPopularPosts = () => [
    {
        id: 1,
        title: '반다이의 퇴물이 방지 대책',
        category: '웹소설',
        time: '1시간 전',
        likes: 36,
        thumbnail: 'https://via.placeholder.com/80',
    },
    {
        id: 2,
        title: '남돌 신청성 근황임',
        category: '게임',
        time: '3시간 전',
        likes: 40,
        thumbnail: 'https://via.placeholder.com/80',
    },
    {
        id: 3,
        title: '박효신 HERO 발매 ost from 소방관',
        category: '아이돌/연예인',
        time: '8시간 전',
        likes: 20,
        thumbnail: 'https://via.placeholder.com/80',
    },
    {
        id: 4,
        title: '"기카자드! 니 딸따로 병원에 다녀오길 잘했어!"',
        category: '아이돌/연예인',
        time: '9시간 전',
        likes: 17,
        thumbnail: 'https://via.placeholder.com/80',
    },
    {
        id: 5,
        title: '제 82회 골든 글로브 수상작 풀 리스트',
        category: '영화',
        time: '10시간 전',
        likes: 52,
        thumbnail: 'https://via.placeholder.com/80',
    },
]; 