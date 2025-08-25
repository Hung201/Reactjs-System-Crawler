import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Download, Clock, Calendar, DollarSign, CheckCircle, XCircle, AlertCircle, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import ApifyService from '../../services/apifyService';
import toast from 'react-hot-toast';

const ActorDetail = () => {
    const { actorId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('runs');
    const [actor, setActor] = useState(null);
    const [runs, setRuns] = useState([]);
    const [builds, setBuilds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingRuns, setLoadingRuns] = useState(false);
    const [apiToken, setApiToken] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [totalRuns, setTotalRuns] = useState(0);

    // Builds pagination state
    const [currentBuildsPage, setCurrentBuildsPage] = useState(1);
    const [buildsItemsPerPage, setBuildsItemsPerPage] = useState(20);
    const [totalBuilds, setTotalBuilds] = useState(0);
    const [loadingBuilds, setLoadingBuilds] = useState(false);
    const [dataLoaded, setDataLoaded] = useState({ actor: false, runs: false, builds: false });

    // Timeout để tránh loading vô tận
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (loading) {
                setLoading(false);
                toast.error('Tải dữ liệu quá lâu, vui lòng thử lại');
            }
        }, 10000); // 10 giây

        return () => clearTimeout(timeout);
    }, [loading]);

    useEffect(() => {
        // Lấy API token từ localStorage hoặc context
        let token = localStorage.getItem('apify_api_token') || '';

        // Nếu không có token, không set token mặc định
        if (!token) {
            console.warn('No API token found. Please set your Apify API token.');
        }

        setApiToken(token);
    }, []);

    useEffect(() => {
        if (actorId && apiToken) {
            loadActorDetails();
            loadRuns();
            loadBuilds(); // Load builds ngay từ đầu
        } else {
            setLoading(false);
        }
    }, [actorId, apiToken]);

    // Kiểm tra khi nào tất cả dữ liệu đã được load
    useEffect(() => {
        if (dataLoaded.actor && dataLoaded.runs && dataLoaded.builds) {
            setLoading(false);
        }
    }, [dataLoaded]);

    const loadActorDetails = async () => {
        try {
            const apifyService = new ApifyService(apiToken);
            const response = await apifyService.getActor(actorId);
            setActor(response.data);
            setDataLoaded(prev => ({ ...prev, actor: true }));
        } catch (error) {
            console.error('Error loading actor details:', error);
            toast.error('Không thể tải thông tin actor');
            setDataLoaded(prev => ({ ...prev, actor: true })); // Mark as loaded even if error
        }
    };

    const loadRuns = async () => {
        setLoadingRuns(true);
        try {
            const apifyService = new ApifyService(apiToken);
            const response = await apifyService.getActorRuns(actorId, itemsPerPage, 0);
            // Sắp xếp runs theo thời gian startedAt giảm dần (mới nhất lên đầu)
            const sortedRuns = (response.data?.items || []).sort((a, b) => {
                const dateA = new Date(a.startedAt);
                const dateB = new Date(b.startedAt);
                return dateB - dateA; // Giảm dần (mới nhất trước)
            });

            setRuns(sortedRuns);
            setTotalRuns(response.data?.total || sortedRuns.length);
            setCurrentPage(1); // Reset to first page when loading new data
        } catch (error) {
            console.error('Error loading runs:', error);
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            toast.error(`Không thể tải danh sách runs: ${error.message}`);
        } finally {
            setLoadingRuns(false);
            setDataLoaded(prev => ({ ...prev, runs: true }));
        }
    };

    const loadRunsForPage = async (offset) => {
        setLoadingRuns(true);
        try {
            const apifyService = new ApifyService(apiToken);
            const response = await apifyService.getActorRuns(actorId, itemsPerPage, offset);
            // Sắp xếp runs theo thời gian startedAt giảm dần
            const sortedRuns = (response.data?.items || []).sort((a, b) => {
                const dateA = new Date(a.startedAt);
                const dateB = new Date(b.startedAt);
                return dateB - dateA;
            });

            setRuns(sortedRuns);
            setTotalRuns(response.data?.total || sortedRuns.length);
        } catch (error) {
            console.error('Error loading runs for page:', error);
            toast.error(`Không thể tải danh sách runs: ${error.message}`);
        } finally {
            setLoadingRuns(false);
        }
    };

    const loadBuilds = async () => {
        setLoadingBuilds(true);
        try {
            const apifyService = new ApifyService(apiToken);
            const response = await apifyService.getActorBuilds(actorId, buildsItemsPerPage, 0);
            // Sắp xếp builds theo thời gian startedAt giảm dần (mới nhất lên đầu)
            const sortedBuilds = (response.data?.items || []).sort((a, b) => {
                const dateA = new Date(a.startedAt);
                const dateB = new Date(b.startedAt);
                return dateB - dateA; // Giảm dần (mới nhất trước)
            });

            setBuilds(sortedBuilds);
            setTotalBuilds(response.data?.total || sortedBuilds.length);
            setCurrentBuildsPage(1); // Reset to first page when loading new data
        } catch (error) {
            console.error('Error loading builds:', error);
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            toast.error(`Không thể tải danh sách builds: ${error.message}`);
        } finally {
            setLoadingBuilds(false);
            setDataLoaded(prev => ({ ...prev, builds: true }));
        }
    };

    const loadBuildsForPage = async (offset) => {
        setLoadingBuilds(true);
        try {
            const apifyService = new ApifyService(apiToken);
            const response = await apifyService.getActorBuilds(actorId, buildsItemsPerPage, offset);
            // Sắp xếp builds theo thời gian startedAt giảm dần
            const sortedBuilds = (response.data?.items || []).sort((a, b) => {
                const dateA = new Date(a.startedAt);
                const dateB = new Date(b.startedAt);
                return dateB - dateA;
            });

            setBuilds(sortedBuilds);
            setTotalBuilds(response.data?.total || sortedBuilds.length);
        } catch (error) {
            console.error('Error loading builds for page:', error);
            toast.error(`Không thể tải danh sách builds: ${error.message}`);
        } finally {
            setLoadingBuilds(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
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

    // Pagination calculations
    const totalPages = Math.ceil(totalRuns / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Builds pagination calculations
    const totalBuildsPages = Math.ceil(totalBuilds / buildsItemsPerPage);
    const buildsStartIndex = (currentBuildsPage - 1) * buildsItemsPerPage;
    const buildsEndIndex = buildsStartIndex + buildsItemsPerPage;

    const handlePageChange = (page) => {
        setCurrentPage(page);
        // Load data for the new page
        const newOffset = (page - 1) * itemsPerPage;
        loadRunsForPage(newOffset);
        // Scroll to top of table
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset to first page
        loadRunsForPage(0); // Load first page with new items per page
    };

    const handleBuildsPageChange = (page) => {
        setCurrentBuildsPage(page);
        // Load data for the new page
        const newOffset = (page - 1) * buildsItemsPerPage;
        loadBuildsForPage(newOffset);
        // Scroll to top of table
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBuildsItemsPerPageChange = (newItemsPerPage) => {
        setBuildsItemsPerPage(newItemsPerPage);
        setCurrentBuildsPage(1); // Reset to first page
        loadBuildsForPage(0); // Load first page with new items per page
    };

    // Pagination component
    const Pagination = () => {
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
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700">Hiển thị:</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span className="text-sm text-gray-700">trên trang</span>
                    </div>
                    <span className="text-sm text-gray-700">
                        Hiển thị {startIndex + 1}-{Math.min(endIndex, totalRuns)} của {totalRuns} runs
                    </span>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    {getPageNumbers().map((page, index) => (
                        <button
                            key={index}
                            onClick={() => typeof page === 'number' && handlePageChange(page)}
                            disabled={page === '...'}
                            className={`px-3 py-1 text-sm font-medium rounded-md ${page === currentPage
                                ? 'bg-blue-600 text-white'
                                : page === '...'
                                    ? 'text-gray-400 cursor-default'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    };

    // Builds Pagination component
    const BuildsPagination = () => {
        const getPageNumbers = () => {
            const pages = [];
            const maxVisiblePages = 5;

            if (totalBuildsPages <= maxVisiblePages) {
                for (let i = 1; i <= totalBuildsPages; i++) {
                    pages.push(i);
                }
            } else {
                if (currentBuildsPage <= 3) {
                    for (let i = 1; i <= 4; i++) {
                        pages.push(i);
                    }
                    pages.push('...');
                    pages.push(totalBuildsPages);
                } else if (currentBuildsPage >= totalBuildsPages - 2) {
                    pages.push(1);
                    pages.push('...');
                    for (let i = totalBuildsPages - 3; i <= totalBuildsPages; i++) {
                        pages.push(i);
                    }
                } else {
                    pages.push(1);
                    pages.push('...');
                    for (let i = currentBuildsPage - 1; i <= currentBuildsPage + 1; i++) {
                        pages.push(i);
                    }
                    pages.push('...');
                    pages.push(totalBuildsPages);
                }
            }

            return pages;
        };

        return (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700">Hiển thị:</span>
                        <select
                            value={buildsItemsPerPage}
                            onChange={(e) => handleBuildsItemsPerPageChange(Number(e.target.value))}
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span className="text-sm text-gray-700">trên trang</span>
                    </div>
                    <span className="text-sm text-gray-700">
                        Hiển thị {buildsStartIndex + 1}-{Math.min(buildsEndIndex, totalBuilds)} của {totalBuilds} builds
                    </span>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handleBuildsPageChange(currentBuildsPage - 1)}
                        disabled={currentBuildsPage === 1}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    {getPageNumbers().map((page, index) => (
                        <button
                            key={index}
                            onClick={() => typeof page === 'number' && handleBuildsPageChange(page)}
                            disabled={page === '...'}
                            className={`px-3 py-1 text-sm font-medium rounded-md ${page === currentBuildsPage
                                ? 'bg-blue-600 text-white'
                                : page === '...'
                                    ? 'text-gray-400 cursor-default'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => handleBuildsPageChange(currentBuildsPage + 1)}
                        disabled={currentBuildsPage === totalBuildsPages}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Đang tải thông tin actor...</p>
                    {!apiToken && (
                        <p className="text-red-500 text-sm mt-2">Không tìm thấy API token</p>
                    )}
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
                                onClick={() => navigate('/integrations')}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {actor?.name || 'Actor Detail'}
                                </h1>
                                <p className="text-sm text-gray-500">
                                    {actor?.description || 'Chi tiết actor'}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        <button
                            onClick={() => handleTabChange('runs')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'runs'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center space-x-2">
                                <span>Runs</span>
                                <span className="bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                                    {totalRuns}
                                </span>
                            </div>
                        </button>
                        <button
                            onClick={() => handleTabChange('builds')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'builds'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center space-x-2">
                                <span>Builds</span>
                                <span className="bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                                    {totalBuilds}
                                </span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'runs' && (
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-medium text-gray-900">
                                    Danh sách Runs
                                </h2>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={loadRuns}
                                        disabled={loadingRuns}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        {loadingRuns ? 'Đang tải...' : 'Làm mới'}
                                    </button>
                                    <button
                                        onClick={async () => {
                                            try {
                                                const response = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${apiToken}&limit=10`);
                                                const data = await response.json();
                                                toast.success(`API Test: ${response.status === 200 ? 'Success' : 'Failed'}`);
                                            } catch (error) {
                                                toast.error('API Test Failed');
                                            }
                                        }}
                                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                                    >
                                        Test API
                                    </button>
                                    <button
                                        onClick={() => {
                                            const token = prompt('Nhập API Token:', apiToken || '');
                                            if (token) {
                                                localStorage.setItem('apify_api_token', token);
                                                setApiToken(token);
                                                toast.success('API Token đã được lưu');
                                                // Reload data after setting token
                                                setTimeout(() => {
                                                    loadActorDetails();
                                                    loadRuns();
                                                }, 500);
                                            }
                                        }}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                    >
                                        {apiToken ? 'Change API Token' : 'Set API Token'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {loadingRuns ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Run ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Build
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Usage
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Started
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Finished
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Duration
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Origin
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {runs.map((run) => (
                                            <tr key={run.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(run.status)}
                                                        <span className="text-sm text-gray-900">
                                                            {getStatusText(run.status)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div
                                                        className="text-sm font-mono text-blue-600 hover:text-blue-800 cursor-pointer"
                                                        onClick={() => navigate(`/integrations/run/${run.id}`)}
                                                        title="Xem chi tiết run"
                                                    >
                                                        {run.id}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {run.buildNumber}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {formatUsage(run.usageTotalUsd)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {formatDate(run.startedAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {run.finishedAt ? formatDate(run.finishedAt) : 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {formatDuration(run.startedAt, run.finishedAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {run.meta?.origin || 'N/A'}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalRuns > 0 && !loadingRuns && <Pagination />}

                        {runs.length === 0 && !loadingRuns && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 mb-4">Không có runs nào</p>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-md mx-auto">
                                    <p className="text-xs text-gray-600 mb-2">
                                        <strong>Debug Info:</strong>
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        Actor ID: {actorId}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        API Token: {apiToken ? 'Present' : 'Missing'}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        Total runs: {totalRuns}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        Current page: {currentPage}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'builds' && (
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-medium text-gray-900">
                                    Danh sách Builds
                                </h2>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={loadBuilds}
                                        disabled={loadingBuilds}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        {loadingBuilds ? 'Đang tải...' : 'Làm mới'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {loadingBuilds ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Build Number
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Usage
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Started
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Finished
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Duration
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Origin
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {builds.map((build) => (
                                            <tr key={build.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(build.status)}
                                                        <span className="text-sm text-gray-900">
                                                            {getStatusText(build.status)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-mono text-gray-900">
                                                        {build.buildNumber}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {formatUsage(build.usageTotalUsd)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {formatDate(build.startedAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {build.finishedAt ? formatDate(build.finishedAt) : 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {formatDuration(build.startedAt, build.finishedAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {build.meta?.origin || 'N/A'}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Builds Pagination */}
                        {totalBuilds > 0 && !loadingBuilds && <BuildsPagination />}

                        {builds.length === 0 && !loadingBuilds && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 mb-4">Không có builds nào</p>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-md mx-auto">
                                    <p className="text-xs text-gray-600 mb-2">
                                        <strong>Debug Info:</strong>
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        Actor ID: {actorId}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        API Token: {apiToken ? 'Present' : 'Missing'}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        Total builds: {totalBuilds}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        Current page: {currentBuildsPage}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActorDetail;
