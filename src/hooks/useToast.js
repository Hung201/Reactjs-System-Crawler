import { useState } from 'react';

export const useToast = () => {
    const [toast, setToast] = useState({
        isVisible: false,
        message: '',
        type: 'success'
    });

    const showToast = (message, type = 'success', duration = 3000) => {
        setToast({
            isVisible: true,
            message,
            type,
            duration
        });
    };

    const hideToast = () => {
        setToast(prev => ({
            ...prev,
            isVisible: false
        }));
    };

    const showSuccess = (message, duration) => showToast(message, 'success', duration);
    const showError = (message, duration) => showToast(message, 'error', duration);
    const showWarning = (message, duration) => showToast(message, 'warning', duration);
    const showInfo = (message, duration) => showToast(message, 'info', duration);

    return {
        toast,
        showToast,
        hideToast,
        showSuccess,
        showError,
        showWarning,
        showInfo
    };
};

export default useToast;
