import { useState, useEffect, useRef } from 'react';

export const useToast = () => {
    const [toast, setToast] = useState({
        isVisible: false,
        message: '',
        type: 'success'
    });

    const timeoutRef = useRef(null);

    const showToast = (message, type = 'success', duration = 3000) => {
        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setToast({
            isVisible: true,
            message,
            type
        });

        // Set timeout to hide toast
        if (duration > 0) {
            timeoutRef.current = setTimeout(() => {
                hideToast();
            }, duration);
        }
    };

    const hideToast = () => {
        setToast(prev => ({
            ...prev,
            isVisible: false
        }));

        // Clear timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const showSuccess = (message, duration = 3000) => showToast(message, 'success', duration);
    const showError = (message, duration = 5000) => showToast(message, 'error', duration);
    const showWarning = (message, duration = 4000) => showToast(message, 'warning', duration);
    const showInfo = (message, duration = 3000) => showToast(message, 'info', duration);

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
