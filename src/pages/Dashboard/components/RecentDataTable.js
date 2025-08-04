import React from 'react';
import { format } from 'date-fns';
import { ExternalLink, Eye } from 'lucide-react';
import { DATA_TYPE_LABELS, DATA_STATUS_LABELS } from '../../../utils/constants';

const RecentDataTable = ({ data, isLoading, error }) => {
  console.log('RecentDataTable - data:', data);
  console.log('RecentDataTable - data type:', typeof data);
  console.log('RecentDataTable - isArray:', Array.isArray(data));

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Lỗi khi tải dữ liệu</p>
        <p className="text-xs text-gray-400 mt-2">
          {error.message || 'Không thể kết nối đến server'}
        </p>
      </div>
    );
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Không có dữ liệu gần đây</p>
        <p className="text-xs text-gray-400 mt-2">
          Data type: {typeof data} | Is Array: {Array.isArray(data) ? 'Yes' : 'No'}
        </p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      translated: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
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

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="table-header">Tiêu đề</th>
            <th className="table-header">Loại</th>
            <th className="table-header">Trạng thái</th>
            <th className="table-header">Nguồn</th>
            <th className="table-header">Ngày tạo</th>
            <th className="table-header">Thao tác</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item._id} className="hover:bg-gray-50">
              <td className="table-cell">
                <div className="flex items-center">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-10 h-10 rounded-lg object-cover mr-3"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 truncate max-w-xs">
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </td>
              <td className="table-cell">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(item.type)}`}>
                  {DATA_TYPE_LABELS[item.type]}
                </span>
              </td>
              <td className="table-cell">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                  {DATA_STATUS_LABELS[item.status]}
                </span>
              </td>
              <td className="table-cell">
                <span className="text-sm text-gray-900">{item.sourceName}</span>
              </td>
              <td className="table-cell">
                <span className="text-sm text-gray-500">
                  {format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm')}
                </span>
              </td>
              <td className="table-cell">
                <div className="flex items-center space-x-2">
                  <button
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Xem chi tiết"
                  >
                    <Eye size={16} />
                  </button>
                  {item.rawUrl && (
                    <a
                      href={item.rawUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Xem nguồn gốc"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentDataTable; 