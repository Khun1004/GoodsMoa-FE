import React, { useCallback, useEffect, useState, useMemo } from 'react';
import _ from 'lodash';
import { FaHeart } from 'react-icons/fa';
import { SlSocialDropbox } from "react-icons/sl";
import { useLocation, useNavigate } from 'react-router-dom';
import './Commission.css';
import Category from '../../CommissionIcon/CommissionIcon';
import SearchBanner from '../../public/SearchBanner';
import Spacer from "../../public/Spacer.jsx";
import SortSelect from "../../public/SortSelect.jsx";
import BestsellerList from "../../public/BestsellerList.jsx";
import ProductCard from '../../common/ProductCard/ProductCard';
import { getBestsellerByType} from "../../../api/publicService.jsx";
import { getNumericId } from '../../../utils/commissionUtils';
import api from '../../../api/api';

const Commission = ({ showBanner = true}) => {
    const location = useLocation();
    const navigate = useNavigate();

    const userName = "사용자";
    const [registeredCommissions, setRegisteredCommissions] = useState([]);
    const [liked, setLiked] = useState(() => {
        const savedLiked = localStorage.getItem('liked');
        return savedLiked ? JSON.parse(savedLiked) : Array(products1.length + products2.length).fill(false);
    });
    const [selectedProducts, setSelectedProducts] = useState(() => {
        const savedSelected = localStorage.getItem('selectedProducts');
        return savedSelected ? JSON.parse(savedSelected) : [];
    });

    const [commissionProducts, setCommissionProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('ALL');

    const [category, setCategory] = useState(0);
    const [orderBy, setOrderBy] = useState('new');
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

    const fetchCommissionProducts = useCallback(async () => {
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

            // commissionProducts liked 정보 유지하면서 업데이트 하려면 서버에서 liked 정보 같이 받아야 함.
            // 없으면 기존 liked 유지
            setCommissionProducts(productsArr);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            setError(err.message || '데이터를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    }, [searchType, searchQuery, category, orderBy, includeExpired, includeScheduled, page]);

    useEffect(() => {
        const debounceFetch = _.debounce(() => {
            fetchCommissionProducts();
        }, 500);
        debounceFetch();
        return () => debounceFetch.cancel();
    }, [fetchCommissionProducts]);

    const handleLike = async (id) => {
        const numericId = getNumericId(id);
        try {
            await api.post(`/commission/like/${numericId}`);
            setCommissionProducts(prev =>
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

    const filteredProducts = commissionProducts.filter(item => {
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

    // useEffect(() => {
    //     const storedCommissions = JSON.parse(localStorage.getItem("commissions")) || [];
    //     setRegisteredCommissions(storedCommissions);
    // }, []);
    //
    // useEffect(() => {
    //     const commissions = JSON.parse(localStorage.getItem('commissions')) || [];
    //     setRegisteredCommissions(commissions);
    // }, []);
    //
    // useEffect(() => {
    //     // localStorage에서 등록된 커미션 불러오기
    //     const savedCommissions = JSON.parse(localStorage.getItem('commissions')) || [];
    //     setRegisteredCommissions(savedCommissions);
    //
    //     // 좋아요 상태 저장
    //     localStorage.setItem('liked', JSON.stringify(liked));
    //     localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
    // }, [liked, selectedProducts]);
    //
    // const handleLike = (index, product) => {
    //     const newLiked = [...liked];
    //     newLiked[index] = !newLiked[index];
    //     setLiked(newLiked);
    //
    //     if (!liked[index]) {
    //         setSelectedProducts((prev) => [...prev, product]);
    //     } else {
    //         setSelectedProducts((prev) => prev.filter((p) => p.id !== product.id));
    //     }
    // };

    return (
        <div className='container'>
            <div className="commission-container">
                {showBanner && (
                    <>
                        <Spacer height={20}/>
                        <SearchBanner
                            placeholder="커미션 검색"
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

                        {!isSearching && (
                            <BestsellerList
                                apiFn={getBestsellerByType}
                                type="commission"
                                heading="인기 커미션"
                                liked={commissionProducts.reduce((acc, item) => {
                                    const id = getNumericId(item.id);
                                    acc[String(id)] = item.liked;
                                    return acc;
                                }, {})}
                                onLike={(postId) => {
                                    handleLike(postId);
                                }}
                                onCardClick={(item) => {
                                    const numericId = getNumericId(item.id);
                                    navigate(`/commissionDetail/${numericId}`, {
                                        state: {
                                            product: item,
                                            id: numericId
                                        },
                                    });
                                }}
                            />
                        )}
                    </>
                )}

                <div className="commission-header">
                    <div className="commission-icon">
                        <SlSocialDropbox className="commissionbox-icon"/>
                        <FaHeart className="heart-icon"/>
                    </div>
                    <h2 className="commission-heading">커미션</h2>
                    <div style={{marginLeft: 'auto'}}>
                        <SortSelect options={sortOptions} selected={orderBy} onChange={setOrderBy}/>
                    </div>
                </div>

                <div className="product-grid">
                    {loading && <div className="loading-box">🔄 로딩중입니다...</div>}
                    {!loading && (isSearching ? filteredProducts : commissionProducts).length === 0 && (
                        <div className="no-search-result">"{searchQuery}"에 대한 검색 결과가 없습니다.</div>
                    )}

                    {!loading &&
                        (isSearching ? filteredProducts : commissionProducts).map((item, idx) => (
                            <ProductCard
                                key={item.id || idx}
                                item={item}
                                onLike={handleLike}
                                products={commissionProducts}
                                detailPath="/commissionDetail"
                                label="수요조사"
                                saleLabel="수요거래"
                            />
                        ))}
                </div>

                <div className="pagination">
                    {Array.from({length: totalPages}, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i)}
                            style={{
                                margin: '0 5px',
                                padding: '6px 10px',
                                backgroundColor: i === page ? '#333' : '#eee',
                                color: i === page ? '#fff' : '#000',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>


                {/*{true && (*/}
                {/*    <>*/}
                {/*        <SearchBanner*/}
                {/*            placeholder="커미션 검색"*/}
                {/*            searchQuery={searchQuery}*/}
                {/*            setSearchQuery={setSearchQuery}*/}
                {/*            handleSearchKeyPress={(e) => {*/}
                {/*                if (e.key === 'Enter') console.log('검색어:', searchQuery);*/}
                {/*            }}*/}
                {/*        />*/}
                {/*        /!*  카테고리 아이콘 (판매처럼) *!/*/}
                {/*        <CommissionIcon/>*/}

                {/*        /!*  가로 구분선 *!/*/}
                {/*        <hr className="sale-divider"/>*/}
                {/*    </>*/}
                {/*)}*/}


                {/* 커미션 상품 목록 */}
                {/*<div className='commissionProductFrame'>*/}
                {/*    <div className='commission-header'>*/}
                {/*        <div className='commission-icon'>*/}
                {/*            <SlSocialDropbox className='commissionbox-icon'/>*/}
                {/*            <FaHeart className='heart-icon'/>*/}
                {/*        </div>*/}
                {/*        <h2 className="commission-heading">커미션</h2>*/}
                {/*    </div>*/}

                {/*    <div className='commissionFrame1'>*/}
                {/*        <div className="commission-grid">*/}
                {/*            {products1.map((product, index) => (*/}
                {/*                <div key={product.id} className="commission-card">*/}
                {/*                    <div className="profile-info">*/}
                {/*                        <CgProfile className="profile-pic"/>*/}
                {/*                        <p className="user-name">{userName}</p>*/}
                {/*                    </div>*/}
                {/*                    <Link to={`/commissionDetail`}*/}
                {/*                          state={{product, description: product.description}}>*/}
                {/*                        <img src={product.src} alt={product.name} className="commission-image"/>*/}
                {/*                    </Link>*/}
                {/*                    <span className="commission-label">커미션</span>*/}
                {/*                    <button*/}
                {/*                        className={`commission-like-button ${liked[index] ? 'liked' : ''}`}*/}
                {/*                        onClick={() => handleLike(index, product)}*/}
                {/*                    >*/}
                {/*                        <FaHeart size={18}/>*/}
                {/*                    </button>*/}
                {/*                    <p className="commission-product-name">{product.name}</p>*/}
                {/*                </div>*/}
                {/*            ))}*/}
                {/*        </div>*/}
                {/*    </div>*/}

                {/*    <div className='commissionFrame2'>*/}
                {/*        <div className="commission-grid">*/}
                {/*            {products2.map((product, index) => (*/}
                {/*                <div key={product.id} className="commission-card">*/}
                {/*                    <div className="profile-info">*/}
                {/*                        <CgProfile className="profile-pic"/>*/}
                {/*                        <p className="user-name">{userName}</p>*/}
                {/*                    </div>*/}
                {/*                    <Link to={`/commissionDetail`}*/}
                {/*                          state={{product, description: product.description}}>*/}
                {/*                        <img src={product.src} alt={product.name} className="commission-image"/>*/}
                {/*                    </Link>*/}
                {/*                    <span className="commission-label">커미션</span>*/}
                {/*                    <button*/}
                {/*                        className={`commission-like-button ${liked[products1.length + index] ? 'liked' : ''}`}*/}
                {/*                        onClick={() => handleLike(products1.length + index, product)}*/}
                {/*                    >*/}
                {/*                        <FaHeart size={18}/>*/}
                {/*                    </button>*/}
                {/*                    <p className="commission-product-name">{product.name}</p>*/}
                {/*                </div>*/}
                {/*            ))}*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*</div>*/}

                {/* 등록된 커미션 표시 */}
                {/*<div className='commissionProductFrame'>*/}
                {/*    {registeredCommissions.length > 0 && (*/}
                {/*        <>*/}
                {/*            <div className='commission-header'>*/}
                {/*                <div className='commission-icon'>*/}
                {/*                    <SlSocialDropbox className='commissionbox-icon'/>*/}
                {/*                    <FaHeart className='heart-icon'/>*/}
                {/*                </div>*/}
                {/*                <h2 className="commission-heading">내가 등록한 커미션</h2>*/}
                {/*            </div>*/}

                {/*            <div className='commissionFrame1'>*/}
                {/*                <div className="commission-grid">*/}
                {/*                    {registeredCommissions.map((commission, index) => (*/}
                {/*                        <div key={index} className="commission-card">*/}
                {/*                            <div className="profile-info">*/}
                {/*                                <CgProfile className="profile-pic"/>*/}
                {/*                                <p className="user-name">{userName}</p>*/}
                {/*                            </div>*/}
                {/*                            <Link to={`/commissionDetail`}*/}
                {/*                                  state={{commission, description: commission.editorContent}}>*/}
                {/*                                <img*/}
                {/*                                    src={commission.image}*/}
                {/*                                    alt={commission.title}*/}
                {/*                                    className="commission-image"*/}
                {/*                                />*/}
                {/*                            </Link>*/}
                {/*                            <span className="commission-label">커미션</span>*/}
                {/*                            <button className="commission-like-button">*/}
                {/*                                <FaHeart size={18}/>*/}
                {/*                            </button>*/}
                {/*                            <p className="commission-product-name">{commission.title}</p>*/}
                {/*                            <div className="tags-list">*/}
                {/*                                {commission.tags.map((tag, tagIndex) => (*/}
                {/*                                    <span key={tagIndex} className="tag-item">*/}
                {/*                                        #{tag}*/}
                {/*                                    </span>*/}
                {/*                                ))}*/}
                {/*                            </div>*/}
                {/*                        </div>*/}
                {/*                    ))}*/}
                {/*                </div>*/}
                {/*            </div>*/}
                {/*        </>*/}
                {/*    )}*/}
                {/*</div>*/}
            </div>
        </div>

    );
};

export default Commission;
