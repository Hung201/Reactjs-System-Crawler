import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// Improved Rate limiting utility with user-specific limits
const rateLimiter = {
    requests: new Map(),
    userRequests: new Map(), // Track requests per user
    maxRequests: 100, // Tăng lên 100 requests/phút cho toàn bộ hệ thống
    maxRequestsPerUser: 30, // 30 requests/phút cho mỗi user
    timeWindow: 60000, // Trong 1 phút

    canMakeRequest: function (endpoint, userId = null) {
        const now = Date.now();

        // Global rate limiting
        const requests = this.requests.get(endpoint) || [];
        const validRequests = requests.filter(time => now - time < this.timeWindow);

        if (validRequests.length >= this.maxRequests) {
            console.warn(`Global rate limit exceeded for endpoint: ${endpoint}`);
            return false;
        }

        // User-specific rate limiting (if userId provided)
        if (userId) {
            const userKey = `${userId}:${endpoint}`;
            const userRequests = this.userRequests.get(userKey) || [];
            const validUserRequests = userRequests.filter(time => now - time < this.timeWindow);

            if (validUserRequests.length >= this.maxRequestsPerUser) {
                console.warn(`User rate limit exceeded for endpoint: ${endpoint}, user: ${userId}`);
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
    rateLimiter.cleanup();
}, 5 * 60 * 1000);

// Tạo instance axios
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
});

// Interceptor để thêm token vào header và rate limiting
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        const user = useAuthStore.getState().user;
        const userId = user?.id || user?._id;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Rate limiting check with user ID
        const endpoint = `${config.method}:${config.url}`;
        if (!rateLimiter.canMakeRequest(endpoint, userId)) {
            console.warn(`Rate limit exceeded for: ${endpoint}, user: ${userId}`);
            return Promise.reject(new Error('Rate limit exceeded. Please wait before making another request.'));
        }

        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Interceptor để xử lý response
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.error('API Response Error:', error);
        console.error('Error details:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        // Handle rate limiting with retry logic
        if (error.message === 'Rate limit exceeded. Please wait before making another request.') {
            // Don't retry rate limit errors - let the user handle it
            console.warn('Rate limit hit, not retrying');
            return Promise.reject(error);
        }

        // Handle 429 (Too Many Requests) from server
        if (error.response?.status === 429) {
            const retryAfter = error.response.headers['retry-after'];
            const delay = retryAfter ? parseInt(retryAfter) * 1000 : 5000;

            console.warn(`Server rate limit hit, retrying after ${delay}ms`);

            // Wait and retry once
            await new Promise(resolve => setTimeout(resolve, delay));

            // Retry the request
            try {
                const config = error.config;
                return await api.request(config);
            } catch (retryError) {
                console.error('Retry failed:', retryError);
                return Promise.reject(retryError);
            }
        }

        // Handle 401 (Unauthorized)
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
        }

        // Handle other errors with exponential backoff (max 3 retries)
        if (error.config && !error.config._retry && error.config._retryCount < 3) {
            error.config._retry = true;
            error.config._retryCount = (error.config._retryCount || 0) + 1;

            const delay = Math.pow(2, error.config._retryCount) * 1000; // 2s, 4s, 8s
            console.warn(`Retrying request (${error.config._retryCount}/3) after ${delay}ms`);

            await new Promise(resolve => setTimeout(resolve, delay));

            try {
                return await api.request(error.config);
            } catch (retryError) {
                console.error(`Retry ${error.config._retryCount} failed:`, retryError);
                return Promise.reject(retryError);
            }
        }

        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    getProfile: () => api.get('/auth/profile'),
    register: (userData) => api.post('/auth/register', userData),
    updateProfile: (userData) => api.put('/auth/profile', userData),
    changePassword: (passwords) => api.put('/auth/change-password', passwords),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    verifyResetCode: (email, token) => api.post('/auth/verify-reset-code', { email, token }),
    resetPassword: (email, token, newPassword) => api.post('/auth/reset-password', { email, token, newPassword }),
};

// Crawl Sources API
export const sourcesAPI = {
    getAll: (params) => api.get('/sources', { params }),
    getById: (id) => api.get(`/sources/${id}`),
    create: (data) => api.post('/sources', data),
    update: (id, data) => api.put(`/sources/${id}`, data),
    delete: (id) => api.delete(`/sources/${id}`),
    runActor: (id) => api.post(`/sources/${id}/run`),
};

