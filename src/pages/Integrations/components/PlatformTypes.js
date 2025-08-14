import React, { useState, useEffect } from 'react';
import { Info, CheckCircle } from 'lucide-react';
import { platformsAPI } from '../../../services/api';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

const PlatformTypes = () => {
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Add delay to avoid rate limiting
        const timer = setTimeout(() => {
            loadPlatformTypes();
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    const loadPlatformTypes = async (retryCount = 0) => {
        try {
            setLoading(true);
            setError(null);
            const response = await platformsAPI.getAvailableTypes();
            if (response.success) {
                setTypes(response.data || []);
            }
        } catch (error) {
            console.error('Error loading platform types:', error);

            // Retry logic for rate limiting
            if (error.response?.status === 429 && retryCount < 3) {
                const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
                setTimeout(() => {
                    loadPlatformTypes(retryCount + 1);
                }, delay);
                return;
            }

            setError(error.message || 'Không thể tải loại platform');
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = (type) => {
        const typeValue = typeof type === 'object' ? type.value : type;
        switch (typeValue) {
            case 'apify':
                return (
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">A</span>
                    </div>
                );
            case 'scrapingbee':
                return (
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <span className="text-yellow-600 font-bold text-sm">S</span>
                    </div>
                );
            case 'brightdata':
                return (
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-600 font-bold text-sm">B</span>
                    </div>
                );
            default:
                return (
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-600 font-bold text-sm">?</span>
                    </div>
                );
        }
    };

    const getTypeDescription = (type) => {
        const typeValue = typeof type === 'object' ? type.value : type;
        switch (typeValue) {
            case 'apify':
                return 'Web scraping và automation platform với nhiều actors có sẵn';
            case 'scrapingbee':
                return 'Web scraping API service với proxy rotation';
            case 'brightdata':
                return 'Data collection platform với residential proxies';
            default:
                return 'Custom platform integration';
        }
    };

    if (loading) {
        return <LoadingState message="Đang tải loại platform..." />;
    }

    if (error) {
        return <ErrorState message={error} onRetry={() => loadPlatformTypes()} />;
    }

    // Fallback types if API fails
    const fallbackTypes = ['apify', 'scrapingbee', 'brightdata', 'custom'];
    const displayTypes = types.length > 0 ? types : fallbackTypes;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Loại Platform Hỗ Trợ</h3>
                <button
                    onClick={loadPlatformTypes}
                    className="text-sm text-blue-600 hover:text-blue-800"
                >
                    Làm mới
                </button>
            </div>

            <div className="space-y-4">
                {displayTypes.map((type, index) => (
                    <div key={index} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        {getTypeIcon(type)}
                        <div className="ml-4 flex-1">
                            <h4 className="text-sm font-medium text-gray-900 capitalize">
                                {typeof type === 'object' ? (type.value || type.label || 'Unknown') : type}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                                {getTypeDescription(typeof type === 'object' ? type.value : type)}
                            </p>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-1">
                            Thông tin Platform
                        </h4>
                        <p className="text-xs text-blue-700">
                            Mỗi loại platform có các tính năng và API riêng.
                            Hãy chọn loại platform phù hợp với nhu cầu của bạn.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlatformTypes;
