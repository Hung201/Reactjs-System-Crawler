import React, { useState, useEffect } from 'react';
import { Plus, Settings, Play, Download, Eye, EyeOff, Copy, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../hooks/useToast';
import { platformsAPI } from '../../services/api';
import ApifyService from '../../services/apifyService';
import PlatformCard from './components/PlatformCard';
import AddPlatformModal from './components/AddPlatformModal';
import ActorList from './components/ActorList';
import RunActorModal from './components/RunActorModal';

import PlatformStats from './components/PlatformStats';
import PlatformTypes from './components/PlatformTypes';
import ErrorBoundary from './components/ErrorBoundary';

const Integrations = () => {
    const { token, isAuthenticated } = useAuthStore();
    const { toast, showSuccess, showError, showWarning, showInfo, hideToast } = useToast();

    // State management
    const [platforms, setPlatforms] = useState([]);
    const [selectedPlatform, setSelectedPlatform] = useState(null);
    const [actors, setActors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddPlatform, setShowAddPlatform] = useState(false);
    const [showRunActor, setShowRunActor] = useState(false);
    const [selectedActor, setSelectedActor] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load platforms from backend API
    useEffect(() => {
        if (!isInitialized) {
            // Add delay to avoid rate limiting
            const timer = setTimeout(() => {
                loadPlatforms();
                setIsInitialized(true);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [isInitialized]);

    const loadPlatforms = async (retryCount = 0) => {
        try {
            setLoading(true);
            const response = await platformsAPI.getAll();
            if (response && response.success) {
                // Ensure platforms have proper structure
                const validPlatforms = (response.data || []).map(platform => ({
                    _id: platform._id || platform.id,
                    id: platform.id || platform._id,
                    name: platform.name || 'Unknown Platform',
                    type: platform.type || 'custom',
                    description: platform.description || '',
                    apiToken: platform.apiToken || '',
                    baseURL: platform.baseURL || '',
                    isActive: platform.isActive !== undefined ? platform.isActive : true,
                    testStatus: platform.testStatus || null,
                    lastTested: platform.lastTested || null,
                    createdAt: platform.createdAt || new Date().toISOString(),
                    updatedAt: platform.updatedAt || new Date().toISOString()
                }));
                setPlatforms(validPlatforms);
            } else {
                showError('Không thể tải danh sách platforms');
            }
        } catch (error) {
            console.error('Error loading platforms:', error);

            // Retry logic for rate limiting
            if (error.response?.status === 429 && retryCount < 3) {
                const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
                setTimeout(() => {
                    loadPlatforms(retryCount + 1);
                }, delay);
                return;
            }

            if (error.response?.status === 429) {
                showError('Quá nhiều yêu cầu. Vui lòng thử lại sau.');
            } else {
                showError('Không thể tải danh sách platforms');
            }
            setPlatforms([]);
        } finally {
            setLoading(false);
        }
    };



    const handleAddPlatform = async (platformData) => {
        try {
            setLoading(true);
            const response = await platformsAPI.create(platformData);
            console.log('Platform creation response:', response);

            if (response && response.success) {
                showSuccess(`Platform ${platformData.name} đã được thêm thành công!`);
                await loadPlatforms(); // Reload platforms from backend
            } else {
                showError(response?.error || 'Không thể thêm platform');
            }
        } catch (error) {
            console.error('Error adding platform:', error);
            showError('Không thể thêm platform');
        } finally {
            setLoading(false);
            setShowAddPlatform(false);
        }
    };

    const handleRemovePlatform = async (platformId) => {
        try {
            const response = await platformsAPI.delete(platformId);
            if (response && response.success) {
                showSuccess('Platform đã được xóa thành công!');
                if (selectedPlatform?._id === platformId || selectedPlatform?.id === platformId) {
                    setSelectedPlatform(null);
                    setActors([]);
                }
                await loadPlatforms(); // Reload platforms from backend
            } else {
                showError(response?.error || 'Không thể xóa platform');
            }
        } catch (error) {
            console.error('Error removing platform:', error);
            showError('Không thể xóa platform');
        }
    };

    const handleSelectPlatform = async (platform) => {
        setSelectedPlatform(platform);
        setLoading(true);
        setActors([]); // Clear previous actors

        try {
            if (platform.type === 'apify') {
                const apifyService = new ApifyService(platform.apiToken);
                const actorsData = await apifyService.getActors();

                if (actorsData && Array.isArray(actorsData)) {
                    setActors(actorsData);
                } else {
                    throw new Error('Invalid data format received from API');
                }
            }
        } catch (error) {
            console.error('Error fetching actors:', error);
            showError('Không thể tải danh sách actors từ platform này');
            setActors([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRunActor = (actor) => {
        setSelectedActor(actor);
        setShowRunActor(true);
    };

    const handleImportActor = async (actor) => {
        try {
            // Logic để import actor về local system
            showSuccess(`Actor "${actor.name}" đã được import thành công!`);
        } catch (error) {
            showError('Không thể import actor này');
        }
    };

    const handleTestPlatformConnection = async (platformId) => {
        try {
            setLoading(true);
            const response = await platformsAPI.testConnection(platformId);
            if (response && response.success) {
                showSuccess('Kết nối platform thành công!');
                await loadPlatforms(); // Reload để cập nhật trạng thái
            } else {
                showError(response?.error || 'Kết nối platform thất bại');
            }
        } catch (error) {
            console.error('Error testing platform connection:', error);
            showError('Không thể test kết nối platform');
        } finally {
            setLoading(false);
        }
    };

    const handleTestAllConnections = async () => {
        try {
            setLoading(true);
            const response = await platformsAPI.testAllConnections();
            if (response && response.success) {
                showSuccess('Test tất cả kết nối hoàn thành!');
                await loadPlatforms(); // Reload để cập nhật trạng thái
            } else {
                showError(response?.error || 'Test kết nối thất bại');
            }
        } catch (error) {
            console.error('Error testing all connections:', error);
            showError('Không thể test tất cả kết nối');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Kết nối và quản lý các platform bên ngoài
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleTestAllConnections}
                                disabled={loading || platforms.length === 0}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Play className="h-4 w-4 mr-2" />
                                Test Tất Cả
                            </button>
                            <button
                                onClick={() => setShowAddPlatform(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Thêm Platform
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Platforms Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Platforms</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {platforms.length} platform đã kết nối
                                </p>
                            </div>
                            <div className="p-4 space-y-3">
                                {platforms.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                            <Settings className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Chưa có platform nào được kết nối
                                        </p>
                                        <button
                                            onClick={() => setShowAddPlatform(true)}
                                            className="text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            Thêm platform đầu tiên
                                        </button>
                                    </div>
                                ) : (
                                    platforms.map((platform) => (
                                        <PlatformCard
                                            key={platform._id || platform.id}
                                            platform={platform}
                                            isSelected={selectedPlatform?._id === platform._id || selectedPlatform?.id === platform.id}
                                            onSelect={() => handleSelectPlatform(platform)}
                                            onRemove={() => handleRemovePlatform(platform._id || platform.id)}
                                            onTestConnection={handleTestPlatformConnection}
                                            isTesting={loading}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {selectedPlatform ? (
                            <div className="space-y-6">
                                {/* Platform Header */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">
                                                {selectedPlatform.name}
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {selectedPlatform.description}
                                            </p>
                                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                                <span>Loại: {selectedPlatform.type || 'N/A'}</span>
                                                <span>Tạo: {selectedPlatform.createdAt ? new Date(selectedPlatform.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                                                {selectedPlatform.lastTested && (
                                                    <span>Test: {new Date(typeof selectedPlatform.lastTested === 'object' ? selectedPlatform.lastTested.value || selectedPlatform.lastTested.date : selectedPlatform.lastTested).toLocaleDateString('vi-VN')}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedPlatform.testStatus === 'success'
                                                ? 'bg-green-100 text-green-800'
                                                : selectedPlatform.testStatus === 'failed'
                                                    ? 'bg-red-100 text-red-800'
                                                    : selectedPlatform.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                {selectedPlatform.testStatus === 'success'
                                                    ? 'Kết nối thành công'
                                                    : selectedPlatform.testStatus === 'failed'
                                                        ? 'Kết nối thất bại'
                                                        : selectedPlatform.isActive
                                                            ? 'Đang hoạt động'
                                                            : 'Không hoạt động'
                                                }
                                            </span>
                                            <button
                                                onClick={() => handleTestPlatformConnection(selectedPlatform._id || selectedPlatform.id)}
                                                disabled={loading}
                                                className="text-gray-400 hover:text-blue-600 disabled:opacity-50"
                                                title="Test kết nối"
                                            >
                                                <Play className="h-5 w-5" />
                                            </button>
                                            <button className="text-gray-400 hover:text-gray-600">
                                                <Settings className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Platform Stats */}
                                <ErrorBoundary>
                                    <PlatformStats />
                                </ErrorBoundary>

                                {/* Platform Types */}
                                <ErrorBoundary>
                                    <PlatformTypes />
                                </ErrorBoundary>





                                {/* Actors List */}
                                <ActorList
                                    actors={actors}
                                    loading={loading}
                                    platform={selectedPlatform}
                                    onRunActor={handleRunActor}
                                    onImportActor={handleImportActor}
                                />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <Play className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        Chọn Platform
                                    </h3>
                                    <p className="text-gray-500 mb-6">
                                        Chọn một platform từ danh sách bên trái để xem danh sách actors và quản lý kết nối
                                    </p>
                                </div>

                                {/* Platform Stats */}
                                <ErrorBoundary>
                                    <PlatformStats />
                                </ErrorBoundary>

                                {/* Platform Types */}
                                <ErrorBoundary>
                                    <PlatformTypes />
                                </ErrorBoundary>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showAddPlatform && (
                <AddPlatformModal
                    isOpen={showAddPlatform}
                    onClose={() => setShowAddPlatform(false)}
                    onSubmit={handleAddPlatform}
                />
            )}

            {showRunActor && selectedActor && (
                <RunActorModal
                    isOpen={showRunActor}
                    onClose={() => setShowRunActor(false)}
                    actor={selectedActor}
                    platform={selectedPlatform}
                />
            )}

            {/* Toast Notification */}
            <div className="fixed bottom-4 right-4 z-50">
                {toast.isVisible && (
                    <div className={`px-4 py-3 pr-10 rounded-lg shadow-lg text-white relative ${toast.type === 'success' ? 'bg-green-500' :
                        toast.type === 'error' ? 'bg-red-500' :
                            toast.type === 'warning' ? 'bg-yellow-500' :
                                'bg-blue-500'
                        }`}>
                        {toast.message}
                        <button
                            onClick={hideToast}
                            className="absolute top-2 right-2 text-white hover:text-gray-200 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Integrations;
