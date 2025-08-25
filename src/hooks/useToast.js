import toast from 'react-hot-toast';

const useToast = () => {
    const showSuccess = (message) => {
        toast.success(message, {
            duration: 4000,
            position: 'top-right',
        });
    };

    const showError = (message, error = null) => {
        // Handle rate limiting errors specifically
        if (error?.message?.includes('Rate limit exceeded') || error?.response?.status === 429) {
            toast.error('Quá nhiều yêu cầu. Vui lòng chờ một chút trước khi thử lại.', {
                duration: 6000,
                position: 'top-right',
                icon: '⏰',
            });
            return;
        }

        // Handle network errors
        if (error?.message?.includes('Network Error') || error?.code === 'NETWORK_ERROR') {
            toast.error('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.', {
                duration: 5000,
                position: 'top-right',
                icon: '🌐',
            });
            return;
        }

        // Handle timeout errors
        if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
            toast.error('Yêu cầu bị timeout. Vui lòng thử lại.', {
                duration: 5000,
                position: 'top-right',
                icon: '⏱️',
            });
            return;
        }

        // Default error handling
        toast.error(message || 'Đã xảy ra lỗi. Vui lòng thử lại.', {
            duration: 5000,
            position: 'top-right',
        });
    };

    const showWarning = (message) => {
        toast(message, {
            duration: 4000,
            position: 'top-right',
            icon: '⚠️',
        });
    };

    const showInfo = (message) => {
        toast(message, {
            duration: 4000,
            position: 'top-right',
            icon: 'ℹ️',
        });
    };

    const showLoading = (message) => {
        return toast.loading(message, {
            position: 'top-right',
        });
    };

    const dismiss = (toastId) => {
        toast.dismiss(toastId);
    };

    return {
        toast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showLoading,
        dismiss,
        hideToast: dismiss, // Alias for backward compatibility
    };
};

export default useToast;
