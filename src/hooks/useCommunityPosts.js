import { useCallback, useEffect, useState } from 'react';
import _ from 'lodash';
import api from '../api/api';
import { fetchCommunityPosts } from '../utils/communityUtils';

export const useCommunityPosts = (searchType, searchQuery, category, orderBy, page, pageSize = 10) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalPages, setTotalPages] = useState(0);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const params = {
                search_type: searchType.toUpperCase(),
                query: searchQuery,
                category,
                order_by: orderBy,
                page,
                page_size: pageSize,
            };
            
            const res = await api.get('/community', { params });
            const data = res.data;
            const postsArr = Array.isArray(data.content) ? data.content : [];

            setPosts(postsArr);
            setTotalPages(data.totalPages || Math.ceil(data.totalElements / pageSize) || 1);
        } catch (err) {
            console.error('❌ 커뮤니티 게시글 로딩 실패:', err);
            setError(err.response?.data?.message || err.message || '게시글을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [searchType, searchQuery, category, orderBy, page, pageSize]);

    // 디바운싱된 데이터 페칭
    useEffect(() => {
        console.log("Community 데이터 페칭:", { searchType, searchQuery, category, orderBy, page });
        const debounceFetch = _.debounce(() => {
            fetchPosts();
        }, 500);
        debounceFetch();
        return () => debounceFetch.cancel();
    }, [fetchPosts]);

    return {
        posts,
        setPosts,
        loading,
        error,
        totalPages,
        fetchPosts
    };
}; 