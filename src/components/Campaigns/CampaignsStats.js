import React from 'react';
import {
    Target,
    Play,
    Pause,
    BarChart3
} from 'lucide-react';
import { CAMPAIGN_STATUS } from '../../utils/constants';

const CampaignsStats = ({ campaigns, stats, pagination }) => {
    // Sử dụng pagination.total nếu có, nếu không thì fallback về campaigns.length
    const totalCampaigns = pagination?.total || campaigns.length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Target className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Tổng chiến dịch</p>
                        <p className="text-2xl font-bold text-gray-900">{totalCampaigns}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <Play className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Tổng lần chạy</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {stats.totalRuns}
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
    );
};

export default CampaignsStats;
