import React, { useState, useEffect } from 'react';
import {
    Clock,
    Play,
    Pause,
    Trash2,
    Edit,
    Plus,
    Calendar,
    AlertCircle,
    CheckCircle,
    XCircle,
    Settings,
    RefreshCw
} from 'lucide-react';

const ScheduleManagementModal = ({
    isOpen,
    onClose,
    schedules,
    onCancelSchedule,
    onEditSchedule,
    onAddSchedule,
    onUpdateSchedules,
    actors = [],
    initialFormData = null,
    onRunActor = null
}) => {
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all'); // all, active, paused
    const [searchTerm, setSearchTerm] = useState('');

    // Form state for adding/editing schedule
    const [formData, setFormData] = useState({
        actorId: '',
        interval: 60,
        startTime: new Date().toISOString().slice(0, 16),
        isActive: true
    });

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setShowAddForm(false);
            setShowEditForm(false);
            setSelectedSchedule(null);
            setFormData({
                actorId: '',
                interval: 60,
                startTime: new Date().toISOString().slice(0, 16),
                isActive: true
            });
        } else if (initialFormData) {
            // Pre-fill form if initialFormData is provided
            setFormData(initialFormData);
            setShowAddForm(true);
        }
    }, [isOpen, initialFormData]);

    // Force validate schedules when modal opens
    useEffect(() => {
        if (isOpen && schedules.length > 0 && onUpdateSchedules) {
            const validatedSchedules = schedules.map(schedule => validateSchedule(schedule));
            const hasChanges = validatedSchedules.some((schedule, index) =>
                schedule.nextRun !== schedules[index].nextRun
            );

            if (hasChanges) {
                // Update parent component's schedules immediately
                onUpdateSchedules(validatedSchedules);
            }
        }
    }, [isOpen, schedules, onUpdateSchedules]);

    // Filter schedules based on search and status
    const filteredSchedules = schedules.filter(schedule => {
        const matchesSearch = schedule.actorName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && schedule.isActive) ||
            (filterStatus === 'paused' && !schedule.isActive);
        return matchesSearch && matchesStatus;
    });

    // Calculate time remaining for each schedule
    const getTimeRemaining = (nextRun) => {
        const now = new Date().getTime();
        const nextRunTime = new Date(nextRun).getTime();
        const diff = nextRunTime - now;

        if (diff <= 0) return { minutes: 0, seconds: 0, status: 'overdue' };

        const minutes = Math.floor(diff / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return { minutes, seconds, status: 'upcoming' };
    };

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

    // Get status color and icon
    const getStatusInfo = (schedule) => {
        const timeRemaining = getTimeRemaining(schedule.nextRun);

        if (!schedule.isActive) {
            return {
                color: 'text-gray-500',
                bgColor: 'bg-gray-100',
                icon: <Pause className="w-4 h-4" />,
                text: 'Tạm dừng'
            };
        }

        if (timeRemaining.status === 'overdue') {
            return {
                color: 'text-red-600',
                bgColor: 'bg-red-100',
                icon: <AlertCircle className="w-4 h-4" />,
                text: 'Quá hạn'
            };
        }

        return {
            color: 'text-green-600',
            bgColor: 'bg-green-100',
            icon: <CheckCircle className="w-4 h-4" />,
            text: 'Đang chạy'
        };
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Calculate next run time
        const nextRun = calculateNextRun(formData.startTime, formData.interval);

        const scheduleDataWithNextRun = {
            ...formData,
            nextRun: nextRun
        };

        if (showAddForm) {
            onAddSchedule(scheduleDataWithNextRun);
        } else if (showEditForm && selectedSchedule) {
            onEditSchedule(selectedSchedule.id, scheduleDataWithNextRun);
        }
        setShowAddForm(false);
        setShowEditForm(false);
        setSelectedSchedule(null);
    };

    // Handle edit schedule
    const handleEdit = (schedule) => {
        setSelectedSchedule(schedule);
        setFormData({
            actorId: schedule.actorId,
            interval: schedule.interval,
            startTime: new Date(schedule.startTime).toISOString().slice(0, 16),
            isActive: schedule.isActive
        });
        setShowEditForm(true);
    };

    // Auto-update next run times for overdue schedules and force re-render for countdown
    useEffect(() => {
        if (isOpen && schedules.length > 0) {
            const updatedSchedules = schedules.map(schedule => {
                if (schedule.isActive) {
                    // Validate and fix schedule data
                    const validatedSchedule = validateSchedule(schedule);
                    if (validatedSchedule.nextRun !== schedule.nextRun) {
                        return validatedSchedule;
                    }
                }
                return schedule;
            });

            // Update schedules if any were changed
            const hasChanges = updatedSchedules.some((schedule, index) =>
                schedule.nextRun !== schedules[index].nextRun
            );

            if (hasChanges && onUpdateSchedules) {
                // Update parent component's schedules
                onUpdateSchedules(updatedSchedules);
            }
        }
    }, [isOpen, schedules, onUpdateSchedules]);

    // Force re-render every second for countdown timer
    const [, forceUpdate] = useState({});
    useEffect(() => {
        if (isOpen) {
            const timer = setInterval(() => {
                forceUpdate({});
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isOpen]);

    // Format interval display
    const formatInterval = (minutes) => {
        if (minutes < 60) return `${minutes} phút`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (remainingMinutes === 0) return `${hours} giờ`;
        return `${hours} giờ ${remainingMinutes} phút`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Quản lý hẹn giờ</h2>
                                <p className="text-blue-100 text-sm">
                                    {schedules.length} lịch hẹn giờ • {schedules.filter(s => s.isActive).length} đang hoạt động
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Filters and Actions */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Search */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm actor..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            </div>

                            {/* Status Filter */}
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Tất cả</option>
                                <option value="active">Đang hoạt động</option>
                                <option value="paused">Tạm dừng</option>
                            </select>
                        </div>

                        {/* Add Schedule Button */}
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Thêm lịch hẹn
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    {showAddForm || showEditForm ? (
                        /* Add/Edit Form */
                        <div className="p-6">
                            <div className="max-w-2xl mx-auto">
                                <h3 className="text-lg font-semibold mb-4">
                                    {showAddForm ? 'Thêm lịch hẹn giờ mới' : 'Chỉnh sửa lịch hẹn giờ'}
                                </h3>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Actor Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Chọn Actor
                                        </label>
                                        <select
                                            value={formData.actorId}
                                            onChange={(e) => setFormData({ ...formData, actorId: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Chọn actor...</option>
                                            {actors.map(actor => (
                                                <option key={actor.id} value={actor.id}>
                                                    {actor.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Interval */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tần suất chạy
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="number"
                                                min="1"
                                                value={formData.interval}
                                                onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value) })}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                            <span className="text-gray-600">phút</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Chạy mỗi {formatInterval(formData.interval)}
                                        </p>
                                    </div>

                                    {/* Start Time */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Thời gian bắt đầu
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={formData.startTime}
                                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    {/* Active Status */}
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                                            Kích hoạt ngay sau khi tạo
                                        </label>
                                    </div>

                                    {/* Form Actions */}
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAddForm(false);
                                                setShowEditForm(false);
                                                setSelectedSchedule(null);
                                            }}
                                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            {showAddForm ? 'Thêm lịch hẹn' : 'Cập nhật'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    ) : (
                        /* Schedule List */
                        <div className="p-6">
                            {filteredSchedules.length === 0 ? (
                                <div className="text-center py-12">
                                    <Clock className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        {searchTerm || filterStatus !== 'all' ? 'Không tìm thấy lịch hẹn giờ' : 'Chưa có lịch hẹn giờ nào'}
                                    </h3>
                                    <p className="text-gray-500 mb-6">
                                        {searchTerm || filterStatus !== 'all'
                                            ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                                            : 'Tạo lịch hẹn giờ đầu tiên để tự động chạy actor'
                                        }
                                    </p>
                                    {!searchTerm && filterStatus === 'all' && (
                                        <button
                                            onClick={() => setShowAddForm(true)}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Thêm lịch hẹn đầu tiên
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {filteredSchedules.map((schedule, index) => {
                                        // Validate schedule before displaying
                                        const validatedSchedule = validateSchedule(schedule);
                                        const timeRemaining = getTimeRemaining(validatedSchedule.nextRun);
                                        const statusInfo = getStatusInfo(validatedSchedule);

                                        return (
                                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-3">
                                                            <div className={`p-2 rounded-lg ${statusInfo.bgColor}`}>
                                                                {statusInfo.icon}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900">
                                                                    {validatedSchedule.actorName}
                                                                </h4>
                                                                <span className={`text-sm font-medium ${statusInfo.color}`}>
                                                                    {statusInfo.text}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                                            <div>
                                                                <span className="font-medium">Tần suất:</span>
                                                                <p>{formatInterval(validatedSchedule.interval)}</p>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Bắt đầu:</span>
                                                                <p>{new Date(validatedSchedule.startTime).toLocaleString('vi-VN')}</p>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Lần chạy tiếp theo:</span>
                                                                <p>{new Date(validatedSchedule.nextRun).toLocaleString('vi-VN')}</p>
                                                            </div>
                                                        </div>

                                                        {validatedSchedule.isActive && timeRemaining.status === 'upcoming' && (
                                                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-sm font-medium text-blue-800">
                                                                        Còn lại: {timeRemaining.minutes} phút {timeRemaining.seconds} giây
                                                                    </span>
                                                                    <div className="w-24 bg-blue-200 rounded-full h-2">
                                                                        <div
                                                                            className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                                                                            style={{
                                                                                width: `${Math.max(0, Math.min(100, (timeRemaining.minutes * 60 + timeRemaining.seconds) / (validatedSchedule.interval * 60) * 100))}%`
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center space-x-2 ml-4">
                                                        <button
                                                            onClick={() => handleEdit(validatedSchedule)}
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => onCancelSchedule(index)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Hủy lịch hẹn"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!showAddForm && !showEditForm && (
                    <div className="p-6 border-t border-gray-200 bg-gray-50">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                Hiển thị {filteredSchedules.length} trong tổng số {schedules.length} lịch hẹn giờ
                            </div>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Search icon component
const Search = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

export default ScheduleManagementModal;
