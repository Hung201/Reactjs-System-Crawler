import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Search, Filter, Code, Calendar, BarChart3, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import ApifyService from '../../services/apifyService';
import toast from 'react-hot-toast';
import ScheduleManagementModal from './ScheduleManagementModal';

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
    const [showScheduleManagement, setShowScheduleManagement] = useState(false);
    const [formData, setFormData] = useState({
        actorId: '',
        interval: 60,
        startTime: new Date().toISOString().slice(0, 16),
        isActive: true
    });

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

    // Calculate next run time based on start time and interval
    const calculateNextRun = (startTime, interval) => {
        const start = new Date(startTime);
        const now = new Date();
        const intervalMs = interval * 60 * 1000; // Convert minutes to milliseconds

        // If start time is in the future, use it as next run
        if (start > now) {
            return start.toISOString();
        }

        // Calculate how many intervals have passed since start
        const timeSinceStart = now.getTime() - start.getTime();
        const intervalsPassed = Math.floor(timeSinceStart / intervalMs);

        // Calculate next run time
        const nextRun = new Date(start.getTime() + (intervalsPassed + 1) * intervalMs);
        return nextRun.toISOString();
    };

    // Validate and fix schedule data
    const validateSchedule = (schedule) => {
        const now = new Date();
        const nextRun = new Date(schedule.nextRun);

        // If nextRun is in the past, recalculate it
        if (nextRun <= now) {
            const newNextRun = calculateNextRun(schedule.startTime, schedule.interval);
            return { ...schedule, nextRun: newNextRun };
        }

        return schedule;
    };

    // Load schedules from localStorage
    useEffect(() => {
        const savedSchedules = JSON.parse(localStorage.getItem('actorSchedules') || '[]');
        // Khôi phục intervals cho các schedules đã có
        const restoredSchedules = savedSchedules.map(schedule => {
            // Validate and fix schedule data first
            const validatedSchedule = validateSchedule(schedule);

            // Tính thời gian còn lại đến lần chạy tiếp theo
            const now = new Date();
            const nextRunTime = new Date(validatedSchedule.nextRun);
            const timeUntilNextRun = nextRunTime.getTime() - now.getTime();

            // Nếu đã quá thời gian chạy tiếp theo, chạy ngay và tính thời gian mới
            if (timeUntilNextRun <= 0) {
                // Tìm actor trong danh sách để chạy
                const actor = actors.find(a => a.id === validatedSchedule.actorId);
                if (actor) {
                    // Gọi API trực tiếp thay vì mở modal
                    runActorDirectly(actor);
                }

                // Tính thời gian chạy tiếp theo mới dựa trên start time và interval
                const newNextRun = calculateNextRun(validatedSchedule.startTime, validatedSchedule.interval);
                validatedSchedule.nextRun = newNextRun;
            }

            // Tạo interval mới với delay tối thiểu để tránh spam API
            const minInterval = Math.max(schedule.interval * 60 * 1000, 60000); // Tối thiểu 1 phút
            const intervalId = setInterval(() => {
                const actor = actors.find(a => a.id === schedule.actorId);
                if (actor) {
                    // Gọi API trực tiếp thay vì mở modal
                    runActorDirectly(actor);
                }

                // Cập nhật thời gian chạy tiếp theo
                const newNextRun = new Date(Date.now() + minInterval);
                schedule.nextRun = newNextRun.toISOString();

                // Cập nhật localStorage
                const updatedSchedules = JSON.parse(localStorage.getItem('actorSchedules') || '[]');
                const scheduleIndex = updatedSchedules.findIndex(s => s.actorId === schedule.actorId);
                if (scheduleIndex !== -1) {
                    updatedSchedules[scheduleIndex].nextRun = schedule.nextRun;
                    localStorage.setItem('actorSchedules', JSON.stringify(updatedSchedules));
                }
            }, minInterval);

            return {
                ...validatedSchedule,
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

    // Auto-update schedules every minute to refresh status and run actors when time comes
    useEffect(() => {
        const updateTimer = setInterval(() => {
            setSchedules(prevSchedules => {
                const updatedSchedules = prevSchedules.map(schedule => {
                    if (schedule.isActive) {
                        const now = new Date();
                        const nextRun = new Date(schedule.nextRun);

                        // Check if it's time to run the actor
                        if (nextRun <= now) {
                            // Find and run the actor
                            const actor = actors.find(a => a.id === schedule.actorId);
                            if (actor) {
                                runActorDirectly(actor);
                            }

                            // Calculate next run time
                            const newNextRun = calculateNextRun(schedule.startTime, schedule.interval);
                            return { ...schedule, nextRun: newNextRun };
                        }
                    }
                    return schedule;
                });

                // Update localStorage if any changes
                const hasChanges = updatedSchedules.some((schedule, index) =>
                    schedule.nextRun !== prevSchedules[index]?.nextRun
                );

                if (hasChanges) {
                    localStorage.setItem('actorSchedules', JSON.stringify(updatedSchedules.map(s => ({
                        actorId: s.actorId,
                        actorName: s.actorName,
                        interval: s.interval,
                        startTime: s.startTime,
                        nextRun: s.nextRun,
                        isActive: s.isActive
                    }))));
                }

                return updatedSchedules;
            });
        }, 30000); // Check every 30 seconds

        return () => clearInterval(updateTimer);
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
        setShowScheduleManagement(true);
        // Pre-fill form with selected actor
        setFormData({
            actorId: actor.id,
            interval: 60,
            startTime: new Date().toISOString().slice(0, 16),
            isActive: true
        });
    };

    const handleConfirmSchedule = () => {
        if (selectedActor && scheduleTime > 0) {
            // Tạo interval để chạy actor theo thời gian đã hẹn với delay tối thiểu
            const minInterval = Math.max(scheduleTime * 60 * 1000, 60000); // Tối thiểu 1 phút
            const intervalId = setInterval(() => {
                // Gọi API trực tiếp thay vì mở modal
                runActorDirectly(selectedActor);

                // Cập nhật thời gian chạy tiếp theo
                const newNextRun = new Date(Date.now() + minInterval);

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
            }, minInterval);

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

        // Sử dụng toast thay vì alert
        toast.success(`Đã hủy hẹn giờ cho actor "${scheduleToCancel.actorName}"`);
    };

    const handleShowSchedulesList = () => {
        setShowSchedulesList(true);
    };

    const handleCloseSchedulesList = () => {
        setShowSchedulesList(false);
    };

    // Handle schedule management
    const handleAddSchedule = (scheduleData) => {
        const actor = actors.find(a => a.id === scheduleData.actorId);
        if (!actor) {
            toast.error('Không tìm thấy actor');
            return;
        }

        const newSchedule = {
            id: Date.now().toString(),
            actorId: scheduleData.actorId,
            actorName: actor.name,
            interval: scheduleData.interval,
            startTime: scheduleData.startTime,
            nextRun: scheduleData.nextRun || new Date(scheduleData.startTime).toISOString(),
            isActive: scheduleData.isActive,
            createdAt: new Date().toISOString()
        };

        // Create interval for the new schedule if it's active
        if (scheduleData.isActive) {
            const intervalMs = scheduleData.interval * 60 * 1000;
            const intervalId = setInterval(() => {
                const now = new Date();
                const nextRun = new Date(newSchedule.nextRun);

                if (nextRun <= now) {
                    runActorDirectly(actor);

                    // Update next run time
                    const newNextRun = calculateNextRun(newSchedule.startTime, newSchedule.interval);
                    newSchedule.nextRun = newNextRun;

                    // Update localStorage
                    const currentSchedules = JSON.parse(localStorage.getItem('actorSchedules') || '[]');
                    const scheduleIndex = currentSchedules.findIndex(s => s.actorId === newSchedule.actorId);
                    if (scheduleIndex !== -1) {
                        currentSchedules[scheduleIndex].nextRun = newNextRun;
                        localStorage.setItem('actorSchedules', JSON.stringify(currentSchedules));
                    }
                }
            }, Math.min(intervalMs, 30000)); // Check every 30 seconds or interval, whichever is smaller

            newSchedule.intervalId = intervalId;
        }

        setSchedules(prev => [...prev, newSchedule]);

        // Save to localStorage
        const updatedSchedules = [...schedules, newSchedule];
        localStorage.setItem('actorSchedules', JSON.stringify(updatedSchedules.map(s => ({
            actorId: s.actorId,
            actorName: s.actorName,
            interval: s.interval,
            startTime: s.startTime,
            nextRun: s.nextRun,
            isActive: s.isActive
        }))));

        toast.success(`Đã tạo lịch hẹn giờ cho ${actor.name}`);
    };

    const handleEditSchedule = (scheduleId, scheduleData) => {
        const actor = actors.find(a => a.id === scheduleData.actorId);
        if (!actor) {
            toast.error('Không tìm thấy actor');
            return;
        }

        setSchedules(prev => prev.map(schedule =>
            schedule.id === scheduleId
                ? {
                    ...schedule,
                    actorId: scheduleData.actorId,
                    actorName: actor.name,
                    interval: scheduleData.interval,
                    startTime: scheduleData.startTime,
                    nextRun: scheduleData.nextRun || new Date(scheduleData.startTime).toISOString(),
                    isActive: scheduleData.isActive,
                    updatedAt: new Date().toISOString()
                }
                : schedule
        ));

        // Update localStorage
        const updatedSchedules = schedules.map(schedule =>
            schedule.id === scheduleId
                ? {
                    ...schedule,
                    actorId: scheduleData.actorId,
                    actorName: actor.name,
                    interval: scheduleData.interval,
                    startTime: scheduleData.startTime,
                    nextRun: scheduleData.nextRun || new Date(scheduleData.startTime).toISOString(),
                    isActive: scheduleData.isActive
                }
                : schedule
        );
        localStorage.setItem('actorSchedules', JSON.stringify(updatedSchedules.map(s => ({
            actorId: s.actorId,
            actorName: s.actorName,
            interval: s.interval,
            startTime: s.startTime,
            nextRun: s.nextRun,
            isActive: s.isActive
        }))));

        toast.success(`Đã cập nhật lịch hẹn giờ cho ${actor.name}`);
    };

    const handleUpdateSchedules = (updatedSchedules) => {
        setSchedules(updatedSchedules);

        // Update localStorage
        localStorage.setItem('actorSchedules', JSON.stringify(updatedSchedules.map(s => ({
            actorId: s.actorId,
            actorName: s.actorName,
            interval: s.interval,
            startTime: s.startTime,
            nextRun: s.nextRun,
            isActive: s.isActive
        }))));
    };

    // Hàm gọi API trực tiếp thay vì mở modal
    const runActorDirectly = async (actor) => {
        try {
            if (!platform?.apiToken) {
                toast.error('Không có API token để chạy actor');
                return;
            }

            // Get saved input data for this actor
            let inputData = {};
            try {
                const savedActorInputData = localStorage.getItem('actorInputData');
                if (savedActorInputData) {
                    const allActorData = JSON.parse(savedActorInputData);
                    inputData = allActorData[actor.id] || {};
                }
            } catch (error) {
                console.error('Error loading saved input data:', error);
            }

            const apifyService = new ApifyService(platform.apiToken);

            const result = await apifyService.runActor(actor.id, inputData);

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
                            onClick={() => setShowScheduleManagement(true)}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
                        >
                            <Clock className="h-4 w-4 mr-2" />
                            Quản lý hẹn giờ
                            {schedules.length > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                                    {schedules.length}
                                </span>
                            )}
                        </button>
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
                            className="search-input"
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



            {/* Schedule Management Modal */}
            <ScheduleManagementModal
                isOpen={showScheduleManagement}
                onClose={() => setShowScheduleManagement(false)}
                schedules={schedules}
                onCancelSchedule={handleCancelScheduledActor}
                onEditSchedule={handleEditSchedule}
                onAddSchedule={handleAddSchedule}
                onUpdateSchedules={handleUpdateSchedules}
                actors={actors}
                initialFormData={formData.actorId ? formData : null}
                onRunActor={runActorDirectly}
            />
        </div>
    );
};

export default ActorList;
