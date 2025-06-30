import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Lock, Package, Calendar } from 'lucide-react';
import ProductService from '../../../../api/ProductService';
import ManagementPageLayout from '../../../public/management/ManagementPageLayout';
import ManagementCard from '../../../public/management/ManagementCard';
import ActionButton from '../../../public/management/ActionButton';
import './SaleFormManagement.css';

const SaleFormManagement = () => {
    const navigate = useNavigate();
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    useEffect(() => {
        const fetchUserForms = async () => {
            setLoading(true);
            try {
                const userPostsResponse = await ProductService.getUserPosts(0, 100, 'createdAt,desc');
                const userApiPosts = userPostsResponse.content || [];
                setForms(userApiPosts);
            } catch (e) {
                console.error('사용자 작성 글 로드 실패:', e);
                setError('작성한 글을 가져오는 데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };
        fetchUserForms();
    }, []);

    const placeholderImage = 'https://your-bucket.s3.amazonaws.com/default-product.jpg'; // 실제 기본이미지로 변경

    const handleEdit = (form) => {
        navigate('/saleform', {
            state: {
                from: 'management',
                isEditMode: true,
                title: form.title,
                description: form.content || '',
                category: form.categoryName || '',
                categoryId: form.categoryId || 0,
                image: {
                    preview: form.thumbnailImage || placeholderImage,
                    file: null,
                    extension: (form.thumbnailImage || placeholderImage).split('.').pop() || 'jpg',
                    uploadPath: 'productPost/thumbnail'
                },
                products: (form.products || []).map((prod, i) => ({
                    ...prod,
                    image: prod.imageUrl || placeholderImage,
                    images: [prod.imageUrl || placeholderImage],
                    imageUpdated: false
                })),
                hashtag: form.hashtag ? form.hashtag.split(',').map(tag => tag.trim()) : [],
                start_time: form.startTime || '',
                end_time: form.endTime || '',
                contentImages: form.contentImages || [],
                shippingMethods: form.shippingMethods || [{ name: '택배', price: '3000' }],
                isPublic: form.isPublic !== undefined ? form.isPublic : true,
                privateCode: form.privateCode || "",
                isPermanent: form.isPermanent || false,
                postId: form.id // 수정할 글 ID
            }
        });
    };


    const handleDelete = async (form) => {
        if (!form?.id) {
            alert('삭제할 게시물 정보가 없습니다.');
            return;
        }
        if (confirmDelete !== form.id) {
            setConfirmDelete(form.id);
            setTimeout(() => setConfirmDelete(null), 3000);
            return;
        }
        setLoading(true);
        try {
            await ProductService.deletePost(form.id);
            setForms(forms.filter(f => f.id !== form.id));
        } catch (error) {
            console.error('게시물 삭제 실패:', error);
            setError(`게시물 삭제 실패: ${error.message}`);
        } finally {
            setLoading(false);
            setConfirmDelete(null);
        }
    };

    const handleFormClick = (form) => {
        if (!form?.id) return;

        navigate(`/person`, {
            state: {
                product: form,
                products: form.products,
                selectedImage: form.thumbnailUrl || form.image || null,
                productReviews: [],
                start_time: form.startTime,
                end_time: form.endTime,
                saleLabel: "판매",
                isPublic: form.isPublic,
                privateCode: form.password,
                description: form.content,
                hashtags: form.hashtag?.split(',') || [],
                from: "saleForm",
                userName: form.nickname || "사용자 이름",
                profileImage: form.profileUrl || null,
                category: form.categoryName || form.category
            }
        });
    };

    const formatDate = (dateString) => !dateString ? '미정' : new Date(dateString).toLocaleDateString('ko-KR');

    return (
        <ManagementPageLayout
            pageTitle="판매 폼 관리"
            isLoading={loading}
            error={error}
            data={forms}
            emptyStateProps={{
                title: "등록된 판매 폼이 없습니다",
                description: "새로운 판매 폼을 만들어서 상품을 판매해보세요!",
                buttonText: "새 판매 폼 만들기",
                onButtonClick: () => navigate('/saleform')
            }}
        >
            <div className="management-grid">
                {forms.map((form) => (
                    <ManagementCard
                        key={form.id}
                        item={form}
                        statusType={form.isPublic ? 'public' : 'private'}
                        statusIcon={form.isPublic ? <Eye size={14} /> : <Lock size={14} />}
                        statusText={form.isPublic ? '공개' : '비공개'}
                        badges={[
                            { icon: <Package size={14} />, text: form.categoryName || '미분류' },
                            {
                                icon: <Calendar size={14} />,
                                text: (form.startTime && form.endTime)
                                    ? `${formatDate(form.startTime)} ~ ${formatDate(form.endTime)}`
                                    : (form.isPermanent ? '상시' : '기간')
                            }
                        ]}
                        footerText={`상품 ${form.products?.length || 0}개`}
                        onCardClick={() => handleFormClick(form)}
                        actionButtons={
                            <>
                                <ActionButton variant="edit" onClick={() => handleEdit(form)}>수정하기</ActionButton>
                                <ActionButton variant="delete" onClick={() => handleDelete(form)}>
                                    {confirmDelete === form.id ? '확인' : '삭제하기'}
                                </ActionButton>
                            </>
                        }
                    />
                ))}
            </div>
        </ManagementPageLayout>
    );
};

export default SaleFormManagement;
