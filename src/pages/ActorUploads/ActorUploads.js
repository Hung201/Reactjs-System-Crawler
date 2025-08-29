import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Play, Edit, Trash2, Upload, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { actorsAPI } from '../../services/api';
import { ACTOR_STATUS_LABELS } from '../../utils/constants';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/Common/ConfirmModal';
import UploadActorModal from '../../components/ActorUploads/UploadActorModal';

import { useAuthStore } from '../../stores/authStore';

const ActorUploads = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actorToDelete, setActorToDelete] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);


  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: actors, isLoading, error } = useQuery({
    queryKey: ['actors', { search: searchTerm, status: statusFilter }],
    queryFn: () => actorsAPI.getAll({ search: searchTerm, status: statusFilter }),
    retry: 1,
    staleTime: 30000, // 30 seconds
    cacheTime: 300000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Actors API error:', error);
      console.error('Error details:', error.response?.data);
    },
    onSuccess: (data) => {
      console.log('Actors loaded successfully:', data);
    }
  });

  const runActorMutation = useMutation({
    mutationFn: (id) => actorsAPI.run(id),
    onSuccess: () => {
      toast.success('Actor đã được khởi chạy!');
      queryClient.invalidateQueries(['actors']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể chạy actor');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => actorsAPI.delete(id),
    onSuccess: () => {
      toast.success('Actor đã được xóa!');
      // Invalidate và refetch data
      queryClient.invalidateQueries(['actors']);
      // Thêm delay nhỏ để tránh race condition
      setTimeout(() => {
        queryClient.refetchQueries(['actors']);
      }, 100);
      setShowDeleteModal(false);
      setActorToDelete(null);
    },
    onError: (error) => {
      console.error('Delete actor error:', error);
      console.error('Error details:', error.response?.data);

      // Kiểm tra loại lỗi
      if (error.response?.status === 429) {
        toast.error('Quá nhiều yêu cầu. Vui lòng thử lại sau.');
      } else if (error.response?.status === 404) {
        toast.error('Actor không tồn tại hoặc đã bị xóa.');
      } else if (error.response?.status === 500) {
        toast.error('Lỗi server. Vui lòng thử lại sau.');
      } else {
        toast.error(error.response?.data?.message || 'Không thể xóa actor');
      }

      setShowDeleteModal(false);
      setActorToDelete(null);
    },
  });

  const handleDelete = (actor) => {
    if (!deleteMutation.isLoading) {
      setActorToDelete(actor);
      setShowDeleteModal(true);
    }
  };

  const confirmDelete = () => {
    if (actorToDelete && !deleteMutation.isLoading) {
      deleteMutation.mutate(actorToDelete._id);
    }
  };

  const handleRunActor = (id) => {
    runActorMutation.mutate(id);
  };

  const handleEditActor = (id) => {
    navigate(`/actors/${id}/edit`);
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      running: 'bg-blue-100 text-blue-800',
      draft: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Use real API data with fallback to mock data if API fails
  // Handle different API response structures
  // API returns: { success: true, data: [...] }
  // But React Query wraps it: { data: { success: true, data: [...] } }
  const actorsData = actors?.data?.data || actors?.data || [];
  const filteredActors = Array.isArray(actorsData) ? actorsData :
    (error ? [
      {
        _id: 'mock-actor-1',
        name: 'Web Scraper Actor',
        description: 'Actor để crawl dữ liệu từ website',
        status: 'active',
        runInfo: { lastRunAt: new Date('2024-01-15T10:30:00') },
        createdBy: { name: 'Admin User' }
      },
      {
        _id: 'mock-actor-2',
        name: 'E-commerce Crawler',
        description: 'Crawl sản phẩm từ các trang thương mại điện tử',
        status: 'running',
        runInfo: { lastRunAt: new Date('2024-01-15T09:15:00') },
        createdBy: { name: 'Editor User' }
      },
      {
        _id: 'mock-actor-3',
        name: 'News Aggregator',
        description: 'Thu thập tin tức từ nhiều nguồn khác nhau',
        status: 'error',
        runInfo: { lastRunAt: new Date('2024-01-14T16:45:00') },
        createdBy: { name: 'Crawler User' }
      }
    ] : []);



  // Check auth token
  const token = useAuthStore.getState().token;

  // Force invalidate cache on mount only once
  useEffect(() => {
    queryClient.invalidateQueries(['actors']);
  }, [queryClient]);

  return (
    <div className="space-y-6" key={`actors-${filteredActors.length}-${isLoading}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Actor</h1>
          <p className="text-gray-600">Upload và quản lý các actor Apify</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/actors/new')}
            className="btn-primary flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Tạo Actor Mới
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-secondary flex items-center"
          >
            <Upload size={20} className="mr-2" />
            Upload Actor
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm actor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ready">Sẵn sàng</option>
            <option value="error">Lỗi</option>
            <option value="running">Đang chạy</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
            }}
            className="btn-secondary"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>



      {/* Actors Table */}
      <div className="card">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Lỗi khi tải dữ liệu</p>
            <p className="text-xs text-gray-400 mt-2">
              {error.message || 'Không thể kết nối đến server'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 btn-secondary"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Tên Actor</th>
                  <th className="table-header">Mô tả</th>
                  <th className="table-header">Trạng thái</th>
                  <th className="table-header">Lần chạy cuối</th>
                  <th className="table-header">Người upload</th>
                  <th className="table-header">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredActors.map((actor) => (
                  <tr key={actor._id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Code className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{actor.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <p className="text-sm text-gray-900 truncate max-w-xs">
                        {actor.description || 'Không có mô tả'}
                      </p>
                    </td>
                    <td className="table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(actor.status)}`}>
                        {actor.status === 'active' ? 'Sẵn sàng' :
                          actor.status === 'running' ? 'Đang chạy' :
                            actor.status === 'error' ? 'Lỗi' :
                              actor.status === 'draft' ? 'Nháp' :
                                actor.status === 'inactive' ? 'Tạm dừng' : 'Không xác định'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-gray-500">
                        {actor.runInfo?.lastRunAt
                          ? new Date(actor.runInfo.lastRunAt).toLocaleDateString('vi-VN')
                          : 'Chưa chạy'
                        }
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-gray-900">
                        {actor.createdBy?.name || 'Unknown'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRunActor(actor._id)}
                          disabled={runActorMutation.isLoading || actor.status === 'running'}
                          className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50"
                          title="Chạy actor"
                        >
                          <Play size={16} />
                        </button>
                        <button
                          onClick={() => handleEditActor(actor._id)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(actor)}
                          disabled={deleteMutation.isLoading}
                          className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-500">Lỗi khi tải dữ liệu</p>
            <p className="text-xs text-gray-400 mt-2">
              {error.message || 'Không thể kết nối đến server'}
            </p>
          </div>
        )}

        {/* Debug info */}
        <div className="text-xs text-gray-400 p-2 bg-gray-50">
          Debug: length={filteredActors.length}, loading={isLoading}, error={error ? 'yes' : 'no'}
        </div>

        {filteredActors.length === 0 && !isLoading && !error && (
          <div className="text-center py-8">
            <p className="text-gray-500">Không có actor nào</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          if (!deleteMutation.isLoading) {
            setShowDeleteModal(false);
            setActorToDelete(null);
          }
        }}
        onConfirm={confirmDelete}
        title="Xóa Actor"
        message={`Bạn có chắc chắn muốn xóa actor "${actorToDelete?.actorName}"?`}
        confirmText={deleteMutation.isLoading ? "Đang xóa..." : "Xóa"}
        cancelText="Hủy"
        isLoading={deleteMutation.isLoading}
      />

      {/* Upload Actor Modal */}
      <UploadActorModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
    </div>
  );
};

export default ActorUploads; 