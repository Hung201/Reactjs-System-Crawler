import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Play, Edit, Trash2, MoreVertical } from 'lucide-react';
import { sourcesAPI } from '../../services/api';
import { SOURCE_STATUS_LABELS, DATA_TYPE_LABELS } from '../../utils/constants';
import toast from 'react-hot-toast';
import SourceModal from '../../components/SourceModal/SourceModal';
import ConfirmModal from '../../components/Common/ConfirmModal';

const CrawlSources = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState(null);

  const queryClient = useQueryClient();

  const { data: sources, isLoading, error } = useQuery({
    queryKey: ['sources', { search: searchTerm, status: statusFilter, type: typeFilter }],
    queryFn: () => sourcesAPI.getAll({ search: searchTerm, status: statusFilter, type: typeFilter }),
    retry: 1,
    onError: (error) => {
      console.error('Sources API error:', error);
    }
  });

  const runActorMutation = useMutation({
    mutationFn: (id) => sourcesAPI.runActor(id),
    onSuccess: () => {
      toast.success('Actor đã được khởi chạy!');
      queryClient.invalidateQueries(['sources']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể chạy actor');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => sourcesAPI.delete(id),
    onSuccess: () => {
      toast.success('Nguồn crawl đã được xóa!');
      queryClient.invalidateQueries(['sources']);
      setShowDeleteModal(false);
      setSourceToDelete(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể xóa nguồn crawl');
    },
  });

  const handleEdit = (source) => {
    setEditingSource(source);
    setShowModal(true);
  };

  const handleDelete = (source) => {
    setSourceToDelete(source);
    setShowDeleteModal(true);
  };

  const handleRunActor = (id) => {
    runActorMutation.mutate(id);
  };

  const confirmDelete = () => {
    if (sourceToDelete) {
      deleteMutation.mutate(sourceToDelete._id);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type) => {
    const colors = {
      product: 'bg-purple-100 text-purple-800',
      news: 'bg-blue-100 text-blue-800',
      video: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const filteredSources = Array.isArray(sources?.data) ? sources.data : [];

  console.log('CrawlSources - sources:', sources);
  console.log('CrawlSources - sources.data:', sources?.data);
  console.log('CrawlSources - filteredSources:', filteredSources);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nguồn Crawl</h1>
          <p className="text-gray-600">Quản lý các nguồn dữ liệu để crawl</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Thêm nguồn
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm nguồn..."
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
            <option value="active">Hoạt động</option>
            <option value="inactive">Tạm dừng</option>
            <option value="archived">Đã lưu trữ</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-field"
          >
            <option value="">Tất cả loại</option>
            <option value="product">Sản phẩm</option>
            <option value="news">Tin tức</option>
            <option value="video">Video</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setTypeFilter('');
            }}
            className="btn-secondary"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Sources Table */}
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
                  <th className="table-header">Tên nguồn</th>
                  <th className="table-header">Loại</th>
                  <th className="table-header">Trạng thái</th>
                  <th className="table-header">URL</th>
                  <th className="table-header">Actor</th>
                  <th className="table-header">Lịch chạy</th>
                  <th className="table-header">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSources.map((source) => (
                  <tr key={source._id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-gray-900">{source.name}</p>
                        <p className="text-sm text-gray-500">
                          Tạo bởi: {source.createdBy?.name || 'Unknown'}
                        </p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(source.type)}`}>
                        {DATA_TYPE_LABELS[source.type]}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(source.status)}`}>
                        {SOURCE_STATUS_LABELS[source.status]}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-900 truncate">
                          {source.startUrls?.[0] || 'N/A'}
                        </p>
                        {source.startUrls?.length > 1 && (
                          <p className="text-xs text-gray-500">
                            +{source.startUrls.length - 1} URL khác
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-gray-900">{source.actorId || 'N/A'}</span>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-gray-500">
                        {source.schedule || 'Thủ công'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRunActor(source._id)}
                          disabled={runActorMutation.isLoading}
                          className="p-1 text-green-600 hover:text-green-800"
                          title="Chạy actor"
                        >
                          <Play size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(source)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(source)}
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

        {filteredSources.length === 0 && !isLoading && !error && (
          <div className="text-center py-8">
            <p className="text-gray-500">Không có nguồn crawl nào</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <SourceModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingSource(null);
        }}
        source={editingSource}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSourceToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Xóa nguồn crawl"
        message={`Bạn có chắc chắn muốn xóa nguồn "${sourceToDelete?.name}"?`}
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
};

export default CrawlSources; 