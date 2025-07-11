import { useCallback, useEffect, useState } from 'react';
import _ from 'lodash';
import api from '../api/api';
import { getNumericId } from '../utils/demandUtils';

export const useDemandProducts = (searchType, searchQuery, category, orderBy, includeExpired, includeScheduled, page, pageSize = 10) => {
    const [demandProducts, setDemandProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalPages, setTotalPages] = useState(0);

    const fetchDemandProducts = useCallback(async () => {
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
            
            const res = await api.get('/demand', { params });
            const data = res.data;
            const productsArr = Array.isArray(data.content) ? data.content : [];

            setDemandProducts(productsArr);
            setTotalPages(data.totalPages || Math.ceil(data.totalElements / pageSize) || 1);
        } catch (err) {
            console.error('❌ 수요조사 데이터 로딩 실패:', err);
            setError(err.response?.data?.message || err.message || '수요조사를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [searchType, searchQuery, category, orderBy, includeExpired, includeScheduled, page, pageSize]);

    // 디바운싱된 데이터 페칭
    useEffect(() => {
        console.log("Demand 데이터 페칭:", { searchType, searchQuery, category, orderBy, page });
        const debounceFetch = _.debounce(() => {
            fetchDemandProducts();
        }, 500);
        debounceFetch();
        return () => debounceFetch.cancel();
    }, [fetchDemandProducts]);

    return {
        demandProducts,
        setDemandProducts,
        loading,
        error,
        totalPages,
        fetchDemandProducts
    };
}; 