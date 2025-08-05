import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Eye, EyeOff } from 'lucide-react';
import { usersAPI } from '../../services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const EditUserModal = ({ isOpen, onClose, user }) => {
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
        setValue,
    } = useForm();

    const password = watch('password');

    // Set form values when user data is available
    React.useEffect(() => {
        if (user && isOpen) {
            setValue('name', user.name || '');
            setValue('email', user.email || '');
            setValue('role', user.role || 'viewer');
            setValue('status', user.status || 'active');
        }
    }, [user, isOpen, setValue]);

    const updateUserMutation = useMutation({
        mutationFn: ({ id, userData }) => usersAPI.update(id, userData),
        onSuccess: () => {
            toast.success('Người dùng đã được cập nhật thành công!');
            queryClient.invalidateQueries(['users']);
            handleClose();
        },
        onError: (error) => {
            toast.error(`${error.response?.data?.message || 'Không thể cập nhật người dùng'}`);
        },
    });

    const handleClose = () => {
        setShowPassword(false);
        setShowConfirmPassword(false);
        reset();
        onClose();
    };

    const onSubmit = async (data) => {
        if (data.password && data.password !== data.confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }

        const userData = {
            name: data.name,
            email: data.email,
            role: data.role,
            status: data.status || 'active'
        };

        // Only include password if it's provided
        if (data.password) {
            userData.password = data.password;
        }

        try {
            await updateUserMutation.mutateAsync({ id: user._id, userData });
        } catch (error) {
            // Error is handled by mutation
        }
    };

    if (!isOpen || !user) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Chỉnh sửa người dùng</h2>
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
                            Mật khẩu mới (để trống nếu không thay đổi)
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                {...register('password', {
                                    minLength: {
                                        value: 6,
                                        message: 'Mật khẩu phải có ít nhất 6 ký tự'
                                    }
                                })}
                                className="input-field w-full pr-10"
                                placeholder="Nhập mật khẩu mới..."
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
                            Xác nhận mật khẩu mới
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                {...register('confirmPassword', {
                                    validate: value => {
                                        const password = watch('password');
                                        if (password && value !== password) {
                                            return 'Mật khẩu xác nhận không khớp';
                                        }
                                        return true;
                                    }
                                })}
                                className="input-field w-full pr-10"
                                placeholder="Nhập lại mật khẩu mới..."
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
                            disabled={updateUserMutation.isLoading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={updateUserMutation.isLoading}
                            className="btn-primary flex items-center"
                        >
                            {updateUserMutation.isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Đang cập nhật...
                                </>
                            ) : (
                                <>
                                    <Save size={16} className="mr-2" />
                                    Cập nhật
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal; 