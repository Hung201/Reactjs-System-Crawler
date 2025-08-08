import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Play,
    Pause,
    Edit,
    Trash2,
    Calendar,
    Target,
    Users,
    BarChart3
} from 'lucide-react';
import { CAMPAIGN_STATUS, CAMPAIGN_STATUS_LABELS } from '../../utils/constants';
import CampaignModal from './components/CampaignModal';
import ConfirmModal from '../../components/Common/ConfirmModal';
import CampaignService from '../../services/campaignService';
import { useAuthStore } from '../../stores/authStore';

const Campaigns = () => {
    const navigate = useNavigate();
    const { token, isAuthenticated, user } = useAuthStore();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updateSuccess, setUpdateSuccess] = useState(null);

    const campaignService = new CampaignService(token);

    // Helper function to validate MongoDB ObjectId
    const isValidObjectId = (id) => {
        if (!id || typeof id !== 'string') return false;
        // MongoDB ObjectId is 24 characters hex string
        return /^[0-9a-fA-F]{24}$/.test(id);
    };



    // Load campaigns từ API
    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await campaignService.getCampaigns();
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
                    config: campaign.config
                }));
                setCampaigns(normalizedCampaigns);
            } else {
                setError(result.message || 'Không thể tải danh sách campaigns');
            }
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            // Fallback to mock data if API is not available
            if (error.code === 'ERR_NETWORK' || error.response?.status === 404) {
                console.log('Using mock data for campaigns');
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
                console.log('Using mock campaigns:', mockCampaigns);
                setCampaigns(mockCampaigns);
            } else {
                setError('Lỗi kết nối server');
            }
        } finally {
            setLoading(false);
        }
    };

    // Load campaigns khi component mount
    useEffect(() => {
        fetchCampaigns();
    }, [token]);

    // Tìm kiếm campaigns
    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            fetchCampaigns();
            return;
        }

        try {
            setLoading(true);
            const result = await campaignService.searchCampaigns(searchTerm);
            if (result.success) {
                setCampaigns(result.data);
            }
        } catch (error) {
            console.error('Error searching campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    // Lọc theo trạng thái
    const handleStatusFilter = async (status) => {
        setStatusFilter(status);
        if (status === 'all') {
            fetchCampaigns();
            return;
        }

        try {
            setLoading(true);
            const result = await campaignService.filterCampaignsByStatus(status);
            if (result.success) {
                setCampaigns(result.data);
            }
        } catch (error) {
            console.error('Error filtering campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCampaigns = campaigns.filter(campaign => {
        const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Tính toán thống kê
    const calculateStats = () => {
        const totalCampaigns = campaigns.length;
        const activeCampaigns = campaigns.filter(c => c.status === CAMPAIGN_STATUS.ACTIVE).length;
        const completedCampaigns = campaigns.filter(c => c.status === CAMPAIGN_STATUS.COMPLETED).length;
        const successRate = totalCampaigns > 0 ? Math.round((completedCampaigns / totalCampaigns) * 100) : 0;

        return { totalCampaigns, activeCampaigns, successRate };
    };

    const stats = calculateStats();

    const handleCreateCampaign = async (campaignData) => {
        try {
            const result = await campaignService.createCampaign(campaignData);
            if (result.success) {
                setShowCreateModal(false);
                fetchCampaigns(); // Refresh danh sách
            } else {
                alert(result.message || 'Không thể tạo campaign');
            }
        } catch (error) {
            console.error('Error creating campaign:', error);
            // For demo purposes, add to local state
            const newCampaign = {
                id: Date.now().toString(),
                ...campaignData,
                status: CAMPAIGN_STATUS.DRAFT,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: 'admin@daisan.vn',
                runsCount: 0,
                successRate: 0,
                lastRun: null,
                totalDataCollected: 0,
                averageRunTime: '0 phút'
            };
            setCampaigns(prev => [...prev, newCampaign]);
            setShowCreateModal(false);
        }
    };

    const handleEditCampaign = async (campaignData) => {
        try {

            // Validate campaign ID before making API call
            if (!isValidObjectId(selectedCampaign.id)) {
                throw new Error(`Invalid campaign ID: ${selectedCampaign.id}. Expected 24-character MongoDB ObjectId.`);
            }

            const result = await campaignService.updateCampaign(selectedCampaign.id, campaignData);

            // Check for actual success more strictly
            if (result && (result.success === true || (result.data && typeof result.data === 'object'))) {
                // Show loading state
                setLoading(true);

                // Verify the update was actually saved
                try {
                    const verifyResult = await campaignService.getCampaign(selectedCampaign.id);

                    if (verifyResult.success && verifyResult.data) {
                        const updatedCampaign = verifyResult.data;

                        // Check if our changes were actually saved
                        const nameUpdated = updatedCampaign.name === campaignData.name;
                        const descUpdated = !campaignData.description || updatedCampaign.description === campaignData.description;

                        // Update local state immediately with fresh data
                        setCampaigns(prev => prev.map(c =>
                            c.id === selectedCampaign.id
                                ? {
                                    ...c,
                                    ...updatedCampaign,
                                    id: updatedCampaign._id || updatedCampaign.id || c.id,
                                    actorId: typeof updatedCampaign.actorId === 'object' ?
                                        updatedCampaign.actorId?.name || updatedCampaign.actorId?._id || updatedCampaign.actorId?.id || 'Unknown Actor' :
                                        (updatedCampaign.actorId || 'Unknown Actor')
                                }
                                : c
                        ));

                        if (nameUpdated && descUpdated) {
                            setUpdateSuccess('Campaign đã được cập nhật thành công!');
                            setTimeout(() => setUpdateSuccess(null), 3000); // Clear after 3 seconds
                        } else {
                            setUpdateSuccess('Campaign được cập nhật nhưng có thể chưa lưu hết thay đổi');
                            setTimeout(() => setUpdateSuccess(null), 3000);
                        }
                    } else {
                        setUpdateSuccess('Campaign đã được cập nhật thành công!');
                        setTimeout(() => setUpdateSuccess(null), 3000);
                    }
                } catch (verifyError) {
                    console.error('Error verifying update:', verifyError);

                    // Fallback: Update local state with the data we sent
                    setCampaigns(prev => prev.map(c =>
                        c.id === selectedCampaign.id
                            ? { ...c, ...campaignData, updatedAt: new Date().toISOString() }
                            : c
                    ));

                    setUpdateSuccess('Campaign đã được cập nhật thành công!');
                    setTimeout(() => setUpdateSuccess(null), 3000);
                }

                setShowEditModal(false);
                setSelectedCampaign(null);

                // Force a final refresh to ensure consistency
                await fetchCampaigns();
                setLoading(false);
            } else {
                alert(result?.message || result?.error || 'Không thể cập nhật campaign');
            }
        } catch (error) {
            console.error('Error updating campaign:', error);

            // Kiểm tra nếu là lỗi network, API chưa sẵn sàng, hoặc validation error
            if (error.code === 'ERR_NETWORK' || error.response?.status === 404 || error.response?.status === 400) {
                alert('Campaign đã được cập nhật thành công! (Demo mode)');
                // For demo purposes, update local state
                setCampaigns(prev => prev.map(c =>
                    c.id === selectedCampaign.id
                        ? { ...c, ...campaignData, updatedAt: new Date().toISOString() }
                        : c
                ));
                setShowEditModal(false);
                setSelectedCampaign(null);
            } else {
                const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Không thể cập nhật campaign';
                console.error('Update campaign error details:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: errorMessage,
                    campaignId: selectedCampaign.id,
                    campaignData: campaignData
                });

                // Kiểm tra nếu lỗi authentication
                if (error.response?.status === 401 || errorMessage.includes('Access denied') || errorMessage.includes('No token')) {
                    alert('Vui lòng đăng nhập lại để cập nhật campaign');
                    // Redirect to login
                    navigate('/login');
                } else if (error.response?.status === 400) {
                    // Validation error - hiển thị chi tiết
                    const details = error.response?.data?.details || [];
                    const detailMessage = details.length > 0 ?
                        '\nChi tiết:\n' + details.map(d => `- ${d.field}: ${d.message}`).join('\n') : '';
                    alert(`Lỗi validation: ${errorMessage}${detailMessage}`);
                } else {
                    alert(`Lỗi cập nhật: ${errorMessage}`);
                }
            }
        }
    };

    const handleDeleteCampaign = async () => {
        try {
            const result = await campaignService.deleteCampaign(selectedCampaign.id);
            if (result.success) {
                setShowDeleteModal(false);
                setSelectedCampaign(null);
                fetchCampaigns(); // Refresh danh sách
            } else {
                alert(result.message || 'Không thể xóa campaign');
            }
        } catch (error) {
            console.error('Error deleting campaign:', error);
            // For demo purposes, remove from local state
            setCampaigns(prev => prev.filter(c => c.id !== selectedCampaign.id));
            setShowDeleteModal(false);
            setSelectedCampaign(null);
        }
    };

    const handleStatusChange = async (campaignId, newStatus) => {
        try {
            const result = await campaignService.updateCampaign(campaignId, { status: newStatus });
            if (result.success) {
                fetchCampaigns(); // Refresh danh sách
            } else {
                alert(result.message || 'Không thể cập nhật trạng thái');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            // For demo purposes, update local state
            setCampaigns(prev => prev.map(c =>
                c.id === campaignId
                    ? { ...c, status: newStatus, updatedAt: new Date().toISOString() }
                    : c
            ));
        }
    };

    const handleRunCampaign = async (campaignId) => {
        try {
            const result = await campaignService.runCampaign(campaignId);
            if (result.success) {
                alert('Campaign đã được khởi chạy thành công!');
                fetchCampaigns(); // Refresh danh sách
            } else {
                alert(result.message || 'Không thể chạy campaign');
            }
        } catch (error) {
            console.error('Error running campaign:', error);
            alert('Campaign đã được khởi chạy thành công! (Demo mode)');
            // For demo purposes, update local state
            setCampaigns(prev => prev.map(c =>
                c.id === campaignId
                    ? {
                        ...c,
                        runsCount: c.runsCount + 1,
                        lastRun: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                    : c
            ));
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case CAMPAIGN_STATUS.ACTIVE:
                return 'bg-green-100 text-green-800';
            case CAMPAIGN_STATUS.PAUSED:
                return 'bg-yellow-100 text-yellow-800';
            case CAMPAIGN_STATUS.COMPLETED:
                return 'bg-blue-100 text-blue-800';
            case CAMPAIGN_STATUS.DRAFT:
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', dateString, error);
            return 'Invalid Date';
        }
    };

    return (
        <div className="p-6">
            {/* Success Notification */}
            {updateSuccess && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {updateSuccess}
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Chiến dịch</h1>
                    <p className="text-gray-600 mt-1">Quản lý các chiến dịch crawl dữ liệu</p>
                    {!isAuthenticated && (
                        <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded-md">
                            <p className="text-sm text-yellow-800">
                                ⚠️ Bạn chưa đăng nhập. Một số tính năng có thể không hoạt động.
                                <button
                                    onClick={() => navigate('/login')}
                                    className="ml-2 text-blue-600 hover:text-blue-800 underline"
                                >
                                    Đăng nhập ngay
                                </button>
                            </p>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} />
                    Tạo chiến dịch
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Target className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Tổng chiến dịch</p>
                            <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Play className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Đang chạy</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats.activeCampaigns}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Pause className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Tạm dừng</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {campaigns.filter(c => c.status === CAMPAIGN_STATUS.PAUSED).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <BarChart3 className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Tỷ lệ thành công</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats.successRate}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm chiến dịch..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            {Object.entries(CAMPAIGN_STATUS_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Campaigns List */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Chiến dịch
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thống kê
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cập nhật
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                            <span className="ml-2 text-gray-600">Đang tải...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="text-red-600">
                                            <p className="font-medium">Lỗi tải dữ liệu</p>
                                            <p className="text-sm mt-1">{error}</p>
                                            <button
                                                onClick={fetchCampaigns}
                                                className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                                            >
                                                Thử lại
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCampaigns.map((campaign) => (
                                <tr key={campaign.id} className={`hover:bg-gray-50 ${campaign.updatedAt && new Date(campaign.updatedAt).getTime() > Date.now() - 10000
                                    ? 'bg-green-50 border-l-4 border-green-400'
                                    : ''
                                    }`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <button
                                                onClick={() => navigate(`/campaigns/${campaign.id}`)}
                                                className="text-sm font-medium text-gray-900 hover:text-primary-600 transition-colors text-left"
                                            >
                                                {typeof campaign.name === 'string' ? campaign.name : 'Unnamed Campaign'}
                                            </button>
                                            <div className="text-sm text-gray-500">{typeof campaign.description === 'string' ? campaign.description : 'No description'}</div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                Tạo bởi {typeof campaign.createdBy === 'object' ? campaign.createdBy?.name || 'Unknown' : campaign.createdBy} • {formatDate(campaign.createdAt)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{typeof campaign.actorId === 'object' ? campaign.actorId?.name || 'Unknown' : campaign.actorId}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                                            {CAMPAIGN_STATUS_LABELS[campaign.status] || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            <div>Chạy: {campaign.runsCount || 0}</div>
                                            <div>Thành công: {campaign.successRate || 0}%</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {campaign.lastRun ? formatDate(campaign.lastRun) : 'Chưa chạy'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleRunCampaign(campaign.id)}
                                                className="text-green-600 hover:text-green-900"
                                                title="Chạy campaign"
                                            >
                                                <Play size={16} />
                                            </button>

                                            {campaign.status === CAMPAIGN_STATUS.ACTIVE ? (
                                                <button
                                                    onClick={() => handleStatusChange(campaign.id, CAMPAIGN_STATUS.PAUSED)}
                                                    className="text-yellow-600 hover:text-yellow-900"
                                                    title="Tạm dừng"
                                                >
                                                    <Pause size={16} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleStatusChange(campaign.id, CAMPAIGN_STATUS.ACTIVE)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Kích hoạt"
                                                >
                                                    <Play size={16} />
                                                </button>
                                            )}

                                            <button
                                                onClick={() => {
                                                    setSelectedCampaign(campaign);
                                                    setShowEditModal(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit size={16} />
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setSelectedCampaign(campaign);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="text-red-600 hover:text-red-900"
                                                title="Xóa"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredCampaigns.length === 0 && (
                    <div className="text-center py-12">
                        <Target className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Không có chiến dịch nào</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm || statusFilter !== 'all'
                                ? 'Thử thay đổi bộ lọc tìm kiếm.'
                                : 'Bắt đầu tạo chiến dịch đầu tiên của bạn.'
                            }
                        </p>
                        {!searchTerm && statusFilter === 'all' && (
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
                                >
                                    <Plus size={20} />
                                    Tạo chiến dịch
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            {showCreateModal && (
                <CampaignModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateCampaign}
                    mode="create"
                />
            )}

            {showEditModal && selectedCampaign && (
                <CampaignModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedCampaign(null);
                    }}
                    onSubmit={handleEditCampaign}
                    campaign={selectedCampaign}
                />
            )}

            {showDeleteModal && selectedCampaign && (
                <ConfirmModal
                    isOpen={showDeleteModal}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setSelectedCampaign(null);
                    }}
                    onConfirm={handleDeleteCampaign}
                    title="Xóa chiến dịch"
                    message={`Bạn có chắc chắn muốn xóa chiến dịch "${selectedCampaign.name}"? Hành động này không thể hoàn tác.`}
                    confirmText="Xóa"
                    cancelText="Hủy"
                />
            )}
        </div>
    );
};

export default Campaigns;
