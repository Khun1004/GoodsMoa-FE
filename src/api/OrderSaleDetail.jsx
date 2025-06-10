const API_BASE_URL = 'http://localhost:8080';

class OrderSaleDetail {
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
    
}

export default new OrderSaleDetail();