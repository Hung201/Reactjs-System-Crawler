import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Trash2 } from 'lucide-react';
import { sourcesAPI } from '../../../services/api';
import { DATA_TYPES, SOURCE_STATUS } from '../../../utils/constants';
import toast from 'react-hot-toast';

const SourceModal = ({ isOpen, onClose, source }) => {
  const queryClient = useQueryClient();
  const isEditing = !!source;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      name: source?.name || '',
      type: source?.type || DATA_TYPES.PRODUCT,
      status: source?.status || SOURCE_STATUS.ACTIVE,
      startUrls: source?.startUrls || [''],
      actorId: source?.actorId || '',
      schedule: source?.schedule || '',
    },
  });

  const startUrls = watch('startUrls');

  const mutation = useMutation({
    mutationFn: (data) => {
      if (isEditing) {
        return sourcesAPI.update(source._id, data);
      }
      return sourcesAPI.create(data);
    },
    onSuccess: () => {
      toast.success(
        isEditing ? 'Nguồn crawl đã được cập nhật!' : 'Nguồn crawl đã được tạo!'
      );
      queryClient.invalidateQueries(['sources']);
      handleClose();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 
        (isEditing ? 'Không thể cập nhật nguồn crawl' : 'Không thể tạo nguồn crawl')
      );
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data) => {
    // Filter out empty URLs
    const filteredUrls = data.startUrls.filter(url => url.trim() !== '');
    mutation.mutate({
      ...data,
      startUrls: filteredUrls,
    });
  };

  const addUrl = () => {
    setValue('startUrls', [...startUrls, '']);
  };

  const removeUrl = (index) => {
    if (startUrls.length > 1) {
      const newUrls = startUrls.filter((_, i) => i !== index);
      setValue('startUrls', newUrls);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {isEditing ? 'Chỉnh sửa nguồn crawl' : 'Thêm nguồn crawl mới'}
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên nguồn *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Tên nguồn là bắt buộc' })}
                    className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="VD: Shopee Products"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại dữ liệu *
                  </label>
                  <select
                    {...register('type', { required: 'Loại dữ liệu là bắt buộc' })}
                    className={`input-field ${errors.type ? 'border-red-500' : ''}`}
                  >
                    <option value={DATA_TYPES.PRODUCT}>Sản phẩm</option>
                    <option value={DATA_TYPES.NEWS}>Tin tức</option>
                    <option value={DATA_TYPES.VIDEO}>Video</option>
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    {...register('status')}
                    className="input-field"
                  >
                    <option value={SOURCE_STATUS.ACTIVE}>Hoạt động</option>
                    <option value={SOURCE_STATUS.INACTIVE}>Tạm dừng</option>
                    <option value={SOURCE_STATUS.ARCHIVED}>Đã lưu trữ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Actor ID
                  </label>
                  <input
                    type="text"
                    {...register('actorId')}
                    className="input-field"
                    placeholder="VD: shopee-product-scraper"
                  />
                </div>
              </div>

              {/* URLs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URLs bắt đầu *
                </label>
                <div className="space-y-2">
                  {startUrls.map((url, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="url"
                        {...register(`startUrls.${index}`, { 
                          required: index === 0 ? 'Ít nhất một URL là bắt buộc' : false,
                          pattern: {
                            value: /^https?:\/\/.+/,
                            message: 'URL phải bắt đầu bằng http:// hoặc https://',
                          },
                        })}
                        className={`input-field flex-1 ${errors.startUrls?.[index] ? 'border-red-500' : ''}`}
                        placeholder="https://example.com"
                      />
                      {startUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeUrl(index)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addUrl}
                    className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                  >
                    <Plus size={16} className="mr-1" />
                    Thêm URL
                  </button>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lịch chạy (Cron expression)
                </label>
                <input
                  type="text"
                  {...register('schedule')}
                  className="input-field"
                  placeholder="VD: 0 0 * * * (chạy hàng ngày lúc 00:00)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Để trống để chạy thủ công. Sử dụng cron expression để lập lịch tự động.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-secondary"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={mutation.isLoading}
                  className="btn-primary"
                >
                  {mutation.isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    isEditing ? 'Cập nhật' : 'Tạo nguồn'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourceModal; 