import React from 'react';
import { CAMPAIGN_STATUS } from '../../utils/constants';

const BasicInfoTab = ({
    formData,
    handleInputChange,
    handleTemplateChange,
    getActorIdString,
    isEditMode,
    actors,
    loadingActors,
    templates,
    loadingTemplates
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
                    Template
                </label>
                {isEditMode ? (
                    // Edit mode: Read-only field
                    <>
                        <input
                            type="text"
                            value={formData.selectedTemplate ? templates.find(t => t._id === formData.selectedTemplate)?.name || 'Không có template' : 'Không có template'}
                            readOnly
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                            placeholder="Template không thể chỉnh sửa"
                        />
                        <p className="text-xs text-gray-500 mt-1">Template không thể thay đổi sau khi tạo</p>
                    </>
                ) : (
                    // Create mode: Select dropdown
                    <>
                        {loadingTemplates ? (
                            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                                <span className="text-gray-500">Đang tải danh sách templates...</span>
                            </div>
                        ) : (
                            <select
                                value={formData.selectedTemplate || ''}
                                onChange={(e) => handleTemplateChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Chọn Template (tùy chọn)...</option>
                                {templates.map((template) => (
                                    <option key={template._id} value={template._id}>
                                        {template.name} - {template.category}
                                    </option>
                                ))}
                            </select>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Chọn template để tự động điền input schema</p>

                        {/* Hiển thị thông tin template khi được chọn */}
                        {formData.selectedTemplate && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h4 className="text-sm font-medium text-blue-800">
                                            {templates.find(t => t._id === formData.selectedTemplate)?.name}
                                        </h4>
                                        <p className="text-sm text-blue-700 mt-1">
                                            {templates.find(t => t._id === formData.selectedTemplate)?.description}
                                        </p>
                                        <p className="text-xs text-blue-600 mt-1">
                                            Template này sẽ tự động điền các trường input schema phù hợp cho loại crawl này.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => handleTemplateChange('')}
                                            className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                                        >
                                            Sử dụng schema mặc định
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Actor ID - Ẩn khi đã chọn template */}
            {!formData.selectedTemplate && (
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
            )}

            {/* Hiển thị thông tin Actor từ Template khi đã chọn template */}
            {formData.selectedTemplate && !isEditMode && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Actor (từ Template)
                    </label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50 text-blue-700">
                        <div className="flex items-center">
                            <svg className="h-4 w-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium">
                                {templates.find(t => t._id === formData.selectedTemplate)?.actorId?.name || 'Actor từ Template'}
                            </span>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">
                            Actor được tự động chọn từ template
                        </p>
                    </div>
                </div>
            )}

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