// Crawl Data API
export const dataAPI = {
    getAll: (params) => api.get('/data', { params }),
    getById: (id) => api.get(`/data/${id}`),
    update: (id, data) => api.put(`/data/${id}`, data),
    delete: (id) => api.delete(`/data/${id}`),
    translate: (id) => api.put(`/data/${id}/translate`),
    approve: (id) => api.put(`/data/${id}/approve`),
    reject: (id) => api.put(`/data/${id}/reject`),
};

// Users API
export const usersAPI = {
    getAll: (params) => api.get('/users', { params }),
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
    updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
};

// Actor Uploads API
export const actorsAPI = {
    getAll: (params) => api.get('/actors', { params }),
    getById: (id) => api.get(`/actors/${id}`),
    upload: (data) => api.post('/actors', data),
    update: (id, data) => api.put(`/actors/${id}`, data),
    delete: (id) => api.delete(`/actors/${id}`).catch(error => {
        console.error('Actor delete API error:', error);
        throw error;
    }),

    // File-based storage APIs (new endpoints)
    saveFile: (actorId, filePath, content) =>
        api.put(`/actors/${actorId}/files/${encodeURIComponent(filePath)}`, { content }),
    getFile: (actorId, filePath) =>
        api.get(`/actors/${actorId}/files/${encodeURIComponent(filePath)}`),
    getFiles: (actorId) =>
        api.get(`/actors/${actorId}/files`),
    saveFiles: (actorId, files) =>
        api.post(`/actors/${actorId}/files`, { files }),
    deleteFile: (actorId, filePath) =>
        api.delete(`/actors/${actorId}/files/${encodeURIComponent(filePath)}`),

    // Build and Run APIs (new endpoints)
    build: (actorId) => api.post(`/actors/${actorId}/build/file`),
    run: (actorId, input = {}) => api.post(`/actors/${actorId}/run/file`, { input }),

    // Legacy APIs (for backward compatibility)
    saveSource: (actorId, filePath, content) =>
        api.post(`/actors/${actorId}/source/file`, { filePath, content }),
    getSource: (actorId, filePath) =>
        api.get(`/actors/${actorId}/source/file`, { params: { filePath } }),

    // Streaming API
    runStream: (actorId, input) =>
        api.post(`/actors/${actorId}/run/stream`, { input }, {
            responseType: 'stream'
        })
};

// Run Logs API
export const logsAPI = {
    getAll: (params) => api.get('/logs', { params }),
    getById: (id) => api.get(`/logs/${id}`),
    getByActor: (actorId) => api.get(`/logs/actor/${actorId}`),
    getStats: () => api.get('/logs/stats'),
};

// Dashboard API
export const dashboardAPI = {
    getStats: async () => {
        const response = await api.get('/dashboard/stats');
        return response.data;
    },
    getRecentData: async () => {
        const response = await api.get('/dashboard/recent-data');
        return response.data;
    },
    getChartData: async (period) => {
        const response = await api.get(`/dashboard/chart-data?period=${period}`);
        return response.data;
    },
    getDetailedStats: async () => {
        const response = await api.get('/dashboard/detailed-stats');
        return response.data;
    },
};

// Campaigns API
export const campaignsAPI = {
    getAll: (params) => api.get('/campaigns', { params }),
    getById: (id) => api.get(`/campaigns/${id}`),
    create: (data) => api.post('/campaigns', data),
    update: (id, data) => api.put(`/campaigns/${id}`, data),
    delete: (id) => api.delete(`/campaigns/${id}`),
    run: (id) => api.post(`/campaigns/${id}/run`),
    getStatus: (id) => api.get(`/campaigns/${id}/status`),
    getRuns: (id) => api.get(`/campaigns/${id}/runs`),
};

