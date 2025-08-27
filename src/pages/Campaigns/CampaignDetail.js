import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Clock,
    Play,
    Info
} from 'lucide-react';
import { CAMPAIGN_STATUS, CAMPAIGN_STATUS_LABELS } from '../../utils/constants';
import CampaignService from '../../services/campaignService';
import { useAuthStore } from '../../stores/authStore';

// Import components
import StatsCards from '../../components/CampaignDetail/StatsCards';
import CampaignTabs from '../../components/CampaignDetail/CampaignTabs';
import RunControls from '../../components/CampaignDetail/RunControls';
import OverviewTab from '../../components/CampaignDetail/tabs/OverviewTab';
import SchemaTab from '../../components/CampaignDetail/tabs/SchemaTab';
import DataTab from '../../components/CampaignDetail/tabs/DataTab';
import RunsTab from '../../components/CampaignDetail/tabs/RunsTab';
import SettingsTab from '../../components/CampaignDetail/tabs/SettingsTab';
import ServerErrorAlert from '../../components/Common/ServerErrorAlert';

const CampaignDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuthStore();
    const [campaign, setCampaign] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isRunning, setIsRunning] = useState(false);
    const [runStatus, setRunStatus] = useState(null);
    const [crawledData, setCrawledData] = useState(null);
    const [pollingInterval, setPollingInterval] = useState(null);
    const [runHistory, setRunHistory] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    const campaignService = new CampaignService(token);

    // Parse products from log text
    const parseProductsFromLog = (logText) => {
        try {
            const products = [];
            const lines = logText.split('\n');

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                // Look for product data pattern
                if (line.includes('Đã lấy xong dữ liệu sản phẩm:')) {
                    const productName = line.split('Đã lấy xong dữ liệu sản phẩm:')[1]?.trim();

                    // Look for price in nearby lines
                    let price = null;
                    for (let j = Math.max(0, i - 10); j < i; j++) {
                        const priceMatch = lines[j].match(/Price sau khi làm sạch: ([\d,]+)/);
                        if (priceMatch) {
                            price = priceMatch[1];
                            break;
                        }
                    }

                    // Look for SKU in nearby lines
                    let sku = null;
                    for (let j = Math.max(0, i - 10); j < i; j++) {
                        const skuMatch = lines[j].match(/Tự động tạo SKU: ([A-Z0-9_]+)/);
                        if (skuMatch) {
                            sku = skuMatch[1];
                            break;
                        }
                    }

                    // Look for images in nearby lines
                    const images = [];
                    for (let j = Math.max(0, i - 15); j < i; j++) {
                        const imageMatch = lines[j].match(/Thêm ảnh: (https:\/\/[^\s]+)/);
                        if (imageMatch) {
                            images.push(imageMatch[1]);
                        }
                    }

                    if (productName) {
                        products.push({
                            name: productName,
                            price: price ? `${price} ₫` : 'Liên hệ',
                            sku: sku || 'N/A',
                            images: images.slice(0, 3), // Limit to 3 images
                            url: `https://b2b.daisan.vn/products/${sku?.toLowerCase() || 'product'}`
                        });
                    }
                }
            }

            return products;
        } catch (error) {
            console.error('Error parsing products from log:', error);
            return [];
        }
    };

    // Load run history from campaign API (since it's included in campaign data)
    const loadRunHistory = async () => {
        try {
            const result = await campaignService.getCampaign(id);
            if (result.success && result.data && result.data.runHistory && Array.isArray(result.data.runHistory)) {
                setRunHistory(result.data.runHistory);
            } else {
                setRunHistory([]);
            }
        } catch (error) {
            console.error('Error loading run history:', error);
            setRunHistory([]);
        }
    };

    // Load crawled data from campaign API (prioritize status API for latest data)
    const loadCrawledData = async () => {
        if (isLoadingData) {
            return;
        }

        try {
            setIsLoadingData(true);

            // First try status API for latest data
            const statusResult = await campaignService.getCampaignStatus(id);

            if (statusResult.success) {
                // Check for data.result.output first (correct API structure)
                if (statusResult.data?.result?.output && Array.isArray(statusResult.data.result.output)) {
                    setCrawledData(statusResult.data.result.output);
                    return;
                }
                // Check for data.output (fallback)
                else if (statusResult.data?.output && Array.isArray(statusResult.data.output)) {
                    setCrawledData(statusResult.data.output);
                    return;
                }
                // Check for result.log and parse it
                else if (statusResult.data?.result?.log) {
                    const logText = statusResult.data.result.log;
                    const products = parseProductsFromLog(logText);
                    setCrawledData(products);
                    return;
                }
            }

            // Fallback to campaign API runHistory
            const campaignResult = await campaignService.getCampaign(id);

            if (campaignResult.success && campaignResult.data) {
                if (campaignResult.data.runHistory && campaignResult.data.runHistory.length > 0) {
                    const latestRun = campaignResult.data.runHistory[0]; // Most recent run
                    if (latestRun.output && Array.isArray(latestRun.output)) {
                        setCrawledData(latestRun.output);
                        return;
                    }
                }
            }

            setCrawledData([]);
        } catch (error) {
            console.error('Error loading crawled data:', error);
            setCrawledData([]);
        } finally {
            setIsLoadingData(false);
        }
    };

    // Load campaign data
    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const result = await campaignService.getCampaign(id);

                if (result.success) {
                    // Normalize campaign data to prevent rendering issues
                    const normalizedCampaign = {
                        ...result.data,
                        id: result.data._id || result.data.id,
                        name: result.data.name || 'Unnamed Campaign',
                        description: result.data.description || 'No description',
                        actorId: typeof result.data.actorId === 'object'
                            ? result.data.actorId?.name || result.data.actorId?._id || 'Unknown Actor'
                            : result.data.actorId || 'Unknown Actor',
                        createdBy: typeof result.data.createdBy === 'object'
                            ? result.data.createdBy?.name || result.data.createdBy?.email || 'Unknown User'
                            : result.data.createdBy || 'Unknown User',
                        status: result.data.status || 'draft',
                        runsCount: result.data.stats?.totalRuns || 0,
                        successRate: result.data.stats ? Math.round((result.data.stats.successfulRuns / result.data.stats.totalRuns) * 100) : 0,
                        totalRecordsProcessed: result.data.stats?.totalRecordsProcessed || 0,
                        averageRunTime: result.data.stats?.averageDuration
                            ? `${Math.round(result.data.stats.averageDuration / 1000)} giây`
                            : '0 giây',
                        failedRuns: result.data.stats?.failedRuns || 0,
                        memoryUsage: result.data.stats?.totalMemUsedInProcessed || '0%',
                        createdAt: result.data.createdAt || new Date().toISOString(),
                        updatedAt: result.data.updatedAt || new Date().toISOString(),
                        lastRun: result.data.lastRun || null,
                        input: result.data.input || {},
                        inputSchema: result.data.inputSchema || {}
                    };

                    setCampaign(normalizedCampaign);

                    // Only set crawled data if it's not already set
                    if (result.data.output && !crawledData) {
                        setCrawledData(result.data.output);
                    }
                } else {
                    console.error('Failed to fetch campaign:', result.message);
                }
            } catch (error) {
                console.error('Error fetching campaign:', error);
            }
        };

        if (id) {
            fetchCampaign();
        }
    }, [id, token]);

    // Load crawled data and run history separately to avoid conflicts
    useEffect(() => {
        if (id) {
            loadCrawledData();
            loadRunHistory();
        }
    }, [id]); // Only depend on id, not crawledData

    // Auto-load data when campaign status changes to completed
    useEffect(() => {
        if (campaign && campaign.status === CAMPAIGN_STATUS.COMPLETED && !crawledData && !isRunning && !isLoadingData) {

            // Use longer delay to avoid rate limiting
            setTimeout(() => {
                loadCrawledData();
            }, 3000); // Wait 3 seconds for API to be ready
        }
    }, [campaign?.status, isRunning, isLoadingData]); // Removed crawledData from dependencies

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
        };
    }, [pollingInterval]);

    const handleRunCampaign = async () => {
        try {
            setIsRunning(true);
            setRunStatus({ status: 'starting', message: 'Đang khởi chạy campaign...' });
            setCrawledData(null);

            // Step 1: Call run API
            const runResult = await campaignService.runCampaign(id);

            if (runResult.success) {
                setRunStatus({
                    status: 'running',
                    message: 'Campaign đang chạy...',
                    runId: runResult.data?.runId
                });

                // Step 2: Start polling status
                const interval = setInterval(async () => {
                    try {
                        const statusResult = await campaignService.getCampaignStatus(id);

                        if (statusResult.success) {
                            const status = statusResult.data?.status;
                            setRunStatus(prev => ({
                                ...prev,
                                status: status,
                                message: statusResult.data?.message || `Trạng thái: ${status}`
                            }));

                            // Step 3: If completed, get output data
                            if (status === 'completed') {
                                clearInterval(interval);
                                setPollingInterval(null);
                                setIsRunning(false);

                                // Extract crawled data from output using the same logic as loadCrawledData
                                let outputData = null;

                                // Check for data.result.output first (correct API structure)
                                if (statusResult.data?.result?.output && Array.isArray(statusResult.data.result.output)) {
                                    outputData = statusResult.data.result.output;
                                }
                                // Check for data.output (fallback)
                                else if (statusResult.data?.output && Array.isArray(statusResult.data.output)) {
                                    outputData = statusResult.data.output;
                                }
                                // Check for result.log and parse it
                                else if (statusResult.data?.result?.log) {
                                    const logText = statusResult.data.result.log;
                                    outputData = parseProductsFromLog(logText);
                                }

                                if (outputData) {
                                    setCrawledData(outputData);
                                    setActiveTab('data'); // Switch to data tab
                                } else {
                                    // Fallback: call loadCrawledData to get data from other sources
                                    setTimeout(() => {
                                        loadCrawledData();
                                    }, 1000); // Small delay to ensure API is ready
                                }

                                // Update campaign stats
                                setCampaign(prev => ({
                                    ...prev,
                                    runsCount: (prev.runsCount || 0) + 1,
                                    lastRun: new Date().toISOString(),
                                    status: CAMPAIGN_STATUS.COMPLETED
                                }));

                                // Refresh run history after completion
                                loadRunHistory();
                            } else if (status === 'failed') {
                                clearInterval(interval);
                                setPollingInterval(null);
                                setIsRunning(false);
                                setRunStatus(prev => ({
                                    ...prev,
                                    status: 'failed',
                                    message: 'Campaign thất bại'
                                }));

                                // Refresh run history after failure
                                loadRunHistory();
                            }
                        } else {
                            console.error('Status API failed:', statusResult.message);
                        }
                    } catch (error) {
                        console.error('Error polling status:', error);
                        clearInterval(interval);
                        setPollingInterval(null);
                        setIsRunning(false);

                        // Xử lý lỗi polling chi tiết hơn
                        let errorMessage = 'Lỗi khi kiểm tra trạng thái';

                        if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
                            errorMessage = 'Mất kết nối server. Backend server có thể đã dừng.';
                        } else if (error.response?.status === 404) {
                            errorMessage = 'Campaign không tồn tại hoặc đã bị xóa.';
                        } else if (error.response?.status === 500) {
                            errorMessage = 'Lỗi server khi kiểm tra trạng thái.';
                        }

                        setRunStatus(prev => ({
                            ...prev,
                            status: 'error',
                            message: errorMessage
                        }));
                    }
                }, 5000); // Poll every 5 seconds (reduced frequency)

                setPollingInterval(interval);
            } else {
                setIsRunning(false);
                setRunStatus({
                    status: 'error',
                    message: runResult.message || 'Không thể khởi chạy campaign'
                });
            }
        } catch (error) {
            console.error('Error running campaign:', error);
            setIsRunning(false);

            // Xử lý lỗi chi tiết hơn
            let errorMessage = 'Lỗi kết nối server';

            if (error.response) {
                // Server trả về lỗi
                const status = error.response.status;
                const data = error.response.data;

                switch (status) {
                    case 400:
                        errorMessage = data?.message || 'Dữ liệu không hợp lệ';
                        break;
                    case 401:
                        errorMessage = 'Không có quyền thực hiện';
                        break;
                    case 404:
                        errorMessage = 'Campaign không tồn tại';
                        break;
                    case 500:
                        errorMessage = 'Lỗi server nội bộ';
                        break;
                    default:
                        errorMessage = data?.message || `Lỗi server (${status})`;
                }
            } else if (error.request) {
                // Không nhận được response
                errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra backend server có đang chạy không.';
            } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
                // Network error
                errorMessage = 'Lỗi kết nối mạng. Backend server có thể chưa được khởi động.';
            } else {
                // Lỗi khác
                errorMessage = error.message || 'Lỗi không xác định';
            }

            setRunStatus({
                status: 'error',
                message: errorMessage,
                error: error
            });
        }
    };

    const handleStatusChange = (newStatus) => {
        setCampaign(prev => ({
            ...prev,
            status: newStatus,
            updatedAt: new Date().toISOString()
        }));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case CAMPAIGN_STATUS.ACTIVE:
                return 'bg-green-100 text-green-800';
            case CAMPAIGN_STATUS.PAUSED:
                return 'bg-yellow-100 text-yellow-800';
            case CAMPAIGN_STATUS.COMPLETED:
                return 'bg-blue-100 text-blue-800';
            case CAMPAIGN_STATUS.DRAFT:
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRunStatusIcon = (status) => {
        switch (status) {
            case 'success':
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'failed':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'running':
                return <Clock className="w-5 h-5 text-blue-500" />;
            case 'starting':
                return <Play className="w-5 h-5 text-blue-500" />;
            default:
                return <Info className="w-5 h-5 text-gray-500" />;
        }
    };

    const exportData = (data, filename = 'crawled-data.json') => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (!campaign) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/campaigns')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
                        <p className="text-gray-600 mt-1">{campaign.description}</p>
                    </div>
                </div>

                <RunControls
                    campaign={campaign}
                    handleRunCampaign={handleRunCampaign}
                    handleStatusChange={handleStatusChange}
                    isRunning={isRunning}
                />
            </div>

            {/* Run Status */}
            {runStatus && runStatus.status === 'error' ? (
                <ServerErrorAlert
                    error={runStatus.error}
                    onRetry={handleRunCampaign}
                    title="Lỗi chạy campaign"
                />
            ) : runStatus && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                        {getRunStatusIcon(runStatus.status)}
                        <div>
                            <p className="text-sm font-medium text-blue-900">
                                {runStatus.message}
                            </p>
                            {runStatus.runId && (
                                <p className="text-xs text-blue-600">Run ID: {runStatus.runId}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Status Badge - Removed as requested */}
            {/* <div className="mb-6">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                    {CAMPAIGN_STATUS_LABELS[campaign.status]}
                </span>
            </div> */}

            {/* Stats Cards */}
            <StatsCards campaign={campaign} />

            {/* Tabs */}
            <CampaignTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                crawledData={crawledData}
            />

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                    {activeTab === 'overview' && (
                        <OverviewTab campaign={campaign} formatDate={formatDate} />
                    )}

                    {activeTab === 'schema' && (
                        <SchemaTab campaign={campaign} />
                    )}

                    {activeTab === 'data' && (
                        <DataTab
                            campaign={campaign}
                            crawledData={crawledData}
                            loadCrawledData={loadCrawledData}
                            campaignService={campaignService}
                            id={id}
                            parseProductsFromLog={parseProductsFromLog}
                            exportData={exportData}
                            handleRunCampaign={handleRunCampaign}
                            isRunning={isRunning}
                        />
                    )}

                    {activeTab === 'runs' && (
                        <RunsTab
                            runHistory={runHistory}
                            runStatus={runStatus}
                            loadRunHistory={loadRunHistory}
                            formatDate={formatDate}
                            getRunStatusIcon={getRunStatusIcon}
                        />
                    )}

                    {activeTab === 'settings' && (
                        <SettingsTab
                            campaign={campaign}
                            handleStatusChange={handleStatusChange}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default CampaignDetail;
