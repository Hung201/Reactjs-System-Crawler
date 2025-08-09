import React from 'react';
import { Play, Pause } from 'lucide-react';
import { CAMPAIGN_STATUS } from '../../utils/constants';

const RunControls = ({
    campaign,
    handleRunCampaign,
    handleStatusChange,
    isRunning
}) => {
    return (
        <div className="flex items-center gap-3">
            {campaign.status === CAMPAIGN_STATUS.ACTIVE ? (
                <button
                    onClick={() => handleStatusChange(CAMPAIGN_STATUS.PAUSED)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                >
                    <Pause size={16} />
                    Tạm dừng
                </button>
            ) : (
                <button
                    onClick={() => handleStatusChange(CAMPAIGN_STATUS.ACTIVE)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                    <Play size={16} />
                    Kích hoạt
                </button>
            )}

            <button
                onClick={handleRunCampaign}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
                {isRunning ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Đang chạy...
                    </>
                ) : (
                    <>
                        <Play size={16} />
                        Chạy ngay
                    </>
                )}
            </button>
        </div>
    );
};

export default RunControls;
