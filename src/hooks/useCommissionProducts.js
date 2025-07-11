import { useCallback, useEffect, useState } from 'react';
import _ from 'lodash';
import api from '../api/api';
import { fetchCommissionProducts } from '../utils/commissionUtils';

export const useCommissionProducts = (searchType, searchQuery, category, orderBy, includeExpired, includeScheduled, page, pageSize = 10) => {
    const [commissionProducts, setCommissionProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalPages, setTotalPages] = useState(0);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const params = {
                search_type: searchType.toUpperCase(),
                query: searchQuery,
                category,
                order_by: orderBy,
                include_expired: includeExpired,
                include_scheduled: includeScheduled,
                page,
                page_size: pageSize,
            };
            
            const res = await api.get('/commission/search', { params });
            const data = res.data;
            const productsArr = Array.isArray(data.content) ? data.content : [];

            setCommissionProducts(productsArr);
            setTotalPages(data.totalPages || Math.ceil(data.totalElements / pageSize) || 1);
        } catch (err) {
            console.error('❌ 커미션 데이터 로딩 실패:', err);
            setError(err.response?.data?.message || err.message || '커미션을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [searchType, searchQuery, category, orderBy, includeExpired, includeScheduled, page, pageSize]);

    // 디바운싱된 데이터 페칭
    useEffect(() => {
        console.log("Commission 데이터 페칭:", { searchType, searchQuery, category, orderBy, page });
        const debounceFetch = _.debounce(() => {
            fetchProducts();
        }, 500);
        debounceFetch();
        return () => debounceFetch.cancel();
    }, [fetchProducts]);

    return {
        commissionProducts,
        setCommissionProducts,
        loading,
        error,
        totalPages,
        fetchProducts
    };
}; 