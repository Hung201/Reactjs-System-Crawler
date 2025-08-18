import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Search, Filter, Code, Calendar, BarChart3, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import ApifyService from '../../services/apifyService';
import toast from 'react-hot-toast';

const ActorList = ({ actors, loading, platform, onRunActor }) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedActor, setSelectedActor] = useState(null);
    const [scheduleTime, setScheduleTime] = useState(60); // Mặc định 60 phút
    const [showSchedulesList, setShowSchedulesList] = useState(false);
    const [schedules, setSchedules] = useState([]);

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

    // Load schedules from localStorage
    useEffect(() => {
        const savedSchedules = JSON.parse(localStorage.getItem('actorSchedules') || '[]');
        console.log('Loading schedules from localStorage:', savedSchedules);
        console.log('Number of schedules:', savedSchedules.length);

        // Khôi phục intervals cho các schedules đã có
        const restoredSchedules = savedSchedules.map(schedule => {
            // Tính thời gian còn lại đến lần chạy tiếp theo
            const now = new Date();
            const nextRunTime = new Date(schedule.nextRun);
            const timeUntilNextRun = nextRunTime.getTime() - now.getTime();

            // Nếu đã quá thời gian chạy tiếp theo, chạy ngay và tính thời gian mới
            if (timeUntilNextRun <= 0) {
                // Chạy actor ngay lập tức
                console.log('Running delayed actor:', schedule.actorName);
                // Tìm actor trong danh sách để chạy
                const actor = actors.find(a => a.id === schedule.actorId);
                if (actor) {
                    // Gọi API trực tiếp thay vì mở modal
                    runActorDirectly(actor);
                }

                // Tính thời gian chạy tiếp theo mới
                const newNextRun = new Date(now.getTime() + schedule.interval * 60 * 1000);
                schedule.nextRun = newNextRun.toISOString();
            }

            // Tạo interval mới
            const intervalId = setInterval(() => {
                console.log('Running scheduled actor:', schedule.actorName);
                const actor = actors.find(a => a.id === schedule.actorId);
                if (actor) {
                    // Gọi API trực tiếp thay vì mở modal
                    runActorDirectly(actor);
                }

                // Cập nhật thời gian chạy tiếp theo
                const newNextRun = new Date(Date.now() + schedule.interval * 60 * 1000);
                schedule.nextRun = newNextRun.toISOString();

                // Cập nhật localStorage
                const updatedSchedules = JSON.parse(localStorage.getItem('actorSchedules') || '[]');
                const scheduleIndex = updatedSchedules.findIndex(s => s.actorId === schedule.actorId);
                if (scheduleIndex !== -1) {
                    updatedSchedules[scheduleIndex].nextRun = schedule.nextRun;
                    localStorage.setItem('actorSchedules', JSON.stringify(updatedSchedules));
                }
            }, schedule.interval * 60 * 1000);

            return {
                ...schedule,
                intervalId: intervalId
            };
        });

        setSchedules(restoredSchedules);

        // Cập nhật localStorage với thời gian mới
        localStorage.setItem('actorSchedules', JSON.stringify(restoredSchedules.map(s => ({
            actorId: s.actorId,
            actorName: s.actorName,
            interval: s.interval,
            startTime: s.startTime,
            nextRun: s.nextRun
        }))));

    }, [actors, platform]);

    // Cleanup intervals when component unmounts
    useEffect(() => {
        return () => {
            schedules.forEach(schedule => {
                if (schedule.intervalId) {
                    clearInterval(schedule.intervalId);
                }
            });
        };
    }, [schedules]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (value) => {
        setItemsPerPage(parseInt(value));
        setCurrentPage(1);
    };

    const handleScheduleActor = (actor) => {
        setSelectedActor(actor);
        setShowScheduleModal(true);
    };

    const handleConfirmSchedule = () => {
        if (selectedActor && scheduleTime > 0) {
            // Tạo interval để chạy actor theo thời gian đã hẹn
            const intervalId = setInterval(() => {
                console.log('Running scheduled actor:', selectedActor.name);
                // Gọi API trực tiếp thay vì mở modal
                runActorDirectly(selectedActor);

                // Cập nhật thời gian chạy tiếp theo
                const newNextRun = new Date(Date.now() + scheduleTime * 60 * 1000);

                // Cập nhật state và localStorage
                setSchedules(prevSchedules => {
                    const updatedSchedules = prevSchedules.map(s =>
                        s.actorId === selectedActor.id
                            ? { ...s, nextRun: newNextRun.toISOString() }
                            : s
                    );

                    // Cập nhật localStorage (không lưu intervalId)
                    localStorage.setItem('actorSchedules', JSON.stringify(updatedSchedules.map(s => ({
                        actorId: s.actorId,
                        actorName: s.actorName,
                        interval: s.interval,
                        startTime: s.startTime,
                        nextRun: s.nextRun
                    }))));

                    return updatedSchedules;
                });
            }, scheduleTime * 60 * 1000);

            // Lưu thông tin hẹn giờ vào localStorage (không lưu intervalId)
            const scheduleInfo = {
                actorId: selectedActor.id,
                actorName: selectedActor.name,
                interval: scheduleTime,
                startTime: new Date().toISOString(),
                nextRun: new Date(Date.now() + scheduleTime * 60 * 1000).toISOString()
            };

            const existingSchedules = JSON.parse(localStorage.getItem('actorSchedules') || '[]');
            existingSchedules.push(scheduleInfo);
            localStorage.setItem('actorSchedules', JSON.stringify(existingSchedules));

            // Cập nhật state với intervalId
            const newScheduleWithInterval = {
                ...scheduleInfo,
                intervalId: intervalId
            };

            setSchedules(prevSchedules => [...prevSchedules, newScheduleWithInterval]);

            console.log('Created new schedule:', newScheduleWithInterval);
            console.log('All schedules after adding:', [...schedules, newScheduleWithInterval]);

            // Hiển thị thông báo thành công
            toast.success(`Đã hẹn giờ chạy actor "${selectedActor.name}" mỗi ${scheduleTime} phút. Actor sẽ tự động chạy khi đến thời gian.`);

            setShowScheduleModal(false);
            setSelectedActor(null);
            setScheduleTime(60);
        }
    };

    const handleCancelSchedule = () => {
        setShowScheduleModal(false);
        setSelectedActor(null);
        setScheduleTime(60);
    };

    const handleCancelScheduledActor = (scheduleIndex) => {
        const updatedSchedules = [...schedules];
        const scheduleToCancel = updatedSchedules[scheduleIndex];

        // Clear the interval
        if (scheduleToCancel.intervalId) {
            clearInterval(scheduleToCancel.intervalId);
        }

        // Remove from array
        updatedSchedules.splice(scheduleIndex, 1);

        // Update localStorage
        localStorage.setItem('actorSchedules', JSON.stringify(updatedSchedules));
        setSchedules(updatedSchedules);

        alert(`Đã hủy hẹn giờ cho actor "${scheduleToCancel.actorName}"`);
    };

    const handleShowSchedulesList = () => {
        setShowSchedulesList(true);
    };

    const handleCloseSchedulesList = () => {
        setShowSchedulesList(false);
    };

    // Hàm gọi API trực tiếp thay vì mở modal
    const runActorDirectly = async (actor) => {
        try {
            console.log('Running actor directly:', actor.name);

            if (!platform?.apiToken) {
                console.error('No API token available');
                toast.error('Không có API token để chạy actor');
                return;
            }

            const apifyService = new ApifyService(platform.apiToken);
            const result = await apifyService.runActor(actor.id, {});

            console.log('Actor run result:', result);
            toast.success(`Actor "${actor.name}" đã được chạy thành công!`);

        } catch (error) {
            console.error('Error running actor directly:', error);
            toast.error(`Không thể chạy actor "${actor.name}": ${error.message}`);
        }
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
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleShowSchedulesList}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Clock className="h-4 w-4 mr-1" />
                            Quản lý hẹn giờ ({schedules.length})
                        </button>
                        {/* Debug info */}
                        <span className="text-xs text-gray-500">
                            Debug: {schedules.length} schedules
                        </span>
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
                                            {actor.description || actor.name}
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
                                        {actor.name}
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

                                <div className="flex items-center space-x-2 ml-4 mt-4">
                                    <button
                                        onClick={() => onRunActor(actor)}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <Play className="h-4 w-4 mr-1" />
                                        Chạy
                                    </button>
                                    <button
                                        onClick={() => handleScheduleActor(actor)}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <Clock className="h-4 w-4 mr-1" />
                                        Hẹn giờ
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

            {/* Modal Danh sách hẹn giờ */}
            {showSchedulesList && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Quản lý hẹn giờ ({schedules.length})
                                </h3>
                                <button
                                    onClick={handleCloseSchedulesList}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {schedules.length === 0 ? (
                                <div className="text-center py-8">
                                    <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <p className="text-gray-500">Chưa có lịch hẹn giờ nào</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {schedules.map((schedule, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900">
                                                        {schedule.actorName}
                                                    </h4>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Chạy mỗi {schedule.interval} phút
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Bắt đầu: {new Date(schedule.startTime).toLocaleString('vi-VN')}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        Lần chạy tiếp theo: {new Date(schedule.nextRun).toLocaleString('vi-VN')}
                                                    </p>
                                                    <p className="text-xs text-blue-500">
                                                        Còn lại: {Math.max(0, Math.floor((new Date(schedule.nextRun).getTime() - new Date().getTime()) / 1000 / 60))} phút
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleCancelScheduledActor(index)}
                                                    className="ml-4 px-3 py-1 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                >
                                                    Hủy
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={handleCloseSchedulesList}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Hẹn giờ */}
            {showScheduleModal && selectedActor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Hẹn giờ chạy Actor
                                </h3>
                                <button
                                    onClick={handleCancelSchedule}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-2">
                                    Actor: <span className="font-medium text-gray-900">{selectedActor.name}</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                    Mô tả: <span className="font-medium text-gray-900">{selectedActor.description}</span>
                                </p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Thời gian chạy (phút)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="1440"
                                    value={scheduleTime}
                                    onChange={(e) => setScheduleTime(parseInt(e.target.value) || 60)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập số phút"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Nhập số phút (1-1440). Actor sẽ chạy tự động mỗi {scheduleTime} phút.
                                </p>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={handleCancelSchedule}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleConfirmSchedule}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActorList;
