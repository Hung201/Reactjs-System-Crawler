import React, { useState, useEffect } from 'react';
import { Info, CheckCircle } from 'lucide-react';
import { platformsAPI } from '../../services/api';
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

            // Nếu API không có endpoint này, sử dụng fallback types
            console.log('Using fallback platform types');
            setTypes([]); // Sẽ sử dụng fallback types trong render
            setError(null); // Không hiển thị lỗi vì có fallback
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
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-4 sm:p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Loại Platform Hỗ Trợ</h3>
                <button
                    onClick={loadPlatformTypes}
                    className="text-sm text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
                >
                    Làm mới
                </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
                {displayTypes.map((type, index) => (
                    <div key={index} className="flex items-center p-3 border-2 border-gray-200/50 rounded-lg hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-200">
                        {getTypeIcon(type)}
                        <div className="ml-3 flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 capitalize truncate">
                                {typeof type === 'object' ? (type.value || type.label || 'Unknown') : type}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                                {getTypeDescription(typeof type === 'object' ? type.value : type)}
                            </p>
                        </div>
                        <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 rounded-lg border border-blue-200/50">
                <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mr-2">
                        <Info className="h-3 w-3 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-xs font-bold text-blue-900 mb-1">
                            Thông tin Platform
                        </h4>
                        <p className="text-xs text-blue-700 leading-relaxed">
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
