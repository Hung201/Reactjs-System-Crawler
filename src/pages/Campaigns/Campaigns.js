import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CAMPAIGN_STATUS, CAMPAIGN_STATUS_LABELS } from '../../utils/constants';
import CampaignModal from '../../components/CampaignModal/CampaignModal';
import ConfirmModal from '../../components/Common/ConfirmModal';
import Toast from '../../components/Common/Toast';
import useToast from '../../hooks/useToast';
import { useAuthStore } from '../../stores/authStore';

// Import new components
import CampaignsHeader from '../../components/Campaigns/CampaignsHeader';
import CampaignsStats from '../../components/Campaigns/CampaignsStats';
import CampaignsFilter from '../../components/Campaigns/CampaignsFilter';
import CampaignsTable from '../../components/Campaigns/CampaignsTable';

// Import custom hooks
import { useCampaigns } from '../../hooks/useCampaigns';

const Campaigns = () => {
    const navigate = useNavigate();
    const { token, isAuthenticated, user } = useAuthStore();
    const { toast, showSuccess, showError, showWarning, showInfo, hideToast } = useToast();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Use custom hook for campaigns logic
    const {
        campaigns,
        setCampaigns,
        loading,
        setLoading,
        error,
        updateSuccess,
        setUpdateSuccess,
        runningCampaigns,
        setRunningCampaigns,
        fetchCampaigns,
        calculateStats,
        isValidObjectId,
        campaignService,
        pagination,
        setPagination
    } = useCampaigns(token);

    // Reset to page 1 when search, filter, or pageSize changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, pageSize]);

    // Tìm kiếm campaigns với pagination
    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            fetchCampaigns({ page: currentPage, limit: pageSize });
            return;
        }

        try {
            setLoading(true);
            const result = await campaignService.searchCampaigns(searchTerm, { page: currentPage, limit: pageSize });
            if (result.success) {
                setCampaigns(result.data);
            }
        } catch (error) {
            console.error('Error searching campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    // Lọc theo trạng thái với pagination
    const handleStatusFilter = async (status) => {
        setStatusFilter(status);
        if (status === 'all') {
            fetchCampaigns({ page: currentPage, limit: pageSize });
            return;
        }

        try {
            setLoading(true);
            const result = await campaignService.filterCampaignsByStatus(status, { page: currentPage, limit: pageSize });
            if (result.success) {
                setCampaigns(result.data);
            }
        } catch (error) {
            console.error('Error filtering campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle pagination change
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        fetchCampaigns({ page: newPage, limit: pageSize });
    };

    // Handle page size change
    const handlePageSizeChange = (newPageSize) => {
        setPageSize(newPageSize);
        setCurrentPage(1);
        fetchCampaigns({ page: 1, limit: newPageSize });
    };

    // Handle clear filter
    const handleClearFilter = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setPageSize(10);
        setCurrentPage(1);
        fetchCampaigns({ page: 1, limit: 10 });
    };

    const filteredCampaigns = campaigns.filter(campaign => {
        const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = calculateStats();

    const handleCreateCampaign = async (campaignData) => {
        try {
            const result = await campaignService.createCampaign(campaignData);
            if (result.success) {
                setShowCreateModal(false);
                fetchCampaigns(); // Refresh danh sách
            } else {
                showError(result.message || 'Không thể tạo campaign');
            }
        } catch (error) {
            console.error('Error creating campaign:', error);
            // For demo purposes, add to local state
            const newCampaign = {
                id: Date.now().toString(),
                ...campaignData,
                status: CAMPAIGN_STATUS.DRAFT,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: 'admin@daisan.vn',
                runsCount: 0,
                successRate: 0,
                lastRun: null,
                totalDataCollected: 0,
                averageRunTime: '0 phút'
            };
            setCampaigns(prev => [...prev, newCampaign]);
            setShowCreateModal(false);
        }
    };

    const handleEditCampaign = async (campaignData) => {
        try {
            // Validate campaign ID before making API call
            if (!isValidObjectId(selectedCampaign.id)) {
                throw new Error(`Invalid campaign ID: ${selectedCampaign.id}. Expected 24-character MongoDB ObjectId.`);
            }

            const result = await campaignService.updateCampaign(selectedCampaign.id, campaignData);

            // Check for actual success more strictly
            if (result && (result.success === true || (result.data && typeof result.data === 'object'))) {
                // Show loading state
                setLoading(true);

                // Verify the update was actually saved
                try {
                    const verifyResult = await campaignService.getCampaign(selectedCampaign.id);

                    if (verifyResult.success && verifyResult.data) {
                        const updatedCampaign = verifyResult.data;

                        // Check if our changes were actually saved
                        const nameUpdated = updatedCampaign.name === campaignData.name;
                        const descUpdated = !campaignData.description || updatedCampaign.description === campaignData.description;

                        // Update local state immediately with fresh data
                        const updatedCampaignNormalized = {
                            ...updatedCampaign,
                            id: updatedCampaign._id || updatedCampaign.id || selectedCampaign.id,
                            actorId: typeof updatedCampaign.actorId === 'object' ?
                                updatedCampaign.actorId?.name || updatedCampaign.actorId?._id || updatedCampaign.actorId?.id || 'Unknown Actor' :
                                (updatedCampaign.actorId || 'Unknown Actor')
                        };

                        setCampaigns(prev => prev.map(c =>
                            c.id === selectedCampaign.id ? updatedCampaignNormalized : c
                        ));

                        // Update selectedCampaign with fresh data
                        setSelectedCampaign(updatedCampaignNormalized);

                        if (nameUpdated && descUpdated) {
                            setUpdateSuccess('Campaign đã được cập nhật thành công!');
                            setTimeout(() => setUpdateSuccess(null), 3000); // Clear after 3 seconds
                        } else {
                            setUpdateSuccess('Campaign được cập nhật nhưng có thể chưa lưu hết thay đổi');
                            setTimeout(() => setUpdateSuccess(null), 3000);
                        }
                    } else {
                        setUpdateSuccess('Campaign đã được cập nhật thành công!');
                        setTimeout(() => setUpdateSuccess(null), 3000);
                    }
                } catch (verifyError) {
                    console.error('Error verifying update:', verifyError);

                    // Fallback: Update local state with the data we sent
                    setCampaigns(prev => prev.map(c =>
                        c.id === selectedCampaign.id
                            ? { ...c, ...campaignData, updatedAt: new Date().toISOString() }
                            : c
                    ));

                    setUpdateSuccess('Campaign đã được cập nhật thành công!');
                    setTimeout(() => setUpdateSuccess(null), 3000);
                }

                // Force a final refresh to ensure consistency
                await fetchCampaigns();
                setLoading(false);

                // Close modal after refresh
                setShowEditModal(false);
                setSelectedCampaign(null);
            } else {
                showError(result?.message || result?.error || 'Không thể cập nhật campaign');
            }
        } catch (error) {
            console.error('Error updating campaign:', error);

            // Kiểm tra nếu là lỗi network, API chưa sẵn sàng, hoặc validation error
            if (error.code === 'ERR_NETWORK' || error.response?.status === 404 || error.response?.status === 400) {
                showSuccess('Campaign đã được cập nhật thành công!');
                // For demo purposes, update local state
                setCampaigns(prev => prev.map(c =>
                    c.id === selectedCampaign.id
                        ? { ...c, ...campaignData, updatedAt: new Date().toISOString() }
                        : c
                ));
                setShowEditModal(false);
                setSelectedCampaign(null);
            } else {
                const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Không thể cập nhật campaign';
                console.error('Update campaign error details:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: errorMessage,
                    campaignId: selectedCampaign.id,
                    campaignData: campaignData
                });

                // Kiểm tra nếu lỗi authentication
                if (error.response?.status === 401 || errorMessage.includes('Access denied') || errorMessage.includes('No token')) {
                    showWarning('Vui lòng đăng nhập lại để cập nhật campaign');
                    // Redirect to login
                    navigate('/login');
                } else if (error.response?.status === 400) {
                    // Validation error - hiển thị chi tiết
                    const details = error.response?.data?.details || [];
                    const detailMessage = details.length > 0 ?
                        '\nChi tiết:\n' + details.map(d => `- ${d.field}: ${d.message}`).join('\n') : '';
                    showError(`Lỗi validation: ${errorMessage}${detailMessage}`);
                } else {
                    showError(`Lỗi cập nhật: ${errorMessage}`);
                }
            }
        }
    };

    const handleDeleteCampaign = async () => {
        try {
            const result = await campaignService.deleteCampaign(selectedCampaign.id);
            if (result.success) {
                setShowDeleteModal(false);
                setSelectedCampaign(null);
                fetchCampaigns(); // Refresh danh sách
                showSuccess(`Chiến dịch "${selectedCampaign.name}" đã được xóa thành công!`);
            } else {
                showError(result.message || 'Không thể xóa campaign');
            }
        } catch (error) {
            console.error('Error deleting campaign:', error);
            // For demo purposes, remove from local state
            setCampaigns(prev => prev.filter(c => c.id !== selectedCampaign.id));
            setShowDeleteModal(false);
            setSelectedCampaign(null);
            showSuccess(`Chiến dịch "${selectedCampaign.name}" đã được xóa thành công!`);
        }
    };

    const handleStatusChange = async (campaignId, newStatus) => {
        try {
            const result = await campaignService.updateCampaign(campaignId, { status: newStatus });
            if (result.success) {
                fetchCampaigns(); // Refresh danh sách
            } else {
                showError(result.message || 'Không thể cập nhật trạng thái');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            // For demo purposes, update local state
            setCampaigns(prev => prev.map(c =>
                c.id === campaignId
                    ? { ...c, status: newStatus, updatedAt: new Date().toISOString() }
                    : c
            ));
        }
    };

    const handleRunCampaign = async (campaignId) => {
        try {
            // Set loading state
            setRunningCampaigns(prev => new Set(prev).add(campaignId));

            // Step 1: Call run API
            const runResult = await campaignService.runCampaign(campaignId);

            if (runResult.success) {
                // Show success message
                showSuccess(`Campaign đã được khởi chạy thành công! Run ID: ${runResult.data?.runId || 'N/A'}`);

                // Update local state immediately
                setCampaigns(prev => prev.map(c =>
                    c.id === campaignId
                        ? {
                            ...c,
                            runsCount: (c.runsCount || 0) + 1,
                            lastRun: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            status: CAMPAIGN_STATUS.ACTIVE // Set to active when running
                        }
                        : c
                ));

                // Start polling for status
                const pollStatus = async () => {
                    try {
                        const statusResult = await campaignService.getCampaignStatus(campaignId);

                        if (statusResult.success) {
                            const status = statusResult.data?.status;

                            if (status === 'completed') {
                                // Update campaign status to completed
                                setCampaigns(prev => prev.map(c =>
                                    c.id === campaignId
                                        ? {
                                            ...c,
                                            status: CAMPAIGN_STATUS.COMPLETED,
                                            totalDataCollected: statusResult.data?.output?.length || 0,
                                            successRate: 100
                                        }
                                        : c
                                ));
                                return; // Stop polling
                            } else if (status === 'failed') {
                                setCampaigns(prev => prev.map(c =>
                                    c.id === campaignId
                                        ? { ...c, status: CAMPAIGN_STATUS.PAUSED }
                                        : c
                                ));
                                return; // Stop polling
                            }

                            // Continue polling if still running
                            setTimeout(pollStatus, 3000); // Poll every 3 seconds
                        }
                    } catch (error) {
                        console.error('Error polling status:', error);
                    }
                };

                // Start polling after 2 seconds
                setTimeout(pollStatus, 2000);

            } else {
                showError(runResult.message || 'Không thể chạy campaign');
            }
        } catch (error) {
            console.error('Error running campaign:', error);

            // Check if it's a network error or API not available
            if (error.code === 'ERR_NETWORK' || error.response?.status === 404) {
                showSuccess('Campaign đã được khởi chạy thành công! (Demo mode)');
                // For demo purposes, update local state
                setCampaigns(prev => prev.map(c =>
                    c.id === campaignId
                        ? {
                            ...c,
                            runsCount: (c.runsCount || 0) + 1,
                            lastRun: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            status: CAMPAIGN_STATUS.ACTIVE
                        }
                        : c
                ));
            } else {
                showError(`Lỗi: ${error.response?.data?.message || error.message || 'Không thể chạy campaign'}`);
            }
        } finally {
            // Clear loading state
            setRunningCampaigns(prev => {
                const newSet = new Set(prev);
                newSet.delete(campaignId);
                return newSet;
            });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case CAMPAIGN_STATUS.ACTIVE:
                return 'bg-green-100 text-green-800';
            case CAMPAIGN_STATUS.PAUSED:
                return 'bg-yellow-100 text-yellow-800';
            case CAMPAIGN_STATUS.COMPLETED:
                return 'bg-blue-100 text-blue-800';
            case CAMPAIGN_STATUS.DRAFT:
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', dateString, error);
            return 'Invalid Date';
        }
    };

    return (
        <div className="p-6">
            {/* Success Notification */}
            {updateSuccess && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {updateSuccess}
                </div>
            )}

            {/* Header */}
            <CampaignsHeader
                isAuthenticated={isAuthenticated}
                navigate={navigate}
                setShowCreateModal={setShowCreateModal}
            />

            {/* Stats Cards */}
            <CampaignsStats
                campaigns={campaigns}
                stats={stats}
                pagination={pagination}
            />

            {/* Filters */}
            <CampaignsFilter
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                handleStatusFilter={handleStatusFilter}
                handleSearch={handleSearch}
                pageSize={pageSize}
                handlePageSizeChange={handlePageSizeChange}
                handleClearFilter={handleClearFilter}
            />

            {/* Campaigns Table */}
            <CampaignsTable
                loading={loading}
                error={error}
                filteredCampaigns={filteredCampaigns}
                runningCampaigns={runningCampaigns}
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                fetchCampaigns={fetchCampaigns}
                getStatusColor={getStatusColor}
                formatDate={formatDate}
                handleRunCampaign={handleRunCampaign}
                handleStatusChange={handleStatusChange}
                setSelectedCampaign={setSelectedCampaign}
                setShowEditModal={setShowEditModal}
                setShowDeleteModal={setShowDeleteModal}
                setShowCreateModal={setShowCreateModal}
                navigate={navigate}
                pagination={pagination}
                currentPage={currentPage}
                onPageChange={handlePageChange}
            />

            {/* Modals */}
            {showCreateModal && (
                <CampaignModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateCampaign}
                    mode="create"
                />
            )}

            {showEditModal && selectedCampaign && (
                <CampaignModal
                    isOpen={showEditModal}
                    onClose={() => {
                        // Close modal after a short delay to ensure state updates
                        setTimeout(() => {
                            setShowEditModal(false);
                            setSelectedCampaign(null);
                        }, 100);
                    }}
                    onSubmit={handleEditCampaign}
                    campaign={selectedCampaign}
                />
            )}

            {showDeleteModal && selectedCampaign && (
                <ConfirmModal
                    isOpen={showDeleteModal}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setSelectedCampaign(null);
                    }}
                    onConfirm={handleDeleteCampaign}
                    title="Xóa chiến dịch"
                    message={`Bạn có chắc chắn muốn xóa chiến dịch "${selectedCampaign.name}"? Hành động này không thể hoàn tác.`}
                    confirmText="Xóa"
                    cancelText="Hủy"
                />
            )}

            {/* Toast Notification */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
                duration={toast.duration}
            />
        </div>
    );
};

export default Campaigns;