// Templates API
export const templatesAPI = {
    // Lấy danh sách templates
    getAll: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.search) queryParams.append('search', params.search);
            if (params.status) queryParams.append('status', params.status);
            if (params.category) queryParams.append('category', params.category);
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);

            const response = await api.get(`/templates?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Templates API error:', error);
            throw error;
        }
    },

    // Lấy template theo ID
    getById: async (id) => {
        try {
            const response = await api.get(`/templates/${id}`);
            return response.data;
        } catch (error) {
            console.error('Template API error:', error);
            throw error;
        }
    },

    // Lấy danh sách actors có sẵn
    getActors: async () => {
        try {
            const response = await api.get('/templates/actors');
            return response.data;
        } catch (error) {
            console.error('Get actors API error:', error);
            throw error;
        }
    },

    // Lấy schema của actor
    getActorSchema: async (actorId) => {
        try {
            const response = await api.get(`/templates/actors/${actorId}/schema`);
            return response.data;
        } catch (error) {
            console.error('Get actor schema API error:', error);
            throw error;
        }
    },

    // Tạo template từ actor
    createFromActor: async (templateData) => {
        try {
            const response = await api.post('/templates/from-actor', templateData);
            return response.data;
        } catch (error) {
            console.error('Create template from actor API error:', error);
            throw error;
        }
    },

    // Tạo template mới (legacy)
    create: async (templateData) => {
        try {
            const response = await api.post('/templates', templateData);
            return response.data;
        } catch (error) {
            console.error('Create template API error:', error);
            throw error;
        }
    },

    // Cập nhật template
    update: async (id, templateData) => {
        try {
            const response = await api.put(`/templates/${id}`, templateData);
            return response.data;
        } catch (error) {
            console.error('Update template API error:', error);
            throw error;
        }
    },

    // Xóa template
    delete: async (id) => {
        try {
            const response = await api.delete(`/templates/${id}`);
            return response.data;
        } catch (error) {
            console.error('Delete template API error:', error);
            throw error;
        }
    },

    // Sử dụng template để tạo source
    useTemplate: async (templateId, sourceData) => {
        try {
            const response = await api.post(`/templates/${templateId}/use`, sourceData);
            return response.data;
        } catch (error) {
            console.error('Use template API error:', error);
            throw error;
        }
    }
};

// Platforms API
export const platformsAPI = {
    // Lấy danh sách platforms
    getAll: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.search) queryParams.append('search', params.search);
            if (params.type) queryParams.append('type', params.type);
            if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);

            const response = await api.get(`/platforms?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Platforms API error:', error);
            throw error;
        }
    },

    // Lấy platform theo ID
    getById: async (id) => {
        try {
            const response = await api.get(`/platforms/${id}`);
            return response.data;
        } catch (error) {
            console.error('Platform API error:', error);
            throw error;
        }
    },

    // Tạo platform mới
    create: async (platformData) => {
        try {
            const response = await api.post('/platforms', platformData);
            return response.data;
        } catch (error) {
            console.error('Create platform API error:', error);
            throw error;
        }
    },

    // Cập nhật platform
    update: async (id, platformData) => {
        try {
            // Try PUT first
            try {
                const response = await api.put(`/platforms/${id}`, platformData);
                return response.data;
            } catch (putError) {
                // Fallback: Use POST with _method override if PUT is not supported
                const response = await api.post(`/platforms/${id}`, {
                    ...platformData,
                    _method: 'PUT'
                });
                return response.data;
            }
        } catch (error) {
            console.error('Update platform API error:', error);
            throw error;
        }
    },

    // Xóa platform
    delete: async (id) => {
        try {
            const response = await api.delete(`/platforms/${id}`);
            return response.data;
        } catch (error) {
            console.error('Delete platform API error:', error);
            throw error;
        }
    },

    // Test connection platform
    testConnection: async (id) => {
        try {
            const response = await api.post(`/platforms/${id}/test`);
            return response.data;
        } catch (error) {
            console.error('Test platform connection API error:', error);
            throw error;
        }
    },

    // Test tất cả platforms
    testAllConnections: async () => {
        try {
            const response = await api.post('/platforms/test-all');
            return response.data;
        } catch (error) {
            console.error('Test all platforms API error:', error);
            throw error;
        }
    },

    // Lấy thống kê platforms
    getStats: async () => {
        try {
            const response = await api.get('/platforms?includeStats=true');
            return response.data;
        } catch (error) {
            console.error('Platform stats API error:', error);
            throw error;
        }
    },

    // Lấy danh sách loại platform
    getAvailableTypes: async () => {
        try {
            const response = await api.get('/platforms/types/available');
            return response.data;
        } catch (error) {
            console.error('Platform types API error:', error);
            throw error;
        }
    }
};

export default api; 