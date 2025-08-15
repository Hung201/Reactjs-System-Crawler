import React, { useState } from 'react';
import { Trash2, Settings, CheckCircle, XCircle, Play, AlertCircle } from 'lucide-react';

const PlatformCard = ({ platform, isSelected, onSelect, onRemove, onTestConnection, isTesting }) => {

    // Validate platform data
    if (!platform || typeof platform !== 'object') {
        return null;
    }

    const getPlatformIcon = (type) => {
        switch (type) {
            case 'apify':
                return (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-sm">A</span>
                    </div>
                );
            case 'scrapingbee':
                return (
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-sm">S</span>
                    </div>
                );
            case 'brightdata':
                return (
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-sm">B</span>
                    </div>
                );
            default:
                return (
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-slate-600 rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-sm">?</span>
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
        if (onRemove) {
            onRemove(platform);
        }
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
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-102 ${isSelected
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg'
                    : 'border-gray-200 bg-white/90 backdrop-blur-sm hover:border-blue-300 hover:shadow-md'
                    }`}
                onClick={onSelect}
            >
                <div className="flex items-center space-x-3">
                    {getPlatformIcon(platform.type)}
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {platform.name}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                            {getPlatformName(platform.type)}
                        </p>
                    </div>

                    <div className="flex items-center space-x-1 flex-shrink-0">
                        {platform.testStatus === 'success' ? (
                            <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-green-600" title="Kết nối thành công" />
                            </div>
                        ) : platform.testStatus === 'failed' ? (
                            <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
                                <AlertCircle className="h-4 w-4 text-red-600" title="Kết nối thất bại" />
                            </div>
                        ) : platform.isActive ? (
                            <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-green-600" title="Đang hoạt động" />
                            </div>
                        ) : (
                            <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
                                <XCircle className="h-4 w-4 text-red-600" title="Không hoạt động" />
                            </div>
                        )}

                        <button
                            onClick={handleTestConnection}
                            disabled={isTesting}
                            className="w-6 h-6 bg-blue-100 hover:bg-blue-200 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Test kết nối"
                        >
                            <Play className="h-3 w-3 text-blue-600" />
                        </button>



                        <button
                            onClick={handleRemove}
                            className="w-6 h-6 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition-all duration-200"
                            title="Xóa platform"
                        >
                            <Trash2 className="h-3 w-3 text-red-600" />
                        </button>
                    </div>
                </div>

                {platform.description && (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-1">
                        {platform.description}
                    </p>
                )}

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                        Tạo: {platform.createdAt ? new Date(platform.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                        {platform.lastTested ? `Test: ${new Date(typeof platform.lastTested === 'object' ? platform.lastTested.value || platform.lastTested.date : platform.lastTested).toLocaleDateString('vi-VN')}` : 'Chưa test'}
                    </div>
                </div>
            </div>


        </div>
    );
};

export default PlatformCard;
