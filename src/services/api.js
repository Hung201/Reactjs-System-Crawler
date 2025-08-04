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
    run: (id) => api.post(`/actors/${id}/run`),
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

export default api; 