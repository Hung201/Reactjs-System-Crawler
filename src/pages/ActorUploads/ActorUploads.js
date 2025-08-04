import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Play, Edit, Trash2, Upload, Code } from 'lucide-react';
import { actorsAPI } from '../../services/api';
import { ACTOR_STATUS_LABELS } from '../../utils/constants';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/Common/ConfirmModal';

const ActorUploads = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actorToDelete, setActorToDelete] = useState(null);

  const queryClient = useQueryClient();

  const { data: actors, isLoading, error } = useQuery({
    queryKey: ['actors', { search: searchTerm, status: statusFilter }],
    queryFn: () => actorsAPI.getAll({ search: searchTerm, status: statusFilter }),
    retry: 1,
    onError: (error) => {
      console.error('Actors API error:', error);
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
      queryClient.invalidateQueries(['actors']);
      setShowDeleteModal(false);
      setActorToDelete(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể xóa actor');
    },
  });

  const handleDelete = (actor) => {
    setActorToDelete(actor);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (actorToDelete) {
      deleteMutation.mutate(actorToDelete._id);
    }
  };

  const handleRunActor = (id) => {
    runActorMutation.mutate(id);
  };

  const getStatusColor = (status) => {
    const colors = {
      ready: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      running: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredActors = Array.isArray(actors?.data) ? actors.data : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Actor</h1>
          <p className="text-gray-600">Upload và quản lý các actor Apify</p>
        </div>
        <button className="btn-primary flex items-center">
          <Upload size={20} className="mr-2" />
          Upload Actor
        </button>
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
              className="input-field pl-10"
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
                          <p className="font-medium text-gray-900">{actor.actorName}</p>
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
                        {ACTOR_STATUS_LABELS[actor.status]}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-gray-500">
                        {actor.lastRunAt
                          ? new Date(actor.lastRunAt).toLocaleDateString('vi-VN')
                          : 'Chưa chạy'
                        }
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-gray-900">
                        {actor.uploadedBy?.name || 'Unknown'}
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
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(actor)}
                          className="p-1 text-red-600 hover:text-red-800"
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
          setShowDeleteModal(false);
          setActorToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Xóa Actor"
        message={`Bạn có chắc chắn muốn xóa actor "${actorToDelete?.actorName}"?`}
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
};

export default ActorUploads; 