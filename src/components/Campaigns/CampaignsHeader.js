import React from 'react';
import { Plus } from 'lucide-react';

const CampaignsHeader = ({
    isAuthenticated,
    navigate,
    setShowCreateModal
}) => {
    return (
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Chiến dịch</h1>
                <p className="text-gray-600 mt-1">Quản lý các chiến dịch crawl dữ liệu</p>
                {!isAuthenticated && (
                    <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded-md">
                        <p className="text-sm text-yellow-800">
                            ⚠️ Bạn chưa đăng nhập. Một số tính năng có thể không hoạt động.
                            <button
                                onClick={() => navigate('/login')}
                                className="ml-2 text-blue-600 hover:text-blue-800 underline"
                            >
                                Đăng nhập ngay
                            </button>
                        </p>
                    </div>
                )}
            </div>
            <button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
                <Plus size={20} />
                Tạo chiến dịch
            </button>
        </div>
    );
};

export default CampaignsHeader;
