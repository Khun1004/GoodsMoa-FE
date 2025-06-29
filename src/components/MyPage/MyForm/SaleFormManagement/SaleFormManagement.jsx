// ▼ [정리] 사용하지 않는 아이콘(ChevronRight) 임포트 제거
import { ArrowLeft, Calendar, Edit2, Eye, Hash, Lock, Package, ShoppingBag, Trash2, Truck } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductService from '../../../../api/ProductService';

// ▼ [구조] 우리가 만든 공통 컴포넌트 임포트
import ManagementPageLayout from '../../../public/management/ManagementPageLayout';
import ManagementCard from '../../../public/management/ManagementCard';
import DetailView from '../../../public/management/DetailView';
import SectionCard from '../../../public/management/SectionCard';
import ActionButton from '../../../public/management/ActionButton';

// ▼ [구조] 공통 CSS와 기존 CSS 임포트
import '../../../public/management/ManagementComponents.css';
import './SaleFormManagement.css';

const API_BASE_URL = 'http://localhost:8080';
const SUPPORTED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];

const SaleFormManagement = () => {
    const navigate = useNavigate();
    const [forms, setForms] = useState([]);
    const [selectedForm, setSelectedForm] = useState(null);
    const [viewMode, setViewMode] = useState('list');
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [activeTab, setActiveTab] = useState('상세 정보');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 헬퍼 함수들은 원본 그대로 유지
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
        products: Array.isArray(form.products) ? form.products.map((product, pIndex) => ({ id: product.id || `temp_${Date.now()}_${pIndex}`, name: product.name || '상품 이름 없음', price: Number(product.price) || 0, quantity: Number(product.quantity) || 0, maxQuantity: Number(product.maxQuantity) || 1, image: product.image || null, images: product.image ? [product.image] : [], imageUpdated: product.imageUpdated || false, })) : [],
        delivers: Array.isArray(form.delivers) ? form.delivers.map(method => ({ id: method.id || null, name: method.name || '택배', price: Number(method.price) || 3000, })) : [{ name: '택배', price: 3000 }],
        contentImages: form.contentImages || [],
        user: form.user || { id: null, name: localStorage.getItem('userName') || '판매자' },
    });
    
    useEffect(() => {
        const fetchUserForms = async () => {
            setLoading(true);
            try {
                const userPostsResponse = await ProductService.getUserPosts(0, 100, 'createdAt,desc');
                const userApiPosts = userPostsResponse.content || [];
                const formattedUserForms = userApiPosts.map((post, index) => formatForm(post, index));
                setForms(formattedUserForms);
            } catch (e) {
                console.error('사용자 작성 글 로드 실패:', e);
                setError('작성한 글을 가져오는 데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };
        fetchUserForms();
    }, []);

    const getImageSrc = (img, postId, isProductImage = false, index = 0) => {
        if (!img) return 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop';
        if (typeof img === 'string' && (img.startsWith('http') || img.startsWith('blob:'))) return img.split('?')[0];
        if (typeof img === 'object' && img.preview) return img.preview;
        const id = String(postId || '');
        if (id && !id.startsWith('temp_')) {
            const extension = getImageExtension(img);
            return `${API_BASE_URL}/productPost/${isProductImage ? 'product' : 'thumbnail'}/${id}_${isProductImage ? index + 1 : 1}.${extension}`;
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
        // 원본 수정 로직 그대로 유지
        const transformImage = (img) => (typeof img === 'string' && (img.startsWith('http') || img.startsWith('blob:'))) ? img : (typeof img === 'object' && img.preview ? img : img);
        navigate('/saleform', {
            state: {
                from: 'management', postId: form.id, title: form.title, category: form.category || '', description: form.content, image: transformImage(form.thumbnailImage, form.id),
                hashtag: typeof form.hashtag === 'string' ? form.hashtag.split(',').filter(tag => tag.trim()) : (Array.isArray(form.hashtag) ? form.hashtag : []),
                shippingMethods: form.delivers,
                products: form.products.map((product, index) => ({ ...product, image: transformImage(product.image, form.id, true, index), images: product.image ? [transformImage(product.image, form.id, true, index)] : [], isExisting: !String(form.id).startsWith('temp_'), imageUpdated: false, })),
                isPublic: form.isPublic, privateCode: form.password, start_time: form.startTime, end_time: form.endTime, isPermanent: form.isPermanent, contentImages: form.contentImages || [],
            },
        });
    };

    const handleDelete = async (form) => {
        if (!form?.id) { alert('삭제할 게시물 정보가 없습니다.'); return; }
        if (confirmDelete !== form.id) { setConfirmDelete(form.id); setTimeout(() => setConfirmDelete(null), 3000); return; }
        setLoading(true);
        try {
            if (!String(form.id).startsWith('temp_')) { await ProductService.deletePost(form.id); }
            const storedSaleFormDataList = JSON.parse(localStorage.getItem('saleFormDataList')) || [];
            const updatedSaleFormDataList = storedSaleFormDataList.filter(data => data.id !== form.id);
            localStorage.setItem('saleFormDataList', JSON.stringify(updatedSaleFormDataList));
            const storedApiResponseList = JSON.parse(localStorage.getItem('apiResponseList')) || [];
            const updatedApiResponseList = storedApiResponseList.filter(res => res?.id !== form.id);
            localStorage.setItem('apiResponseList', JSON.stringify(updatedApiResponseList));
            setForms(forms.filter(f => f.id !== form.id));
            if (selectedForm?.id === form.id) { handleBackToList(); }
        } catch (error) {
            console.error('게시물 삭제 실패:', error);
            setError(`게시물 삭제 실패: ${error.message}`);
        } finally {
            setLoading(false);
            setConfirmDelete(null);
            // ▼ [수정] 삭제 후 다른 페이지로 이동하는 navigate() 호출을 완전히 제거.
        }
    };

    const formatDate = (dateString) => !dateString ? '미정' : new Date(dateString).toLocaleDateString('ko-KR');
    const parseHashtags = (hashtag) => !hashtag ? [] : (Array.isArray(hashtag) ? hashtag : String(hashtag).split(',').map(tag => tag.trim()).filter(Boolean));

    // ▼ [구조] 단일 return문으로 모든 렌더링을 처리.
    // ManagementPageLayout이 로딩, 에러, 빈 배열 상태를 모두 관리.
    return (
        <ManagementPageLayout
            pageTitle="판매 폼 관리"
            isLoading={loading}
            error={error}
            data={forms}
            emptyStateProps={{
                title: "등록된 판매 폼이 없습니다", description: "새로운 판매 폼을 만들어서 상품을 판매해보세요!", buttonText: "새 판매 폼 만들기", onButtonClick: () => navigate('/saleform'),
            }}
        >
            {viewMode === 'list' ? (
                // ----------------- 🖥️ 목록 뷰 -----------------
                <div className="management-grid">
                    {forms.map((form) => {
                        const statusProps = form.isPublic ? { type: 'public', icon: <Eye size={14} />, text: '공개' } : { type: 'private', icon: <Lock size={14} />, text: '비공개' };
                        const badges = [{ icon: <Package size={14} />, text: form.category || '미분류' }, { icon: <Calendar size={14} />, text: form.isPermanent ? '상시' : '기간' }];
                        return (
                            <ManagementCard
                                key={form.id} item={form} statusType={statusProps.type} statusIcon={statusProps.icon} statusText={statusProps.text} badges={badges}
                                footerText={`상품 ${form.products?.length || 0}개`}
                                onCardClick={() => handleFormClick(form)}
                                actionButtons={
                                    <>
                                        <ActionButton variant="edit" onClick={() => handleEdit(form)}><Edit2 size={16} /></ActionButton>
                                        <ActionButton variant="delete" onClick={() => handleDelete(form)}>{confirmDelete === form.id ? '확인' : <Trash2 size={16} />}</ActionButton>
                                    </>
                                }
                            />
                        );
                    })}
                </div>
            ) : (
                // ----------------- 🔎 상세 뷰 -----------------
                selectedForm && (
                    <DetailView
                        onBack={handleBackToList}
                        headerActions={
                            <>
                                <ActionButton variant="edit" onClick={() => handleEdit(selectedForm)}><Edit2 size={16} /> 수정하기</ActionButton>
                                <ActionButton variant="delete" onClick={() => handleDelete(selectedForm)}><Trash2 size={16} />{confirmDelete === selectedForm.id ? '삭제 확인' : '삭제하기'}</ActionButton>
                            </>
                        }
                    >
                        <SectionCard>
                           <div className="saleFormManage-detail-main">
                                <div className="saleFormManage-detail-image">
                                    <img src={getImageSrc(selectedForm.thumbnailImage, selectedForm.id)} alt={selectedForm.title} className="saleFormManage-detail-thumbnail"/>
                                </div>
                                <div className="saleFormManage-detail-info">
                                   <h1 className="saleFormManage-detail-title">{selectedForm.title}</h1>
                                   <div className="saleFormManage-detail-badges">
                                        {/* ▼ [완성] 상세 뷰의 뱃지 데이터 매핑 */}
                                        {selectedForm.category && <span className="saleFormManage-badge badge-category"><Package size={14} />{selectedForm.category}</span>}
                                        <span className={`saleFormManage-badge ${selectedForm.isPublic ? 'badge-public' : 'badge-private'}`}>{selectedForm.isPublic ? <Eye size={14} /> : <Lock size={14} />}{selectedForm.isPublic ? '공개' : '비공개'}</span>
                                        <span className="saleFormManage-badge badge-date"><Calendar size={14} />{selectedForm.isPermanent ? '상시판매' : `${formatDate(selectedForm.startTime)} ~ ${formatDate(selectedForm.endTime)}`}</span>
                                   </div>
                                   {!selectedForm.isPublic && selectedForm.password && ( <div className="saleFormManage-password-notice"><Lock size={16} /><span>비공개 코드: <code>{selectedForm.password}</code></span></div> )}
                                </div>
                            </div>
                        </SectionCard>
                        <SectionCard title="상세 설명"><div dangerouslySetInnerHTML={{ __html: selectedForm.content || "내용 없음" }} /></SectionCard>
                        <div className="saleFormManage-info-grid">
                            <SectionCard title="배송 정보" icon={<Truck size={20}/>}>
                                <div className="saleFormManage-delivery-list">
                                    {selectedForm.delivers?.map((method, index) => ( <div key={index} className="saleFormManage-delivery-item"><span>{method.name || '택배'}</span><span>{Number(method.price || 0).toLocaleString()}원</span></div> ))}
                                </div>
                            </SectionCard>
                            <SectionCard title="태그" icon={<Hash size={20}/>}>
                                <div className="saleFormManage-hashtag-list">
                                    {/* ▼ [완성] 상세 뷰의 태그 데이터 매핑 */}
                                    {parseHashtags(selectedForm.hashtag).length > 0 ? ( parseHashtags(selectedForm.hashtag).map((tag, index) => ( <span key={index} className="saleFormManage-hashtag">#{tag}</span> ))) 
                                    : ( <span className="saleFormManage-no-tags">등록된 태그가 없습니다</span> )}
                                </div>
                            </SectionCard>
                        </div>
                        <SectionCard title={`판매 상품 (${selectedForm.products?.length || 0}개)`}>
                            <div className="saleFormManage-products-grid">
                               {selectedForm.products?.map((product, index) => (
                                    // ▼ [완성] 상세 뷰의 상품 카드 데이터 매핑
                                    <div key={product.id || index} className="saleFormManage-product-card">
                                        {product.image && ( <div className="saleFormManage-product-image"><img src={getImageSrc(product.image, selectedForm.id, true, index)} alt={product.name} className="saleFormManage-product-img"/></div> )}
                                        <div className="saleFormManage-product-info">
                                            <h3 className="saleFormManage-product-name">{product.name || '상품 이름 없음'}</h3>
                                            <p className="saleFormManage-product-price">{product.price ? `${Number(product.price).toLocaleString()}원` : '가격 미정'}</p>
                                            <div className="saleFormManage-product-stock"><span>재고: {product.quantity || 0}개</span><span>최대 {product.maxQuantity || 1}개</span></div>
                                        </div>
                                    </div>
                               ))}
                            </div>
                        </SectionCard>
                    </DetailView>
                )
            )}
        </ManagementPageLayout>
    );
};

export default SaleFormManagement;