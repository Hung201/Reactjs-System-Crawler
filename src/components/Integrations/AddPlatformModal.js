import React, { useState } from 'react';
import { X, Plus, Eye, EyeOff, CheckCircle, AlertCircle, Play } from 'lucide-react';
import { platformsAPI } from '../../services/api';
import ApifyService from '../../services/apifyService';

const AddPlatformModal = ({ isOpen, onClose, onSubmit, editingPlatform = null }) => {
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
    const [nameError, setNameError] = useState('');

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

        // Clear name error when user types
        if (field === 'name') {
            setNameError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert('Vui lòng nhập tên platform');
            return;
        }

        if (!formData.apiToken.trim()) {
            alert('Vui lòng nhập API token');
            return;
        }

        // Check for duplicate name if not editing
        if (!editingPlatform) {
            try {
                const response = await platformsAPI.getAll();
                if (response && response.success) {
                    const existingPlatform = response.data.find(p =>
                        p.name.toLowerCase() === formData.name.trim().toLowerCase()
                    );
                    if (existingPlatform) {
                        setNameError('Platform với tên này đã tồn tại');
                        return;
                    }
                }
            } catch (error) {
                console.error('Error checking duplicate name:', error);
            }
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
        setNameError('');
    };

    // Load editing platform data when modal opens
    React.useEffect(() => {
        if (isOpen && editingPlatform) {
            setFormData({
                name: editingPlatform.name || '',
                type: editingPlatform.type || 'apify',
                description: editingPlatform.description || '',
                apiToken: editingPlatform.apiToken || '',
                baseURL: editingPlatform.baseURL || ''
            });
        } else if (isOpen && !editingPlatform) {
            // Reset form when opening for new platform
            setFormData({
                name: '',
                type: 'apify',
                description: '',
                apiToken: '',
                baseURL: ''
            });
        }
    }, [isOpen, editingPlatform]);

    const handleTestConnection = async () => {
        if (!formData.apiToken.trim()) {
            alert('Vui lòng nhập API token trước khi test');
            return;
        }

        setTesting(true);
        setTestResult(null);

        try {
            // Test connection using ApifyService directly
            const apifyService = new ApifyService(formData.apiToken);

            const result = await apifyService.testConnection();

            if (result.success) {
                setTestResult({
                    success: true,
                    message: 'Kết nối thành công! API token hợp lệ.'
                });
            } else {
                setTestResult({
                    success: false,
                    message: result.error || 'Kết nối thất bại'
                });
            }
        } catch (error) {
            console.error('Test connection error:', error);
            setTestResult({
                success: false,
                message: error.message || 'Kết nối thất bại'
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-8 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-t-3xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{editingPlatform ? 'Sửa Thông Tin Platform' : 'Thêm Platform Mới'}</h2>
                            <p className="text-gray-600 font-medium">Kết nối platform bên ngoài vào hệ thống</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-all duration-200"
                        >
                            <X className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Platform Type Selection */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-4">
                                Loại Platform
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {platformTypes.map((type) => (
                                    <div
                                        key={type.value}
                                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${formData.type === type.value
                                            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg'
                                            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                                            }`}
                                        onClick={() => handleInputChange('type', type.value)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${type.value === 'apify' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                                                type.value === 'scrapingbee' ? 'bg-gradient-to-br from-yellow-500 to-orange-600' :
                                                    type.value === 'brightdata' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                                                        'bg-gradient-to-br from-gray-500 to-slate-600'
                                                }`}>
                                                <span className="text-white font-bold text-lg">
                                                    {type.label.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{type.label}</h3>
                                                <p className="text-sm text-gray-600">{type.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Platform Name */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">
                                Tên Platform
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 font-medium ${nameError
                                        ? 'border-red-300 focus:border-red-500'
                                        : 'border-gray-200 focus:border-blue-500'
                                    }`}
                                placeholder="Nhập tên platform..."
                            />
                            {nameError && (
                                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                        <p className="text-sm text-red-700">{nameError}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">
                                Mô tả (Tùy chọn)
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                rows="3"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 font-medium resize-none"
                                placeholder="Mô tả về platform này..."
                            />
                        </div>

                        {/* API Token */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">
                                API Token
                            </label>
                            <div className="relative">
                                <input
                                    type={showToken ? 'text' : 'password'}
                                    value={formData.apiToken}
                                    onChange={(e) => handleInputChange('apiToken', e.target.value)}
                                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 font-medium"
                                    placeholder="Nhập API token..."
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowToken(!showToken)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all duration-200"
                                >
                                    {showToken ? <EyeOff className="h-4 w-4 text-gray-600" /> : <Eye className="h-4 w-4 text-gray-600" />}
                                </button>
                            </div>
                        </div>

                        {/* Base URL */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">
                                Base URL (Tùy chọn)
                            </label>
                            <input
                                type="url"
                                value={formData.baseURL}
                                onChange={(e) => handleInputChange('baseURL', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 font-medium"
                                placeholder={getDefaultBaseURL(formData.type)}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Để trống để sử dụng URL mặc định: {getDefaultBaseURL(formData.type)}
                            </p>
                        </div>

                        {/* Test Result */}
                        {testResult && (
                            <div className={`p-4 rounded-xl border-2 ${testResult.success
                                ? 'border-green-200 bg-green-50'
                                : 'border-red-200 bg-red-50'
                                }`}>
                                <div className="flex items-center space-x-3">
                                    {testResult.success ? (
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-red-600" />
                                    )}
                                    <p className={`font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'
                                        }`}>
                                        {testResult.message}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-4 pt-4">
                            <button
                                type="button"
                                onClick={handleTestConnection}
                                disabled={testing || !formData.apiToken.trim() || nameError}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                            >
                                {testing ? 'Đang test...' : 'Test Kết Nối'}
                            </button>
                            <button
                                type="submit"
                                disabled={!formData.name.trim() || !formData.apiToken.trim()}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                            >
                                {editingPlatform ? 'Cập nhật Platform' : 'Thêm Platform'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddPlatformModal;
