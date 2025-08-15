import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Download, Search, Filter, Code, Calendar, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';

const ActorList = ({ actors, loading, platform, onRunActor, onImportActor }) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Get unique categories
    const categories = ['all', ...new Set(actors.flatMap(actor => actor.categories || []))];

    // Filter and sort actors
    const filteredActors = actors
        .filter(actor => {
            const matchesSearch = actor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                actor.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' ||
                (actor.categories && actor.categories.includes(selectedCategory));
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'runs':
                    return (b.runCount || 0) - (a.runCount || 0);
                case 'created':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                default:
                    return 0;
            }
        });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    // Pagination logic
    const totalItems = filteredActors.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentActors = filteredActors.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory, sortBy]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (value) => {
        setItemsPerPage(parseInt(value));
        setCurrentPage(1);
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-20 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">
                            Actors ({filteredActors.length})
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Danh sách actors từ {platform.name}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm actors..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category === 'all' ? 'Tất cả categories' : (typeof category === 'object' ? category.value || category.label || 'Unknown' : category)}
                            </option>
                        ))}
                    </select>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="name">Sắp xếp theo tên</option>
                        <option value="runs">Sắp xếp theo số lần chạy</option>
                        <option value="created">Sắp xếp theo ngày tạo</option>
                    </select>

                    {/* Items per page */}
                    <select
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={5}>5 items</option>
                        <option value={10}>10 items</option>
                        <option value={20}>20 items</option>
                        <option value={50}>50 items</option>
                    </select>
                </div>
            </div>

            {/* Actors List */}
            <div className="divide-y divide-gray-200">
                {currentActors.length === 0 ? (
                    <div className="p-8 text-center">
                        <Code className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                            Không tìm thấy actors
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm || selectedCategory !== 'all'
                                ? 'Thử thay đổi bộ lọc tìm kiếm'
                                : 'Không có actors nào trong platform này'
                            }
                        </p>
                    </div>
                ) : (
                    currentActors.map((actor) => (
                        <div key={actor.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-3">
                                        <h4
                                            className="text-lg font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors"
                                            onClick={() => navigate(`/integrations/actor/${actor.id}`)}
                                            title="Xem chi tiết actor"
                                        >
                                            {actor.name}
                                        </h4>
                                        {actor.isPublic && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Public
                                            </span>
                                        )}
                                        {actor.isDeprecated && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                Deprecated
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                        {actor.description}
                                    </p>

                                    <div className="flex items-center space-x-6 mt-3 text-sm text-gray-500">
                                        <div className="flex items-center space-x-1">
                                            <BarChart3 className="h-4 w-4" />
                                            <span>{formatNumber(actor.stats?.totalRuns || 0)} runs</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>Tạo: {formatDate(actor.createdAt)}</span>
                                        </div>
                                        {actor.username && (
                                            <span className="text-blue-600">@{actor.username}</span>
                                        )}
                                        {actor.stats?.lastRunStartedAt && (
                                            <span>Lần chạy cuối: {formatDate(actor.stats.lastRunStartedAt)}</span>
                                        )}
                                    </div>

                                    {actor.categories && actor.categories.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-3">
                                            {actor.categories.map((category, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                >
                                                    {typeof category === 'object' ? category.value || category.label || 'Unknown' : category}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2 ml-4">
                                    <button
                                        onClick={() => onRunActor(actor)}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <Play className="h-4 w-4 mr-1" />
                                        Chạy
                                    </button>
                                    <button
                                        onClick={() => onImportActor(actor)}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <Download className="h-4 w-4 mr-1" />
                                        Import
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-gray-700">
                            <span>
                                Hiển thị {startIndex + 1}-{Math.min(endIndex, totalItems)} trong tổng số {totalItems} actors
                            </span>
                        </div>

                        <div className="flex items-center space-x-2">
                            {/* Previous button */}
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            {/* Page numbers */}
                            <div className="flex items-center space-x-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-3 py-1 text-sm border rounded-md ${currentPage === pageNum
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Next button */}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActorList;
