import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Copy, ExternalLink, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import ApifyService from '../../services/apifyService';
import toast from 'react-hot-toast';

const RunDetail = () => {
    const { runId } = useParams();
    const navigate = useNavigate();
    const [run, setRun] = useState(null);
    const [logs, setLogs] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [apiToken, setApiToken] = useState('');

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
        }
    }, [runId, apiToken]);

    const loadRunDetails = async () => {
        try {
            // Lấy thông tin run từ API (có thể cần thêm method này)
            // const apifyService = new ApifyService(apiToken);
            // const response = await apifyService.getRun(runId);
            // setRun(response.data);

            // Tạm thời set loading false
            setLoading(false);
        } catch (error) {
            console.error('Error loading run details:', error);
            toast.error('Không thể tải thông tin run');
            setLoading(false);
        }
    };

    const loadRunLogs = async () => {
        setLoadingLogs(true);
        try {
            console.log('=== Loading Run Logs ===');
            console.log('Run ID:', runId);
            console.log('API Token:', apiToken ? 'Present' : 'Missing');

            const apifyService = new ApifyService(apiToken);
            const response = await apifyService.getRunLogs(runId);

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
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Run Info */}
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

                {/* Logs */}
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
            </div>
        </div>
    );
};

export default RunDetail;
