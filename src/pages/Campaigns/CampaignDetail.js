import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Play,
    Pause,
    Settings,
    BarChart3,
    Calendar,
    Clock,
    User,
    Target,
    Code,
    FileText,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Info
} from 'lucide-react';
import { CAMPAIGN_STATUS, CAMPAIGN_STATUS_LABELS } from '../../utils/constants';

const CampaignDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isRunning, setIsRunning] = useState(false);

    // Mock data - trong thực tế sẽ fetch từ API
    useEffect(() => {
        // Simulate API call
        const mockCampaign = {
            id: id,
            name: 'Crawl sản phẩm B2B Daisan',
            description: 'Crawl sản phẩm từ website B2B Daisan với các thông số tùy chỉnh',
            actorId: 'daisan/multi-website-product-crawler',
            status: CAMPAIGN_STATUS.ACTIVE,
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-20T14:20:00Z',
            createdBy: 'admin@daisan.vn',
            runsCount: 25,
            successRate: 92,
            lastRun: '2024-01-20T14:20:00Z',
            totalDataCollected: 1250,
            averageRunTime: '15 phút',
            inputSchema: {
                url: 'https://b2b.daisan.vn/products/gach-op-tuong',
                paginationPattern: '?page=',
                pageStart: 1,
                pageEnd: 5,
                productLinkSelector: '.list-item-img a',
                productLinkIncludePatterns: [],
                productLinkExcludePatterns: [],
                titleSelector: '.product-detail_title h1',
                descriptionSelector: ''
            },
            recentRuns: [
                {
                    id: 'run-1',
                    status: 'success',
                    startedAt: '2024-01-20T14:20:00Z',
                    completedAt: '2024-01-20T14:35:00Z',
                    dataCollected: 45,
                    errors: 0
                },
                {
                    id: 'run-2',
                    status: 'success',
                    startedAt: '2024-01-19T10:15:00Z',
                    completedAt: '2024-01-19T10:30:00Z',
                    dataCollected: 42,
                    errors: 1
                },
                {
                    id: 'run-3',
                    status: 'failed',
                    startedAt: '2024-01-18T16:45:00Z',
                    completedAt: '2024-01-18T16:50:00Z',
                    dataCollected: 0,
                    errors: 5
                }
            ]
        };
        setCampaign(mockCampaign);
    }, [id]);

    const handleRunCampaign = () => {
        setIsRunning(true);
        // Simulate running campaign
        setTimeout(() => {
            setIsRunning(false);
            // Update campaign data
            setCampaign(prev => ({
                ...prev,
                runsCount: prev.runsCount + 1,
                lastRun: new Date().toISOString()
            }));
        }, 3000);
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
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'failed':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'running':
                return <Clock className="w-5 h-5 text-blue-500" />;
            default:
                return <Info className="w-5 h-5 text-gray-500" />;
        }
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

                <div className="flex items-center gap-3">
                    {campaign.status === CAMPAIGN_STATUS.ACTIVE ? (
                        <button
                            onClick={() => handleStatusChange(CAMPAIGN_STATUS.PAUSED)}
                            className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                        >
                            <Pause size={16} />
                            Tạm dừng
                        </button>
                    ) : (
                        <button
                            onClick={() => handleStatusChange(CAMPAIGN_STATUS.ACTIVE)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        >
                            <Play size={16} />
                            Kích hoạt
                        </button>
                    )}

                    <button
                        onClick={handleRunCampaign}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                    >
                        {isRunning ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Đang chạy...
                            </>
                        ) : (
                            <>
                                <Play size={16} />
                                Chạy ngay
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Status Badge */}
            <div className="mb-6">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                    {CAMPAIGN_STATUS_LABELS[campaign.status]}
                </span>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <BarChart3 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Tổng lần chạy</p>
                            <p className="text-2xl font-bold text-gray-900">{campaign.runsCount}</p>
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
                            <p className="text-2xl font-bold text-gray-900">{campaign.successRate}%</p>
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
                            <p className="text-2xl font-bold text-gray-900">{campaign.totalDataCollected}</p>
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
                            <p className="text-2xl font-bold text-gray-900">{campaign.averageRunTime}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'overview'
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Tổng quan
                        </button>
                        <button
                            onClick={() => setActiveTab('schema')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'schema'
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Input Schema
                        </button>
                        <button
                            onClick={() => setActiveTab('runs')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'runs'
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Lịch sử chạy
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'settings'
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Cài đặt
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin chiến dịch</h3>
                                    <dl className="space-y-3">
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Actor ID:</dt>
                                            <dd className="text-sm text-gray-900">{campaign.actorId}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Tạo bởi:</dt>
                                            <dd className="text-sm text-gray-900">{campaign.createdBy}</dd>
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
                                                <span className="text-gray-900">{campaign.successRate}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-green-600 h-2 rounded-full"
                                                    style={{ width: `${campaign.successRate}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">Dữ liệu trung bình/lần</span>
                                                <span className="text-gray-900">
                                                    {campaign.runsCount > 0 ? Math.round(campaign.totalDataCollected / campaign.runsCount) : 0}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'schema' && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Input Schema Configuration</h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <pre className="text-sm text-gray-800 overflow-x-auto">
                                    {JSON.stringify(campaign.inputSchema, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}

                    {activeTab === 'runs' && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Lịch sử chạy gần đây</h3>
                            <div className="space-y-3">
                                {campaign.recentRuns.map((run) => (
                                    <div key={run.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            {getRunStatusIcon(run.status)}
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    Run #{run.id}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatDate(run.startedAt)} - {formatDate(run.completedAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-900">{run.dataCollected} items</p>
                                            {run.errors > 0 && (
                                                <p className="text-xs text-red-600">{run.errors} errors</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default CampaignDetail;
