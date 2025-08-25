import React, { useState } from 'react';
import {
    RefreshCw,
    Download,
    Play,
    FileText,
    Eye,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const DataTab = ({
    campaign,
    crawledData,
    loadCrawledData,
    campaignService,
    id,
    parseProductsFromLog,
    exportData,
    handleRunCampaign,
    isRunning
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);

    // Tính toán phân trang
    const totalItems = Array.isArray(crawledData) ? crawledData.length : 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = Array.isArray(crawledData) ? crawledData.slice(startIndex, endIndex) : [];

    // Xử lý thay đổi trang
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Tạo danh sách các trang để hiển thị
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Dữ liệu cào</h3>
                <div className="flex gap-2">
                    <button
                        onClick={loadCrawledData}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <RefreshCw size={16} />
                        Tải lại dữ liệu
                    </button>
                    <button
                        onClick={async () => {
                            try {
                                const result = await campaignService.getCampaignStatus(id);
                                alert(`API Response: ${JSON.stringify(result, null, 2)}`);
                            } catch (error) {
                                alert(`API Error: ${error.message}`);
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        🐛 Debug API
                    </button>
                    <button
                        onClick={async () => {
                            try {
                                const result = await campaignService.getCampaignStatus(id);
                                if (result.success && result.data?.result?.log) {
                                    const products = parseProductsFromLog(result.data.result.log);
                                    alert(`Raw Log Data:\n\n${result.data.result.log}\n\n---\nParsed ${products.length} products from log`);
                                } else {
                                    alert('No log data found');
                                }
                            } catch (error) {
                                alert(`Error: ${error.message}`);
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                        📄 View Log
                    </button>
                    <button
                        onClick={async () => {
                            try {
                                const result = await campaignService.getCampaign(id);
                                if (result.success) {
                                    // Also check for crawled data
                                    const statusResult = await campaignService.getCampaignStatus(id);
                                    let actualRunsCount = result.data.stats?.totalRuns || 0;
                                    let actualDataCount = result.data.totalRecordsProcessed || 0;

                                    if (statusResult.success && statusResult.data?.result?.log) {
                                        const products = parseProductsFromLog(statusResult.data.result.log);
                                        if (products.length > 0) {
                                            actualRunsCount = Math.max(actualRunsCount, 1);
                                            actualDataCount = products.length;
                                        }
                                    }

                                    const successRate = result.data.stats ? Math.round((result.data.stats.successfulRuns / result.data.stats.totalRuns) * 100) : (actualDataCount > 0 ? 100 : 0);
                                    alert(`Campaign refreshed!\nRuns: ${actualRunsCount}\nData: ${actualDataCount}\nSuccess: ${successRate}%\nFailed: ${result.data.stats?.failedRuns || 0}\nAvg Duration: ${Math.round((result.data.stats?.averageDuration || 0) / 1000)}s\nMemory: ${result.data.stats?.totalMemUsedInProcessed || '0%'}`);
                                }
                            } catch (error) {
                                alert(`Error: ${error.message}`);
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        🔄 Refresh Stats
                    </button>
                    {crawledData && (
                        <button
                            onClick={() => exportData(crawledData, `${campaign.name}-data.json`)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Download size={16} />
                            Xuất dữ liệu
                        </button>
                    )}
                </div>
            </div>

            {!crawledData ? (
                <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có dữ liệu</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Chạy campaign để thu thập dữ liệu
                    </p>
                    <div className="mt-6">
                        <button
                            onClick={handleRunCampaign}
                            disabled={isRunning}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto disabled:opacity-50"
                        >
                            <Play size={16} />
                            Chạy campaign
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {Array.isArray(crawledData) ? (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-gray-600">
                                    Tổng cộng {crawledData.length} sản phẩm được thu thập
                                </p>
                                <p className="text-sm text-gray-500">
                                    Hiển thị {startIndex + 1}-{Math.min(endIndex, totalItems)} của {totalItems} sản phẩm
                                </p>
                            </div>

                            {/* Log List */}
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                {currentData.map((item, index) => (
                                    <div
                                        key={startIndex + index}
                                        className={`flex items-center justify-between p-3 hover:bg-gray-50 transition-colors ${index !== currentData.length - 1 ? 'border-b border-gray-200'
                                            : ''}`}
                                    >
                                        {/* SKU */}
                                        <div className="w-48 flex-shrink-0">
                                            <span className="text-xs font-mono text-gray-600">
                                                {item.sku || `SKU: DAISANB2B_G_${String(startIndex + index + 1).padStart(8, '0')}`}
                                            </span>
                                        </div>

                                        {/* Product Name */}
                                        <div className="flex-1 min-w-0 px-4">
                                            <h3 className="text-sm font-medium text-gray-900 truncate">
                                                {item.title || `Sản phẩm ${startIndex + index + 1}`}
                                            </h3>
                                        </div>

                                        {/* Price */}
                                        <div className="w-24 flex-shrink-0 text-right">
                                            <span className="text-sm font-medium text-green-600">
                                                {item.price || 'N/A'}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="w-16 flex-shrink-0 flex items-center justify-end space-x-1">
                                            {item.url && (
                                                <a
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye size={14} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft size={16} />
                                            Trước
                                        </button>

                                        <div className="flex items-center space-x-1">
                                            {getPageNumbers().map((page, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => typeof page === 'number' && handlePageChange(page)}
                                                    disabled={page === '...'}
                                                    className={`px-3 py-2 text-sm font-medium rounded-md ${page === currentPage
                                                        ? 'bg-blue-600 text-white'
                                                        : page === '...'
                                                            ? 'text-gray-400 cursor-default'
                                                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Sau
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>

                                    <div className="text-sm text-gray-500">
                                        Trang {currentPage} của {totalPages}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <pre className="text-sm text-gray-800 overflow-x-auto">
                                {JSON.stringify(crawledData, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DataTab;
