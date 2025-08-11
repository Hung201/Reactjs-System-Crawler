import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', isVisible, onClose, duration = 3000 }) => {
    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible) return null;

    const getToastConfig = () => {
        switch (type) {
            case 'success':
                return {
                    icon: <CheckCircle className="w-5 h-5" />,
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    textColor: 'text-green-800',
                    iconColor: 'text-green-500'
                };
            case 'error':
                return {
                    icon: <XCircle className="w-5 h-5" />,
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    textColor: 'text-red-800',
                    iconColor: 'text-red-500'
                };
            case 'warning':
                return {
                    icon: <AlertCircle className="w-5 h-5" />,
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200',
                    textColor: 'text-yellow-800',
                    iconColor: 'text-yellow-500'
                };
            case 'info':
                return {
                    icon: <Info className="w-5 h-5" />,
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                    textColor: 'text-blue-800',
                    iconColor: 'text-blue-500'
                };
            default:
                return {
                    icon: <CheckCircle className="w-5 h-5" />,
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    textColor: 'text-green-800',
                    iconColor: 'text-green-500'
                };
        }
    };

    const { icon, bgColor, borderColor, textColor, iconColor } = getToastConfig();

    return (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
            <div className={`${bgColor} ${borderColor} border rounded-lg shadow-lg p-4 transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                }`}>
                <div className="flex items-start">
                    <div className={`${iconColor} flex-shrink-0`}>
                        {icon}
                    </div>
                    <div className={`ml-3 flex-1 ${textColor}`}>
                        <p className="text-sm font-medium">
                            {message}
                        </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                        <button
                            onClick={onClose}
                            className={`${textColor} hover:opacity-70 transition-opacity`}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Toast;
