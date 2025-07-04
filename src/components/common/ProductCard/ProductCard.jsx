import React from 'react';
import { Link } from 'react-router-dom';
import { CgProfile } from 'react-icons/cg';
import { FaHeart } from 'react-icons/fa';
import { getNumericId, getFullThumbnailUrl } from '../../../utils/demandUtils';
import './ProductCard.css';

const ProductCard = ({ 
    item, 
    onLike, 
    products, 
    detailPath, 
    label = '상품',
    saleLabel = '거래'
}) => {
    const id = getNumericId(item.id || item.demandPostId || item.salePostId || item.tradePostId);

    return (
        <div className="product-card">
            <div className="product-image-wrapper">
                <Link
                    to={`${detailPath}/${id}`}
                    state={{
                        product: item,
                        saleLabel: saleLabel,
                        products: products,
                    }}
                    className="product-image-link"
                >
                    <img
                        src={getFullThumbnailUrl(item.thumbnailUrl)}
                        alt={item.title}
                        className="product-image"
                    />
                </Link>
                <span className="product-label">{label}</span>
                <button
                    className={`product-like-button${item.liked ? ' liked' : ''}`}
                    onClick={() => onLike(id)}
                >
                    <FaHeart size={18} />
                </button>
            </div>
            <div className="product-profile-block">
                <div className="product-profile-line">
                    <div className="product-profile-row">
                        {item.userImage ? (
                            <img src={item.userImage} alt="profile" className="profile-pic" />
                        ) : (
                            <CgProfile className="profile-pic" />
                        )}
                        <span className="product-user-name-mini">{item.nickname || '작성자'}</span>
                    </div>
                    <span className="view-count">조회수: {item.views || 0}</span>
                </div>

                <div className="product-title">{item.title}</div>

                {item.hashtag && item.hashtag.trim() && (
                    <div className="tags-list">
                        {item.hashtag
                            .split(',')
                            .map((tag) => tag.trim())
                            .filter((tag) => tag.length > 0)
                            .map((tag, idx) => (
                                <span key={idx} className="tag-item">
                                    #{tag}
                                </span>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCard; 