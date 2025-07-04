import React, { useEffect, useState } from 'react';
import { CgProfile } from "react-icons/cg";
import { SlSocialDropbox } from "react-icons/sl";
import { FaHeart } from 'react-icons/fa';
import { default as placeholderImage } from '../../assets/sales/sale1.jpg';
import '../Sales/Sale/Sale.css';
import Spacer from "./Spacer.jsx";
import ProductCard from '../common/ProductCard/ProductCard';
import { getNumericId as getDemandNumericId } from '../../utils/demandUtils';
import { getNumericId as getTradeNumericId } from '../../utils/tradeUtils';

// ✅ 문자열 ID에서 숫자 postId 추출하는 함수
const extractPostId = (fullId, type) => {
    if (type === 'trade') {
        return getTradeNumericId(fullId);
    } else if (type === 'demand') {
        return getDemandNumericId(fullId);
    } else {
        // sale이나 다른 타입의 경우
        if (typeof fullId === 'string' && fullId.includes('_')) {
            return Number(fullId.split('_')[1]);
        }
        return Number(fullId);
    }
};

const BestsellerList = ({ apiFn, type, heading, liked = {}, onLike, onCardClick }) => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        console.log("✅ BestsellerList received liked props:", liked);
    }, [liked]);
    
    // 베스트셀러 리스트 가져오기
    useEffect(() => {
        const fetchBestsellers = async () => {
            try {
                const result = await apiFn(type);
                setPosts(result);
            } catch (err) {
                console.error("🔥 베스트셀러 조회 실패:", err);
            }
        };
        fetchBestsellers();
    }, [apiFn, type]);

    return (
        <div className='saleProductFrame'>
            <div className='sale-header'>
                <div className='sale-icon'>
                    <SlSocialDropbox className='salebox-icon' />
                    <FaHeart className='heart-icon' />
                </div>
                <h2 className="sale-heading">{heading}</h2>
            </div>

            <div className="sale-grid">
                {posts.map((post) => {
                    const postId = extractPostId(post.id, type);
                    const isLiked = liked[postId] || false;
                    
                    return (
                        <ProductCard
                            key={post.id}
                            item={{...post, liked: isLiked}}
                            onLike={onLike}
                            products={posts}
                            detailPath={type === 'trade' ? '/tradeDetail' : '/saleDetail'}
                            label="인기"
                            saleLabel={heading}
                            onCardClick={onCardClick}
                        />
                    );
                })}
            </div>

            {posts.length === 0 && (
                <div className="no-search-results">
                    <p style={{ textAlign: 'center', marginTop: '50px', fontSize: '18px', color: '#666' }}>
                        상품이 없습니다.
                    </p>
                </div>
            )}

            <div className="bestseller-divider" />
        </div>
    );
};

export default BestsellerList;
