import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// Tạo instance axios
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
});

// Interceptor để thêm token vào header
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor để xử lý response
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
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
    delete: (id) => api.delete(`/actors/${id}`),

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
    getStats: () => api.get('/dashboard/stats'),
    getRecentData: () => api.get('/dashboard/recent-data'),
    getChartData: (period) => api.get(`/dashboard/chart-data?period=${period}`),
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

export default api; 