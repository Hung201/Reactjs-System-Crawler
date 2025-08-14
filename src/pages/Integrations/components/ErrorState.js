import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorState = ({ message = 'Có lỗi xảy ra', onRetry }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-center py-8">
                <div className="text-center">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                    <p className="text-sm text-gray-500 mb-4">{message}</p>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Thử lại
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ErrorState;
