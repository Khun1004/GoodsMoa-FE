import api from '../api/api';
import { getNumericId as getDemandNumericId } from './demandUtils';

// Trade용 숫자 ID 추출 함수
export const getNumericId = (id) => {
    if (typeof id === 'string' && id.startsWith('TRADE_')) {
        return id.replace('TRADE_', '');
    }
    return String(id);
};

export const fetchTradeProducts = async (params) => {
  // 방어 코드: 인자가 없거나 undefined인 경우 에러 처리
  if (!params) {
    console.error('fetchTradeProducts: params 인자가 필요합니다!');
    return;
  }

  const {
    searchType,
    searchQuery,
    category,
    orderBy,
    includeExpired,
    includeScheduled,
    page,
    pageSize,
    setTradeProducts,
    setTotalPages,
    setLoading,
    setError,
  } = params;

  setLoading(true);
  setError(null);
  try {
    const apiParams = {
      search_type: (searchType || 'ALL').toUpperCase(),
      query: searchQuery || '',
      category: category ?? 0,
      order_by: orderBy || 'latest',
      include_expired: includeExpired,
      include_scheduled: includeScheduled,
      page: page ?? 0,
      page_size: pageSize ?? 10,
    };
    console.log('tradePost API params:', apiParams);
    const res = await api.get('/tradePost', { params: apiParams });
    const data = res.data;
    const productsArr = Array.isArray(data.content) ? data.content : [];
    setTradeProducts(productsArr);
    setTotalPages(data.totalPages || 1);
  } catch (err) {
    setError(err.message || '데이터를 불러오지 못했습니다.');
  } finally {
    setLoading(false);
  }
};

export const handleLike = async ({
  id,
  tradeProducts,
  setTradeProducts,
}) => {
  const numericId = getNumericId(id);
  try {
    const item = tradeProducts.find(p => getNumericId(p.id) === numericId);
    const isLiked = item?.liked;
    if (isLiked) {
      await api.delete(`/trade-like/${numericId}`);
    } else {
      await api.post(`/trade-like/like/${numericId}`);
    }
    setTradeProducts(prev =>
      prev.map(item => {
        const numericItemId = getNumericId(item.id);
        if (numericItemId === numericId) {
          return { ...item, liked: !item.liked };
        }
        return item;
      })
    );
  } catch (err) {
    alert('좋아요 처리 실패: ' + (err.response?.data?.message || err.message));
  }
}; 