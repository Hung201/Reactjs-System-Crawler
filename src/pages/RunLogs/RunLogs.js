import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Eye, Clock, CheckCircle, XCircle, Play } from 'lucide-react';
import { logsAPI } from '../../services/api';
import { RUN_STATUS_LABELS } from '../../utils/constants';

const RunLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actorFilter, setActorFilter] = useState('');

  const { data: logs, isLoading, error } = useQuery({
    queryKey: ['run-logs', { search: searchTerm, status: statusFilter, actor: actorFilter }],
    queryFn: () => logsAPI.getAll({ search: searchTerm, status: statusFilter, actor: actorFilter }),
    retry: 1,
    onError: (error) => {
      console.error('RunLogs API error:', error);
    }
  });

  const getStatusColor = (status) => {
    const colors = {
      running: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <Play size={16} className="text-blue-600" />;
      case 'success':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'failed':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  const formatDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';

    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = end - start;

    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);

    return `${minutes}m ${seconds}s`;
  };

  const filteredLogs = Array.isArray(logs?.data) ? logs.data : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nhật ký chạy</h1>
        <p className="text-gray-600">Theo dõi lịch sử chạy các actor</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm log..."
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
            <option value="running">Đang chạy</option>
            <option value="success">Thành công</option>
            <option value="failed">Thất bại</option>
          </select>

          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="input-field"
          >
            <option value="">Tất cả actor</option>
            <option value="actor1">Actor 1</option>
            <option value="actor2">Actor 2</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setActorFilter('');
            }}
            className="btn-secondary"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Logs Table */}
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
                  <th className="table-header">Actor</th>
                  <th className="table-header">Trạng thái</th>
                  <th className="table-header">Người chạy</th>
                  <th className="table-header">Thời gian bắt đầu</th>
                  <th className="table-header">Thời gian kết thúc</th>
                  <th className="table-header">Thời gian chạy</th>
                  <th className="table-header">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Play className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{log.actorName}</p>
                          <p className="text-sm text-gray-500">{log.sourceName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        {getStatusIcon(log.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status)}`}>
                          {RUN_STATUS_LABELS[log.status]}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-gray-900">
                        {log.triggeredBy?.name || 'System'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-gray-500">
                        {log.startTime
                          ? new Date(log.startTime).toLocaleString('vi-VN')
                          : 'N/A'
                        }
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-gray-500">
                        {log.endTime
                          ? new Date(log.endTime).toLocaleString('vi-VN')
                          : 'N/A'
                        }
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-gray-500">
                        {formatDuration(log.startTime, log.endTime)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
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

        {filteredLogs.length === 0 && !isLoading && !error && (
          <div className="text-center py-8">
            <p className="text-gray-500">Không có log nào</p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Play className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng số lần chạy</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredLogs.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Thành công</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredLogs.filter(log => log.status === 'success').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Thất bại</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredLogs.filter(log => log.status === 'failed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đang chạy</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredLogs.filter(log => log.status === 'running').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunLogs; 