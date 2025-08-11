import React from 'react';
import {
    Play,
    Pause,
    Edit,
    Trash2
} from 'lucide-react';
import { CAMPAIGN_STATUS } from '../../utils/constants';

const CampaignActions = ({
    campaign,
    runningCampaigns,
    handleRunCampaign,
    handleStatusChange,
    setSelectedCampaign,
    setShowEditModal,
    setShowDeleteModal,
    navigate
}) => {
    return (
        <div className="flex items-center justify-end gap-2">
            <button
                onClick={() => handleRunCampaign(campaign.id)}
                disabled={campaign.status === CAMPAIGN_STATUS.ACTIVE || runningCampaigns.has(campaign.id)}
                className={`${campaign.status === CAMPAIGN_STATUS.ACTIVE || runningCampaigns.has(campaign.id)
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-green-600 hover:text-green-900'
                    }`}
                title={
                    campaign.status === CAMPAIGN_STATUS.ACTIVE
                        ? 'Campaign đang chạy'
                        : runningCampaigns.has(campaign.id)
                            ? 'Đang khởi chạy...'
                            : 'Chạy campaign'
                }
            >
                {campaign.status === CAMPAIGN_STATUS.ACTIVE || runningCampaigns.has(campaign.id) ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                ) : (
                    <Play size={16} />
                )}
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
    );
};

export default CampaignActions;
