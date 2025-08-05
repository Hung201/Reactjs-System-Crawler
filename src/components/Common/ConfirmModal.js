import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'danger'
}) => {
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

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: AlertTriangle,
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100',
          buttonColor: 'btn-danger',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
          buttonColor: 'btn-secondary',
        };
      default:
        return {
          icon: AlertTriangle,
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-100',
          buttonColor: 'btn-primary',
        };
    }
  };

  const styles = getTypeStyles();
  const Icon = styles.icon;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <div className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full ${styles.iconBg}`}>
              <Icon className={`h-5 w-5 ${styles.iconColor}`} />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">
                {title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-500">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={styles.buttonColor}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal; 