import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Filter, Eye, CheckCircle, XCircle, Globe } from 'lucide-react';
import { dataAPI } from '../../services/api';
import { DATA_TYPE_LABELS, DATA_STATUS_LABELS } from '../../utils/constants';
import toast from 'react-hot-toast';

const CrawlData = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const queryClient = useQueryClient();

  const { data: crawlData, isLoading, error } = useQuery({
    queryKey: ['crawl-data', { search: searchTerm, status: statusFilter, type: typeFilter }],
    queryFn: () => dataAPI.getAll({ search: searchTerm, status: statusFilter, type: typeFilter }),
    retry: 1,
    onError: (error) => {
      console.error('CrawlData API error:', error);
    }
  });

  const translateMutation = useMutation({
    mutationFn: (id) => dataAPI.translate(id),
    onSuccess: () => {
      toast.success('Đã bắt đầu dịch nội dung!');
      queryClient.invalidateQueries(['crawl-data']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể dịch nội dung');
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id) => dataAPI.approve(id),
    onSuccess: () => {
      toast.success('Đã duyệt nội dung!');
      queryClient.invalidateQueries(['crawl-data']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể duyệt nội dung');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => dataAPI.reject(id),
    onSuccess: () => {
      toast.success('Đã từ chối nội dung!');
      queryClient.invalidateQueries(['crawl-data']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể từ chối nội dung');
    },
  });

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

  const filteredData = Array.isArray(crawlData?.data) ? crawlData.data : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dữ liệu Crawl</h1>
        <p className="text-gray-600">Quản lý và xem dữ liệu đã crawl</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm dữ liệu..."
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
            <option value="pending">Chờ xử lý</option>
            <option value="translated">Đã dịch</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
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

      {/* Data Table */}
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
                  <th className="table-header">Nội dung</th>
                  <th className="table-header">Loại</th>
                  <th className="table-header">Trạng thái</th>
                  <th className="table-header">Nguồn</th>
                  <th className="table-header">Ngày tạo</th>
                  <th className="table-header">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item) => (
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
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
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
                        
                        {item.status === 'pending' && (
                          <button
                            onClick={() => translateMutation.mutate(item._id)}
                            disabled={translateMutation.isLoading}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Dịch nội dung"
                          >
                            <Globe size={16} />
                          </button>
                        )}
                        
                        {item.status === 'translated' && (
                          <>
                            <button
                              onClick={() => approveMutation.mutate(item._id)}
                              disabled={approveMutation.isLoading}
                              className="p-1 text-green-600 hover:text-green-800"
                              title="Duyệt"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => rejectMutation.mutate(item._id)}
                              disabled={rejectMutation.isLoading}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Từ chối"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
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

        {filteredData.length === 0 && !isLoading && !error && (
          <div className="text-center py-8">
            <p className="text-gray-500">Không có dữ liệu nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrawlData; 