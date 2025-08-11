import React from 'react';
import { Plus, Target } from 'lucide-react';
import { CAMPAIGN_STATUS_LABELS } from '../../utils/constants';
import CampaignActions from './CampaignActions';

const CampaignsTable = ({
    loading,
    error,
    filteredCampaigns,
    runningCampaigns,
    searchTerm,
    statusFilter,
    fetchCampaigns,
    getStatusColor,
    formatDate,
    handleRunCampaign,
    handleStatusChange,
    setSelectedCampaign,
    setShowEditModal,
    setShowDeleteModal,
    setShowCreateModal,
    navigate
}) => {
    return (
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
                                            className="text-sm font-medium text-gray-900 hover:text-primary-600 hover:underline transition-colors text-left cursor-pointer"
                                            title="Click để xem chi tiết campaign"
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
                                        <div>Chạy: {campaign.stats?.totalRuns || campaign.runsCount || 0}</div>
                                        <div>Thành công: {campaign.stats && campaign.stats.totalRuns > 0 ? Math.round((campaign.stats.successfulRuns / campaign.stats.totalRuns) * 100) : campaign.successRate || 0}%</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {campaign.lastRun ? formatDate(campaign.lastRun) : 'Chưa chạy'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <CampaignActions
                                        campaign={campaign}
                                        runningCampaigns={runningCampaigns}
                                        handleRunCampaign={handleRunCampaign}
                                        handleStatusChange={handleStatusChange}
                                        setSelectedCampaign={setSelectedCampaign}
                                        setShowEditModal={setShowEditModal}
                                        setShowDeleteModal={setShowDeleteModal}
                                        navigate={navigate}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredCampaigns.length === 0 && !loading && !error && (
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
    );
};

export default CampaignsTable;
