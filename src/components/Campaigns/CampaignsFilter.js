import React from 'react';
import { Search } from 'lucide-react';
import { CAMPAIGN_STATUS_LABELS } from '../../utils/constants';

const CampaignsFilter = ({
    searchTerm,
    setSearchTerm,
    statusFilter,
    handleStatusFilter,
    handleSearch,
    pageSize,
    handlePageSizeChange,
    handleClearFilter
}) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm chiến dịch..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="search-input"
                    />
                </div>

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

                <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                    <option value={10}>10 chiến dịch/trang</option>
                    <option value={20}>20 chiến dịch/trang</option>
                    <option value={30}>30 chiến dịch/trang</option>
                    <option value={40}>40 chiến dịch/trang</option>
                    <option value={50}>50 chiến dịch/trang</option>
                </select>

                <button
                    onClick={handleClearFilter}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    Xóa bộ lọc
                </button>
            </div>
        </div>
    );
};

export default CampaignsFilter;
