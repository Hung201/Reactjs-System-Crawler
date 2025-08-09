import React from 'react';
import { CAMPAIGN_STATUS } from '../../../utils/constants';

const SettingsTab = ({ campaign, handleStatusChange }) => {
    return (
        <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cài đặt chiến dịch</h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                        <p className="text-sm font-medium text-gray-900">Trạng thái chiến dịch</p>
                        <p className="text-xs text-gray-500">Kích hoạt hoặc tạm dừng chiến dịch</p>
                    </div>
                    <select
                        value={campaign.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                        <option value={CAMPAIGN_STATUS.DRAFT}>Bản nháp</option>
                        <option value={CAMPAIGN_STATUS.ACTIVE}>Đang chạy</option>
                        <option value={CAMPAIGN_STATUS.PAUSED}>Tạm dừng</option>
                        <option value={CAMPAIGN_STATUS.COMPLETED}>Hoàn thành</option>
                    </select>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                        <p className="text-sm font-medium text-gray-900">Xóa chiến dịch</p>
                        <p className="text-xs text-gray-500">Xóa vĩnh viễn chiến dịch này</p>
                    </div>
                    <button className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
                        Xóa
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsTab;
