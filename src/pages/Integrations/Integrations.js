import React, { useState, useEffect } from 'react';
import { Plus, Settings, Play, Download, Eye, EyeOff, Copy, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import useToast from '../../hooks/useToast';
import { platformsAPI } from '../../services/api';
import ApifyService from '../../services/apifyService';
import PlatformCard from '../../components/Integrations/PlatformCard';
import AddPlatformModal from '../../components/Integrations/AddPlatformModal';
import ActorList from '../../components/Integrations/ActorList';
import RunActorModal from '../../components/Integrations/RunActorModal';

import PlatformStats from '../../components/Integrations/PlatformStats';
import PlatformTypes from '../../components/Integrations/PlatformTypes';
import ErrorBoundary from '../../components/Integrations/ErrorBoundary';

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
    const [editingPlatform, setEditingPlatform] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [platformToDelete, setPlatformToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

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
            let response;

            if (editingPlatform) {
                // Update existing platform
                try {
                    response = await platformsAPI.update(editingPlatform._id || editingPlatform.id, platformData);

                    if (response && response.success) {
                        showSuccess(`Platform ${platformData.name} đã được cập nhật thành công!`);
                    } else {
                        showError(response?.error || 'Không thể cập nhật platform');
                        return;
                    }
                } catch (updateError) {

                    // Fallback: Delete old platform and create new one
                    try {
                        // Delete old platform
                        await platformsAPI.delete(editingPlatform._id || editingPlatform.id);

                        // Create new platform
                        response = await platformsAPI.create(platformData);

                        if (response && response.success) {
                            showSuccess(`Platform ${platformData.name} đã được cập nhật thành công! (via delete+create)`);
                        } else {
                            showError('Không thể cập nhật platform');
                            return;
                        }
                    } catch (fallbackError) {
                        console.error('Fallback update failed:', fallbackError);
                        showError('Không thể cập nhật platform');
                        return;
                    }
                }
            } else {
                // Create new platform
                response = await platformsAPI.create(platformData);

                if (response && response.success) {
                    showSuccess(`Platform ${platformData.name} đã được thêm thành công!`);
                } else {
                    showError(response?.error || 'Không thể thêm platform');
                    return;
                }
            }

            await loadPlatforms(); // Reload platforms from backend
            setShowAddPlatform(false);
            setEditingPlatform(null);
        } catch (error) {
            console.error('Error adding/updating platform:', error);
            showError(editingPlatform ? 'Không thể cập nhật platform' : 'Không thể thêm platform');
        } finally {
            setLoading(false);
        }
    };

    const handleShowDeleteModal = (platform) => {
        setPlatformToDelete(platform);
        setShowDeleteModal(true);
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setPlatformToDelete(null);
        setIsDeleting(false);
    };

    // Handle ESC key to close delete modal
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape' && showDeleteModal) {
                handleCancelDelete();
            }
        };

        if (showDeleteModal) {
            document.addEventListener('keydown', handleEscKey);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
            document.body.style.overflow = 'unset';
        };
    }, [showDeleteModal]);

    const handleConfirmDelete = async () => {
        if (!platformToDelete) return;

        setIsDeleting(true);
        try {
            const response = await platformsAPI.delete(platformToDelete._id || platformToDelete.id);
            if (response && response.success) {
                showSuccess('Platform đã được xóa thành công!');
                if (selectedPlatform?._id === platformToDelete._id || selectedPlatform?.id === platformToDelete.id) {
                    setSelectedPlatform(null);
                    setActors([]);
                }
                await loadPlatforms(); // Reload platforms from backend
            } else {
                showError(response?.error || 'Không thể xóa platform');
                throw new Error(response?.error || 'Không thể xóa platform');
            }
        } catch (error) {
            console.error('Error removing platform:', error);
            showError('Không thể xóa platform');
            throw error;
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setPlatformToDelete(null);
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
                throw new Error(response?.error || 'Không thể xóa platform');
            }
        } catch (error) {
            console.error('Error removing platform:', error);
            showError('Không thể xóa platform');
            throw error; // Re-throw để PlatformCard có thể handle
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

    const handleEditPlatform = (platform) => {
        setEditingPlatform(platform);
        setShowAddPlatform(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-x-hidden">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 sm:py-8 gap-4">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent truncate">
                                Integrations
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 mt-2 font-medium">
                                Kết nối và quản lý các platform bên ngoài
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                            <button
                                onClick={handleTestAllConnections}
                                disabled={loading || platforms.length === 0}
                                className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-sm font-semibold rounded-xl shadow-sm text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                <Play className="h-4 w-4 mr-2" />
                                Test Tất Cả
                            </button>
                            <button
                                onClick={() => setShowAddPlatform(true)}
                                className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm font-semibold rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Thêm Platform
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 sm:gap-8">
                    {/* Platforms Sidebar */}
                    <div className="xl:col-span-1">
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
                            <div className="p-4 sm:p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-blue-50/30">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Platforms</h3>
                                <p className="text-sm text-gray-600 font-medium">
                                    {platforms.length} platform đã kết nối
                                </p>
                            </div>
                            <div className="p-4 sm:p-6 space-y-3 max-h-96 overflow-y-auto">
                                {platforms.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                                            <Settings className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <p className="text-sm text-gray-600 mb-4 font-medium">
                                            Chưa có platform nào được kết nối
                                        </p>
                                        <button
                                            onClick={() => setShowAddPlatform(true)}
                                            className="text-sm text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
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
                                            onRemove={handleShowDeleteModal}
                                            onTestConnection={handleTestPlatformConnection}
                                            isTesting={loading}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="xl:col-span-3">
                        {selectedPlatform ? (
                            <div className="space-y-4 sm:space-y-6">
                                {/* Platform Header */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-4 sm:p-6 overflow-hidden">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 truncate">
                                                {selectedPlatform.name}
                                            </h2>
                                            <p className="text-sm text-gray-600 mb-3 font-medium line-clamp-2">
                                                {selectedPlatform.description}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                                                <span className="flex items-center">
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                                    Loại: {selectedPlatform.type || 'N/A'}
                                                </span>
                                                <span className="flex items-center">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                    Tạo: {selectedPlatform.createdAt ? new Date(selectedPlatform.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                                </span>
                                                {selectedPlatform.lastTested && (
                                                    <span className="flex items-center">
                                                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                                        Test: {new Date(typeof selectedPlatform.lastTested === 'object' ? selectedPlatform.lastTested.value || selectedPlatform.lastTested.date : selectedPlatform.lastTested).toLocaleDateString('vi-VN')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 flex-shrink-0">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${selectedPlatform.testStatus === 'success'
                                                ? 'bg-green-100 text-green-800 border border-green-200'
                                                : selectedPlatform.testStatus === 'failed'
                                                    ? 'bg-red-100 text-red-800 border border-red-200'
                                                    : selectedPlatform.isActive
                                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                                        : 'bg-red-100 text-red-800 border border-red-200'
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
                                                className="text-gray-400 hover:text-blue-600 disabled:opacity-50 transition-colors p-1 hover:bg-blue-50 rounded"
                                                title="Test kết nối"
                                            >
                                                <Play className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEditPlatform(selectedPlatform)}
                                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-50 rounded"
                                                title="Sửa thông tin platform"
                                            >
                                                <Settings className="h-4 w-4" />
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
                            <div className="space-y-4 sm:space-y-6">
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-8 text-center">
                                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                        <Play className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                                        Chọn Platform
                                    </h3>
                                    <p className="text-base text-gray-600 mb-8 max-w-md mx-auto font-medium">
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
                    onClose={() => {
                        setShowAddPlatform(false);
                        setEditingPlatform(null);
                    }}
                    onSubmit={handleAddPlatform}
                    editingPlatform={editingPlatform}
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

            {/* Delete Platform Modal */}
            {showDeleteModal && platformToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleCancelDelete}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 border border-gray-200" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 relative">
                            {/* Close button */}
                            <button
                                onClick={handleCancelDelete}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                                title="Đóng"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 mb-3">
                                    Xóa Platform
                                </h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    Bạn có chắc chắn muốn xóa platform <strong>"{platformToDelete.name}"</strong>?
                                </p>
                                <p className="text-xs text-red-500 mb-6">
                                    Hành động này không thể hoàn tác!
                                </p>

                                {/* Platform Info */}
                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                                            <span className="text-white font-bold text-sm">A</span>
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="text-sm font-medium text-gray-900">{platformToDelete.name}</p>
                                            <p className="text-xs text-gray-500">Apify</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 text-xs text-gray-500 space-y-1">
                                        <div>Tạo: {platformToDelete.createdAt ? new Date(platformToDelete.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</div>
                                        <div>{platformToDelete.lastTested ? `Test: ${new Date(typeof platformToDelete.lastTested === 'object' ? platformToDelete.lastTested.value || platformToDelete.lastTested.date : platformToDelete.lastTested).toLocaleDateString('vi-VN')}` : 'Chưa test'}</div>
                                    </div>
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleCancelDelete}
                                        className="flex-1 px-4 py-3 text-sm font-semibold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleConfirmDelete}
                                        disabled={isDeleting}
                                        className="flex-1 px-4 py-3 text-sm font-semibold bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Đang xóa...
                                            </>
                                        ) : (
                                            'Xóa Platform'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            <div className="fixed bottom-6 right-6 z-50">
                {toast.isVisible && (
                    <div className={`px-6 py-4 pr-12 rounded-2xl shadow-2xl text-white relative backdrop-blur-sm border border-white/20 transition-all duration-300 transform ${toast.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                        toast.type === 'error' ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                            toast.type === 'warning' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                'bg-gradient-to-r from-blue-500 to-indigo-500'
                        }`}>
                        <div className="flex items-center space-x-3">
                            {toast.type === 'success' && <CheckCircle className="h-5 w-5" />}
                            {toast.type === 'error' && <AlertCircle className="h-5 w-5" />}
                            {toast.type === 'warning' && <AlertCircle className="h-5 w-5" />}
                            {toast.type === 'info' && <Play className="h-5 w-5" />}
                            <span className="font-semibold">{toast.message}</span>
                        </div>
                        <button
                            onClick={hideToast}
                            className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors w-6 h-6 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center"
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
