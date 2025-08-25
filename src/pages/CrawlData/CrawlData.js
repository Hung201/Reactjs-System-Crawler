import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Filter, Eye, CheckCircle, XCircle, Globe, Clock, Calendar, ExternalLink, Database, Tag, User, Play, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { dataAPI } from '../../services/api';
import { DATA_TYPE_LABELS, DATA_STATUS_LABELS } from '../../utils/constants';
import toast from 'react-hot-toast';

const CrawlData = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [debugInfo, setDebugInfo] = useState(null);

  const queryClient = useQueryClient();

  const { data: crawlData, isLoading, error, refetch } = useQuery({
    queryKey: ['crawl-data', { search: searchTerm, status: statusFilter, type: typeFilter, source: sourceFilter, page: currentPage }],
    queryFn: async () => {
      try {
        const response = await dataAPI.getAll({
          search: searchTerm,
          status: statusFilter,
          type: typeFilter,
          source: sourceFilter,
          page: currentPage,
          limit: 20
        });
        return response;
      } catch (error) {
        console.error('❌ API Error:', error);
        console.error('❌ Error response:', error.response);
        console.error('❌ Error config:', error.config);
        setDebugInfo({
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
          headers: error.config?.headers
        });
        throw error;
      }
    },
    retry: 1,
    onError: (error) => {
      console.error('CrawlData API error:', error);
      toast.error(`Lỗi API: ${error.message}`);
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
      pending: 'text-yellow-600',
      translated: 'text-blue-600',
      approved: 'text-green-600',
      rejected: 'text-red-600',
    };
    return colors[status] || 'text-gray-600';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={12} />;
      case 'translated':
        return <Globe size={12} />;
      case 'approved':
        return <CheckCircle size={12} />;
      case 'rejected':
        return <XCircle size={12} />;
      default:
        return <Clock size={12} />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDebugAPI = async () => {
    try {
      const response = await dataAPI.getAll({ page: 1, limit: 20 });
      alert(`API Response: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      console.error('❌ Direct API call error:', error);
      alert(`API Error: ${error.message}\nStatus: ${error.response?.status}\nData: ${JSON.stringify(error.response?.data, null, 2)}`);
    }
  };

  // Get data from correct structure
  const products = Array.isArray(crawlData?.data?.data) ? crawlData.data.data : [];
  const pagination = crawlData?.data?.pagination || {};

  // Pagination functions
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const totalPages = pagination.pages || 1;
    const currentPageNum = pagination.page || 1;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPageNum <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPageNum >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPageNum - 1; i <= currentPageNum + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dữ liệu cào</h1>
          <p className="text-gray-600">
            Tổng cộng {pagination.total || 0} sản phẩm được thu thập
            {pagination.total > 0 && (
              <span className="text-sm text-gray-500 ml-2">
                (Trang {pagination.page || 1} của {pagination.pages || 1})
              </span>
            )}
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => refetch()}
            className="btn-secondary flex items-center space-x-2"
          >
            <Search size={16} />
            <span>Tải lại dữ liệu</span>
          </button>
          <button
            onClick={handleDebugAPI}
            className="btn-secondary flex items-center space-x-2"
          >
            <Eye size={16} />
            <span>Debug API</span>
          </button>
          <button className="btn-secondary flex items-center space-x-2">
            <Eye size={16} />
            <span>View Log</span>
          </button>
          <button className="btn-secondary flex items-center space-x-2">
            <Clock size={16} />
            <span>Refresh Stats</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <ExternalLink size={16} />
            <span>Xuất dữ liệu</span>
          </button>
        </div>
      </div>

      {/* Debug Info */}
      {debugInfo && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 mb-2">Debug Information</h3>
              <div className="text-xs text-red-700 space-y-1">
                <p><strong>Message:</strong> {debugInfo.message}</p>
                <p><strong>Status:</strong> {debugInfo.status || 'N/A'}</p>
                <p><strong>URL:</strong> {debugInfo.url || 'N/A'}</p>
                {debugInfo.headers && (
                  <p><strong>Headers:</strong> {JSON.stringify(debugInfo.headers, null, 2)}</p>
                )}
                {debugInfo.data && (
                  <p><strong>Response:</strong> {JSON.stringify(debugInfo.data, null, 2)}</p>
                )}
              </div>
              <button
                onClick={() => setDebugInfo(null)}
                className="mt-2 text-xs text-red-600 hover:text-red-800"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm dữ liệu..."
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

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="input-field"
          >
            <option value="">Tất cả nguồn</option>
            <option value="DAISANB2B">DAISANB2B</option>
            <option value="ALIBABA">ALIBABA</option>
            <option value="OTHER">Khác</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setTypeFilter('');
              setSourceFilter('');
              setCurrentPage(1);
            }}
            className="btn-secondary"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Data List */}
      <div className="card">
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border-b border-gray-200">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0">
            {products.map((item, index) => (
              <div
                key={item._id}
                className={`p-4 hover:bg-gray-50 transition-colors ${index !== products.length - 1 ? 'border-b border-gray-200' : ''}`}
              >
                {/* Main Row */}
                <div className="flex items-center justify-between mb-2">
                  {/* SKU & Title */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {item.metadata?.sku || `SKU: ${item._id?.slice(-8)}`}
                      </span>
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {item.title || `Sản phẩm ${index + 1}`}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="w-24 flex-shrink-0 text-right">
                    <span className="text-sm font-medium text-green-600">
                      {item.metadata?.price ? new Intl.NumberFormat('vi-VN').format(item.metadata.price) : 'N/A'}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="w-24 flex-shrink-0 text-center">
                    <span className={`inline-flex items-center space-x-1 text-xs ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span>{DATA_STATUS_LABELS[item.status]}</span>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="w-20 flex-shrink-0 flex items-center justify-end space-x-1">
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                        title="Xem chi tiết"
                      >
                        <Eye size={14} />
                      </a>
                    )}

                    {item.status === 'pending' && (
                      <button
                        onClick={() => translateMutation.mutate(item._id)}
                        disabled={translateMutation.isLoading}
                        className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                        title="Dịch nội dung"
                      >
                        <Globe size={14} />
                      </button>
                    )}

                    {item.status === 'translated' && (
                      <>
                        <button
                          onClick={() => approveMutation.mutate(item._id)}
                          disabled={approveMutation.isLoading}
                          className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                          title="Duyệt"
                        >
                          <CheckCircle size={14} />
                        </button>
                        <button
                          onClick={() => rejectMutation.mutate(item._id)}
                          disabled={rejectMutation.isLoading}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                          title="Từ chối"
                        >
                          <XCircle size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="flex items-center space-x-6 text-xs text-gray-500">
                  {/* Source */}
                  <div className="flex items-center space-x-1">
                    <Database size={12} />
                    <span>{item.source || 'N/A'}</span>
                  </div>

                  {/* Type */}
                  <div className="flex items-center space-x-1">
                    <Tag size={12} />
                    <span>{DATA_TYPE_LABELS[item.type] || item.type || 'N/A'}</span>
                  </div>

                  {/* Campaign */}
                  {item.campaignId && (
                    <div className="flex items-center space-x-1">
                      <Play size={12} />
                      <span>Campaign: {item.campaignId.name || item.campaignId._id || 'N/A'}</span>
                    </div>
                  )}

                  {/* Actor */}
                  {item.actorId && (
                    <div className="flex items-center space-x-1">
                      <User size={12} />
                      <span>Actor: {item.actorId.name || item.actorId._id || 'N/A'}</span>
                    </div>
                  )}

                  {/* Created Date */}
                  <div className="flex items-center space-x-1">
                    <Calendar size={12} />
                    <span>{formatDate(item.createdAt)}</span>
                  </div>

                  {/* Category */}
                  {item.metadata?.category && (
                    <div className="flex items-center space-x-1">
                      <Tag size={12} />
                      <span>{item.metadata.category}</span>
                    </div>
                  )}

                  {/* Supplier */}
                  {item.metadata?.supplier && (
                    <div className="flex items-center space-x-1">
                      <User size={12} />
                      <span>{item.metadata.supplier}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
                Trước
              </button>

              <div className="flex items-center space-x-1">
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && handlePageChange(page)}
                    disabled={page === '...'}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${page === pagination.page
                      ? 'bg-blue-600 text-white'
                      : page === '...'
                        ? 'text-gray-400 cursor-default'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="text-sm text-gray-500">
              Hiển thị {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} của {pagination.total} sản phẩm
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <AlertTriangle size={48} className="mx-auto text-red-300 mb-4" />
            <p className="text-red-500 font-medium">Lỗi khi tải dữ liệu</p>
            <p className="text-sm text-gray-600 mt-2">
              {error.message || 'Không thể kết nối đến server'}
            </p>
            {error.response?.status && (
              <p className="text-xs text-gray-500 mt-1">
                HTTP Status: {error.response.status}
              </p>
            )}
            <button
              onClick={() => refetch()}
              className="mt-4 btn-secondary"
            >
              Thử lại
            </button>
          </div>
        )}

        {products.length === 0 && !isLoading && !error && (
          <div className="text-center py-8">
            <Globe size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Không có dữ liệu nào</p>
            <p className="text-xs text-gray-400 mt-1">Hãy chạy campaign để thu thập dữ liệu</p>
            <button
              onClick={() => refetch()}
              className="mt-4 btn-secondary"
            >
              Tải lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrawlData; 