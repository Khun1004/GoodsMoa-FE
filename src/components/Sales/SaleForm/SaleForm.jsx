import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductService from "../../../api/ProductService";
import "./SaleForm.css";

const API_BASE_URL = 'http://localhost:8080';

// List of supported image extensions
const SUPPORTED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

const SaleForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const [editProduct, setEditProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState(location.state?.description || "");
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDescriptionEdit, setIsDescriptionEdit] = useState(false);
    const [postId, setPostId] = useState(location.state?.postId || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [category, setCategory] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [hashtag, setHashtag] = useState([]);
    const [tagInput, setTagInput] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [editingMethod, setEditingMethod] = useState(null);
    const [defaultShippingChecked, setDefaultShippingChecked] = useState(true);
    const [shippingMethods, setShippingMethods] = useState([{ name: '택배', price: '3000' }]);
    const [shippingCost, setShippingCost] = useState("");
    const [newMethod, setNewMethod] = useState("");
    const [productName, setProductName] = useState("");
    const [price, setPrice] = useState("");
    const [quantity, setQuantity] = useState("");
    const [productImage, setProductImage] = useState(null);
    const [maxQuantity, setMaxQuantity] = useState("1");
    const [isPublic, setIsPublic] = useState(true);
    const [privateCode, setPrivateCode] = useState("");
    const [start_time, setStartTime] = useState("");
    const [end_time, setEndTime] = useState("");
    const [isPermanent, setIsPermanent] = useState(false);
    const [contentImages, setContentImages] = useState(location.state?.contentImages || []);
    const [deleteProductImageIds, setDeleteProductImageIds] = useState([]);

    // Utility function to extract extension from a file or image object
    const getImageExtension = (fileOrImage) => {
        if (!fileOrImage) return SUPPORTED_IMAGE_EXTENSIONS[0]; // Default to 'jpg'
        if (fileOrImage instanceof File) {
            const match = fileOrImage.name.match(/\.([a-zA-Z0-9]+)$/);
            const extension = match ? match[1].toLowerCase() : SUPPORTED_IMAGE_EXTENSIONS[0];
            return SUPPORTED_IMAGE_EXTENSIONS.includes(extension) ? extension : SUPPORTED_IMAGE_EXTENSIONS[0];
        }
        if (typeof fileOrImage === 'string') {
            const match = fileOrImage.match(/\.([a-zA-Z0-9]+)$/);
            return match ? match[1].toLowerCase() : SUPPORTED_IMAGE_EXTENSIONS[0];
        }
        if (typeof fileOrImage === 'object' && fileOrImage.extension) {
            const extension = fileOrImage.extension.toLowerCase();
            return SUPPORTED_IMAGE_EXTENSIONS.includes(extension) ? extension : SUPPORTED_IMAGE_EXTENSIONS[0];
        }
        return SUPPORTED_IMAGE_EXTENSIONS[0]; // Fallback
    };

    useEffect(() => {
        const loadData = () => {
            if (location.state?.from === 'management') {
                const {
                    title, category, description, image, hashtag,
                    shippingMethods, products, isPublic, privateCode,
                    start_time, end_time, isPermanent, postId, contentImages
                } = location.state;

                setTitle(title || "");
                setCategory(category || "");
                setDescription(description || "");
                setImage(image || null);
                setHashtag(hashtag || []);
                setShippingMethods(shippingMethods || [{ name: '택배', price: '3000' }]);
                setProducts(products || []);
                setIsPublic(isPublic !== false);
                setPrivateCode(privateCode || "");
                setStartTime(start_time || "");
                setEndTime(end_time || "");
                setIsPermanent(isPermanent || false);
                setPostId(postId || null);
                setContentImages(contentImages || []);
                setIsEditMode(true);
            } else if (location.state?.from === 'write') {
                const {
                    title, category, description, image, hashtag,
                    shippingMethods, products, isPublic, privateCode,
                    start_time, end_time, isPermanent, price, quantity, maxQuantity,
                    postId, contentImages, isEditMode
                } = location.state;

                title && setTitle(title);
                category && setCategory(category);
                description && setDescription(description);
                image && setImage(image);
                hashtag && setHashtag(hashtag);
                shippingMethods && setShippingMethods(shippingMethods);
                products && setProducts(products);
                isPublic !== undefined && setIsPublic(isPublic);
                privateCode && setPrivateCode(privateCode);
                start_time && setStartTime(start_time);
                end_time && setEndTime(end_time);
                isPermanent !== undefined && setIsPermanent(isPermanent);
                price && setPrice(price);
                quantity && setQuantity(quantity);
                maxQuantity && setMaxQuantity(maxQuantity);
                postId && setPostId(postId);
                contentImages && setContentImages(contentImages);
                isEditMode !== undefined && setIsEditMode(isEditMode);
            }
        };

        loadData();
    }, [location.state]);

    const fetchPostDetails = async (id) => {
        if (!id || String(id).startsWith('temp_') || isNaN(id)) {
            console.warn('Invalid or temporary postId, skipping fetch:', id);
            return;
        }
    
        try {
            setLoading(true);
            const postData = await ProductService.getPostDetail(id);
            populateFormWithPostData(postData);
        } catch (err) {
            console.error('Failed to fetch post details:', err);
            setError(`게시물 정보를 불러오는데 실패했습니다: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const populateFormWithPostData = (postData) => {
        if (!postData) return;

        setTitle(postData.title || "");
        setDescription(postData.content || "");
        setImage(postData.thumbnailImage || null);
        setCategoryId(postData.categoryId || "");
        setCategory(postData.category?.name || "");
        setIsPublic(postData.isPublic !== false);
        setPrivateCode(postData.password || "");
        setStartTime(postData.startTime || "");
        setEndTime(postData.endTime || "");
        setIsPermanent(postData.isPermanent || false);
        setPostId(postData.id || null);
        setContentImages(postData.contentImages || []);

        if (postData.products && Array.isArray(postData.products)) {
            setProducts(postData.products.map(prod => ({
                id: prod.id,
                name: prod.name,
                price: prod.price?.toString() || "",
                quantity: prod.quantity?.toString() || "",
                maxQuantity: prod.maxQuantity?.toString() || "1",
                image: prod.image,
                images: [prod.image]
            })));
        }

        if (postData.delivers && Array.isArray(postData.delivers)) {
            setShippingMethods(postData.delivers.map(del => ({
                name: del.name || "",
                price: del.price?.toString() || "0"
            })));
        }

        if (postData.hashtag) {
            const hashtagArray = typeof postData.hashtag === 'string'
                ? postData.hashtag.split(',')
                : Array.isArray(postData.hashtag)
                ? postData.hashtag
                : [];
            setHashtag(hashtagArray);
        }
    };

    const getCategoryId = (categoryName) => {
        const categoryMap = {
            "애니메이션": 1,
            "아이돌": 2,
            "순수창작": 3,
            "게임": 4,
            "영화": 5,
            "드라마": 6,
            "웹소설": 7,
            "웹툰": 8
        };
        return categoryMap[categoryName] || null;
    };

    const handleFormSubmit = async () => {
        if (!title || !category || !image) {
            alert("필수 필드를 모두 채워주세요! (제목, 카테고리, 이미지는 필수입니다)");
            return;
        }
    
        if (products.length === 0) {
            alert("최소 한 개 이상의 상품을 등록해주세요!");
            return;
        }
    
        for (const product of products) {
            if (!product.name || product.name.trim() === "") {
                alert(`상품에 이름을 입력해주세요! (상품 ID: ${product.id})`);
                return;
            }
            if (!product.price || isNaN(product.price)) {
                alert(`상품 "${product.name}"에 유효한 가격을 입력해주세요!`);
                return;
            }
            if (!product.quantity || isNaN(product.quantity)) {
                alert(`상품 "${product.name}"에 유효한 재고 수량을 입력해주세요!`);
                return;
            }
        }
    
        const validShippingMethods = shippingMethods
            .map(method => {
                if (typeof method === 'string') {
                    return { name: method, price: 0 };
                }
                return method;
            })
            .filter(method => method.name && method.name.trim() !== "");
    
        if (validShippingMethods.length === 0) {
            alert("배송 방법을 하나 이상 설정해주세요!");
            return;
        }
    
        if (!isPublic && !privateCode.trim()) {
            alert("비공개 판매를 선택하셨습니다. 비밀번호를 설정해주세요!");
            return;
        }
    
        const userId = ProductService.getUserId();
        if (!userId) {
            alert("로그인이 필요합니다!");
            return;
        }
    
        const thumbnailExtension = getImageExtension(image);
    
        const deleteProductImageIds = products
            .filter(product => product.id && !String(product.id).startsWith('temp_') && !product.image)
            .map(product => product.id);
    
            const processedProducts = products.map((product, index) => {
                const extension = getImageExtension(product.image);
                return {
                    ...product,
                    id: product.id && !String(product.id).startsWith('temp_') && product.id !== null ? product.id : null, // Ensure new products have id: null
                    image: product.image instanceof File ? null : product.image || null
                };
            });
    
        const postData = {
            id: isEditMode && postId && !String(postId).startsWith('temp_') ? postId : null,
            title: title,
            content: description,
            thumbnailImage: typeof image === 'object' && image.file ? { ...image, extension: thumbnailExtension } : image,
            isPublic: isPublic,
            password: !isPublic ? privateCode : null,
            startTime: start_time,
            endTime: end_time,
            isPermanent: isPermanent,
            delivers: validShippingMethods,
            hashtag: hashtag.join(','),
            categoryId: getCategoryId(category),
            category: { name: category },
            user: {
                id: userId,
                name: localStorage.getItem('userName') || '판매자'
            },
            products: processedProducts,
            contentImages: contentImages.map(img => typeof img === 'object' && img.file ? img : img.url || img),
            deleteProductImageIds: deleteProductImageIds.length > 0 ? deleteProductImageIds : undefined,
        };
    
        try {
            setLoading(true);
            let response;
    
            console.log('Submitting with postId:', postId, 'isEditMode:', isEditMode);
            console.log('Products:', postData.products);
            console.log('DeleteProductImageIds:', deleteProductImageIds);
    
            const isTempPost = String(postId || '').startsWith('temp_');
            const isValidPostId = postId && !isNaN(postId) && !isTempPost;
    
            if (isEditMode && isValidPostId) {
                response = await ProductService.updatePost(postId, postData);
            } else {
                response = await ProductService.createPost(postData);
            }
    
            setPostId(response.id);
    
            const updatedProducts = response.products?.map((product, index) => {
                const extension = getImageExtension(processedProducts[index]?.image) || 'png';
                return {
                    ...product,
                    image: product.image || `${API_BASE_URL}/productPost/product/${response.id}_${index + 1}.${extension}`
                };
            }) || processedProducts;
    
            const updatedContentImages = (response.contentImages || []).map((img, index) => {
                const originalImg = contentImages[index] || {};
                const extension = getImageExtension(originalImg) || 'jpg';
                return {
                    ...img,
                    url: `${API_BASE_URL}/productPost/content/${response.id}_${index + 1}.${extension}`
                };
            });
            setContentImages(updatedContentImages);
    
            let updatedContent = description;
            contentImages.forEach((img, index) => {
                const oldUrl = typeof img === 'string' ? img : img.url;
                const extension = getImageExtension(img) || 'jpg';
                const newUrl = `${API_BASE_URL}/productPost/content/${response.id}_${index + 1}.${extension}`;
                updatedContent = updatedContent.replace(oldUrl, newUrl);
            });
            setDescription(updatedContent);
    
            const thumbnailUrl = response.thumbnailImage ||
                `${API_BASE_URL}/productPost/thumbnail/${response.id}_1.${thumbnailExtension}`;
    
            navigate("/sale", {
                state: {
                    formData: {
                        ...postData,
                        id: response.id,
                        createdAt: new Date().toISOString(),
                        products: updatedProducts,
                        thumbnailImage: thumbnailUrl,
                        title: title,
                        content: updatedContent,
                        category: category,
                        hashtag: hashtag,
                        isPublic: isPublic,
                        password: privateCode,
                        startTime: start_time,
                        endTime: end_time,
                        delivers: validShippingMethods,
                        contentImages: updatedContentImages,
                    },
                    apiResponse: response,
                    from: 'saleForm'
                }
            });
        } catch (err) {
            console.error("Submission error:", err);
            setError(err.message || '요청 처리 중 오류가 발생했습니다.');
            alert(`저장 실패: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDefaultShippingChange = (e) => {
        const isChecked = e.target.checked;
        setDefaultShippingChecked(isChecked);

        if (isChecked) {
            const hasPost = shippingMethods.some(m => m.name === '택배');
            if (!hasPost) {
                setShippingMethods([...shippingMethods, { name: '택배', price: '3000' }]);
            }
        } else {
            setShippingMethods(shippingMethods.filter(m => m.name !== '택배'));
        }
    };

    const handleAddMethod = () => {
        if (newMethod.trim() && shippingCost.trim()) {
            const method = {
                name: newMethod.trim(),
                price: shippingCost.trim() === "0" ? "0" : shippingCost.trim() || "3000"
            };

            if (editMode) {
                setShippingMethods(
                    shippingMethods.map(m =>
                        m.name === editingMethod.name ? method : m
                    )
                );
            } else {
                setShippingMethods([
                    ...shippingMethods.filter(m => m.name !== method.name),
                    method
                ]);
            }

            setNewMethod("");
            setShippingCost("");
            setEditMode(false);
            setEditingMethod(null);
        }
    };

    const handleDeleteMethod = (methodName) => {
        if (methodName === '택배') {
            setDefaultShippingChecked(false);
        }
        setShippingMethods(shippingMethods.filter(m => m.name !== methodName));
    };

    useEffect(() => {
        if (shippingMethods.length === 0) {
            setShippingMethods([{ name: '택배', price: '3000' }]);
        }
    }, []);

    const handleEditMethod = (method) => {
        setNewMethod(method.name);
        setShippingCost(method.price);
        setEditingMethod(method);
        setEditMode(true);
    };

    const handleDeleteProduct = (id) => {
        // 기존 상품이면서 이미지가 있는 경우 삭제 목록에 추가
        const productToDelete = products.find(p => p.id === id);
        const isExistingProduct = productToDelete?.id && !String(id).startsWith('temp_');
        
        if (isExistingProduct && productToDelete.image) {
            setDeleteProductImageIds(prev => [...prev, id]);
        }
        
        setProducts(products.filter((product) => product.id !== id));
    };

    const handleAddProduct = async () => {
        if (!productName || !productName.trim()) {
            alert("상품 이름을 입력해주세요!");
            return;
        }
        if (productName.trim().length > 40) {
            alert("상품 이름은 40자 이내로 입력해주세요!");
            return;
        }
    
        if (!price || isNaN(price)) {
            alert("유효한 가격을 입력해주세요!");
            return;
        }
    
        if (!quantity || isNaN(quantity)) {
            alert("유효한 재고 수량을 입력해주세요!");
            return;
        }
    
        if (!productImage) {
            alert("상품 이미지를 등록해주세요!");
            return;
        }
    
        try {
            const processedImage = await ProductService.processImageForUpload(productImage);
            if (!processedImage || !processedImage.file) {
                alert("상품 이미지 처리에 실패했습니다!");
                return;
            }
    
            const extension = getImageExtension(processedImage.file || processedImage);
            if (!SUPPORTED_IMAGE_EXTENSIONS.includes(extension)) {
                alert(`지원하지 않는 이미지 형식입니다: ${extension}. 지원 형식: ${SUPPORTED_IMAGE_EXTENSIONS.join(', ')}`);
                return;
            }
    
            const maxQuantityValue = Math.max(1, parseInt(maxQuantity) || 1);
    
            // Generate a temporary ID for the new product
            const tempId = `temp_${Date.now()}`;
            
            // Create image URL - use postId if available, otherwise use tempId
            let imageUrl = null;
            if (isEditMode && postId && !String(postId).startsWith('temp_')) {
                // Use the format: /productPost/product/{postId}_{productId}.{extension}
                imageUrl = `${API_BASE_URL}/productPost/product/${image}`;
            } else {
                // For new posts, use a blob URL temporarily
                imageUrl = URL.createObjectURL(processedImage.file);
            }
    
            const newProduct = {
                id: tempId, // Use the temporary ID
                name: productName.trim().substring(0, 40),
                price: Number(price),
                quantity: Number(quantity),
                maxQuantity: maxQuantityValue,
                image: {
                    file: processedImage.file,
                    preview: imageUrl,
                    extension: extension,
                    uploadPath: 'productPost/product'
                },
                imageUpdated: true,
                images: [imageUrl],
                available: "판매중"
            };
    
            setProducts([...products, newProduct]);
            resetProductForm();
        } catch (err) {
            alert(`상품 이미지 처리 실패: ${err.message}`);
        }
    };

    const handleSaveEdit = async () => {
        if (!productName || !price || !quantity || !productImage) {
            alert("상품 정보를 모두 입력해주세요!");
            return;
        }

        try {
            let processedImage = productImage;
            if (typeof productImage === 'object' && productImage.file instanceof File) {
                const result = await ProductService.processImageForUpload(productImage);
                if (!result || !result.file) {
                    alert("상품 이미지 처리에 실패했습니다!");
                    return;
                }
                processedImage = result;
            }

            const extension = getImageExtension(processedImage.file || processedImage);
            if (!SUPPORTED_IMAGE_EXTENSIONS.includes(extension)) {
                alert(`지원하지 않는 이미지 형식입니다: ${extension}. 지원 형식: ${SUPPORTED_IMAGE_EXTENSIONS.join(', ')}`);
                return;
            }

            const maxQuantityValue = Math.max(1, parseInt(maxQuantity) || 1);

            const updatedProduct = {
                id: editProduct.id,
                name: productName,
                price: Number(price),
                quantity: Number(quantity),
                maxQuantity: maxQuantityValue,
                image: typeof processedImage === 'string' ? processedImage : {
                    file: processedImage.file,
                    preview: URL.createObjectURL(processedImage.file),
                    extension: extension
                },
                available: "판매중"
            };

            setProducts(
                products.map((product) =>
                    product.id === editProduct.id ? updatedProduct : product
                )
            );

            setEditProduct(null);
            resetProductForm();
        } catch (err) {
            alert(`상품 이미지 처리 실패: ${err.message}`);
        }
    };

    const resetProductForm = () => {
        setProductName("");
        setPrice("");
        setQuantity("");
        setMaxQuantity("1");
        setProductImage(null);
    };

    const handleEditProduct = (product) => {
        setEditProduct(product);
        setProductName(product.name);
        setPrice(product.price);
        setQuantity(product.quantity);
        setMaxQuantity(product.maxQuantity || "1");
        setProductImage(product.image);
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const processedImage = await ProductService.processImageForUpload({ file });
                if (!processedImage || !processedImage.file) {
                    alert("썸네일 이미지 처리에 실패했습니다!");
                    return;
                }
                const extension = getImageExtension(file);
                if (!SUPPORTED_IMAGE_EXTENSIONS.includes(extension)) {
                    alert(`지원하지 않는 이미지 형식입니다: ${extension}. 지원 형식: ${SUPPORTED_IMAGE_EXTENSIONS.join(', ')}`);
                    return;
                }
                setImage({
                    file: processedImage.file,
                    preview: URL.createObjectURL(processedImage.file),
                    extension: extension,
                    uploadPath: 'productPost/thumbnail'
                });
            } catch (err) {
                alert(`썸네일 이미지 처리 실패: ${err.message}`);
            }
        }
    };

    const handleProductImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const processedImage = await ProductService.processImageForUpload({ file });
                if (!processedImage || !processedImage.file) {
                    console.error("Failed to process product image");
                    alert("상품 이미지 처리에 실패했습니다!");
                    return;
                }
                const extension = getImageExtension(file);
                if (!SUPPORTED_IMAGE_EXTENSIONS.includes(extension)) {
                    console.error(`Unsupported image format: ${extension}`);
                    alert(`지원하지 않는 이미지 형식입니다: ${extension}. 지원 형식: ${SUPPORTED_IMAGE_EXTENSIONS.join(', ')}`);
                    return;
                }
                setProductImage({
                    file: processedImage.file,
                    preview: URL.createObjectURL(processedImage.file),
                    extension: extension,
                    uploadPath: 'productPost/product'
                });
            } catch (err) {
                console.error("Product image processing error:", err);
                alert(`상품 이미지 처리 실패: ${err.message}`);
            }
        }
    };

    const handleAddTag = () => {
        if (tagInput.trim() !== "" && hashtag.length < 5) {
            setHashtag([...hashtag, tagInput.trim()]);
            setTagInput("");
        }
    };

    const handleRemoveTag = (index) => {
        setHashtag(hashtag.filter((_, i) => i !== index));
    };

    const handleWriteClick = () => {
        setIsDescriptionEdit(true);
        navigate("/write", {
            state: {
                postId: postId || `temp_${Date.now()}`,
                title,
                category,
                description,
                image,
                hashtag,
                shippingMethods,
                products,
                isPublic,
                privateCode,
                start_time,
                end_time,
                isPermanent,
                price,
                quantity,
                maxQuantity,
                contentImages: contentImages,
                from: 'saleForm',
                isEditMode,
            },
        });
    };

    const handleEditClick = () => {
        setIsDescriptionEdit(true);
        navigate("/write", {
            state: {
                postId: postId || `temp_${Date.now()}`,
                title,
                category,
                description,
                image,
                hashtag,
                shippingMethods,
                products,
                isPublic,
                privateCode,
                start_time,
                end_time,
                isPermanent,
                price,
                quantity,
                maxQuantity,
                contentImages: contentImages,
                from: 'saleForm',
                isEditMode,
            },
        });
    };

    const handleCancel = () => {
        navigate(-1)
    };

    useEffect(() => {
        if (location.state?.from === 'write') {
            setIsDescriptionEdit(false);
            if (location.state.isEditMode !== undefined) {
                setIsEditMode(location.state.isEditMode);
            }
        }
        if (location.state && location.state.from !== 'management') {
            const {
                title, category, description, image, hashtag,
                shippingMethods, products, isPublic, privateCode,
                start_time, end_time, isPermanent, price, quantity, maxQuantity,
                isEditMode
            } = location.state;

            title && setTitle(title);
            category && setCategory(category);
            description && setDescription(description);
            image && setImage(image);
            hashtag && setHashtag(hashtag);
            shippingMethods && setShippingMethods(shippingMethods);
            products && setProducts(products);
            isPublic !== undefined && setIsPublic(isPublic);
            privateCode && setPrivateCode(privateCode);
            start_time && setStartTime(start_time);
            end_time && setEndTime(end_time);
            isPermanent !== undefined && setIsPermanent(isPermanent);
            price && setPrice(price);
            quantity && setQuantity(quantity);
            maxQuantity && setMaxQuantity(maxQuantity);
            isEditMode !== undefined && setIsEditMode(isEditMode);
        }
    }, [location.state]);

    if (loading) {
        return <div className="loading">로딩 중...</div>;
    }

    if (error) {
        return <div className="error">오류 발생: {error}</div>;
    }

    return (
        <div className="container">
            <h1 className="saleForm-title">판매 폼 만들기</h1>

            <div className="sale-form">
                {/* 이미지 업로드 */}
                <div className="image-upload">
                    <label className="upload-box">
                        {image ? (
                            <img
                                src={typeof image === 'string' ? image : (image.preview || placeholderImage)}
                                alt="Uploaded"
                                className="uploaded-image"
                                onError={(e) => { e.target.src = placeholderImage; }}
                            />
                        ) : (
                            <span className="upload-text">+ 사진 등록</span>
                        )}
                        <input
                            type="file"
                            className="hidden"
                            onChange={handleImageChange}
                            accept="image/jpeg,image/png,image/webp,image/gif"
                        />
                    </label>
                </div>

                {/* 제목 입력 */}
                <div>
                    <label className="form-label">폼 타입(제목)</label>
                    <input
                        type="text"
                        placeholder="제목을 입력해주세요."
                        className="form-input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                {/* 카테고리 선택 */}
                <div>
                    <label className="form-label">카테고리</label>
                    <select
                        className="form-input"
                        value={category}
                        onChange={(e) => {
                            setCategory(e.target.value);
                            setCategoryId(getCategoryId(e.target.value));
                        }}
                    >
                        <option value="">카테고리를 선택해주세요</option>
                        <option value="애니메이션">애니메이션</option>
                        <option value="아이돌">아이돌</option>
                        <option value="순수창작">순수창작</option>
                        <option value="게임">게임</option>
                        <option value="영화">영화</option>
                        <option value="드라마">드라마</option>
                        <option value="웹소설">웹소설</option>
                        <option value="웹툰">웹툰</option>
                    </select>
                </div>

                {/* 상세 설명 */}
                <div>
                    <label className="form-label">상세설명</label>
                    <div className="description-box">
                        {description ? (
                            <>
                                <div
                                    className="description-display hidden"
                                    dangerouslySetInnerHTML={{ __html: description }}
                                />
                                <button
                                    type="button"
                                    className="saleFormWriteBtn"
                                    onClick={handleEditClick}
                                >
                                    수정하기
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                className="saleFormWriteBtn"
                                onClick={handleWriteClick}
                            >
                                작성하기
                            </button>
                        )}
                    </div>
                </div>

                {/* 배송 방법 */}
                <div>
                    <label className="form-label">배송 방법 입력 <span style={{ color: "red" }}>*</span></label>
                    <p className="form-description">배송방법 수정은 구매 발생 전까지 변경이 가능합니다.</p>

                    <div className="shipping-default-option">
                        <label>
                            <input
                                type="checkbox"
                                checked={defaultShippingChecked}
                                onChange={handleDefaultShippingChange}
                            />
                            기본 택배 (3000원)
                        </label>
                    </div>

                    <div className="shipping-methods-list">
                        {shippingMethods
                            .filter(method => method.name !== '택배' || defaultShippingChecked)
                            .map((method, index) => (
                                <div
                                    key={index}
                                    className="shipping-method-item"
                                    data-method={method.name}
                                >
                                    <span>{method.name}: {method.price}원</span>
                                    <div className="shipping-method-actions">
                                        <button
                                            className="shipping-method-edit"
                                            onClick={() => handleEditMethod(method)}
                                            disabled={method.name === '택배'}
                                        >
                                            수정
                                        </button>
                                        <button
                                            className="shipping-method-delete"
                                            onClick={() => handleDeleteMethod(method.name)}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>

                    <div className="shipping-input-group">
                        <input
                            type="text"
                            placeholder="배송방법 (예: 무료배송)"
                            value={newMethod}
                            onChange={(e) => setNewMethod(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="배송비 (예: 0)"
                            value={shippingCost}
                            onChange={(e) => setShippingCost(e.target.value)}
                        />
                        <button className="ship-submit-button" onClick={handleAddMethod}>
                            {editMode ? "수정 완료" : "배송방법 추가"}
                        </button>
                    </div>
                </div>

                {/* 해시태그 입력 */}
                <div>
                    <label className="form-label">해쉬 태그 <span className="tag-limit">( {hashtag.length}/5 ) 5개까지 입력 가능합니다.</span></label>
                    <div className="tag-input-box">
                        <input
                            type="text"
                            placeholder="해쉬 태그를 입력해주세요. (ex: #애니)"
                            className="form-input tag-input"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                        />
                        <button className="add-tag-button" onClick={handleAddTag}>추가하기</button>
                    </div>
                    <div className="tag-list">
                        {hashtag.map((tag, index) => (
                            <span key={index} className="tag-item" onClick={() => handleRemoveTag(index)}>
                                #{tag} ×
                            </span>
                        ))}
                    </div>
                </div>

                {/* 상품 정보 입력 */}
                <div className="product-container">
                    <div className="product-left">
                        <label className="form-label">상품 정보 입력</label>
                        <h2>상품 이름</h2>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="상품 이름을 입력해주세요."
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                        />

                        <h2>가격</h2>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="해당 상품의 가격을 입력해주세요."
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />

                        <h2>재고</h2>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="재고 수량"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                        />

                        <h2>최대 구매 개수</h2>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="최대 구매 개수 제한"
                            min="1"
                            value={maxQuantity}
                            onChange={(e) => setMaxQuantity(e.target.value)}
                        />
                    </div>

                    <div className="product-right">
                        <label className="upload-box">
                            {productImage ? (
                                <img
                                    src={typeof productImage === 'string' ? productImage : (productImage.preview || placeholderImage)}
                                    alt="상품 이미지"
                                    className="uploaded-image"
                                    onError={(e) => { e.target.src = placeholderImage; }}
                                />
                            ) : (
                                <span className="upload-text">+ 상품 사진 등록</span>
                            )}
                            <input
                                type="file"
                                className="hidden"
                                onChange={handleProductImageChange}
                                accept="image/jpeg,image/png,image/webp,image/gif"
                            />
                        </label>

                        <button className="product-submit-button" onClick={editProduct ? handleSaveEdit : handleAddProduct}>
                            {editProduct ? "상품 수정하기" : "상품 추가하기"}
                        </button>
                    </div>
                </div>

                {/* 판매 상품 리스트 */}
                <div className="product-list">
                    <label className="form-label">
                        판매 상품 리스트 <span>(총 {products.length} 개의 상품)</span>
                    </label>

                    {products.length === 0 ? (
                        <p className="not">등록된 상품이 없습니다.</p>
                    ) : (
                        products.map((product) => (
                            <div key={product.id} className="product-item">
                                <img
                                    src={typeof product.image === 'object' ? (product.image.preview || placeholderImage) : (product.image || placeholderImage)}
                                    alt={product.name}
                                    className="product-image"
                                    onError={(e) => { e.target.src = placeholderImage; }}
                                />
                                <div className="product-infos">
                                    <div className="product-text">
                                        <strong>{product.name}</strong>
                                        <p>가격: {product.price}원</p>
                                        <p>재고: {product.quantity}개</p>
                                        <p>최대 구매 개수: {product.maxQuantity}개</p>
                                    </div>
                                </div>
                                <div className="product-actions">
                                    <button className="edit-button" onClick={() => handleEditProduct(product)}>
                                        수정
                                    </button>
                                    <button className="delete-button" onClick={() => handleDeleteProduct(product.id)}>
                                        삭제
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* 공개 판매/ 비공개 판매 */}
                <div>
                    <label className="form-label">공개 판매 / 비공개 판매</label>
                    <div>
                        <input
                            type="radio"
                            name="saleType"
                            checked={isPublic}
                            onChange={() => setIsPublic(true)}
                        /> 공개 판매 (사용자들이 전부 볼 수 있음)
                    </div>
                    <div>
                        <input
                            type="radio"
                            name="saleType"
                            checked={!isPublic}
                            onChange={() => setIsPublic(false)}
                        /> 비공개 판매 (일부 사용자들만 볼 수 있음)
                    </div>
                    {!isPublic && (
                        <input
                            type="text"
                            className="form-input"
                            placeholder="해당 비밀번호 입력"
                            value={privateCode}
                            onChange={(e) => setPrivateCode(e.target.value)}
                        />
                    )}
                </div>

                {/* 판매 기간 */}
                <div>
                    <label className="saleForm-label">판매 기간</label>
                    <div className="saleForm-period">
                        <label className="saleLabel">판매 시작일</label>
                        <input
                            className="saleform-start"
                            type="date"
                            name="start_time"
                            value={start_time}
                            onChange={(e) => setStartTime(e.target.value)}
                            disabled={isPermanent}
                        />

                        <div className="sale-period-separator">~</div>

                        <label className="saleLabel">판매 종료일</label>
                        <input
                            className="saleform-end"
                            type="date"
                            name="end_time"
                            value={end_time}
                            onChange={(e) => setEndTime(e.target.value)}
                            disabled={isPermanent}
                        />
                    </div>

                    <div className="saleform-group">
                        <label>
                            <input
                                type="checkbox"
                                name="isPermanent"
                                checked={isPermanent}
                                onChange={(e) => setIsPermanent(e.target.checked)}
                            />
                            상시판매
                        </label>
                    </div>
                </div>
            </div>

            {/* 등록 버튼 */}
            <div className="saleFormButton-container">
                <button className="saleFormsubmit" onClick={handleFormSubmit}>
                    {isEditMode ? "수정 등록하기" : "등록하기"}
                </button>
                <button className="saleFormCancel" onClick={handleCancel}>취소하기</button>
            </div>
        </div>
    );
};

export default SaleForm;