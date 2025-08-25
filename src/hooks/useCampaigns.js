import { useState, useEffect } from 'react';
import { CAMPAIGN_STATUS } from '../utils/constants';
import CampaignService from '../services/campaignService';

export const useCampaigns = (token) => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updateSuccess, setUpdateSuccess] = useState(null);
    const [runningCampaigns, setRunningCampaigns] = useState(new Set());
    const [pagination, setPagination] = useState(null);

    const campaignService = new CampaignService(token);

    // Helper function to validate MongoDB ObjectId
    const isValidObjectId = (id) => {
        if (!id || typeof id !== 'string') return false;
        // MongoDB ObjectId is 24 characters hex string
        return /^[0-9a-fA-F]{24}$/.test(id);
    };

    // Load campaigns từ API với pagination
    const fetchCampaigns = async (params = {}) => {
        try {
            setLoading(true);
            setError(null);
            const result = await campaignService.getCampaigns(params);
            if (result.success) {
                // Ensure all campaigns have the correct structure
                const normalizedCampaigns = (result.data || []).map(campaign => ({
                    id: campaign._id?.toString() || campaign.id || String(Math.random()),
                    name: campaign.name || 'Unnamed Campaign',
                    description: campaign.description || 'No description',
                    actorId: typeof campaign.actorId === 'object' ? campaign.actorId?.name || campaign.actorId?._id || campaign.actorId?.id || 'Unknown Actor' : (campaign.actorId || campaign.actor?.name || 'Unknown Actor'),
                    actorIdOriginal: typeof campaign.actorId === 'object' ? campaign.actorId?._id || campaign.actorId?.id :
                        // For now, hardcode the known ObjectId for this actor name
                        (campaign.actorId === "Actor Craw by Class (Latest)" ? "689464ac10595b979c15002a" : campaign.actorId),
                    status: campaign.status || CAMPAIGN_STATUS.DRAFT,
                    createdAt: campaign.createdAt || new Date().toISOString(),
                    updatedAt: campaign.updatedAt || new Date().toISOString(),
                    createdBy: campaign.createdBy || 'Unknown User',
                    runsCount: campaign.runsCount || 0,
                    successRate: campaign.successRate || 0,
                    lastRun: campaign.lastRun || null,
                    totalDataCollected: campaign.totalDataCollected || 0,
                    averageRunTime: campaign.averageRunTime || '0 phút',
                    // IMPORTANT: Preserve input and input_schema data
                    input: campaign.input,
                    input_schema: campaign.input_schema,
                    config: campaign.config,
                    // IMPORTANT: Preserve stats data from backend
                    stats: campaign.stats
                }));
                setCampaigns(normalizedCampaigns);

                // Set pagination data if available
                if (result.pagination) {
                    setPagination(result.pagination);
                }
            } else {
                setError(result.message || 'Không thể tải danh sách campaigns');
            }
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            // Fallback to mock data if API is not available
            if (error.code === 'ERR_NETWORK' || error.response?.status === 404) {
                const mockCampaigns = [
                    {
                        id: '1',
                        name: 'Crawl sản phẩm B2B Daisan',
                        description: 'Crawl sản phẩm từ website B2B Daisan với các thông số tùy chỉnh',
                        actorId: 'daisan/multi-website-product-crawler',
                        status: CAMPAIGN_STATUS.ACTIVE,
                        createdAt: '2024-01-15T10:30:00Z',
                        updatedAt: '2024-01-20T14:20:00Z',
                        createdBy: 'admin@daisan.vn',
                        runsCount: 25,
                        successRate: 92,
                        lastRun: '2024-01-20T14:20:00Z',
                        totalDataCollected: 1250,
                        averageRunTime: '15 phút'
                    },
                    {
                        id: '2',
                        name: 'Crawl tin tức VnExpress',
                        description: 'Thu thập tin tức từ VnExpress',
                        actorId: 'news/vnexpress-crawler',
                        status: CAMPAIGN_STATUS.PAUSED,
                        createdAt: '2024-01-10T09:15:00Z',
                        updatedAt: '2024-01-18T16:45:00Z',
                        createdBy: 'editor@example.com',
                        runsCount: 15,
                        successRate: 88,
                        lastRun: '2024-01-18T16:45:00Z',
                        totalDataCollected: 850,
                        averageRunTime: '8 phút'
                    }
                ];
                setCampaigns(mockCampaigns);
                // Set mock pagination
                setPagination({
                    page: 1,
                    limit: 10,
                    total: mockCampaigns.length,
                    pages: 1
                });
            } else {
                setError('Lỗi kết nối server');
            }
        } finally {
            setLoading(false);
        }
    };

    // Load campaigns khi component mount
    useEffect(() => {
        if (token) {
            fetchCampaigns();
        }
    }, [token]);

    // Tính toán thống kê từ backend stats và campaign data
    const calculateStats = () => {
        const totalCampaigns = campaigns.length;
        const activeCampaigns = campaigns.filter(c => c.status === CAMPAIGN_STATUS.ACTIVE).length;

        // Tính tổng runs và success rate từ backend stats
        let totalRuns = 0;
        let totalSuccessfulRuns = 0;

        campaigns.forEach(campaign => {
            if (campaign.stats) {
                totalRuns += campaign.stats.totalRuns || 0;
                totalSuccessfulRuns += campaign.stats.successfulRuns || 0;
            } else if (campaign.runsCount) {
                // Fallback cho campaigns cũ
                totalRuns += campaign.runsCount || 0;
                totalSuccessfulRuns += campaign.runsCount || 0; // Assume all are successful for old data
            }
        });

        const successRate = totalRuns > 0 ? Math.round((totalSuccessfulRuns / totalRuns) * 100) : 0;

        return {
            totalCampaigns,
            activeCampaigns,
            totalRuns,
            successRate
        };
    };

    return {
        campaigns,
        setCampaigns,
        loading,
        setLoading,
        error,
        setError,
        updateSuccess,
        setUpdateSuccess,
        runningCampaigns,
        setRunningCampaigns,
        fetchCampaigns,
        calculateStats,
        isValidObjectId,
        campaignService,
        pagination,
        setPagination
    };
};
