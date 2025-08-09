import React from 'react';

const OverviewTab = ({ campaign, formatDate }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin chiến dịch</h3>
                    <dl className="space-y-3">
                        <div className="flex justify-between">
                            <dt className="text-sm font-medium text-gray-500">Actor ID:</dt>
                            <dd className="text-sm text-gray-900">
                                {typeof campaign.actorId === 'object'
                                    ? campaign.actorId?.name || campaign.actorId?._id || 'Unknown Actor'
                                    : campaign.actorId || 'Unknown Actor'
                                }
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm font-medium text-gray-500">Tạo bởi:</dt>
                            <dd className="text-sm text-gray-900">
                                {typeof campaign.createdBy === 'object'
                                    ? campaign.createdBy?.name || campaign.createdBy?.email || 'Unknown User'
                                    : campaign.createdBy || 'Unknown User'
                                }
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm font-medium text-gray-500">Ngày tạo:</dt>
                            <dd className="text-sm text-gray-900">{formatDate(campaign.createdAt)}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm font-medium text-gray-500">Cập nhật lần cuối:</dt>
                            <dd className="text-sm text-gray-900">{formatDate(campaign.updatedAt)}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm font-medium text-gray-500">Lần chạy cuối:</dt>
                            <dd className="text-sm text-gray-900">
                                {campaign.lastRun ? formatDate(campaign.lastRun) : 'Chưa chạy'}
                            </dd>
                        </div>
                    </dl>
                </div>

                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Thống kê hiệu suất</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Tỷ lệ thành công</span>
                                <span className="text-gray-900">{campaign.successRate || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${campaign.successRate || 0}%` }}
                                ></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Dữ liệu trung bình/lần</span>
                                <span className="text-gray-900">
                                    {campaign.runsCount > 0 ? Math.round((campaign.totalRecordsProcessed || 0) / campaign.runsCount) : 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
