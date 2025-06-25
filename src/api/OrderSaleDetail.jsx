import api from '../api/api'; // Assuming this is the path to your axios instance

const API_BASE_URL = 'http://localhost:8080';

class OrderSaleDetail {
    getUserId() {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
            console.error('사용자 인증 정보가 없습니다. 로그인 페이지로 이동합니다.');
            window.location.href = '/login';
            throw new Error('사용자가 인증되지 않았습니다');
        }

        const parsedUser = JSON.parse(userInfo);
        const userId = parsedUser?.id;

        if (!userId) {
            console.error('userInfo에 id가 존재하지 않습니다.');
            window.location.href = '/login';
            throw new Error('사용자 ID가 존재하지 않습니다.');
        }

        return userId;
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
        // For multipart, let axios set Content-Type: multipart/form-data with boundary

        let data = body;
        // Only stringify body for non-multipart JSON requests
        if (body && !isMultipart) {
            data = JSON.stringify(body);
        }

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

            console.error(`API ${method} request to ${endpoint} failed:`, error);
            throw new Error(error.message || 'Network request failed');
        }
    }

    async requestTossPayment(orderData) {
        try {
            const response = await this.request('/payment/toss', 'POST', orderData);
            console.log('/payment/toss 후에 나온 값 :::', response);
            return response;
        } catch (error) {
            console.error('결제 요청 실패:', error);
            throw error;
        }
    }

    async confirmTossPayment(paymentKey, orderCode, amount) {
        return this.request(`/payment/success?paymentKey=${paymentKey}&orderCode=${orderCode}&amount=${amount}`, 'GET');
    }

    // 주문 내역 조회
    async listOrders(page = 0, size = 10, sort = 'id,DESC') {
        try {
            const endpoint = `/order/list?page=${page}&size=${size}&sort=${sort}`;
            return await this.request(endpoint, 'GET');
        } catch (error) {
            console.error('Order list fetch failed:', {
                error: error.message,
                page,
                size,
                sort,
            });
            throw error;
        }
    }

    // 상품 주문 상세 조회
    async getOrderDetail(id) {
        try {
            const endpoint = `/order/detail/${id}`;
            const response = await this.request(endpoint, 'GET');
            console.log('🧾 주문 상세 응답:', response);
            return response;
        } catch (error) {
            console.error(`❌ 주문 상세 조회 실패 (ID: ${id})`, error);
            throw error;
        }
    }

    async handleFailedPayment(errorCode, errorMessage, orderId) {
        return this.request(`/payment/fail?code=${errorCode}&message=${errorMessage}&orderId=${orderId}`, 'GET');
    }
}

export default new OrderSaleDetail();