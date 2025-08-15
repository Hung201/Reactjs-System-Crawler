import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Activity, CheckCircle, XCircle, Clock } from 'lucide-react';
import { platformsAPI } from '../../services/api';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

const PlatformStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Add delay to avoid rate limiting
        const timer = setTimeout(() => {
            loadStats();
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const loadStats = async (retryCount = 0) => {
        try {
            setLoading(true);
            setError(null);
            const response = await platformsAPI.getStats();
            if (response.success) {
                // Lấy dữ liệu thống kê từ response.statistics
                setStats(response.statistics || response.data);
            }
        } catch (error) {
            console.error('Error loading platform stats:', error);

            // Retry logic for rate limiting
            if (error.response?.status === 429 && retryCount < 3) {
                const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
                setTimeout(() => {
                    loadStats(retryCount + 1);
                }, delay);
                return;
            }

            setError(error.message || 'Không thể tải thống kê');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingState message="Đang tải thống kê..." />;
    }

    if (error) {
        return <ErrorState message={error} onRetry={() => loadStats()} />;
    }

    if (!stats) {
        return <ErrorState message="Không có dữ liệu thống kê" />;
    }

    const statCards = [
        {
            title: 'Tổng Platforms',
            value: stats.totalPlatforms || 0,
            icon: BarChart3,
            color: 'bg-blue-500',
            textColor: 'text-blue-600'
        },
        {
            title: 'Đang hoạt động',
            value: stats.activePlatforms || 0,
            icon: CheckCircle,
            color: 'bg-green-500',
            textColor: 'text-green-600'
        },
        {
            title: 'Kết nối thành công',
            value: stats.successfulConnections || 0,
            icon: Activity,
            color: 'bg-green-500',
            textColor: 'text-green-600'
        },
        {
            title: 'Kết nối thất bại',
            value: stats.failedConnections || 0,
            icon: XCircle,
            color: 'bg-red-500',
            textColor: 'text-red-600'
        }
    ];

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-4 sm:p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Thống kê Platforms</h3>
                <button
                    onClick={loadStats}
                    className="text-sm text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
                >
                    Làm mới
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {statCards.map((stat, index) => {
                    const IconComponent = stat.icon;
                    return (
                        <div key={index} className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-lg p-3 border border-gray-200/50 hover:shadow-sm transition-all duration-200">
                            <div className="flex items-center">
                                <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10 shadow-sm`}>
                                    <IconComponent className={`h-5 w-5 ${stat.textColor}`} />
                                </div>
                                <div className="ml-2 flex-1 min-w-0">
                                    <p className="text-lg font-bold text-gray-900 truncate">
                                        {stat.value}
                                    </p>
                                    <p className="text-xs text-gray-600 truncate">
                                        {stat.title}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {stats.platformTypes && Object.keys(stats.platformTypes).length > 0 && (
                <div className="mt-4">
                    <h4 className="text-sm font-bold text-gray-900 mb-2">Phân bố theo loại</h4>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                        {Object.entries(stats.platformTypes).map(([type, count]) => (
                            <div key={type} className="flex items-center justify-between p-2 bg-gray-50/50 rounded-lg">
                                <span className="text-xs text-gray-600 capitalize font-medium">{type}</span>
                                <span className="text-xs font-bold text-gray-900">
                                    {typeof count === 'object' ? (count.value || count.count || 0) : count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlatformStats;
