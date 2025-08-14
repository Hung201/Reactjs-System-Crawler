import React, { useState } from 'react';
import { Trash2, Settings, CheckCircle, XCircle, Play, AlertCircle } from 'lucide-react';

const PlatformCard = ({ platform, isSelected, onSelect, onRemove, onTestConnection, isTesting }) => {
    const [showConfirm, setShowConfirm] = useState(false);

    // Validate platform data
    if (!platform || typeof platform !== 'object') {
        return null;
    }

    const getPlatformIcon = (type) => {
        switch (type) {
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

    const getPlatformName = (type) => {
        switch (type) {
            case 'apify':
                return 'Apify';
            case 'scrapingbee':
                return 'ScrapingBee';
            case 'brightdata':
                return 'Bright Data';
            default:
                return 'Custom Platform';
        }
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        setShowConfirm(true);
    };

    const confirmRemove = (e) => {
        e.stopPropagation();
        onRemove();
        setShowConfirm(false);
    };

    const cancelRemove = (e) => {
        e.stopPropagation();
        setShowConfirm(false);
    };

    const handleTestConnection = (e) => {
        e.stopPropagation();
        if (onTestConnection) {
            onTestConnection(platform._id || platform.id);
        }
    };

    return (
        <div className="relative">
            <div
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                onClick={onSelect}
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                        {getPlatformIcon(platform.type)}
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                                {platform.name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                                {getPlatformName(platform.type)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-1">
                        {platform.testStatus === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" title="Kết nối thành công" />
                        ) : platform.testStatus === 'failed' ? (
                            <AlertCircle className="h-4 w-4 text-red-500" title="Kết nối thất bại" />
                        ) : platform.isActive ? (
                            <CheckCircle className="h-4 w-4 text-green-500" title="Đang hoạt động" />
                        ) : (
                            <XCircle className="h-4 w-4 text-red-500" title="Không hoạt động" />
                        )}

                        <button
                            onClick={handleTestConnection}
                            disabled={isTesting}
                            className="text-gray-400 hover:text-blue-500 transition-colors p-1 disabled:opacity-50"
                            title="Test kết nối"
                        >
                            <Play className="h-4 w-4" />
                        </button>

                        <button
                            onClick={handleRemove}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            title="Xóa platform"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {platform.description && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                        {platform.description}
                    </p>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-400">
                        Tạo: {platform.createdAt ? new Date(platform.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-400">
                        {platform.lastTested ? `Test: ${new Date(typeof platform.lastTested === 'object' ? platform.lastTested.value || platform.lastTested.date : platform.lastTested).toLocaleDateString('vi-VN')}` : 'Chưa test'}
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="absolute inset-0 bg-white rounded-lg border-2 border-red-200 p-4 z-10">
                    <div className="text-center">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Trash2 className="h-4 w-4 text-red-600" />
                        </div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Xóa Platform
                        </h4>
                        <p className="text-xs text-gray-500 mb-4">
                            Bạn có chắc chắn muốn xóa platform "{platform.name}"?
                        </p>
                        <div className="flex space-x-2">
                            <button
                                onClick={cancelRemove}
                                className="flex-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={confirmRemove}
                                className="flex-1 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlatformCard;
