import React from 'react';
import {
    RefreshCw,
    Download,
    Play,
    FileText
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
                            console.log('🔍 DEBUG: Testing status API directly...');
                            try {
                                const result = await campaignService.getCampaignStatus(id);
                                console.log('🔍 DEBUG: Direct API call result:', result);
                                alert(`API Response: ${JSON.stringify(result, null, 2)}`);
                            } catch (error) {
                                console.error('🔍 DEBUG: API error:', error);
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
                                console.log('🔍 Force refreshing campaign data...');
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
                            <p className="text-sm text-gray-600 mb-4">
                                Tổng cộng {crawledData.length} sản phẩm được thu thập
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                {crawledData.map((item, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                                        {/* Product Image */}
                                        {item.images && item.images.length > 0 && (
                                            <div className="mb-2">
                                                <img
                                                    src={item.images[0]}
                                                    alt={item.name}
                                                    className="w-full h-24 object-cover rounded-md"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {/* Product Info */}
                                        <h4 className="font-medium text-gray-900 mb-1 line-clamp-2 text-sm">
                                            {item.name || `Sản phẩm ${index + 1}`}
                                        </h4>

                                        {item.price && (
                                            <p className="text-green-600 font-semibold mb-1 text-sm">
                                                {item.price}
                                            </p>
                                        )}

                                        {item.sku && (
                                            <p className="text-xs text-gray-500 mb-2">
                                                SKU: {item.sku}
                                            </p>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-1 mt-2">
                                            {item.url && (
                                                <a
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 text-xs flex-1 text-center py-1 px-1 border border-blue-300 rounded hover:bg-blue-50"
                                                >
                                                    Chi tiết
                                                </a>
                                            )}
                                            {item.images && item.images.length > 1 && (
                                                <button
                                                    className="text-gray-600 hover:text-gray-800 text-xs py-1 px-1 border border-gray-300 rounded hover:bg-gray-50"
                                                    title={`${item.images.length} ảnh`}
                                                >
                                                    +{item.images.length - 1}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
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
