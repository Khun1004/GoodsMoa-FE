import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductService from '../../../../api/ProductService';
import './SaleFormManagement.css';

const API_BASE_URL = 'http://localhost:8080';
const SUPPORTED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];

const SaleFormManagement = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [formData, setFormData] = React.useState(null);
    const [confirmDelete, setConfirmDelete] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    // Get image extension
    const getImageExtension = (img) => {
        if (!img) return 'png'; // Default for products
        if (typeof img === 'object' && img.extension) {
            const ext = img.extension.toLowerCase();
            return SUPPORTED_IMAGE_EXTENSIONS.includes(ext) ? ext : 'png';
        }
        if (typeof img === 'string' && img.includes('.')) {
            const urlParts = img.split('.');
            const ext = urlParts.pop().toLowerCase().split('?')[0];
            return SUPPORTED_IMAGE_EXTENSIONS.includes(ext) ? ext : 'png';
        }
        return 'png';
    };

    // Data load
    React.useEffect(() => {
        const loadData = () => {
            try {
                let loadedData = null;

                if (location.state?.formData) {
                    loadedData = {
                        ...location.state.formData,
                        id: location.state.formData.id || location.state.postId || `temp_${Date.now()}`,
                    };
                } else {
                    const savedData = localStorage.getItem('saleFormData');
                    if (savedData) {
                        loadedData = JSON.parse(savedData);
                        if (!loadedData.id) {
                            loadedData.id = `temp_${Date.now()}`;
                        }
                    }
                }

                if (loadedData) {
                    // Ensure all required fields exist with defaults
                    const safeFormData = {
                        id: loadedData.id,
                        title: loadedData.title || '제목 없음',
                        content: loadedData.content || '내용 없음',
                        thumbnailImage: loadedData.thumbnailImage || null,
                        isPublic: loadedData.isPublic !== false,
                        startTime: loadedData.startTime || null,
                        endTime: loadedData.endTime || null,
                        isPermanent: loadedData.isPermanent || false,
                        password: loadedData.password || loadedData.privateCode || null,
                        hashtag: loadedData.hashtag || '',
                        category: loadedData.category || null,
                        products: Array.isArray(loadedData.products)
                            ? loadedData.products.map((product, index) => ({
                                  ...product,
                                  id: product.id || `temp_${Date.now()}_${index}`,
                                  image: product.image || null,
                                  quantity: Number(product.quantity) || 0,
                                  maxQuantity: Number(product.maxQuantity) || 1,
                                  images: product.image ? [product.image] : [], // Ensure images array
                              }))
                            : [],
                        delivers: Array.isArray(loadedData.delivers)
                            ? loadedData.delivers.map((method) => ({
                                  name: method.name || '택배',
                                  price: Number(method.price) || 3000,
                              }))
                            : [{ name: '택배', price: 3000 }],
                    };

                    setFormData(safeFormData);
                    localStorage.setItem('saleFormData', JSON.stringify(safeFormData));
                }
            } catch (e) {
                console.error('Failed to load form data:', e);
                setError('데이터 로드 실패');
            }
        };

        loadData();
    }, [location.state]);

    const handleEdit = () => {
        if (!formData?.id) {
            console.error('No post ID available for editing');
            alert('수정할 게시물 정보가 없습니다.');
            return;
        }
    
        const transformImage = (img, postId, isProductImage = false, index = 0) => {
            if (!img) {
                console.warn(`No image provided for ${isProductImage ? 'product' : 'thumbnail'} at index ${index}`);
                return null;
            }
    
            let extension = isProductImage ? 'png' : 'jpg';
            if (typeof img === 'object' && img.extension) {
                extension = getImageExtension(img);
            } else if (typeof img === 'string' && img.includes('.')) {
                extension = getImageExtension(img);
            }
    
            if (typeof img === 'string' && (img.startsWith('http') || img.startsWith('blob:'))) {
                return img; // Preserve existing URLs
            }
    
            const id = String(postId || '');
            if (id && !id.startsWith('temp_')) {
                const url = `${API_BASE_URL}/productPost/${
                    isProductImage ? 'product' : 'thumbnail'
                }/${id}_${isProductImage ? index + 1 : 1}.${extension}`;
                console.log(`Constructed image URL: ${url}`);
                return url;
            }
    
            return typeof img === 'object' && img.preview ? img : img;
        };
    
        console.log(`Navigating to SaleForm with postId: ${formData.id}`);
        navigate('/saleform', {
            state: {
                from: 'management',
                postId: formData.id, // Pass the real postId
                title: formData.title,
                category: typeof formData.category === 'object' ? formData.category.name : formData.category,
                description: formData.content,
                image: transformImage(formData.thumbnailImage, formData.id),
                hashtag: typeof formData.hashtag === 'string'
                    ? formData.hashtag.split(',').filter(tag => tag.trim())
                    : Array.isArray(formData.hashtag)
                    ? formData.hashtag
                    : [],
                shippingMethods: formData.delivers,
                products: formData.products.map((product, index) => ({
                    ...product,
                    image: transformImage(product.image, formData.id, true, index),
                    images: product.image ? [transformImage(product.image, formData.id, true, index)] : [],
                    isExisting: !String(formData.id).startsWith('temp_'),
                    imageUpdated: false,
                })),
                isPublic: formData.isPublic,
                privateCode: formData.password,
                start_time: formData.startTime,
                end_time: formData.endTime,
                isPermanent: formData.isPermanent,
                contentImages: formData.contentImages || [],
            },
        });
    };

    const handleDelete = async () => {
        if (!formData?.id) {
            alert('삭제할 게시물 정보가 없습니다.');
            return;
        }

        if (!confirmDelete) {
            setConfirmDelete(true);
            setTimeout(() => setConfirmDelete(false), 3000);
            return;
        }

        try {
            setLoading(true);

            const postId = String(formData.id || '');
            if (!postId.startsWith('temp_')) {
                await ProductService.deletePost(postId);
            }

            localStorage.removeItem('saleFormData');
            navigate('/sale', {
                state: {
                    message: '게시물이 성공적으로 삭제되었습니다.',
                    from: 'management',
                },
                replace: true,
            });
        } catch (error) {
            console.error('게시물 삭제 실패:', error);
            setError(`게시물 삭제 실패: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!formData) {
        return (
            <div className="saleManagement-no-data-container">
                <p>등록된 판매 폼이 없습니다.</p>
                <button
                    className="saleManagement-create-button"
                    onClick={() => navigate('/saleform')}
                >
                    새 판매 폼 만들기
                </button>
            </div>
        );
    }

    if (loading) {
        return <div className="loading">처리 중...</div>;
    }

    if (error) {
        return <div className="error">오류: {error}</div>;
    }

    const getImageSrc = (img, postId, isProductImage = false, index = 0) => {
        if (!img) return '/path/to/placeholder.png'; // Use placeholder for null images

        let extension = isProductImage ? 'png' : 'jpg';
        extension = getImageExtension(img);

        if (typeof img === 'string' && (img.startsWith('http') || img.startsWith('blob:'))) {
            return img.split('?')[0]; // Remove query params
        }

        if (typeof img === 'object' && img.preview) {
            return img.preview;
        }

        const id = String(postId || '');
        if (id && !id.startsWith('temp_')) {
            return `${API_BASE_URL}/productPost/${
                isProductImage ? 'product' : 'thumbnail'
            }/${id}_${isProductImage ? index + 1 : 1}.${extension}`;
        }

        return typeof img === 'string' ? img : '/path/to/placeholder.png';
    };

    return (
        <div className="saleManagement-container">
            <div className="saleManagement-header-section">
                {formData.thumbnailImage && (
                    <div className="saleManagement-thumbnail-container">
                        <img
                            src={getImageSrc(formData.thumbnailImage, formData.id)}
                            alt="대표 이미지"
                            className="saleManagement-thumbnail-image"
                            onError={(e) => { e.target.src = '/path/to/placeholder.png'; }}
                        />
                    </div>
                )}

                <div className="saleManagement-header-info">
                    <h1 className="saleManagement-title">{formData.title}</h1>

                    <div className="saleManagement-meta-info">
                        {formData.category && (
                            <span className="saleManagement-category">
                                {typeof formData.category === 'object' ? formData.category.name : formData.category}
                            </span>
                        )}
                        <span className={`saleManagement-visibility ${formData.isPublic ? 'public' : 'private'}`}>
                            {formData.isPublic ? '공개' : '비공개'}
                        </span>
                        {formData.isPermanent ? (
                            <span className="saleManagement-period">상시판매</span>
                        ) : (
                            <span className="saleManagement-period">
                                {formData.startTime ? new Date(formData.startTime).toLocaleDateString() : '미정'} ~
                                {formData.endTime ? new Date(formData.endTime).toLocaleDateString() : '미정'}
                            </span>
                        )}
                    </div>

                    {!formData.isPublic && formData.password && (
                        <div className="saleManagement-private-code">
                            <span>비공개 코드: </span>
                            <strong>{formData.password}</strong>
                        </div>
                    )}
                </div>
            </div>

            <div className="saleManagement-action-buttons">
                <button className="saleManagement-edit-button" onClick={handleEdit}>
                    수정하기
                </button>
                <button
                    className={`saleManagement-delete-button ${confirmDelete ? 'confirm' : ''}`}
                    onClick={handleDelete}
                >
                    {confirmDelete ? '정말 삭제하시겠습니까?' : '삭제하기'}
                </button>
            </div>

            <div className="saleManagement-content-section">
                <div className="saleManagement-description-section">
                    <h2>상세 설명</h2>
                    <div
                        className="saleManagement-description-content"
                        dangerouslySetInnerHTML={{ __html: formData.content }}
                    />
                </div>

                <div className="saleManagement-shipping-section">
                    <h2>배송 정보</h2>
                    <div className="saleManagement-shipping-methods">
                        {formData.delivers?.map((method, index) => (
                            <div key={index} className="saleManagement-method-item">
                                <span className="saleManagement-method-name">{method.name || '택배'}</span>
                                <span className="saleManagement-method-cost">
                                    {method.price && Number(method.price) > 0
                                        ? `${Number(method.price).toLocaleString()}원`
                                        : '무료'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="saleManagement-tags-section">
                    <h2>태그</h2>
                    <div className="saleManagement-tags-container">
                        {formData.hashtag ? (
                            typeof formData.hashtag === 'string' ? (
                                formData.hashtag.split(',').map((tag, index) =>
                                    tag.trim() ? <span key={index} className="saleManagement-tag">#{tag.trim()}</span> : null
                                )
                            ) : Array.isArray(formData.hashtag) ? (
                                formData.hashtag.map((tag, index) =>
                                    tag.trim() ? <span key={index} className="saleManagement-tag">#{tag.trim()}</span> : null
                                )
                            ) : null
                        ) : (
                            <span className="no-tags">등록된 태그가 없습니다</span>
                        )}
                    </div>
                </div>

                <div className="saleManagement-products-section">
                    <h2>판매 상품 ({formData.products?.length || 0}개)</h2>

                    <div className="saleManagement-products-grid">
                        {formData.products?.map((product, index) => (
                            <div key={product.id || index} className="saleManagement-product-card">
                                {product.image && (
                                    <div className="saleManagement-product-image-container">
                                        <img
                                            src={getImageSrc(product.image, formData.id, true, index)}
                                            alt={product.name}
                                            className="saleManagement-product-image"
                                            onError={(e) => { e.target.src = '/path/to/placeholder.png'; }}
                                        />
                                    </div>
                                )}

                                <div className="saleManagement-product-info">
                                    <h3 className="saleManagement-product-name">{product.name || '상품 이름 없음'}</h3>
                                    <p className="saleManagement-product-price">
                                        {product.price ? `${Number(product.price).toLocaleString()}원` : '가격 미정'}
                                    </p>
                                    <div className="saleManagement-product-meta">
                                        <span>재고: {product.quantity || 0}개</span>
                                        <span>최대 {product.maxQuantity || 1}개 구매 가능</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SaleFormManagement;