import { ArrowLeft, Calendar, ChevronRight, Edit2, Eye, Hash, Lock, Package, ShoppingBag, Trash2, Truck } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductService from '../../../../api/ProductService';
import './SaleFormManagement.css';

const API_BASE_URL = 'http://localhost:8080';
const SUPPORTED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];

const SaleFormManagement = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [forms, setForms] = useState([]);
    const [selectedForm, setSelectedForm] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get image extension
    const getImageExtension = (img) => {
        if (!img) return 'png';
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

    // Format form data consistently
    const formatForm = (form, index = 0) => ({
        id: form.id || `temp_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        title: form.title || '제목 없음',
        content: form.content || '내용 없음',
        thumbnailImage: form.thumbnailImage || null,
        isPublic: form.isPublic !== false,
        startTime: form.startTime || null,
        endTime: form.endTime || null,
        isPermanent: form.isPermanent || false,
        password: form.password || null,
        hashtag: form.hashtag || '',
        category: form.category?.name || form.category || null,
        categoryId: form.categoryId || null,
        products: Array.isArray(form.products)
            ? form.products.map((product, pIndex) => ({
                id: product.id || `temp_${Date.now()}_${pIndex}`,
                name: product.name || '상품 이름 없음',
                price: Number(product.price) || 0,
                quantity: Number(product.quantity) || 0,
                maxQuantity: Number(product.maxQuantity) || 1,
                image: product.image || null,
                images: product.image ? [product.image] : [],
                imageUpdated: product.imageUpdated || false,
            }))
            : [],
        delivers: Array.isArray(form.delivers)
            ? form.delivers.map(method => ({
                id: method.id || null,
                name: method.name || '택배',
                price: Number(method.price) || 3000,
            }))
            : [{ name: '택배', price: 3000 }],
        contentImages: form.contentImages || [],
        user: form.user || { id: null, name: localStorage.getItem('userName') || '판매자' },
    });

    useEffect(() => {
        const fetchUserForms = async () => {
            try {
                setLoading(true);

                // 🚩 사용자 작성 글만 가져오기
                const userPostsResponse = await ProductService.getUserPosts(0, 100, 'createdAt,desc');
                const userApiPosts = userPostsResponse.content || [];

                // formatForm으로 가공
                const formattedUserForms = userApiPosts.map((post, index) => formatForm(post, index));

                // 상태에 반영
                setForms(formattedUserForms);
            } catch (e) {
                console.error('사용자 작성 글 로드 실패:', e);
                setError('작성한 글을 가져오는 데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserForms();
    }, []); // ✅ location.state 제거, 마운트 시 한 번만 호출

    const getImageSrc = (img, postId, isProductImage = false, index = 0) => {
        if (!img) return 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop';

        if (typeof img === 'string' && (img.startsWith('http') || img.startsWith('blob:'))) {
            return img.split('?')[0];
        }

        if (typeof img === 'object' && img.preview) {
            return img.preview;
        }

        const id = String(postId || '');
        if (id && !id.startsWith('temp_')) {
            const extension = getImageExtension(img);
            return `${API_BASE_URL}/productPost/${
                isProductImage ? 'product' : 'thumbnail'
            }/${id}_${isProductImage ? index + 1 : 1}.${extension}`;
        }

        return typeof img === 'string' ? img : 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop';
    };

    const handleFormClick = (form) => {
        setSelectedForm(form);
        setViewMode('detail');
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedForm(null);
    };

    const handleEdit = (form) => {
        if (!form?.id) {
            console.error('No post ID available for editing');
            alert('수정할 게시물 정보가 없습니다.');
            return;
        }

        const transformImage = (img, postId, isProductImage = false, index = 0) => {
            if (!img) return null;

            let extension = isProductImage ? 'png' : 'jpg';
            if (typeof img === 'object' && img.extension) {
                extension = getImageExtension(img);
            } else if (typeof img === 'string' && img.includes('.')) {
                extension = getImageExtension(img);
            }

            if (typeof img === 'string' && (img.startsWith('http') || img.startsWith('blob:'))) {
                return img;
            }

            const id = String(postId || '');
            if (id && !id.startsWith('temp_')) {
                return `${API_BASE_URL}/productPost/${
                    isProductImage ? 'product' : 'thumbnail'
                }/${id}_${isProductImage ? index + 1 : 1}.${extension}`;
            }

            return typeof img === 'object' && img.preview ? img : img;
        };

        navigate('/saleform', {
            state: {
                from: 'management',
                postId: form.id,
                title: form.title,
                category: form.category || '',
                description: form.content,
                image: transformImage(form.thumbnailImage, form.id),
                hashtag: typeof form.hashtag === 'string'
                    ? form.hashtag.split(',').filter(tag => tag.trim())
                    : Array.isArray(form.hashtag)
                    ? form.hashtag
                    : [],
                shippingMethods: form.delivers,
                products: form.products.map((product, index) => ({
                    ...product,
                    image: transformImage(product.image, form.id, true, index),
                    images: product.image ? [transformImage(product.image, form.id, true, index)] : [],
                    isExisting: !String(form.id).startsWith('temp_'),
                    imageUpdated: false,
                })),
                isPublic: form.isPublic,
                privateCode: form.password,
                start_time: form.startTime,
                end_time: form.endTime,
                isPermanent: form.isPermanent,
                contentImages: form.contentImages || [],
            },
        });
    };

    const handleDelete = async (form) => {
        if (!form?.id) {
            alert('삭제할 게시물 정보가 없습니다.');
            return;
        }
    
        if (!confirmDelete) {
            setConfirmDelete(form.id);
            setTimeout(() => setConfirmDelete(false), 3000);
            return;
        }
    
        try {
            setLoading(true);
    
            const postId = String(form.id || '');
            if (!postId.startsWith('temp_')) {
                // Delete post from the database
                await ProductService.deletePost(postId);
            }
    
            // Update localStorage
            const storedSaleFormDataList = JSON.parse(localStorage.getItem('saleFormDataList')) || [];
            const updatedSaleFormDataList = storedSaleFormDataList.filter(data => data.id !== form.id);
            localStorage.setItem('saleFormDataList', JSON.stringify(updatedSaleFormDataList));
    
            // Update apiResponseList
            const storedApiResponseList = JSON.parse(localStorage.getItem('apiResponseList')) || [];
            const updatedApiResponseList = storedApiResponseList.filter(res => res?.id !== form.id);
            localStorage.setItem('apiResponseList', JSON.stringify(updatedApiResponseList));
    
            // Update forms state
            setForms(forms.filter(f => f.id !== form.id));
            setConfirmDelete(false);
    
            if (selectedForm?.id === form.id) {
                handleBackToList();
            }
    
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

    const formatDate = (dateString) => {
        if (!dateString) return '미정';
        return new Date(dateString).toLocaleDateString('ko-KR');
    };

    const parseHashtags = (hashtag) => {
        if (!hashtag) return [];
        if (Array.isArray(hashtag)) return hashtag;
        return hashtag.split(',').map(tag => tag.trim()).filter(tag => tag);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-content">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">처리 중...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-content">
                    <p>오류: {error}</p>
                </div>
            </div>
        );
    }

    if (forms.length === 0) {
        return (
            <div className="saleFormManage-empty-container">
                <div className="saleFormManage-empty-content">
                    <div className="saleFormManage-empty-icon">
                        <ShoppingBag className="saleFormManage-icon-lg" />
                    </div>
                    <h3 className="saleFormManage-empty-title">등록된 판매 폼이 없습니다</h3>
                    <p className="saleFormManage-empty-description">새로운 판매 폼을 만들어서 상품을 판매해보세요!</p>
                    <button 
                        className="saleFormManage-btn-primary"
                        onClick={() => navigate('/saleform')}
                    >
                        새 판매 폼 만들기
                    </button>
                </div>
            </div>
        );
    }

    if (viewMode === 'detail' && selectedForm) {
        return (
            <div className="container">
                <div className="saleFormManage-detail-container">
                    <div className="saleFormManage-detail-header">
                        <div className="saleFormManage-detail-header-content">
                            <div className="saleFormManage-detail-header-nav">
                                <button 
                                    onClick={handleBackToList}
                                    className="saleFormManage-back-button"
                                >
                                    <ArrowLeft className="saleFormManage-icon-sm" />
                                    목록으로 돌아가기
                                </button>
                                <div className="saleFormManage-detail-actions">
                                    <button 
                                        onClick={() => handleEdit(selectedForm)}
                                        className="saleFormManage-btn-edit"
                                    >
                                        <Edit2 className="saleFormManage-icon-sm" />
                                        수정하기
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(selectedForm)}
                                        className={`saleFormManage-btn-delete ${confirmDelete === selectedForm.id ? 'confirm' : ''}`}
                                    >
                                        <Trash2 className="saleFormManage-icon-sm" />
                                        {confirmDelete === selectedForm.id ? '정말 삭제하시겠습니까?' : '삭제하기'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="saleFormManage-detail-content">
                        <div className="saleFormManage-detail-card">
                            <div className="saleFormManage-detail-main">
                                <div className="saleFormManage-detail-image">
                                    <img
                                        src={getImageSrc(selectedForm.thumbnailImage, selectedForm.id)}
                                        alt={selectedForm.title}
                                        className="saleFormManage-detail-thumbnail"
                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop'; }}
                                    />
                                </div>
                                <div className="saleFormManage-detail-info">
                                    <div className="saleFormManage-detail-title-section">
                                        <h1 className="saleFormManage-detail-title">{selectedForm.title}</h1>
                                    </div>
                                    
                                    <div className="saleFormManage-detail-badges">
                                        {selectedForm.category && (
                                            <span className="saleFormManage-badge badge-category">
                                                <Package className="saleFormManage-icon-xs" />
                                                {typeof selectedForm.category === 'object' ? selectedForm.category.name : selectedForm.category}
                                            </span>
                                        )}
                                        <span className={`saleFormManage-badge ${selectedForm.isPublic ? 'badge-public' : 'badge-private'}`}>
                                            {selectedForm.isPublic ? <Eye className="saleFormManage-icon-xs" /> : <Lock className="saleFormManage-icon-xs" />}
                                            {selectedForm.isPublic ? '공개' : '비공개'}
                                        </span>
                                        <span className="saleFormManage-badge badge-date">
                                            <Calendar className="saleFormManage-icon-xs" />
                                            {selectedForm.isPermanent ? '상시판매' : `${formatDate(selectedForm.startTime)} ~ ${formatDate(selectedForm.endTime)}`}
                                        </span>
                                    </div>

                                    {!selectedForm.isPublic && selectedForm.password && (
                                        <div className="saleFormManage-password-notice">
                                            <div className="saleFormManage-password-content">
                                                <Lock className="saleFormManage-icon-sm password-icon" />
                                                <span className="saleFormManage-password-label">비공개 코드: </span>
                                                <code className="saleFormManage-password-code">
                                                    {selectedForm.password}
                                                </code>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="saleFormManage-detail-card">
                            <h2 className="saleFormManage-section-title">상세 설명</h2>
                            <div 
                                className="saleFormManage-content-description"
                                dangerouslySetInnerHTML={{ __html: selectedForm.content }}
                            />
                        </div>

                        <div className="saleFormManage-info-grid">
                            <div className="saleFormManage-detail-card">
                                <h2 className="saleFormManage-section-title section-title-icon">
                                    <Truck className="saleFormManage-icon-md" />
                                    배송 정보
                                </h2>
                                <div className="saleFormManage-delivery-list">
                                    {selectedForm.delivers?.map((method, index) => (
                                        <div key={index} className="saleFormManage-delivery-item">
                                            <span className="saleFormManage-delivery-name">{method.name || '택배'}</span>
                                            <span className="saleFormManage-delivery-price">
                                                {method.price && Number(method.price) > 0
                                                    ? `${Number(method.price).toLocaleString()}원`
                                                    : '무료'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="saleFormManage-detail-card">
                                <h2 className="saleFormManage-section-title section-title-icon">
                                    <Hash className="saleFormManage-icon-md" />
                                    태그
                                </h2>
                                <div className="saleFormManage-hashtag-list">
                                    {parseHashtags(selectedForm.hashtag).length > 0 ? (
                                        parseHashtags(selectedForm.hashtag).map((tag, index) => (
                                            <span key={index} className="saleFormManage-hashtag">
                                                #{tag}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="saleFormManage-no-tags">등록된 태그가 없습니다</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="saleFormManage-detail-card">
                            <h2 className="saleFormManage-section-title">
                                판매 상품 ({selectedForm.products?.length || 0}개)
                            </h2>
                            <div className="saleFormManage-products-grid">
                                {selectedForm.products?.map((product, index) => (
                                    <div key={product.id || index} className="saleFormManage-product-card">
                                        {product.image && (
                                            <div className="saleFormManage-product-image">
                                                <img
                                                    src={getImageSrc(product.image, selectedForm.id, true, index)}
                                                    alt={product.name}
                                                    className="saleFormManage-product-img"
                                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop'; }}
                                                />
                                            </div>
                                        )}
                                        <div className="saleFormManage-product-info">
                                            <h3 className="saleFormManage-product-name">{product.name || '상품 이름 없음'}</h3>
                                            <p className="saleFormManage-product-price">
                                                {product.price ? `${Number(product.price).toLocaleString()}원` : '가격 미정'}
                                            </p>
                                            <div className="saleFormManage-product-stock">
                                                <span>재고: {product.quantity || 0}개</span>
                                                <span>최대 {product.maxQuantity || 1}개</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="saleFormManage-list-container">
                <div className="saleFormManage-list-content">
                    <div className="saleFormManage-list-header">
                        <h1 className="saleFormManage-list-title">판매 폼 관리</h1>
                    </div>

                    <div className="saleFormManage-add-form-section">
                        <button 
                            className="saleFormManage-btn-add-form"
                            onClick={() => navigate('/saleform')}
                        >
                            <ShoppingBag className="saleFormManage-icon-sm" />
                            새 판매 폼 만들기
                        </button>
                    </div>

                    <div className="saleFormManage-forms-grid">
                        {forms.map((form) => (
                            <div 
                                key={form.id} 
                                className="saleFormManage-form-card"
                                onClick={() => handleFormClick(form)}
                            >
                                <div className="saleFormManage-form-thumbnail">
                                    <img
                                        src={getImageSrc(form.thumbnailImage, form.id)}
                                        alt={form.title}
                                        className="saleFormManage-thumbnail-img"
                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop'; }}
                                    />
                                    <div className="saleFormManage-thumbnail-overlay">
                                        <div className="saleFormManage-overlay-icon">
                                            <div className="saleFormManage-icon-circle">
                                                <ChevronRight className="saleFormManage-icon-md" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="saleFormManage-status-badge">
                                        <span className={`saleFormManage-status ${form.isPublic ? 'public' : 'private'}`}>
                                            {form.isPublic ? <Eye className="saleFormManage-icon-xs" /> : <Lock className="saleFormManage-icon-xs" />}
                                            {form.isPublic ? '공개' : '비공개'}
                                        </span>
                                    </div>
                                </div>

                                <div className="saleFormManage-card-content">
                                    <div className="saleFormManage-card-header">
                                        <h3 className="saleFormManage-card-title">
                                            {form.title}
                                        </h3>
                                    </div>

                                    <div className="saleFormManage-card-badges">
                                        {form.category && (
                                            <span className="saleFormManage-card-badge category">
                                                <Package className="saleFormManage-icon-xs" />
                                                {typeof form.category === 'object' ? form.category.name : form.category}
                                            </span>
                                        )}
                                        <span className="saleFormManage-card-badge date">
                                            <Calendar className="saleFormManage-icon-xs" />
                                            {form.isPermanent ? '상시' : '기간'}
                                        </span>
                                    </div>

                                    <div className="saleFormManage-card-footer">
                                        <span className="saleFormManage-product-count">
                                            상품 {form.products?.length || 0}개
                                        </span>
                                        <div className="saleFormManage-card-actions">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(form);
                                                }}
                                                className="saleFormManage-action-btn edit"
                                            >
                                                <Edit2 className="saleFormManage-icon-xs" />
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(form);
                                                }}
                                                className={`saleFormManage-action-btn delete ${confirmDelete === form.id ? 'confirm' : ''}`}
                                            >
                                                <Trash2 className="saleFormManage-icon-xs" />
                                                {confirmDelete === form.id && (
                                                    <span className="saleFormManage-delete-confirm-text">정말?</span>
                                                )}
                                            </button>
                                        </div>
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