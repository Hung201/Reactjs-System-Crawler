import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Mail, Key, CheckCircle, Eye, EyeOff, Clock } from 'lucide-react';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 phút
    const [canResend, setCanResend] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        reset
    } = useForm();

    const password = watch('newPassword');

    // Timer countdown
    useEffect(() => {
        let interval = null;
        if (currentStep === 2 && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setCanResend(true);
                        setError('Mã xác nhận đã hết hạn. Vui lòng gửi lại mã mới.');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [currentStep, timeLeft]);

    // Format time display
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Step 1: Send reset code
    const handleSendCode = async (data) => {
        setIsLoading(true);
        setError('');

        try {
            const response = await authAPI.forgotPassword(data.email);

            if (response.data.success) {
                setEmail(data.email);
                setCurrentStep(2);
                setTimeLeft(15 * 60);
                setCanResend(false);
                toast.success('Mã xác nhận đã được gửi đến email của bạn');
            } else {
                setError(response.data.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Lỗi kết nối mạng');
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify reset code
    const handleVerifyCode = async (data) => {
        setIsLoading(true);
        setError('');

        try {
            const response = await authAPI.verifyResetCode(email, data.token);

            if (response.data.success) {
                setToken(data.token);
                setCurrentStep(3);
                toast.success('Mã xác nhận hợp lệ');
            } else {
                setError(response.data.error || 'Mã xác nhận không hợp lệ');
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Lỗi kết nối mạng');
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Reset password
    const handleResetPassword = async (data) => {
        if (data.newPassword !== data.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await authAPI.resetPassword(email, token, data.newPassword);

            if (response.data.success) {
                setCurrentStep(4);
                toast.success('Mật khẩu đã được đặt lại thành công');

                // Auto redirect sau 3 giây
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(response.data.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Lỗi kết nối mạng');
        } finally {
            setIsLoading(false);
        }
    };

    // Resend code
    const handleResendCode = async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await authAPI.forgotPassword(email);

            if (response.data.success) {
                setTimeLeft(15 * 60);
                setCanResend(false);
                toast.success('Mã xác nhận mới đã được gửi');
            } else {
                setError(response.data.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Lỗi kết nối mạng');
        } finally {
            setIsLoading(false);
        }
    };

    // Reset form when going back
    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
        setError('');
        reset();
    };

    // Progress steps
    const steps = [
        { id: 1, title: 'Nhập email', icon: Mail },
        { id: 2, title: 'Xác thực mã', icon: Key },
        { id: 3, title: 'Đặt mật khẩu mới', icon: Key },
        { id: 4, title: 'Hoàn thành', icon: CheckCircle }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex items-center justify-center mb-6">
                    <button
                        onClick={() => navigate('/login')}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        Quay lại đăng nhập
                    </button>
                </div>

                <h2 className="text-center text-3xl font-bold text-gray-900 mb-2">
                    Quên mật khẩu
                </h2>
                <p className="text-center text-gray-600 mb-8">
                    Nhập email để đặt lại mật khẩu
                </p>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;

                        return (
                            <div key={step.id} className="flex items-center">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${isCompleted
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : isActive
                                            ? 'bg-blue-500 border-blue-500 text-white'
                                            : 'bg-white border-gray-300 text-gray-400'
                                    }`}>
                                    {isCompleted ? (
                                        <CheckCircle size={20} />
                                    ) : (
                                        <Icon size={20} />
                                    )}
                                </div>
                                <span className={`ml-2 text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'
                                    }`}>
                                    {step.title}
                                </span>
                                {index < steps.length - 1 && (
                                    <div className={`w-8 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'
                                        }`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {/* Step 1: Enter Email */}
                    {currentStep === 1 && (
                        <form onSubmit={handleSubmit(handleSendCode)} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
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
                                    placeholder="Nhập email của bạn"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                                )}
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm text-center">{error}</div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary w-full flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Đang gửi...
                                    </>
                                ) : (
                                    <>
                                        <Mail size={16} className="mr-2" />
                                        Gửi mã xác nhận
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Verify Code */}
                    {currentStep === 2 && (
                        <form onSubmit={handleSubmit(handleVerifyCode)} className="space-y-6">
                            <div className="text-center mb-4">
                                <p className="text-sm text-gray-600">
                                    Mã xác nhận đã được gửi đến:
                                </p>
                                <p className="font-medium text-gray-900">{email}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mã xác nhận
                                </label>
                                <input
                                    type="text"
                                    {...register('token', {
                                        required: 'Mã xác nhận là bắt buộc',
                                        pattern: {
                                            value: /^[A-F0-9]{8}$/,
                                            message: 'Mã xác nhận phải có 8 ký tự (A-F, 0-9)'
                                        }
                                    })}
                                    className="input-field w-full text-center text-lg font-mono tracking-widest"
                                    placeholder="59C916AB"
                                    maxLength={8}
                                />
                                {errors.token && (
                                    <p className="text-red-500 text-sm mt-1">{errors.token.message}</p>
                                )}
                            </div>

                            {/* Timer */}
                            <div className="text-center">
                                <div className="flex items-center justify-center text-sm text-gray-600">
                                    <Clock size={16} className="mr-1" />
                                    Thời gian còn lại: {formatTime(timeLeft)}
                                </div>
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm text-center">{error}</div>
                            )}

                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn-primary w-full flex items-center justify-center"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Đang xác thực...
                                        </>
                                    ) : (
                                        <>
                                            <Key size={16} className="mr-2" />
                                            Xác thực mã
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleResendCode}
                                    disabled={!canResend || isLoading}
                                    className="btn-secondary w-full"
                                >
                                    {canResend ? 'Gửi lại mã' : 'Gửi lại mã'}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="text-gray-600 hover:text-gray-900 text-sm"
                                >
                                    ← Quay lại
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 3: Reset Password */}
                    {currentStep === 3 && (
                        <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mật khẩu mới
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        {...register('newPassword', {
                                            required: 'Mật khẩu mới là bắt buộc',
                                            minLength: {
                                                value: 6,
                                                message: 'Mật khẩu phải có ít nhất 6 ký tự'
                                            }
                                        })}
                                        className="input-field w-full pr-10"
                                        placeholder="Nhập mật khẩu mới"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {errors.newPassword && (
                                    <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Xác nhận mật khẩu mới
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        {...register('confirmPassword', {
                                            required: 'Xác nhận mật khẩu là bắt buộc',
                                            validate: value => value === password || 'Mật khẩu xác nhận không khớp'
                                        })}
                                        className="input-field w-full pr-10"
                                        placeholder="Nhập lại mật khẩu mới"
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

                            {error && (
                                <div className="text-red-500 text-sm text-center">{error}</div>
                            )}

                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn-primary w-full flex items-center justify-center"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Đang đặt lại...
                                        </>
                                    ) : (
                                        <>
                                            <Key size={16} className="mr-2" />
                                            Đặt lại mật khẩu
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="text-gray-600 hover:text-gray-900 text-sm"
                                >
                                    ← Quay lại
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 4: Success */}
                    {currentStep === 4 && (
                        <div className="text-center space-y-6">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle size={32} className="text-green-600" />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Đặt lại mật khẩu thành công!
                                </h3>
                                <p className="text-gray-600">
                                    Mật khẩu của bạn đã được đặt lại thành công.
                                    Bạn sẽ được chuyển về trang đăng nhập trong giây lát.
                                </p>
                            </div>

                            <button
                                onClick={() => navigate('/login')}
                                className="btn-primary w-full"
                            >
                                Đăng nhập ngay
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
