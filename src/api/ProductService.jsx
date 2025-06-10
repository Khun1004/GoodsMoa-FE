const API_BASE_URL = 'http://localhost:8080';

class ProductService {
    getUserId() {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            console.error('사용자 인증 정보가 없습니다. 로그인 페이지로 이동합니다.');
            window.location.href = '/login';
            throw new Error('사용자가 인증되지 않았습니다');
        }
        return userId;
    }

    async request(endpoint, method, body = null, isMultipart = false) {
        const url = `${API_BASE_URL}${endpoint}`;
        const token = localStorage.getItem('auth_token');
        const headers = {};
        if (!isMultipart && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const config = {
            method,
            headers,
            credentials: 'include',
        };
        if (body) {
            config.body = isMultipart ? body : JSON.stringify(body);
        }
        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                const errorContent = await response.text();
                try {
                    const errorData = JSON.parse(errorContent);
                    throw new Error(errorData.message || `Request failed with status ${response.status}`);
                } catch {
                    throw new Error(errorContent || `Request failed with status ${response.status}`);
                }
            }
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            return await response.text();
        } catch (error) {
            console.error(`API ${method} request to ${endpoint} failed:`, error);
            throw new Error(error.message || 'Network request failed');
        }
    }

    async processImageForUpload(image) {
        if (!image) return { file: null, extension: null };
        if (image.file instanceof File) {
            const fileName = image.file.name;
            const extension = fileName.split('.').pop().toLowerCase() || 'jpg';
            return { file: image.file, extension };
        }

        if (typeof image === 'string' && image.startsWith('blob:')) {
            try {
                const response = await fetch(image);
                const blob = await response.blob();
                const matches = image.match(/^data:(image\/\w+);base64,/);
                const type = matches ? matches[1] : blob.type || 'image/jpeg';
                const extension = type.split('/')[1] || 'jpg';
                const fileName = `product_${Date.now()}.${extension}`;
                return { file: new File([blob], fileName, { type }), extension };
            } catch (error) {
                console.error('Blob URL 변환 실패:', error);
                return { file: null, extension: null };
            }
        }

        if (typeof image === 'string' && image.startsWith('http')) {
            const urlParts = image.split('.');
            const extension = urlParts.length > 1 ? urlParts.pop().toLowerCase() : 'jpg';
            return { file: image, extension };
        }
        return { file: null, extension: null };
    }

    async createPost(postData) {
        try {
            const userId = this.getUserId();
            const formData = new FormData();
            const thumbnailImageResult = await this.processImageForUpload(postData.thumbnailImage);
            const thumbnailImageFile = thumbnailImageResult.file;
            const thumbnailExtension = thumbnailImageResult.extension || 'jpg';
    
            if (thumbnailImageFile instanceof File) {
                formData.append('thumbnailImage', thumbnailImageFile);
                formData.append('thumbnailExtension', thumbnailExtension);
            } else if (typeof postData.thumbnailImage === 'string') {
                formData.append('existingThumbnailUrl', postData.thumbnailImage);
            } else {
                throw new Error('Thumbnail image is required');
            }
    
            const productImagesInfo = await Promise.all(
                postData.products.map(async (product, index) => {
                    const result = await this.processImageForUpload(product.image);
                    return {
                        file: result.file,
                        extension: result.extension || 'png',
                        index: product.imageIndex || index + 1, // 이미지 인덱스 사용
                        productId: product.id,
                    };
                })
            );
    
            productImagesInfo.forEach(({ file, index }) => {
                if (file instanceof File) {
                    formData.append('productImages', file);
                    formData.append('productImageIndexes', index);
                }
            });
    
            const contentImageFiles = await Promise.all(
                (postData.contentImages || []).map(async (img, index) => {
                    const result = await this.processImageForUpload(img);
                    return result.file && result.file instanceof File
                        ? { file: result.file, extension: result.extension || 'jpg', index }
                        : null;
                })
            );
    
            contentImageFiles.filter(item => item !== null).forEach(({ file, index }) => {
                formData.append('contentImages', file);
                formData.append('contentImageIndexes', index);
            });
    
            const formattedData = this.formatPostData({
                ...postData,
                userId: userId.toString(),
                thumbnailImage: thumbnailImageFile instanceof File
                    ? `temp_thumbnail.${thumbnailExtension}`
                    : postData.thumbnailImage,
                products: postData.products.map((product, idx) => ({
                    ...product,
                    image: productImagesInfo[idx].file ? null : product.image,
                })),
                contentImages: null,
            });
    
            const postBlob = new Blob([JSON.stringify(formattedData)], {
                type: 'application/json',
            });
            formData.append('postRequest', postBlob);
    
            const response = await this.request('/product/post-create', 'POST', formData, true);
    
            if (response && response.id) {
                const updatedContentImages = (postData.contentImages || []).map((img, index) => {
                    const contentImage = contentImageFiles[index];
                    const ext = contentImage && contentImage.extension ? contentImage.extension : 'jpg';
                    return {
                        ...img,
                        url: `${API_BASE_URL}/productPost/content/${response.id}_${index + 1}.${ext}`,
                    };
                });
    
                let updatedContent = postData.content || '';
                (postData.contentImages || []).forEach((img, index) => {
                    const oldUrl = img.url || img;
                    const contentImage = contentImageFiles[index];
                    const ext = contentImage && contentImage.extension ? contentImage.extension : 'jpg';
                    const newUrl = `${API_BASE_URL}/productPost/content/${response.id}_${index + 1}.${ext}`;
                    updatedContent = updatedContent.replace(oldUrl, newUrl);
                });
    
                response.contentImages = updatedContentImages;
                response.content = updatedContent;
    
                if (!response.thumbnailImage) {
                    response.thumbnailImage = `${API_BASE_URL}/productPost/thumbnail/${response.id}_1.${thumbnailExtension}`;
                }
    
                if (response.products) {
                    response.products = response.products.map((product, idx) => {
                        const productImage = productImagesInfo[idx];
                        const ext = productImage?.extension || 'png';
                        return {
                            ...product,
                            image: product.image || 
                                `${API_BASE_URL}/productPost/product/${response.id}_${productImage.index}.${ext}`,
                            images: product.image ? [product.image] : []
                        };
                    });
                }
            }
    
            return response;
        } catch (error) {
            console.error('Create post error:', error);
            throw new Error(`Failed to create post: ${error.message}`);
        }
    }

    async updatePost(postId, postData) {
        try {
            const formData = new FormData();
            
            const thumbnailImageResult = await this.processImageForUpload(postData.thumbnailImage);
            const thumbnailImageFile = thumbnailImageResult.file;
            const thumbnailExtension = thumbnailImageResult.extension || 'jpg';
    
            if (thumbnailImageFile instanceof File) {
                formData.append('newThumbnailImage', thumbnailImageFile);
            } else if (typeof postData.thumbnailImage === 'string') {
                formData.append('existingThumbnailUrl', postData.thumbnailImage);
            }
    
            const productImagesInfo = await Promise.all(
                postData.products.map(async (product, index) => {
                    const result = await this.processImageForUpload(product.image);
                    const isNewImage = result.file instanceof File;
                    return {
                        file: isNewImage ? result.file : null,
                        extension: result.extension || 'png',
                        index: product.imageIndex || index + 1, // 이미지 인덱스 사용
                        productId: product.id,
                        existingUrl: !isNewImage && product.image ? product.image : null
                    };
                })
            );
    
            productImagesInfo.forEach(({ file, productId, index, existingUrl }) => {
                if (file) {
                    formData.append('newProductImages', file);
                    formData.append('productImageIndexes', index);
                    if (productId && !String(productId).startsWith('temp_')) {
                        formData.append('productIds', productId);
                    }
                } else if (existingUrl) {
                    formData.append('existingProductImageUrls', existingUrl);
                    formData.append('existingProductImageIndexes', index);
                    if (productId && !String(productId).startsWith('temp_')) {
                        formData.append('existingProductIds', productId);
                    }
                }
            });
    
            const contentImagesInfo = await Promise.all(
                (postData.contentImages || []).map(async (img, index) => {
                    const result = await this.processImageForUpload(img);
                    return {
                        file: result.file instanceof File ? result.file : null,
                        extension: result.extension || 'jpg',
                        index,
                        existingUrl: !(result.file instanceof File) && img.url ? img.url : null
                    };
                })
            );
    
            contentImagesInfo.forEach(({ file, index, existingUrl }) => {
                if (file) {
                    formData.append('newContentImages', file);
                    formData.append('contentImageIndexes', index);
                } else if (existingUrl) {
                    formData.append('existingContentImageUrls', existingUrl);
                    formData.append('existingContentImageIndexes', index);
                }
            });
    
            if (postData.deleteProductImageIds?.length > 0) {
                postData.deleteProductImageIds.forEach(id => {
    _pd.append('deleteProductImageIds', id);
                });
            }
    
            const formattedData = this.formatPostData({
                ...postData,
                thumbnailImage: null,
                products: postData.products.map((product, index) => ({
                    ...product,
                    image: productImagesInfo[index].file ? null : product.image
                })),
                contentImages: null
            });
    
            const postBlob = new Blob([JSON.stringify(formattedData)], {
                type: 'application/json'
            });
            formData.append('postRequest', postBlob);
    
            const response = await this.request(`/product/post-update/${postId}`, 'POST', formData, true);
    
            if (response && response.id) {
                if (!response.thumbnailImage) {
                    response.thumbnailImage = thumbnailImageFile instanceof File
                        ? `${API_BASE_URL}/productPost/thumbnail/${response.id}_1.${thumbnailExtension}`
                        : postData.thumbnailImage;
                }
    
                if (response.products) {
                    response.products = response.products.map((product, index) => {
                        const productImage = productImagesInfo[index];
                        if (!productImage) {
                            console.warn(`No image info for product at index ${index}`);
                            return product;
                        }
                
                        const ext = productImage.extension || 'png';
                        let imageUrl = product.image;
                
                        if (productImage.file) {
                            // 변경: postId와 productId를 조합한 파일명 사용
                            imageUrl = `${API_BASE_URL}/productPost/product/${response.id}_${product.id}.${ext}`;
                            console.log(`Assigned new product image URL: ${imageUrl}`);
                        } else if (productImage.existingUrl) {
                            imageUrl = productImage.existingUrl;
                        }
                
                        return {
                            ...product,
                            image: imageUrl,
                            images: imageUrl ? [imageUrl] : []
                        };
                    });
                }
    
                const updatedContentImages = (postData.contentImages || []).map((img, index) => {
                    const contentImage = contentImagesInfo[index];
                    if (!contentImage) return img;
    
                    const ext = contentImage.extension || 'jpg';
                    if (contentImage.file) {
                        return {
                            ...img,
                            url: `${API_BASE_URL}/productPost/content/${response.id}_${index + 1}.${ext}`
                        };
                    }
                    return {
                        ...img,
                        url: contentImage.existingUrl || img.url
                    };
                });
    
                response.contentImages = updatedContentImages;
    
                if (response.content && postData.contentImages) {
                    let updatedContent = response.content;
                    (postData.contentImages || []).forEach((img, index) => {
                        const contentImage = contentImagesInfo[index];
                        if (contentImage && contentImage.file && img.url) {
                            const ext = contentImage.extension || 'jpg';
                            const newUrl = `${API_BASE_URL}/productPost/content/${response.id}_${index + 1}.${ext}`;
                            updatedContent = updatedContent.replace(img.url, newUrl);
                        }
                    });
                    response.content = updatedContent;
                }
            }
    
            return response;
        } catch (error) {
            console.error('게시물 수정 오류:', error);
            throw error;
        }
    }

    async getPostDetail(postId) {
        if (isNaN(postId)) {
            throw new Error('Invalid post ID');
        }
        try {
            return await this.request(`/product/post-detail/${postId}`, 'GET');
        } catch (error) {
            console.error('게시물 상세 정보 조회 오류:', error);
            throw new Error(`게시물 상세 정보를 가져오는데 실패했습니다: ${error.message}`);
        }
    }

    async deletePost(postId) {
        try {
            const response = await fetch(`${API_BASE_URL}/product/post-delete/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.message.includes('foreign key constraint')) {
                    throw new Error('이 게시물은 배송 정보와 연결되어 있어 삭제할 수 없습니다. 관리자에게 문의하세요.');
                }
                throw new Error(errorData.message || `게시물 삭제 실패 (상태 코드: ${response.status})`);
            }
            return {};
        } catch (error) {
            console.error('Delete post error:', error);
            throw new Error(`게시물 삭제 실패: ${error.message}`);
        }
    }

    async getPosts(page = 0, size = 10, sort = 'createdAt,desc') {
        try {
            const params = new URLSearchParams({ page, size, sort });
            return await this.request(`/product/post?${params.toString()}`, 'GET');
        } catch (error) {
            console.error('게시물 목록 조회 오류:', error);
            throw new Error(`게시물 목록을 가져오는데 실패했습니다: ${error.message}`);
        }
    }

    formatPostData(data) {
        if (!data) {
            console.error('포맷할 데이터가 없습니다');
            return {};
        }
        const userId = data.userId || this.getUserId();
        if (!userId) {
            throw new Error('사용자 ID가 필요합니다. 로그인 후 다시 시도해주세요.');
        }
        const safeValue = (value, defaultVal = '') => {
            return value === null || value === undefined || value === '' ? defaultVal : value;
        };
        const safeArray = (arr) => {
            return Array.isArray(arr) ? arr : [];
        };
        let hashtagValue = '';
        if (Array.isArray(data.hashtag)) {
            hashtagValue = data.hashtag.join(',');
        } else if (typeof data.hashtag === 'string') {
            hashtagValue = data.hashtag;
        }
        const processDeliveries = () => {
            const methods = safeArray(data.delivers || data.shippingMethods);
            if (methods.length === 0) {
                return [{
                    name: '택배',
                    price: 3000,
                }];
            }
            return methods
                .map(method => {
                    if (typeof method === 'string') {
                        const methodName = method ? method.trim() : '택배';
                        return {
                            name: methodName || '택배',
                            price: methodName.toLowerCase() === '무료배송' ? 0 : 3000,
                        };
                    }
                    if (method && typeof method === 'object') {
                        const name = method.name ? method.name.trim() : '';
                        let price = 0;
                        if (method.price !== undefined && method.price !== null) {
                            if (typeof method.price === 'string') {
                                const numericString = method.price.replace(/[^0-9.-]/g, '');
                                price = numericString ? parseInt(numericString, 10) : 0;
                            } else {
                                price = parseInt(method.price, 10);
                            }
                            if (isNaN(price)) {
                                price = name.toLowerCase() === '무료배송' ? 0 : 3000;
                            }
                        } else {
                            price = name.toLowerCase() === '무료배송' ? 0 : 3000;
                        }
                        return {
                            id: method.id || null,
                            name: name || (price === 0 ? '무료배송' : '택배'),
                            price: price,
                        };
                    }
                    return {
                        name: '택배',
                        price: 3000,
                    };
                })
                .filter(method => method && method.name);
        };
        const processProducts = () => {
            const products = safeArray(data.products);
            return products
                .map(product => {
                    if (!product || typeof product !== 'object') {
                        console.error('Invalid product data:', product);
                        return null;
                    }
                    const productId = product.id || null;
                    return {
                        id: productId,
                        name: safeValue(product.name, 'Unnamed Product').trim().substring(0, 40),
                        price: this.parseIntSafe(product.price, 0),
                        quantity: this.parseIntSafe(product.quantity || product.stock, 0),
                        maxQuantity: Math.max(1, this.parseIntSafe(
                            product.maxQuantity || product.maxQuantity || 1,
                            1
                        )),
                        image: product.image,
                        available: '판매중',
                    };
                })
                .filter(product => product !== null);
        };
        const formatted = {
            id: data.id || null,
            title: safeValue(data.title, '제목 없음').trim(),
            content: safeValue(data.content || data.description, '내용 없음').trim(),
            thumbnailImage: data.thumbnailImage,
            isPublic: data.isPublic !== false,
            startTime: safeValue(data.startTime || data.start_time),
            endTime: safeValue(data.endTime || data.end_time),
            isPermanent: data.isPermanent || false,
            state: true,
            password: !data.isPublic && (data.password || data.privateCode)
                ? (data.password || data.privateCode)
                : null,
            hashtag: hashtagValue,
            categoryId: data.categoryId ? parseInt(data.categoryId) : null,
            userId: userId.toString(),
            user: {
                id: userId.toString(),
                name: safeValue(data.user?.name || localStorage.getItem('userName') || '사용자'),
            },
            products: processProducts(),
            delivers: processDeliveries(),
            contentImages: data.contentImages || [],
        };
        if (!formatted.delivers || formatted.delivers.length === 0) {
            formatted.delivers = [{
                name: '택배',
                price: 3000,
            }];
        }
        return formatted;
    }

    parseIntSafe(value, defaultValue = 0) {
        if (value === undefined || value === null || value === '') {
            return defaultValue;
        }
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? defaultValue : parsed;
    }

    getCategories() {
        return [
            { id: 1, name: '애니메이션' },
            { id: 2, name: '아이돌' },
            { id: 3, name: '순수창작' },
            { id: 4, name: '게임' },
            { id: 5, name: '영화' },
            { id: 6, name: '드라마' },
            { id: 7, name: '웹소설' },
            { id: 8, name: '웹툰' },
        ];
    }
}

export default new ProductService();