import React from 'react';
import { CAMPAIGN_STATUS } from '../../utils/constants';

const BasicInfoTab = ({
    formData,
    handleInputChange,
    getActorIdString,
    isEditMode,
    actors,
    loadingActors
}) => {
    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên chiến dịch *
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Nhập tên chiến dịch"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Mô tả chiến dịch"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Actor ID
                </label>
                {isEditMode ? (
                    // Edit mode: Read-only field
                    <>
                        <input
                            type="text"
                            value={getActorIdString(formData.actorId)}
                            readOnly
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                            placeholder="Actor ID không thể chỉnh sửa"
                        />
                        <p className="text-xs text-gray-500 mt-1">Actor ID không thể thay đổi</p>
                    </>
                ) : (
                    // Create mode: Select dropdown
                    <>
                        {loadingActors ? (
                            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                                <span className="text-gray-500">Đang tải danh sách actors...</span>
                            </div>
                        ) : (
                            <select
                                value={formData.actorId || ''}
                                onChange={(e) => handleInputChange('actorId', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required
                            >
                                <option value="">Chọn Actor...</option>
                                {actors.map((actor) => (
                                    <option key={actor._id} value={actor._id}>
                                        {actor.name}
                                    </option>
                                ))}
                            </select>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Chọn actor từ danh sách có sẵn</p>
                    </>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                </label>
                <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                    <option value={CAMPAIGN_STATUS.DRAFT}>Bản nháp</option>
                    <option value={CAMPAIGN_STATUS.ACTIVE}>Đang chạy</option>
                    <option value={CAMPAIGN_STATUS.PAUSED}>Tạm dừng</option>
                    <option value={CAMPAIGN_STATUS.COMPLETED}>Hoàn thành</option>
                </select>
            </div>
        </div>
    );
};

export default BasicInfoTab;
