import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState = ({ message = 'Đang tải...' }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-center py-8">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-sm text-gray-500">{message}</p>
                </div>
            </div>
        </div>
    );
};

export default LoadingState;
