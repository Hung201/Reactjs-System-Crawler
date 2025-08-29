import axios from 'axios';

// Improved Rate limiting utility for CampaignService
const campaignRateLimiter = {
    requests: new Map(),
    userRequests: new Map(), // Track requests per user
    maxRequests: 500, // Tăng lên 50 requests/phút cho toàn bộ hệ thống
    maxRequestsPerUser: 100, // 20 requests/phút cho mỗi user
    timeWindow: 60000, // Trong 1 phút

    canMakeRequest: function (endpoint, userId = null) {
        const now = Date.now();

        // Global rate limiting
        const requests = this.requests.get(endpoint) || [];
        const validRequests = requests.filter(time => now - time < this.timeWindow);

        if (validRequests.length >= this.maxRequests) {
            console.warn(`Global campaign rate limit exceeded for endpoint: ${endpoint}`);
            return false;
        }

        // User-specific rate limiting (if userId provided)
        if (userId) {
            const userKey = `${userId}:${endpoint}`;
            const userRequests = this.userRequests.get(userKey) || [];
            const validUserRequests = userRequests.filter(time => now - time < this.timeWindow);

            if (validUserRequests.length >= this.maxRequestsPerUser) {
                console.warn(`User campaign rate limit exceeded for endpoint: ${endpoint}, user: ${userId}`);
                return false;
            }

            validUserRequests.push(now);
            this.userRequests.set(userKey, validUserRequests);
        }

        validRequests.push(now);
        this.requests.set(endpoint, validRequests);
        return true;
    },

    // Cleanup old entries to prevent memory leaks
    cleanup: function () {
        const now = Date.now();

        // Cleanup global requests
        for (const [endpoint, requests] of this.requests.entries()) {
            const validRequests = requests.filter(time => now - time < this.timeWindow);
            if (validRequests.length === 0) {
                this.requests.delete(endpoint);
            } else {
                this.requests.set(endpoint, validRequests);
            }
        }

        // Cleanup user requests
        for (const [userKey, requests] of this.userRequests.entries()) {
            const validRequests = requests.filter(time => now - time < this.timeWindow);
            if (validRequests.length === 0) {
                this.userRequests.delete(userKey);
            } else {
                this.userRequests.set(userKey, validRequests);
            }
        }
    }
};

// Cleanup every 5 minutes to prevent memory leaks
setInterval(() => {
    campaignRateLimiter.cleanup();
}, 5 * 60 * 1000);

class CampaignService {
    constructor(token) {
        this.token = token;
        this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        this.api = axios.create({
            baseURL: this.baseURL,
            timeout: 10000,
        });

        // Add token to headers and rate limiting
        this.api.interceptors.request.use(
            (config) => {
                if (this.token) {
                    config.headers.Authorization = `Bearer ${this.token}`;
                }

                // Get user ID from token or other source
                let userId = null;
                try {
                    // Try to decode JWT token to get user ID
                    const tokenParts = this.token.split('.');
                    if (tokenParts.length === 3) {
                        const payload = JSON.parse(atob(tokenParts[1]));
                        userId = payload.id || payload.userId || payload.sub;
                    }
                } catch (error) {
                    console.warn('Could not extract user ID from token');
                }

                // Rate limiting check with user ID
                const endpoint = `${config.method}:${config.url}`;
                if (!campaignRateLimiter.canMakeRequest(endpoint, userId)) {
                    console.warn(`Campaign API rate limit exceeded for: ${endpoint}, user: ${userId}`);
                    return Promise.reject(new Error('Campaign API rate limit exceeded. Please wait before making another request.'));
                }

                return config;
            },
            (error) => {
                console.error('Campaign API Request Error:', error);
                return Promise.reject(error);
            }
        );
    }

    // Tạo campaign mới
    async createCampaign(campaignData) {
        try {
            const response = await this.api.post('/campaigns', campaignData);
            return response.data;
        } catch (error) {
            console.error('Error creating campaign:', error);
            throw error;
        }
    }

    // Lấy danh sách campaigns
    async getCampaigns(params = {}) {
        try {
            const response = await this.api.get('/campaigns', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            throw error;
        }
    }

    // Lấy chi tiết campaign
    async getCampaign(campaignId) {
        try {
            const response = await this.api.get(`/campaigns/${campaignId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching campaign:', error);
            throw error;
        }
    }

    // Cập nhật campaign
    async updateCampaign(campaignId, campaignData) {
        try {
            const response = await this.api.put(`/campaigns/${campaignId}`, campaignData);
            return response.data;
        } catch (error) {
            console.error('Error updating campaign:', error);
            console.error('Error response:', error.response?.data);
            throw error;
        }
    }

    // Chạy campaign
    async runCampaign(campaignId) {
        try {
            const response = await this.api.post(`/campaigns/${campaignId}/run`);
            return response.data;
        } catch (error) {
            console.error('Error running campaign:', error);
            throw error;
        }
    }

    // Lấy trạng thái campaign
    async getCampaignStatus(campaignId) {
        try {
            const response = await this.api.get(`/campaigns/${campaignId}/status`);
            return response.data;
        } catch (error) {
            console.error('Error fetching campaign status:', error);
            throw error;
        }
    }

    // Lấy lịch sử chạy campaign
    async getCampaignRuns(campaignId) {
        try {
            const response = await this.api.get(`/campaigns/${campaignId}/runs`);
            return response.data;
        } catch (error) {
            console.error('Error fetching campaign runs:', error);
            throw error;
        }
    }

    // Xóa campaign
    async deleteCampaign(campaignId) {
        try {
            const response = await this.api.delete(`/campaigns/${campaignId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting campaign:', error);
            throw error;
        }
    }

    // Tìm kiếm campaigns
    async searchCampaigns(searchTerm, paginationParams = {}) {
        return this.getCampaigns({ search: searchTerm, ...paginationParams });
    }

    // Lọc campaigns theo trạng thái
    async filterCampaignsByStatus(status, paginationParams = {}) {
        return this.getCampaigns({ status, ...paginationParams });
    }
}

export default CampaignService;


