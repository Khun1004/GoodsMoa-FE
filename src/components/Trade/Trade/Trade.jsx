import React, {useEffect, useState, useContext, useCallback} from 'react';
import { FaHeart } from 'react-icons/fa';
import { SlSocialDropbox } from "react-icons/sl";
import { Link, useNavigate } from 'react-router-dom';
import { LoginContext } from "../../../contexts/LoginContext";
import SearchBanner from '../../public/SearchBanner';
import './Trade.css';
import Category from '../../public/Category/Category';
import SortSelect from "../../public/SortSelect.jsx";
import BestsellerList from "../../public/BestsellerList.jsx";
import { getBestsellerByType } from "../../../api/publicService";
import api from "../../../api/api";
import _ from "lodash";
import ProductCard from '../../common/ProductCard/ProductCard';
import Pagination from '../../common/Pagination/Pagination';
import { getFullThumbnailUrl } from '../../../utils/demandUtils';
import { getNumericId, fetchTradeProducts, handleLike } from '../../../utils/tradeUtils';

const Trade = ({ showBanner = true, mainCategory, setMainCategory }) => {
  const { userInfo } = useContext(LoginContext);
  const navigate = useNavigate();

  const [fetchedTradePosts, setFetchedTradePosts] = useState([]);
  const [likedServerPosts, setLikedServerPosts] = useState({});

  const [tradeProducts, setTradeProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('ALL');
  const [boardCategory, setBoardCategory] = useState(0);
  const [orderBy, setOrderBy] = useState('latest');
  const [includeExpired, setIncludeExpired] = useState(true);
  const [includeScheduled, setIncludeScheduled] = useState(true);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;



  const sortOptions = [
    { label: '최신순', value: 'new' },      // 최신 등록순
    { label: '오래된순', value: 'old' },        // 오래된 등록순
    { label: '조회수순', value: 'view' },       // 조회수 많은 순
    { label: '좋아요순', value: 'like' },         // 좋아요(찜) 많은 순
  ];

  const category = mainCategory !== undefined ? mainCategory : boardCategory;
  const setCategory = setMainCategory !== undefined ? setMainCategory : setBoardCategory;

  useEffect(() => {
    console.log("Trade의 mainCategory:", mainCategory);
    const debounceFetch = _.debounce(() => {
      fetchTradeProducts({
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
        setError
      });
    }, 500);
    debounceFetch();
    return () => debounceFetch.cancel();
  }, [searchType, searchQuery, category, orderBy, includeExpired, includeScheduled, page]);

  // 좋아요 상태 동기화 (tradeProducts가 바뀔 때만)
  useEffect(() => {
    if (userInfo && tradeProducts.length > 0) {
      const postIds = tradeProducts.map(post => post.id);
      api.post('/trade-like/my-likes-status', { postIds })
        .then(likesRes => setLikedServerPosts(likesRes.data))
        .catch(() => setLikedServerPosts({}));
    } else {
      setLikedServerPosts({});
    }
  }, [userInfo, tradeProducts]);



  // 검색용
  const filteredProducts = tradeProducts.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
        item.title?.toLowerCase().includes(query) ||
        item.hashtag?.toLowerCase().includes(query) ||
        item.nickname?.toLowerCase().includes(query)
    );
  });

  const handleSearchSubmit = () => {
    setPage(0);
  };

  const isSearching = searchQuery.trim().length > 0;

  return (
      <div className="sale-container">
        {showBanner && (
            <>
              <SearchBanner
                  placeholder="중고거래 검색"
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  searchType={searchType}
                  setSearchType={setSearchType}
                  handleSearchKeyPress={(e) => {
                    if (e.key === 'Enter') handleSearchSubmit();
                  }}
              />
              <Category
                  gap={60}
                  selectedId={category}
                  onCategoryClick={(id) => {
                    setCategory(id);
                    setPage(0);
                  }}
              />

              <hr className="sale-divider"/>

              {searchQuery.trim().length === 0 && (
                  <BestsellerList
                      apiFn={getBestsellerByType}
                      type="trade"
                      heading="인기 중고거래"
                      liked={tradeProducts.reduce((acc, item) => {
                          const id = getNumericId(item.id || item.tradePostId);
                          acc[id] = item.liked;
                          return acc;
                      }, {})}
                      onLike={(postId) => {
                          handleLike({
                              id: postId,
                              tradeProducts,
                              setTradeProducts
                          });
                      }}
                      onCardClick={(item) =>
                          navigate(`/tradeDetail/${getNumericId(item.id || item.tradePostId)}`, {
                            state: {product: item},
                          })
                      }
                  />
              )}
            </>
        )}

        <div className='saleProductFrame'>
          {showBanner && (
              <div className='sale-header'>
                <div className='sale-icon'>
                  <SlSocialDropbox className='salebox-icon'/>
                  <FaHeart className='heart-icon'/>
                </div>
                <h2 className="sale-heading">중고거래</h2>
                <div style={{marginLeft: 'auto'}}>
                  <SortSelect options={sortOptions} selected={orderBy} onChange={setOrderBy}/>
                </div>
              </div>
          )}

          <div className="sale-grid">
            {loading && <div className="loading-box">🔄 로딩중입니다...</div>}
            {!loading && (isSearching ? filteredProducts : tradeProducts).length === 0 && (
                <div className="no-search-result">"{searchQuery}"에 대한 검색 결과가 없습니다.</div>
            )}
            {(isSearching ? filteredProducts : tradeProducts).map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  onLike={(id) => handleLike({
                      id,
                      tradeProducts,
                      setTradeProducts
                  })}
                  products={tradeProducts}
                  detailPath="/tradeDetail"
                  label="중고거래"
                  saleLabel="중고거래"
                />
            ))}
          </div>
          {showBanner && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
          )}
        </div>
      </div>
  );
};

export default Trade;
