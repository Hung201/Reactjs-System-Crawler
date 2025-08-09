import React from 'react';
import {
    BarChart3,
    CheckCircle,
    Target,
    Clock,
    XCircle,
    Settings
} from 'lucide-react';

const StatsCards = ({ campaign }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Tổng lần chạy</p>
                        <p className="text-2xl font-bold text-gray-900">{campaign.runsCount || 0}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Tỷ lệ thành công</p>
                        <p className="text-2xl font-bold text-gray-900">{campaign.successRate || 0}%</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Target className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Dữ liệu thu thập</p>
                        <p className="text-2xl font-bold text-gray-900">{campaign.totalRecordsProcessed || 0}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                        <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Thời gian trung bình</p>
                        <p className="text-2xl font-bold text-gray-900">{campaign.averageRunTime || '0 phút'}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                        <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Lần chạy thất bại</p>
                        <p className="text-2xl font-bold text-gray-900">{campaign.failedRuns || 0}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                    <div className="p-2 bg-gray-100 rounded-lg">
                        <Settings className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Bộ nhớ sử dụng</p>
                        <p className="text-2xl font-bold text-gray-900">{campaign.memoryUsage || '0%'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsCards;
