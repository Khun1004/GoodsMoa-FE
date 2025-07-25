import api from '../api/api'; // Assuming this is the path to your axios instance

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ProductService {
    getUserId() {
        const userInfoStr = localStorage.getItem('userInfo');

        if (!userInfoStr) {
            console.error('userInfo가 localStorage에 없습니다. 로그인 페이지로 이동합니다.');
            window.location.href = '/login';
            throw new Error('사용자 인증 정보가 없습니다');
        }

        try {
            const userInfo = JSON.parse(userInfoStr);
            const userId = userInfo?.id;

            if (!userId) {
                console.error('userInfo에 id가 없습니다. 로그인 페이지로 이동합니다.');
                window.location.href = '/login';
                throw new Error('사용자가 인증되지 않았습니다');
            }

            return userId;
        } catch (err) {
            console.error('userInfo 파싱 중 오류 발생:', err);
            window.location.href = '/login';
            throw new Error('사용자 정보가 손상되었습니다');
        }
    }

    async request(endpoint, method, body = null, isMultipart = false) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {},
            withCredentials: true,
        };

        // Only set Content-Type for non-multipart JSON requests
        if (!isMultipart) {
            config.headers['Content-Type'] = 'application/json';
        }
        // For multipart requests, explicitly avoid setting Content-Type
        // Axios will automatically set Content-Type: multipart/form-data with boundary

        let data = body;
        // Only stringify body for non-multipart JSON requests
        if (body && !isMultipart) {
            data = JSON.stringify(body);
        }
        // For multipart, pass FormData directly

        try {
            // Log request details for debugging
            console.log('Request URL:', url);
            console.log('Request Method:', method);
            console.log('Request Data:', body);
            console.log('Is Multipart:', isMultipart);
            console.log('Request Config:', config);

            const response = await api({
                method,
                url,
                data,
                ...config,
            });

            // Log response headers for debugging
            console.log('Response Headers:', response.headers);

            // Return response data
            const contentType = response.headers['content-type'];
            if (contentType && contentType.includes('application/json')) {
                return response.data;
            }
            return response.data;

        } catch (error) {
            // Log error details for debugging
            console.error('Request Error:', error);
            if (error.response) {
                console.error('Error Response Data:', error.response.data);
                console.error('Error Response Headers:', error.response.headers);
            }

            // Special handling for 404 on like checks
            if (error.response && error.response.status === 404 && endpoint.startsWith('/product-like/my-likes/')) {
                console.warn(`🤍 좋아요 안 되어 있음 (endpoint: ${endpoint})`);
                return false;
            }

            // Handle error response
            if (error.response) {
                const errorContent = error.response.data;
                let errorMessage = `Request failed with status ${error.response.status}`;

                if (typeof errorContent === 'string') {
                    try {
                        const errorData = JSON.parse(errorContent);
                        errorMessage = errorData.message || errorMessage;
                    } catch {
                        errorMessage = errorContent || errorMessage;
                    }
                } else if (errorContent && errorContent.message) {
                    errorMessage = errorContent.message;
                }

                throw new Error(errorMessage);
            }

            // Log non-404 errors for non-like endpoints
            if (!(endpoint.startsWith('/product-like/my-likes/') && error.message?.includes('404'))) {
                console.error(`API ${method} request to ${endpoint} failed:`, error);
            }
            throw new Error(error.message || 'Network request failed');
        }
    }

    async processImageForUpload(image) {
        if (!image) return { file: null, extension: null };
        
        // File 객체 자체인 경우
        if (image instanceof File) {
            const fileName = image.name;
            const extension = fileName.split('.').pop().toLowerCase() || 'jpg';
            return { file: image, extension };
        }
        
        // image.file이 File 객체인 경우 (기존 호환성)
        if (image.file instanceof File) {
            const fileName = image.file.name;
            const extension = fileName.split('.').pop().toLowerCase() || 'jpg';
            return { file: image.file, extension };
        }

        if (typeof image === 'string' && image.startsWith('blob:')) {
            try {
                const response = await fetch(image); // Keep fetch here as it's for blob conversion
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

    // 상품글 생성
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
                        index: product.imageIndex || index + 1,
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

            const descriptionImageFiles = await Promise.all(
                (postData.descriptionImages || []).map(async (img, index) => {
                    const result = await this.processImageForUpload(img);
                    const isValid = result.file && result.file instanceof File;
                    
                    return isValid
                        ? { file: result.file, extension: result.extension || 'jpg', index }
                        : null;
                })
            );

            descriptionImageFiles.filter(item => item !== null).forEach(({ file, index }) => {
                formData.append('contentImages', file);  // descriptionImages → contentImages로 변경
                formData.append('descriptionImageIndexes', index);
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
                descriptionImages: null,
            });

            const postBlob = new Blob([JSON.stringify(formattedData)], {
                type: 'application/json',
            });
            formData.append('postRequest', postBlob);

            const response = await this.request('/product/post-create', 'POST', formData, true);



            return response;
        } catch (error) {
            console.error('Create post error:', error);
            throw new Error(`Failed to create post: ${error.message}`);
        }
    }

    // 상품글 수정
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
                        index: product.imageIndex || index + 1,
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

            const descriptionImagesInfo = await Promise.all(
                (postData.descriptionImages || []).map(async (img, index) => {
                    const result = await this.processImageForUpload(img);
                    return {
                        file: result.file instanceof File ? result.file : null,
                        extension: result.extension || 'jpg',
                        index,
                        existingUrl: !(result.file instanceof File) && img.url ? img.url : null
                    };
                })
            );

            descriptionImagesInfo.forEach(({ file, index, existingUrl }) => {
                if (file) {
                    console.log(`[ProductService] FormData append: newDescriptionImages[${index}]`, file);
                    console.log(`[ProductService] FormData append: newDescriptionImages[${index}] instanceof File:`, file instanceof File);
                    console.log(`[ProductService] FormData append: newDescriptionImages[${index}] name:`, file.name);
                    formData.append('newDescriptionImages', file);
                    formData.append('descriptionImageIndexes', index);
                } else if (existingUrl) {
                    console.log(`[ProductService] FormData append: existingDescriptionImageUrls[${index}]`, existingUrl);
                    formData.append('existingDescriptionImageUrls', existingUrl);
                    formData.append('existingDescriptionImageIndexes', index);
                }
            });

            formData.append("deleteProductImageIds", JSON.stringify(postData.deleteProductImageIds || []));
            formData.append("deleteDeliveryIds", JSON.stringify(postData.deleteDeliveryIds || []));
            const formattedData = this.formatPostData({
                ...postData,
                thumbnailImage: null,
                products: postData.products.map((product, index) => ({
                    ...product,
                    image: productImagesInfo[index].file ? null : product.image
                })),
                descriptionImages: null
            });

            const postBlob = new Blob([JSON.stringify(formattedData)], {
                type: 'application/json'
            });
            formData.append('postRequest', postBlob);

            const response = await this.request(`/product/post-update/${postId}`, 'POST', formData, true);

            // 백엔드에서 S3 URL을 반환하므로 프론트엔드에서 URL을 생성하지 않음
            // 백엔드 응답을 그대로 사용
            if (response && response.id) {
                // 백엔드에서 반환한 URL을 그대로 사용
                // thumbnailImage, products.image, contentImages는 백엔드에서 S3 URL로 설정됨
                console.log('백엔드 수정 응답:', response);
            }

            return response;
        } catch (error) {
            console.error('게시물 수정 오류:', error);
            throw error;
        }
    }

    // 상품글 상세조히
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

    // 상품글 삭제
    async deletePost(postId) {
        try {
            const response = await api.delete(`/product/post-delete/${postId}`, {
                withCredentials: true,
            });

            return response.data;
        } catch (error) {
            console.error('Delete post error:', error);
            if (error.response?.data?.message?.includes('foreign key constraint')) {
                throw new Error('이 게시물은 배송 정보와 연결되어 있어 삭제할 수 없습니다. 관리자에게 문의하세요.');
            }
            throw new Error(`게시물 삭제 실패: ${error.response?.data?.message || error.message}`);
        }
    }

    // 여러 상품글 리스트
    async getPosts(page = 0, size = 10, sort = 'createdAt,desc') {
        try {
            const params = new URLSearchParams({ page, size, sort });
            return await this.request(`/product/post?${params.toString()}`, 'GET');
        } catch (error) {
            console.error('게시물 목록 조회 오류:', error);
            throw new Error(`게시물 목록을 가져오는데 실패했습니다: ${error.message}`);
        }
    }

    // 사용자가 작성한 상품글 리스트 조회
    async getUserPosts(page = 0, size = 10, sort = 'createdAt,desc') {
        try {
            const params = new URLSearchParams({ page, size, sort });
            return await this.request(`/product/post-user?${params.toString()}`, 'GET');
        } catch (error) {
            console.error('사용자 게시물 목록 조회 오류:', error);
            throw new Error(`사용자 게시물 목록을 가져오는데 실패했습니다: ${error.message}`);
        }
    }

    // 상품글 찜
    async likeProduct(postId) {
        if (isNaN(postId)) {
            throw new Error('Invalid post ID');
        }
        try {
            return await this.request(`/product-like/${postId}`, 'POST');
        } catch (error) {
            console.error('좋아요 추가 오류:', error);
            throw new Error(`좋아요 추가에 실패했습니다: ${error.message}`);
        }
    }

    // 상품글 찜 해제
    async unlikeProduct(postId) {
        if (isNaN(postId)) {
            throw new Error('Invalid post ID');
        }
        try {
            return await this.request(`/product-like/${postId}`, 'DELETE');
        } catch (error) {
            console.error('좋아요 취소 오류:', error);
            throw new Error(`좋아요 취소에 실패했습니다: ${error.message}`);
        }
    }

    // 내가 찜한 상품글 조회
    async getLikedPosts(page = 0) {
        try {
            const query = `?page=${page}&size=10&sort=id,DESC`;
            return await this.request(`/product-like/likes${query}`, 'GET');
        } catch (error) {
            console.error('좋아요한 게시물 조회 오류:', error);
            throw new Error(`좋아요한 게시물을 가져오는데 실패했습니다: ${error.message}`);
        }
    }

    // 상품글 상세 조회일때 찜
    async getSingleLikedPost(id) {
        try {
            // ID에서 숫자 부분만 추출
            let numericId = id;
            if (typeof id === 'string' && id.includes('_')) {
                numericId = id.split('_')[1];
            }
            console.log("🔍 ProductService.getSingleLikedPost 호출됨 - 원본 ID:", id, "변환된 ID:", numericId);
            return await this.request(`/product-like/my-likes/${numericId}`, 'GET');
        } catch (error) {
            if (error.message.includes("404")) {
                return false;
            }

            console.error(`ID ${id}에 해당하는 좋아요 게시물 조회 오류:`, error);
            throw new Error(`게시물(ID: ${id}) 정보를 가져오는데 실패했습니다: ${error.message}`);
        }
    }

    // 리뷰 작성
    async createReview(postId, reviewData) {
        try {
            const formData = new FormData();

            // 1. JSON 본문 데이터
            const reviewRequest = {
                postId,
                rating: reviewData.rating,
                content: reviewData.content
            };
            const jsonBlob = new Blob([JSON.stringify(reviewRequest)], {
                type: 'application/json'
            });
            formData.append('request', jsonBlob);

            // 2. reviewImages가 이미 File 객체일 경우
            (reviewData.reviewImages || []).forEach((file, index) => {
                if (file instanceof File) {
                    formData.append('reviewImages', file);
                } else {
                    console.warn(`리뷰 이미지가 File 객체가 아닙니다 (index ${index}):`, file);
                }
            });

            // 3. 디버깅 로그
            for (const [key, val] of formData.entries()) {
                console.log('🧾 FormData Entry:', key, val);
            }

            return await this.request(`/product-review/create`, 'POST', formData, true);

        } catch (error) {
            console.error('리뷰 작성 실패:', error);
            throw new Error('리뷰 작성 중 오류가 발생했습니다');
        }
    }

    // 리뷰 목록 조회 (예: /product-review/list?page=0&size=10&sort=id,desc)
    async getMyReviews(page = 0, size = 10, sort = 'id,desc') {
        try {
            const params = new URLSearchParams({ page, size, sort });
            return await this.request(`/product-review/list?${params.toString()}`, 'GET');
        } catch (error) {
            console.error('내 리뷰 목록 조회 오류:', error);
            throw new Error(`리뷰 목록을 가져오는데 실패했습니다: ${error.message}`);
        }
    }

    // postId에 해당하는 리뷰 목록 조회
    async getReviewsByPost(postId, page = 0, size = 10, sort = 'createdAt,desc') {
        try {
            const params = new URLSearchParams({ page, size, sort });
            return await this.request(`/product-review/post/${postId}?${params.toString()}`, 'GET');
        } catch (error) {
            console.error('상품글 리뷰 조회 오류:', error);
            throw new Error(`리뷰 목록을 가져오는데 실패했습니다: ${error.message}`);
        }
    }

    // 리뷰 수정
    async updateReview(reviewData, newImages = []) {
        const formData = new FormData();

        formData.append("review", new Blob([JSON.stringify(reviewData)], { type: "application/json" }));

        for (let image of newImages) {
            formData.append("newImages", image);
        }

        return await this.request(`/product-review/update`, 'PUT', formData, true);
    }

    // 리뷰 삭제
    async deleteReview(reviewId) {
        try {
            return await this.request(`/product-review/${reviewId}`, 'DELETE');
        } catch (error) {
            console.error('Delete review error:', error);

            if (error.message?.includes('foreign key constraint')) {
                throw new Error('이 리뷰는 다른 정보와 연결되어 있어 삭제할 수 없습니다. 관리자에게 문의하세요.');
            }

            throw new Error(`리뷰 삭제 실패: ${error.message}`);
        }
    }

    // 통합 키워드 검색 (새 API 대응)
    async searchIntegrated({
                               query = '',
                               searchType = 'ALL',         // 제목, 내용, 해시태그 등 선택 시
                               boardType = 'TRADE',        // PRODUCT, TRADE, DEMAND
                               page = 0                    // 페이지 번호
                           }) {
        try {
            const params = new URLSearchParams({
                search_type: searchType,
                board_type: boardType,
                ...(query && { query }),
                page: page.toString()
            });

            return await this.request(`/search?${params.toString()}`, 'GET');
        } catch (error) {
            console.error('🔍 통합 검색 오류:', error);
            throw new Error(`검색 요청 중 오류 발생: ${error.message}`);
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
                        imageUpdated: !!product.imageUpdated
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
            deleteProductImageIds: Array.isArray(data.deleteProductImageIds)
                ? data.deleteProductImageIds
                : [],
            deleteDeliveryIds: Array.isArray(data.deleteDeliveryIds)
                ? data.deleteDeliveryIds
                : [],
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