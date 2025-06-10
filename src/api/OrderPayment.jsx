const API_BASE_URL = 'http://localhost:8080';

class OrderPayment {
    constructor(userInfo = null, shippingMethods = []) {
        this.userInfo = userInfo || JSON.parse(localStorage.getItem('userInfo')) || {};
        this.shippingMethods = shippingMethods; // shippingMethods를 클래스 프로퍼티로 저장
        
        if (!this.userInfo?.id) {
            console.error('User ID is missing:', this.userInfo);
            throw new Error('User ID is required. Please log in again.');
        }
    }
    
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

    async request(endpoint, method, body = null) {
        console.log(`Making ${method} request to ${endpoint}`, {
            body,
            userInfo: this.userInfo,
            hasToken: !!this.userInfo?.token
        });
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.userInfo?.token && { 
                        'Authorization': `Bearer ${this.userInfo.token}` 
                    })
                },
                credentials: 'include',
                body: body ? JSON.stringify(body) : null
            });

            if (response.status === 401) {
                console.error('Unauthorized request. Redirecting to login.');
                window.location.href = '/login?expired=true';
                throw new Error('Authentication expired');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Request failed with status ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API request error: ${method} ${endpoint}`, error);
            throw error;
        }
    }

    async createOrder(orderData) {
        try {
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

    async requestTossPayment(paymentData) {
        try {
            console.log('Requesting Toss payment with data:', paymentData);
            return await this.request('/payment/toss', 'POST', paymentData);
        } catch (error) {
            console.error('Toss payment request failed:', error);
            throw new Error(`Payment request failed: ${error.message}`);
        }
    }

    prepareOrderData(products, formData, selectedDeliveryName, totalAmount, refundBank, refundAccount) {
        if (!products?.length) {
            throw new Error('No products to order.');
        }
    
        const userId = this.getUserId();
        
        const invalidProducts = products.filter(p => !p.id || !p.postId);
        if (invalidProducts.length > 0) {
            console.error('Invalid products:', invalidProducts);
            throw new Error(`${invalidProducts.length} product(s) have missing IDs`);
        }
    
        const postId = products[0].postId;
        if (!postId) {
            throw new Error('Primary product missing postId');
        }
    
        // Find the selected delivery method by name
        const selectedMethod = this.shippingMethods.find(m => m.name === selectedDeliveryName);
    
        if (!selectedMethod) {
            throw new Error('Selected delivery method not found');
        }
    
        return {
            userId: userId,
            postId: postId,
            deliveryId: selectedMethod.id,
            deliveryName: selectedMethod.name,
            deliveryPrice: selectedMethod.price,
            recipient_name: formData.recipient_name,
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

    async processPayment(products, formData, selectedDelivery, refundBank, refundAccount, totalAmount) {
        try {
            // Validate inputs
            if (!products || products.length === 0) {
                throw new Error('구매할 상품이 없습니다.');
            }
    
            // Get user ID early to fail fast
            const userId = this.getUserId();
            console.log('Processing payment for user:', userId);
    
            // Prepare order data with validation
            const orderData = this.prepareOrderData(
                products, 
                formData, 
                selectedDelivery, 
                totalAmount,
                refundBank,
                refundAccount
            );
            
            console.log('Order data prepared:', JSON.stringify(orderData, null, 2));
    
            // Create the order
            const orderResponse = await this.createOrder(orderData);
            
            if (!orderResponse?.orderId) {
                throw new Error('주문 생성 후 orderId를 받지 못했습니다.');
            }
    
            // Prepare payment data for Toss
            const paymentData = {
                orderId: orderResponse.orderId,
                amount: totalAmount,
                orderName: `${products[0].name} 외 ${products.length - 1}건`,
                customerName: formData.ordererName,
                customerEmail: formData.ordererEmail,
                deliveryName: orderData.deliveryName, // 택배사 이름 추가
                deliveryPrice: orderData.deliveryPrice // 택배비 추가
            };
    
            // Request Toss payment
            const tossResponse = await this.requestTossPayment(paymentData);
            
            return {
                success: true,
                orderId: orderResponse.orderId,
                tossPayment: tossResponse
            };
        } catch (error) {
            console.error('Payment processing failed:', error);
            
            // More specific error handling
            if (error.message.includes('User') || error.message.includes('user')) {
                return {
                    success: false,
                    error: '로그인이 필요합니다',
                    userError: true
                };
            }
            
            if (error.message.includes('postId') || error.message.includes('productId')) {
                return {
                    success: false,
                    error: '상품 정보가 잘못되었습니다. 장바구니를 다시 확인해주세요.',
                    productError: true
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