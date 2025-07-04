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
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            setError(err.message || '데이터를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    }, [searchType, searchQuery, category, orderBy, includeExpired, includeScheduled, page, pageSize]);

    // debounce 효과용 useEffect
    useEffect(() => {
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