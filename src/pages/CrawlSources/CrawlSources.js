import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Play, Edit, Trash2, MoreVertical, Globe, Database, Code, Target, Clock, CheckCircle, AlertCircle, Copy, Eye } from 'lucide-react';
import { sourcesAPI, templatesAPI } from '../../services/api';
import { SOURCE_STATUS_LABELS, DATA_TYPE_LABELS } from '../../utils/constants';
import toast from 'react-hot-toast';
import SourceModal from '../../components/SourceModal/SourceModal';
import TemplateModal from '../../components/TemplateModal/TemplateModal';
import ConfirmModal from '../../components/Common/ConfirmModal';

const CrawlSources = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteTemplateModal, setShowDeleteTemplateModal] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState(null);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const queryClient = useQueryClient();

  const { data: sources, isLoading, error } = useQuery({
    queryKey: ['sources', { search: searchTerm, status: statusFilter, type: typeFilter }],
    queryFn: () => sourcesAPI.getAll({ search: searchTerm, status: statusFilter, type: typeFilter }),
    retry: 1,
    onError: (error) => {
      console.error('Sources API error:', error);
    }
  });

  // Fetch templates from API
  const { data: templatesData, isLoading: templatesLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => templatesAPI.getAll(),
    retry: 1,
    onError: (error) => {
      console.error('Templates API error:', error);
    }
  });

  // Helper function to get template icon based on category
  const getTemplateIcon = (category) => {
    switch (category) {
      case 'ecommerce':
        return <Database className="w-5 h-5" />;
      case 'blog':
      case 'wordpress':
        return <Globe className="w-5 h-5" />;
      case 'news':
        return <Target className="w-5 h-5" />;
      default:
        return <Code className="w-5 h-5" />;
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa sử dụng';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Get templates from API data
  const templates = templatesData?.data || [];

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

  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => templatesAPI.delete(id),
    onSuccess: () => {
      toast.success('Template đã được xóa!');
      queryClient.invalidateQueries(['templates']);
      setShowDeleteTemplateModal(false);
      setTemplateToDelete(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể xóa template');
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

  const handleCreateFromTemplate = (template) => {
    // Tạo source data từ template
    const sourceData = {
      name: `${template.name} - Source`,
      description: `Tạo từ template: ${template.name}`,
      url: template.input?.url || '',
      actorId: template.actorId?.id || template.actorId,
      type: template.category || 'custom',
      status: 'active',
      // Copy selectors từ template
      selectors: template.selectors || {},
      // Copy input config từ template
      input: {
        ...template.input,
        url: template.input?.url || ''
      },
      // Copy filters từ template
      filters: template.filters || {},
      // Copy config từ template
      config: template.config || {}
    };

    setEditingSource(sourceData);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (sourceToDelete) {
      deleteMutation.mutate(sourceToDelete._id);
    }
  };

  const confirmDeleteTemplate = () => {
    if (templateToDelete) {
      deleteTemplateMutation.mutate(templateToDelete.id);
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
      blog: 'bg-green-100 text-green-800',
      custom: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getSuccessRateColor = (rate) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredSources = Array.isArray(sources?.data) ? sources.data : [];

  console.log('CrawlSources - sources:', sources);
  console.log('CrawlSources - sources.data:', sources?.data);
  console.log('CrawlSources - filteredSources:', filteredSources);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Nguồn Crawl</h1>
                <p className="text-gray-600 mt-1">Quản lý các template và nguồn dữ liệu để crawl</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center space-x-1">
                <Database size={14} />
                <span>{templates.length} templates</span>
              </span>
              <span className="flex items-center space-x-1">
                <Globe size={14} />
                <span>{filteredSources.length} nguồn</span>
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setEditingTemplate(null);
                setShowTemplateModal(true);
              }}
              className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm"
            >
              <Plus size={18} className="mr-2" />
              <span>Thêm template</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm"
            >
              <Plus size={18} className="mr-2" />
              <span>Thêm nguồn</span>
            </button>
          </div>
        </div>
      </div>

      {/* Templates Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Code className="w-4 h-4 text-white" />
                </div>
                <span>Website Templates</span>
              </h2>
              <p className="text-sm text-gray-500 mt-1">Chọn template để tạo nguồn crawl nhanh</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {templates.length} templates
              </span>
            </div>
          </div>
        </div>
        <div className="p-6">

          {templatesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="w-12 h-4 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="h-5 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <div className="flex-1 h-9 bg-gray-200 rounded-lg"></div>
                    <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
                    <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Code className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không có template nào</h3>
              <p className="text-gray-500 mb-6">Hãy tạo template đầu tiên để bắt đầu</p>
              <button
                onClick={() => {
                  setEditingTemplate(null);
                  setShowTemplateModal(true);
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Tạo template đầu tiên
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer relative overflow-hidden"
                  onClick={() => handleCreateFromTemplate(template)}
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                          {getTemplateIcon(template.category)}
                        </div>
                        <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(template.status)}`}>
                          {template.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className={`text-sm font-semibold ${getSuccessRateColor(template.successRate || 0)}`}>
                          {template.successRate || 0}%
                        </span>
                        <CheckCircle size={14} className={getSuccessRateColor(template.successRate || 0)} />
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>

                    {/* Info Grid */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Globe size={12} className="flex-shrink-0" />
                        <span className="truncate font-medium">{template.website || template.urlPattern}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock size={12} className="flex-shrink-0" />
                        <span>Lần cuối: {formatDate(template.lastUsed)}</span>
                      </div>
                      {template.actorId && (
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Code size={12} className="flex-shrink-0" />
                          <span className="truncate">{template.actorId.name}</span>
                        </div>
                      )}
                      {template.totalUses !== undefined && (
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Database size={12} className="flex-shrink-0" />
                          <span>Đã sử dụng: {template.totalUses} lần</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {template.tags && template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {template.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={`${template.id}-tag-${index}`}
                            className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {template.tags.length > 3 && (
                          <span key={`${template.id}-more-tags`} className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                            +{template.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateFromTemplate(template);
                        }}
                      >
                        Sử dụng template
                      </button>
                      <button
                        className="px-3 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Edit template clicked:', template);
                          console.log('Template ID:', template.id || template._id);
                          setEditingTemplate(template);
                          setShowTemplateModal(true);
                        }}
                        title="Chỉnh sửa template"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="px-3 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTemplateToDelete(template);
                          setShowDeleteTemplateModal(true);
                        }}
                        title="Xóa template"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <span>Bộ lọc & Tìm kiếm</span>
          </h3>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setTypeFilter('');
            }}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Xóa tất cả
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm nguồn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Tạm dừng</option>
            <option value="archived">Đã lưu trữ</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option value="">Tất cả loại</option>
            <option value="product">Sản phẩm</option>
            <option value="news">Tin tức</option>
            <option value="blog">Blog</option>
            <option value="custom">Tùy chỉnh</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setTypeFilter('');
            }}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Sources Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Globe className="w-5 h-5 text-blue-600" />
            <span>Danh sách nguồn crawl</span>
          </h3>
        </div>
        <div className="p-6">
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
                    <th className="table-header">Hiệu suất</th>
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
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <span className={`text-sm font-medium ${getSuccessRateColor(source.successRate || 85)}`}>
                              {source.successRate || 85}%
                            </span>
                            <CheckCircle size={12} className={getSuccessRateColor(source.successRate || 85)} />
                          </div>
                          <span className="text-xs text-gray-500">
                            {source.lastRun ? new Date(source.lastRun).toLocaleDateString('vi-VN') : 'Chưa chạy'}
                          </span>
                        </div>
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
              <AlertCircle size={48} className="mx-auto text-red-300 mb-4" />
              <p className="text-red-500 font-medium">Lỗi khi tải dữ liệu</p>
              <p className="text-xs text-gray-400 mt-2">
                {error.message || 'Không thể kết nối đến server'}
              </p>
            </div>
          )}

          {filteredSources.length === 0 && !isLoading && !error && (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Globe className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không có nguồn crawl nào</h3>
              <p className="text-gray-500 mb-6">Hãy tạo nguồn crawl mới hoặc sử dụng template có sẵn</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm"
              >
                <Plus size={16} className="mr-2" />
                Tạo nguồn đầu tiên
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <SourceModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingSource(null);
          setSelectedTemplate(null);
        }}
        source={editingSource}
        template={selectedTemplate}
      />

      <TemplateModal
        isOpen={showTemplateModal}
        onClose={() => {
          setShowTemplateModal(false);
          setEditingTemplate(null);
        }}
        template={editingTemplate}
        onSuccess={() => {
          queryClient.invalidateQueries(['templates']);
        }}
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

      <ConfirmModal
        isOpen={showDeleteTemplateModal}
        onClose={() => {
          setShowDeleteTemplateModal(false);
          setTemplateToDelete(null);
        }}
        onConfirm={confirmDeleteTemplate}
        title="Xóa template"
        message={`Bạn có chắc chắn muốn xóa template "${templateToDelete?.name}"?`}
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
};

export default CrawlSources; 