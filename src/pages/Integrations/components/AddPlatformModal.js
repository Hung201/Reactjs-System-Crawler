import React, { useState } from 'react';
import { X, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { platformsAPI } from '../../../services/api';

const AddPlatformModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: 'apify',
        description: '',
        apiToken: '',
        baseURL: ''
    });
    const [showToken, setShowToken] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);

    const platformTypes = [
        { value: 'apify', label: 'Apify', description: 'Web scraping and automation platform' },
        { value: 'scrapingbee', label: 'ScrapingBee', description: 'Web scraping API service' },
        { value: 'brightdata', label: 'Bright Data', description: 'Data collection platform' },
        { value: 'custom', label: 'Custom Platform', description: 'Custom API integration' }
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert('Vui lòng nhập tên platform');
            return;
        }

        if (!formData.apiToken.trim()) {
            alert('Vui lòng nhập API token');
            return;
        }

        onSubmit(formData);
        setFormData({
            name: '',
            type: 'apify',
            description: '',
            apiToken: '',
            baseURL: ''
        });
        setTestResult(null);
    };

    const handleTestConnection = async () => {
        if (!formData.apiToken.trim()) {
            alert('Vui lòng nhập API token trước khi test');
            return;
        }

        setTesting(true);
        setTestResult(null);

        try {
            // Test connection through backend API
            const testData = {
                name: formData.name || 'Test Platform',
                type: formData.type,
                description: formData.description,
                apiToken: formData.apiToken,
                baseURL: formData.baseURL || getDefaultBaseURL(formData.type)
            };

            const response = await platformsAPI.create(testData);

            if (response.success) {
                setTestResult({
                    success: true,
                    message: 'Kết nối thành công! Platform đã được tạo.'
                });
                // Call onSubmit to add the platform
                onSubmit(testData);
            } else {
                setTestResult({
                    success: false,
                    message: response.error || 'Kết nối thất bại'
                });
            }
        } catch (error) {
            console.error('Test connection error:', error);
            setTestResult({
                success: false,
                message: error.response?.data?.error || error.message || 'Kết nối thất bại'
            });
        } finally {
            setTesting(false);
        }
    };

    const getDefaultBaseURL = (type) => {
        switch (type) {
            case 'apify':
                return 'https://api.apify.com/v2';
            case 'scrapingbee':
                return 'https://app.scrapingbee.com/api/v1';
            case 'brightdata':
                return 'https://api.brightdata.com';
            default:
                return '';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Thêm Platform
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Platform Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Loại Platform *
                        </label>
                        <div className="space-y-2">
                            {platformTypes.map((platform) => (
                                <label
                                    key={platform.value}
                                    className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                                >
                                    <input
                                        type="radio"
                                        name="platformType"
                                        value={platform.value}
                                        checked={formData.type === platform.value}
                                        onChange={(e) => {
                                            handleInputChange('type', e.target.value);
                                            handleInputChange('baseURL', getDefaultBaseURL(e.target.value));
                                        }}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <div className="ml-3">
                                        <div className="text-sm font-medium text-gray-900">
                                            {platform.label}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {platform.description}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Platform Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên Platform *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập tên platform"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mô tả
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Mô tả platform này"
                        />
                    </div>

                    {/* API Token */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            API Token *
                        </label>
                        <div className="relative">
                            <input
                                type={showToken ? 'text' : 'password'}
                                value={formData.apiToken}
                                onChange={(e) => handleInputChange('apiToken', e.target.value)}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập API token"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowToken(!showToken)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                {showToken ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Base URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Base URL
                        </label>
                        <input
                            type="url"
                            value={formData.baseURL}
                            onChange={(e) => handleInputChange('baseURL', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://api.example.com"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            URL cơ sở của API (để trống để sử dụng mặc định)
                        </p>
                    </div>

                    {/* Test Connection */}
                    <div>
                        <button
                            type="button"
                            onClick={handleTestConnection}
                            disabled={testing || !formData.apiToken.trim()}
                            className="w-full px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {testing ? 'Đang test...' : 'Test Connection'}
                        </button>

                        {testResult && (
                            <div className={`mt-3 p-3 rounded-md flex items-center ${testResult.success
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-red-50 border border-red-200'
                                }`}>
                                {testResult.success ? (
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                ) : (
                                    <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                                )}
                                <span className={`text-sm ${testResult.success ? 'text-green-700' : 'text-red-700'
                                    }`}>
                                    {testResult.message}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Thêm Platform
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPlatformModal;
