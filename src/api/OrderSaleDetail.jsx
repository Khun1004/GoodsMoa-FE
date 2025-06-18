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

    async requestTossPayment(orderData) {
        try {
            const response = await this.request('/payment/toss', 'POST', orderData);
            console.log('/payment/toss 후에 나온 값 :::',response);
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
        console.log('listOrders 실행이다ㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏ');
        try {
            console.log('listOrders @@@@@@@@@@@@@@@@');
            const endpoint = `/order/list?page=${page}&size=${size}&sort=${sort}`;
            const response = await this.request(endpoint, 'GET');
            console.log('response :::: ', response);
            return response;
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