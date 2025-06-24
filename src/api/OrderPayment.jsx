import api from '../api/api';

const API_BASE_URL = 'http://localhost:8080';

class OrderPayment {
    // 생성자: 사용자 정보와 배송 방법 배열을 초기화
    constructor(userInfo = null, shippingMethods = []) {
        this.userInfo = userInfo || JSON.parse(localStorage.getItem('userInfo')) || {};
        this.shippingMethods = shippingMethods;

        // 사용자 ID가 없으면 예외 처리
        if (!this.userInfo?.id) {
            console.error('User ID is missing:', this.userInfo);
            throw new Error('User ID is required. Please log in again.');
        }
    }

    // 사용자 ID 추출 및 유효성 검사
    getUserId() {
        if (!this.userInfo?.id) {
            console.error('Missing user ID in userInfo:', this.userInfo);
            throw new Error('Authentication required - No user ID found');
        }
        const userId = String(this.userInfo.id).trim();
        if (!userId || userId === 'null' || userId === 'undefined') {
            throw new Error('Invalid user ID format');
        }
        return userId;
    }

    // 공통 API 요청 함수
    async request(endpoint, method, body = null) {
        console.log(`Making ${method} request to ${endpoint}`, {
            body,
            userInfo: this.userInfo,
            hasToken: !!this.userInfo?.token
        });

        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.userInfo?.token && {
                    'Authorization': `Bearer ${this.userInfo.token}`
                })
            },
            withCredentials: true,
        };

        let data = body;
        if (body) {
            data = JSON.stringify(body);
        }

        try {
            const response = await api({
                method,
                url,
                data,
                ...config,
            });

            // Log response headers for debugging
            console.log('Response Headers:', response.headers);

            // Return response data
            return response.data;

        } catch (error) {
            console.error(`API request error: ${method} ${endpoint}`, error);

            // Handle 401 Unauthorized
            if (error.response?.status === 401) {
                console.error('Unauthorized request. Redirecting to login.');
                window.location.href = '/login?expired=true';
                throw new Error('Authentication expired');
            }

            // Handle other errors
            if (error.response) {
                const errorData = error.response.data || {};
                throw new Error(errorData.message || `Request failed with status ${error.response.status}`);
            }

            throw new Error(error.message || 'Network request failed');
        }
    }

    // 주문 생성 요청 함수
    async createOrder(orderData) {
        try {
            // 필수 값 체크
            if (!orderData.userId) {
                throw new Error(`Missing userId in order data: ${JSON.stringify(orderData)}`);
            }
            if (!orderData.postId) {
                throw new Error(`Missing postId in order data: ${JSON.stringify(orderData)}`);
            }

            const response = await this.request('/order/create', 'POST', orderData);
            return response;
        } catch (error) {
            console.error('Order creation failed:', {
                error: error.message,
                orderData: {
                    ...orderData,
                    userId: orderData.userId || 'MISSING',
                    postId: orderData.postId || 'MISSING',
                    products: orderData.products?.map(p => ({
                        productId: p.productId || 'MISSING',
                        quantity: p.quantity
                    }))
                }
            });
            throw error;
        }
    }

    // 토스 결제 요청
    async requestTossPayment(paymentData) {
        try {
            console.log('Requesting Toss payment with data:', paymentData);
            return await this.request('/payment/toss', 'POST', paymentData);
        } catch (error) {
            console.error('Toss payment request failed:', error);
            throw new Error(`Payment request failed: ${error.message}`);
        }
    }

    // 주문 데이터 구성 함수
    prepareOrderData(products, formData, selectedDeliveryName, totalAmount, refundBank, refundAccount) {
        if (!products?.length) {
            throw new Error('No products to order.');
        }

        const userId = this.getUserId();

        // 제품 정보 유효성 검사
        const invalidProducts = products.filter(p => !p.id || !p.postId);
        if (invalidProducts.length > 0) {
            console.error('Invalid products:', invalidProducts);
            throw new Error(`${invalidProducts.length} product(s) have missing IDs`);
        }

        const postId = products[0].postId;
        if (!postId) {
            throw new Error('Primary product missing postId');
        }

        // 선택된 배송 방법 찾기
        const selectedMethod = this.shippingMethods.find(m => m.name === selectedDeliveryName);

        if (!selectedMethod) {
            throw new Error('Selected delivery method not found');
        }

        // 최종 주문 객체 반환
        return {
            userId: userId,
            postId: postId,
            deliveryId: selectedMethod.id,
            deliveryName: selectedMethod.name,
            deliveryPrice: selectedMethod.price,
            recipientName: formData.recipient_name,
            phoneNumber: formData.phone_number,
            zipCode: formData.zipCode,
            mainAddress: formData.mainAddress,
            detailedAddress: formData.detailedAddress,
            postMemo: formData.deliveryMemo || '',
            products: products.map(product => ({
                productId: product.id,
                quantity: product.quantity
            })),
            totalAmount: totalAmount,
            refundBank: refundBank,
            refundAccount: refundAccount
        };
    }

    // 결제 프로세스 전체 처리 함수
    async processPayment(products, formData, selectedDelivery, refundBank, refundAccount, totalAmount) {
        try {
            if (!products || products.length === 0) {
                throw new Error('구매할 상품이 없습니다.');
            }

            const userId = this.getUserId();
            console.log('Processing payment for user:', userId);

            const orderData = await this.prepareOrderData(
                products,
                formData,
                selectedDelivery,
                totalAmount,
                refundBank,
                refundAccount
            );

            console.log('Order data prepared:', JSON.stringify(orderData, null, 2));

            // 주문 생성( 서버에서 받은 response 값)
            const orderResponse = await this.createOrder(orderData);
            console.log('주문 생성 응답:', orderResponse); // 👈 반드시 확인 필요
            if (!orderResponse?.orderId) {
                throw new Error('주문 생성 후 orderId를 받지 못했습니다.');
            }

            // 결제 요청 데이터 구성
            const paymentData = {
                orderId: orderResponse.orderId,
                postName: orderResponse.postName, // ✅ 필요 시 같이 받아야 함
                postThumbnail: orderResponse.postThumbnail,
                productsPrice: orderResponse.productsPrice,
                deliveryPrice: orderResponse.deliveryPrice,
                totalPrice: totalAmount
            };
            console.log("📨 결제 요청 데이터:", paymentData);
            // 토스 결제 요청
            const tossResponse = await this.requestTossPayment(paymentData);

            return {
                success: true,
                orderId: orderResponse.orderId,
                tossPayment: tossResponse
            };
        } catch (error) {
            console.error('Payment processing failed:', error);

            // 사용자 관련 에러 처리
            if (error.message.includes('User') || error.message.includes('user')) {
                return {
                    success: false,
                    error: '로그인이 필요합니다.',
                    userError: true,
                };
            }

            // 상품 관련 에러 처리
            if (error.message.includes('postId') || error.message.includes('productId')) {
                return {
                    success: false,
                    error: '상품 정보가 잘못되었습니다. 장바구니를 다시 확인해주세요.',
                    productError: true,
                };
            }

            return {
                success: false,
                error: error.message || '결제 처리 중 오류가 발생했습니다.'
            };
        }
    }
}

export default OrderPayment;