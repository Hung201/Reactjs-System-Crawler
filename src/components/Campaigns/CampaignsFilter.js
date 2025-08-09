import React from 'react';
import { Search } from 'lucide-react';
import { CAMPAIGN_STATUS_LABELS } from '../../utils/constants';

const CampaignsFilter = ({
    searchTerm,
    setSearchTerm,
    statusFilter,
    handleStatusFilter,
    handleSearch
}) => {
    return (
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
    );
};

export default CampaignsFilter;
