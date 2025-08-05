import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, UserPlus, Eye, EyeOff } from 'lucide-react';
import { usersAPI } from '../../services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { USER_ROLE_LABELS } from '../../utils/constants';

const AddUserModal = ({ isOpen, onClose }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const queryClient = useQueryClient();

    // Add/remove modal-open class to body
    React.useEffect(() => {
        if (isOpen) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }

        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [isOpen]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm();

    const password = watch('password');

    const createUserMutation = useMutation({
        mutationFn: (userData) => usersAPI.create(userData),
        onSuccess: () => {
            toast.success('Người dùng đã được tạo thành công!');
            queryClient.invalidateQueries(['users']);
            handleClose();
        },
        onError: (error) => {
            toast.error(`${error.response?.data?.message || 'Không thể tạo người dùng'}`);
        },
    });

    const handleClose = () => {
        setShowPassword(false);
        setShowConfirmPassword(false);
        reset();
        onClose();
    };

    const onSubmit = async (data) => {
        if (data.password !== data.confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }

        const userData = {
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role,
            status: data.status || 'active'
        };

        try {
            await createUserMutation.mutateAsync(userData);
        } catch (error) {
            // Error is handled by mutation
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Thêm người dùng</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Họ tên *
                        </label>
                        <input
                            type="text"
                            {...register('name', {
                                required: 'Họ tên là bắt buộc',
                                minLength: {
                                    value: 2,
                                    message: 'Họ tên phải có ít nhất 2 ký tự'
                                },
                                maxLength: {
                                    value: 50,
                                    message: 'Họ tên không được quá 50 ký tự'
                                }
                            })}
                            className="input-field w-full"
                            placeholder="Nhập họ tên..."
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                        </label>
                        <input
                            type="email"
                            {...register('email', {
                                required: 'Email là bắt buộc',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Email không hợp lệ'
                                }
                            })}
                            className="input-field w-full"
                            placeholder="Nhập email..."
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mật khẩu *
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                {...register('password', {
                                    required: 'Mật khẩu là bắt buộc',
                                    minLength: {
                                        value: 6,
                                        message: 'Mật khẩu phải có ít nhất 6 ký tự'
                                    }
                                })}
                                className="input-field w-full pr-10"
                                placeholder="Nhập mật khẩu..."
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Xác nhận mật khẩu *
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                {...register('confirmPassword', {
                                    required: 'Xác nhận mật khẩu là bắt buộc',
                                    validate: value => value === password || 'Mật khẩu xác nhận không khớp'
                                })}
                                className="input-field w-full pr-10"
                                placeholder="Nhập lại mật khẩu..."
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Vai trò *
                        </label>
                        <select
                            {...register('role', {
                                required: 'Vai trò là bắt buộc'
                            })}
                            className="input-field w-full"
                        >
                            <option value="">Chọn vai trò</option>
                            <option value="admin">Quản trị viên</option>
                            <option value="editor">Biên tập viên</option>
                            <option value="viewer">Người xem</option>
                        </select>
                        {errors.role && (
                            <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
                        )}
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trạng thái
                        </label>
                        <select
                            {...register('status')}
                            className="input-field w-full"
                        >
                            <option value="active">Hoạt động</option>
                            <option value="inactive">Tạm dừng</option>
                        </select>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="btn-secondary"
                            disabled={createUserMutation.isLoading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={createUserMutation.isLoading}
                            className="btn-primary flex items-center"
                        >
                            {createUserMutation.isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Đang tạo...
                                </>
                            ) : (
                                <>
                                    <UserPlus size={16} className="mr-2" />
                                    Tạo người dùng
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUserModal; 