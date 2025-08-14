import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Activity, CheckCircle, XCircle, Clock } from 'lucide-react';
import { platformsAPI } from '../../../services/api';
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
                setStats(response.data);
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Thống kê Platforms</h3>
                <button
                    onClick={loadStats}
                    className="text-sm text-blue-600 hover:text-blue-800"
                >
                    Làm mới
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => {
                    const IconComponent = stat.icon;
                    return (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
                                    <IconComponent className={`h-5 w-5 ${stat.textColor}`} />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">
                                        {stat.value}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {stat.title}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {stats.platformTypes && (
                <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Phân bố theo loại</h4>
                    <div className="space-y-2">
                        {Object.entries(stats.platformTypes).map(([type, count]) => (
                            <div key={type} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 capitalize">{type}</span>
                                <span className="text-sm font-medium text-gray-900">
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
