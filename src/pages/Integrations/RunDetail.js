import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Copy, ExternalLink, CheckCircle, XCircle, Clock, AlertCircle, Database, FileText } from 'lucide-react';
import ApifyService from '../../services/apifyService';
import toast from 'react-hot-toast';

const RunDetail = () => {
    const { runId } = useParams();
    const navigate = useNavigate();
    const [run, setRun] = useState(null);
    const [logs, setLogs] = useState('');
    const [dataset, setDataset] = useState([]);
    const [datasetInfo, setDatasetInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [loadingDataset, setLoadingDataset] = useState(false);
    const [apiToken, setApiToken] = useState('');
    const [activeTab, setActiveTab] = useState('info');

    useEffect(() => {
        // Lấy API token từ localStorage
        let token = localStorage.getItem('apify_api_token') || '';
        if (!token) {
            // Không set token mặc định - yêu cầu user nhập
            console.warn('No API token found. Please set your Apify API token.');
        }
        setApiToken(token);
    }, []);

    useEffect(() => {
        if (runId && apiToken) {
            loadRunDetails();
            loadRunLogs();
            loadDatasetInfo(); // Load dataset info ngay khi vào trang
        }
    }, [runId, apiToken]);

    const loadRunDetails = async () => {
        try {
            console.log('=== Loading Run Details ===');
            console.log('Run ID:', runId);
            console.log('API Token:', apiToken ? 'Present' : 'Missing');

            const cleanRunId = runId?.trim();
            const apifyService = new ApifyService(apiToken);
            const response = await apifyService.getRun(cleanRunId);

            console.log('Run details response:', response);
            setRun(response);
        } catch (error) {
            console.error('Error loading run details:', error);
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            toast.error(`Không thể tải thông tin run: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const loadRunLogs = async () => {
        setLoadingLogs(true);
        try {
            console.log('=== Loading Run Logs ===');
            console.log('Run ID (original):', runId);
            console.log('Run ID (cleaned):', runId?.trim());
            console.log('API Token:', apiToken ? 'Present' : 'Missing');

            const cleanRunId = runId?.trim();
            const apifyService = new ApifyService(apiToken);
            const response = await apifyService.getRunLogs(cleanRunId);

            console.log('Logs API Response:', response);

            // Logs thường là text, không phải JSON
            if (typeof response === 'string') {
                setLogs(response);
            } else {
                setLogs(JSON.stringify(response, null, 2));
            }
        } catch (error) {
            console.error('Error loading logs:', error);
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            toast.error(`Không thể tải logs: ${error.message}`);
        } finally {
            setLoadingLogs(false);
        }
    };

    const loadDatasetInfo = async () => {
        try {
            console.log('=== Loading Dataset Info ===');
            const cleanRunId = runId?.trim();
            const apifyService = new ApifyService(apiToken);

            const datasetInfoResponse = await apifyService.getDatasetInfo(cleanRunId);
            setDatasetInfo(datasetInfoResponse);
            console.log('Dataset info loaded:', datasetInfoResponse);
        } catch (error) {
            console.warn('Could not load dataset info:', error);
            setDatasetInfo(null);
        }
    };

    const loadDataset = async () => {
        setLoadingDataset(true);
        try {
            console.log('=== Loading Dataset ===');
            console.log('Run ID (original):', runId);
            console.log('Run ID (typeof):', typeof runId);
            console.log('Run ID (length):', runId?.length);
            console.log('API Token:', apiToken ? 'Present' : 'Missing');

            // Đảm bảo runId không bị thay đổi
            const cleanRunId = runId?.trim();
            console.log('Run ID (cleaned):', cleanRunId);

            const apifyService = new ApifyService(apiToken);

            // Lấy dữ liệu dataset
            const response = await apifyService.getRunDataset(cleanRunId);
            console.log('Dataset API Response:', response);

            if (Array.isArray(response)) {
                setDataset(response);
            } else {
                setDataset([]);
                console.warn('Dataset response is not an array:', response);
            }
        } catch (error) {
            console.error('Error loading dataset:', error);
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            toast.error(`Không thể tải dataset: ${error.message}`);
            setDataset([]);
        } finally {
            setLoadingDataset(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        // Không cần load dataset nữa vì chỉ hiển thị export options
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'SUCCEEDED':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'FAILED':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'RUNNING':
                return <Clock className="h-4 w-4 text-blue-500" />;
            default:
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'SUCCEEDED':
                return 'Thành công';
            case 'FAILED':
                return 'Thất bại';
            case 'RUNNING':
                return 'Đang chạy';
            default:
                return status;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const formatDuration = (startedAt, finishedAt) => {
        if (!startedAt || !finishedAt) return 'N/A';
        const start = new Date(startedAt);
        const finish = new Date(finishedAt);
        const duration = Math.round((finish - start) / 1000);
        return `${duration}s`;
    };

    const formatUsage = (usage) => {
        return `$${parseFloat(usage).toFixed(3)}`;
    };

    const copyLogs = () => {
        navigator.clipboard.writeText(logs).then(() => {
            toast.success('Đã copy logs vào clipboard');
        }).catch(() => {
            toast.error('Không thể copy logs');
        });
    };

    const downloadLogs = () => {
        const blob = new Blob([logs], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `run-${runId}-logs.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Đã tải logs');
    };

    const downloadDataset = async (format = 'json') => {
        try {
            const cleanRunId = runId?.trim();
            const apifyService = new ApifyService(apiToken);
            const runDetails = await apifyService.getRun(cleanRunId);

            // Tìm dataset ID từ nhiều trường có thể có
            let datasetId = null;
            const datasetIdFields = ['defaultDatasetId', 'datasetId', 'defaultDataset', 'dataset'];

            for (const field of datasetIdFields) {
                if (runDetails[field]) {
                    datasetId = runDetails[field];
                    break;
                }
            }

            if (!datasetId) {
                toast.error('Không tìm thấy dataset ID');
                return;
            }

            // Tạo URL với format được chọn
            const url = `https://api.apify.com/v2/datasets/${datasetId}/items?clean=true&format=${format}&token=${apiToken}`;

            // Fetch data từ API
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Xử lý response theo format
            let data, mimeType, fileName;

            switch (format) {
                case 'json':
                    // Đọc response dưới dạng text trước, sau đó parse JSON
                    const jsonText = await response.text();
                    try {
                        data = JSON.parse(jsonText);
                        // Chuyển đổi thành JSON string với format đẹp
                        data = JSON.stringify(data, null, 2);
                    } catch (parseError) {
                        // Nếu không parse được JSON, sử dụng text gốc
                        data = jsonText;
                    }
                    mimeType = 'application/json';
                    fileName = `run-${runId}-dataset.json`;
                    break;
                case 'csv':
                    data = await response.text();
                    mimeType = 'text/csv';
                    fileName = `run-${runId}-dataset.csv`;
                    break;
                case 'xml':
                    data = await response.text();
                    mimeType = 'application/xml';
                    fileName = `run-${runId}-dataset.xml`;
                    break;
                case 'excel':
                    data = await response.arrayBuffer();
                    mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    fileName = `run-${runId}-dataset.xlsx`;
                    break;
                case 'html':
                    data = await response.text();
                    mimeType = 'text/html';
                    fileName = `run-${runId}-dataset.html`;
                    break;
                case 'rss':
                    data = await response.text();
                    mimeType = 'application/rss+xml';
                    fileName = `run-${runId}-dataset.rss`;
                    break;
                case 'jsonl':
                    data = await response.text();
                    mimeType = 'application/jsonl';
                    fileName = `run-${runId}-dataset.jsonl`;
                    break;
                default:
                    // Tương tự như JSON
                    const defaultText = await response.text();
                    try {
                        const defaultData = JSON.parse(defaultText);
                        data = JSON.stringify(defaultData, null, 2);
                    } catch (parseError) {
                        data = defaultText;
                    }
                    mimeType = 'application/json';
                    fileName = `run-${runId}-dataset.json`;
            }

            // Tạo blob và download
            const blob = new Blob([data], { type: mimeType });
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);

            toast.success(`Đã tải dataset dưới định dạng ${format.toUpperCase()}`);
        } catch (error) {
            console.error('Error downloading dataset:', error);
            toast.error(`Không thể tải dataset: ${error.message}`);
        }
    };

    const copyDatasetLink = async (format) => {
        try {
            const cleanRunId = runId?.trim();
            const apifyService = new ApifyService(apiToken);
            const runDetails = await apifyService.getRun(cleanRunId);

            // Tìm dataset ID từ nhiều trường có thể có
            let datasetId = null;
            const datasetIdFields = ['defaultDatasetId', 'datasetId', 'defaultDataset', 'dataset'];

            for (const field of datasetIdFields) {
                if (runDetails[field]) {
                    datasetId = runDetails[field];
                    break;
                }
            }

            if (!datasetId) {
                toast.error('Không tìm thấy dataset ID');
                return;
            }

            const link = `https://api.apify.com/v2/datasets/${datasetId}/items?clean=true&format=${format}&token=${apiToken}`;
            console.log('Copying dataset link:', link);
            navigator.clipboard.writeText(link).then(() => {
                toast.success(`Đã copy link dataset vào clipboard dưới định dạng ${format.toUpperCase()}`);
            }).catch(() => {
                toast.error('Không thể copy link');
            });
        } catch (error) {
            console.error('Error getting dataset link:', error);
            toast.error(`Không thể tạo link dataset: ${error.message}`);
        }
    };

    const openDatasetInNewTab = async (format) => {
        try {
            const cleanRunId = runId?.trim();
            const apifyService = new ApifyService(apiToken);
            const runDetails = await apifyService.getRun(cleanRunId);

            // Tìm dataset ID từ nhiều trường có thể có
            let datasetId = null;
            const datasetIdFields = ['defaultDatasetId', 'datasetId', 'defaultDataset', 'dataset'];

            for (const field of datasetIdFields) {
                if (runDetails[field]) {
                    datasetId = runDetails[field];
                    break;
                }
            }

            if (!datasetId) {
                toast.error('Không tìm thấy dataset ID');
                return;
            }

            const link = `https://api.apify.com/v2/datasets/${datasetId}/items?clean=true&format=${format}&token=${apiToken}`;
            console.log('Opening dataset link in new tab:', link);
            window.open(link, '_blank');
        } catch (error) {
            console.error('Error opening dataset link:', error);
            toast.error(`Không thể mở link dataset: ${error.message}`);
        }
    };

    const previewDataset = async (format) => {
        try {
            const cleanRunId = runId?.trim();
            const apifyService = new ApifyService(apiToken);
            const runDetails = await apifyService.getRun(cleanRunId);

            // Tìm dataset ID từ nhiều trường có thể có
            let datasetId = null;
            const datasetIdFields = ['defaultDatasetId', 'datasetId', 'defaultDataset', 'dataset'];

            for (const field of datasetIdFields) {
                if (runDetails[field]) {
                    datasetId = runDetails[field];
                    break;
                }
            }

            if (!datasetId) {
                toast.error('Không tìm thấy dataset ID');
                return;
            }

            const link = `https://api.apify.com/v2/datasets/${datasetId}/items?clean=true&format=${format}&token=${apiToken}`;
            console.log('Previewing dataset link:', link);
            window.open(link, '_blank');
        } catch (error) {
            console.error('Error previewing dataset:', error);
            toast.error(`Không thể xem trước dataset: ${error.message}`);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Đang tải thông tin run...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-6">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Run Details - {runId}
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Chi tiết và logs của run
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            {activeTab === 'logs' && (
                                <>
                                    <button
                                        onClick={copyLogs}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy Logs
                                    </button>
                                    <button
                                        onClick={downloadLogs}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </button>
                                </>
                            )}
                            {activeTab === 'storage' && (
                                <>
                                    <button
                                        onClick={async () => {
                                            const cleanRunId = runId?.trim();
                                            const apifyService = new ApifyService(apiToken);
                                            try {
                                                const runDetails = await apifyService.getRun(cleanRunId);
                                                setRun(runDetails);

                                                // Reload dataset info
                                                try {
                                                    const datasetInfoResponse = await apifyService.getDatasetInfo(cleanRunId);
                                                    setDatasetInfo(datasetInfoResponse);
                                                } catch (error) {
                                                    console.warn('Could not reload dataset info:', error);
                                                    setDatasetInfo(null);
                                                }

                                                toast.success('Đã làm mới thông tin dataset');
                                            } catch (error) {
                                                console.error('Error refreshing:', error);
                                                toast.error('Không thể làm mới thông tin');
                                            }
                                        }}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Làm mới
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        <button
                            onClick={() => handleTabChange('info')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'info'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4" />
                                <span>Thông tin</span>
                            </div>
                        </button>
                        <button
                            onClick={() => handleTabChange('logs')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'logs'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4" />
                                <span>Logs</span>
                            </div>
                        </button>
                        <button
                            onClick={() => handleTabChange('storage')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'storage'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center space-x-2">
                                <Database className="h-4 w-4" />
                                <span>Storage</span>
                                <span className="bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                                    {datasetInfo?.itemCount || datasetInfo?.cleanItemCount || dataset.length || 0}
                                </span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'info' && (
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">
                                Thông tin Run
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Run ID</p>
                                    <p className="text-sm text-gray-900 font-mono">{runId}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                    <div className="flex items-center space-x-2">
                                        {run?.status && getStatusIcon(run.status)}
                                        <span className="text-sm text-gray-900">
                                            {run?.status ? getStatusText(run.status) : 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Started</p>
                                    <p className="text-sm text-gray-900">
                                        {run?.startedAt ? formatDate(run.startedAt) : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Duration</p>
                                    <p className="text-sm text-gray-900">
                                        {run?.startedAt && run?.finishedAt ? formatDuration(run.startedAt, run.finishedAt) : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-medium text-gray-900">
                                    Logs
                                </h2>
                                <button
                                    onClick={loadRunLogs}
                                    disabled={loadingLogs}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    {loadingLogs ? 'Đang tải...' : 'Làm mới'}
                                </button>
                            </div>
                        </div>

                        {loadingLogs ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <div className="p-6">
                                {logs ? (
                                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                                        <pre className="whitespace-pre-wrap">{logs}</pre>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500">Không có logs</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'storage' && (
                    <div className="space-y-6">
                        {/* Dataset Info */}
                        {datasetInfo && (
                            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-lg font-medium text-gray-900">
                                        Dataset Info
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Dataset ID</p>
                                            <p className="text-sm text-gray-900 font-mono">{datasetInfo.id}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Name</p>
                                            <p className="text-sm text-gray-900">{datasetInfo.name || 'Unnamed'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Items</p>
                                            <p className="text-sm text-gray-900">{datasetInfo.itemCount || dataset.length}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Size</p>
                                            <p className="text-sm text-gray-900">{datasetInfo.cleanItemCount || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Export Dataset */}
                        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">
                                    Export Dataset
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-6">
                                    {/* Format Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Format
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {[
                                                { value: 'json', label: 'JSON', checked: true },
                                                { value: 'csv', label: 'CSV' },
                                                { value: 'xml', label: 'XML' },
                                                { value: 'excel', label: 'Excel' },
                                                { value: 'html', label: 'HTML Table' },
                                                { value: 'rss', label: 'RSS' },
                                                { value: 'jsonl', label: 'JSONL' }
                                            ].map((format) => (
                                                <label key={format.value} className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="exportFormat"
                                                        value={format.value}
                                                        defaultChecked={format.checked}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700">{format.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Advanced Options */}
                                    <div>
                                        <button
                                            type="button"
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            onClick={() => {
                                                // Toggle advanced options
                                                const advancedSection = document.getElementById('advanced-options');
                                                if (advancedSection) {
                                                    advancedSection.classList.toggle('hidden');
                                                }
                                            }}
                                        >
                                            Advanced options &gt;
                                        </button>
                                        <div id="advanced-options" className="hidden mt-3 p-4 bg-gray-50 rounded-md">
                                            <div className="space-y-3">
                                                <label className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700">Clean items only</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700">Include metadata</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={async () => {
                                                const format = document.querySelector('input[name="exportFormat"]:checked')?.value || 'json';
                                                await downloadDataset(format);
                                            }}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                        </button>
                                        <button
                                            onClick={async () => {
                                                const format = document.querySelector('input[name="exportFormat"]:checked')?.value || 'json';
                                                await openDatasetInNewTab(format);
                                            }}
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            View in new tab
                                        </button>
                                        <button
                                            onClick={async () => {
                                                const format = document.querySelector('input[name="exportFormat"]:checked')?.value || 'json';
                                                await copyDatasetLink(format);
                                            }}
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy link
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RunDetail;
