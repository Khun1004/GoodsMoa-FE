const API_BASE_URL = 'http://localhost:8080';

class DemandService {

    async getUserId() {
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

    // 수요조사 참여 생성
    async createOrder(postId, products) {
        return await this.request(
            `/demand/order/create/${postId}`,
            'POST',
            { products } // { products: [...] } 형태로 전송
        );
    }
    
    // 수요조사 참여 수정
    async updateOrder(orderId, products) {
        return await this.request(
            `/demand/order/update/${orderId}`,
            'PUT',
            { products } // { products: [...] } 형태로 전송
        );
    }

    // 수요조사 참여 삭제
    async deleteOrder(orderId) {
        return await this.request(
            `/demand/order/delete/${orderId}`,
            'DELETE'
        );
    }

    // 로그인 한 유저가 작성한 주문 가져오기
    async getMyOrders() {
        return await this.request('/demand/order', 'GET');
    }
}

export default new DemandService();
