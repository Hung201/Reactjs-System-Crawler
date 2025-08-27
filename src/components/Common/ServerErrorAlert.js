import React from 'react';
import { AlertTriangle, Wifi, WifiOff, RefreshCw } from 'lucide-react';

const ServerErrorAlert = ({
    error,
    onRetry,
    title = "Lỗi kết nối server",
    showRetry = true
}) => {
    const getErrorIcon = () => {
        if (error?.response?.status === 0 || !navigator.onLine) {
            return <WifiOff className="w-5 h-5 text-red-500" />;
        }
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
    };

    const getErrorMessage = () => {
        if (!navigator.onLine) {
            return "Không có kết nối internet. Vui lòng kiểm tra kết nối mạng.";
        }

        if (error?.response) {
            const status = error.response.status;
            const data = error.response.data;

            switch (status) {
                case 400:
                    return data?.message || "Dữ liệu không hợp lệ";
                case 401:
                    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
                case 403:
                    return "Không có quyền truy cập";
                case 404:
                    return "Tài nguyên không tồn tại";
                case 500:
                    return "Lỗi server nội bộ. Vui lòng thử lại sau.";
                case 502:
                case 503:
                case 504:
                    return "Server đang bảo trì. Vui lòng thử lại sau.";
                default:
                    return data?.message || `Lỗi server (${status})`;
            }
        } else if (error?.request) {
            return "Không thể kết nối đến server. Vui lòng kiểm tra backend server có đang chạy không.";
        } else if (error?.code === 'ERR_NETWORK' || error?.message?.includes('Network Error')) {
            return "Lỗi kết nối mạng. Backend server có thể chưa được khởi động.";
        } else {
            return error?.message || "Lỗi không xác định";
        }
    };

    const shouldShowTroubleshooting = () => {
        return !navigator.onLine ||
            error?.request ||
            error?.code === 'ERR_NETWORK' ||
            error?.message?.includes('Network Error') ||
            error?.response?.status >= 500;
    };

    return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
                <div className="flex-shrink-0 mr-3 mt-0.5">
                    {getErrorIcon()}
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-medium text-red-800 mb-1">
                        {title}
                    </h3>
                    <p className="text-sm text-red-700 mb-3">
                        {getErrorMessage()}
                    </p>

                    {/* Troubleshooting Guide */}
                    {shouldShowTroubleshooting() && (
                        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <h4 className="text-xs font-medium text-blue-800 mb-2">Hướng dẫn khắc phục:</h4>
                            <ul className="text-xs text-blue-700 space-y-1">
                                {!navigator.onLine ? (
                                    <>
                                        <li>• Kiểm tra kết nối internet</li>
                                        <li>• Thử kết nối lại WiFi</li>
                                        <li>• Kiểm tra cài đặt mạng</li>
                                    </>
                                ) : (
                                    <>
                                        <li>• Kiểm tra backend server có đang chạy không</li>
                                        <li>• Chạy lệnh: <code className="bg-blue-100 px-1 rounded">npm start</code> trong thư mục backend</li>
                                        <li>• Kiểm tra port 5000 có đang được sử dụng không</li>
                                        <li>• Kiểm tra file .env có cấu hình đúng REACT_APP_API_URL không</li>
                                    </>
                                )}
                            </ul>
                        </div>
                    )}

                    {showRetry && (
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={onRetry}
                                className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Thử lại
                            </button>

                            {!navigator.onLine && (
                                <div className="flex items-center text-xs text-red-600">
                                    <Wifi className="w-3 h-3 mr-1" />
                                    Đang chờ kết nối mạng...
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServerErrorAlert;
