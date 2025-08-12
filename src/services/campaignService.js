import axios from 'axios';

class CampaignService {
    constructor(token) {
        this.token = token;
        this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        this.api = axios.create({
            baseURL: this.baseURL,
            timeout: 10000,
        });

        // Add token to headers
        this.api.interceptors.request.use(
            (config) => {
                if (this.token) {
                    config.headers.Authorization = `Bearer ${this.token}`;
                }
                return config;
            },
            (error) => {
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
    async searchCampaigns(searchTerm) {
        return this.getCampaigns({ search: searchTerm });
    }

    // Lọc campaigns theo trạng thái
    async filterCampaignsByStatus(status) {
        return this.getCampaigns({ status });
    }
}

export default CampaignService;


