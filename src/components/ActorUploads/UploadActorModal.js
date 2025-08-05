import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, FileCode, AlertCircle } from 'lucide-react';
import { actorsAPI } from '../../services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const UploadActorModal = ({ isOpen, onClose }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
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

    const actorName = watch('actorName');

    const uploadMutation = useMutation({
        mutationFn: (formData) => actorsAPI.upload(formData),
        onSuccess: () => {
            toast.success('Actor đã được upload thành công!');
            queryClient.invalidateQueries(['actors']);
            handleClose();
        },
        onError: (error) => {
            toast.error(`${error.response?.data?.message || 'Không thể upload actor'}`);
        },
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.name.endsWith('.js') && !file.name.endsWith('.zip')) {
                toast.error('Chỉ chấp nhận file .js hoặc .zip');
                return;
            }
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File quá lớn. Kích thước tối đa là 10MB');
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setIsUploading(false);
        reset();
        onClose();
    };

    const onSubmit = async (data) => {
        if (!selectedFile) {
            toast.error('Vui lòng chọn file actor');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('actorName', data.actorName);
        formData.append('description', data.description || '');
        formData.append('actorFile', selectedFile);

        try {
            await uploadMutation.mutateAsync(formData);
        } catch (error) {
            // Error is handled by mutation
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Upload Actor</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    {/* Actor Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên Actor *
                        </label>
                        <input
                            type="text"
                            {...register('actorName', {
                                required: 'Tên actor là bắt buộc',
                                minLength: {
                                    value: 3,
                                    message: 'Tên actor phải có ít nhất 3 ký tự'
                                },
                                maxLength: {
                                    value: 50,
                                    message: 'Tên actor không được quá 50 ký tự'
                                }
                            })}
                            className="input-field w-full"
                            placeholder="Nhập tên actor..."
                        />
                        {errors.actorName && (
                            <p className="text-red-500 text-sm mt-1">{errors.actorName.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mô tả
                        </label>
                        <textarea
                            {...register('description', {
                                maxLength: {
                                    value: 200,
                                    message: 'Mô tả không được quá 200 ký tự'
                                }
                            })}
                            rows={3}
                            className="input-field w-full resize-none"
                            placeholder="Mô tả về actor (tùy chọn)..."
                        />
                        {errors.description && (
                            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                        )}
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            File Actor *
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                            <input
                                type="file"
                                accept=".js,.zip"
                                onChange={handleFileChange}
                                className="hidden"
                                id="actor-file"
                            />
                            <label htmlFor="actor-file" className="cursor-pointer">
                                {selectedFile ? (
                                    <div className="space-y-2">
                                        <FileCode className="mx-auto h-12 w-12 text-green-500" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                Chọn file actor
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Hỗ trợ file .js hoặc .zip (tối đa 10MB)
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </label>
                        </div>
                        {!selectedFile && (
                            <p className="text-red-500 text-sm mt-1">Vui lòng chọn file actor</p>
                        )}
                    </div>

                    {/* File Requirements */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                            <div className="text-sm text-blue-700">
                                <p className="font-medium mb-1">Yêu cầu file:</p>
                                <ul className="space-y-1 text-xs">
                                    <li>• File .js: Code JavaScript của actor</li>
                                    <li>• File .zip: Package hoàn chỉnh của actor</li>
                                    <li>• Kích thước tối đa: 10MB</li>
                                    <li>• Tên file không được chứa ký tự đặc biệt</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="btn-secondary"
                            disabled={isUploading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isUploading || !selectedFile || !actorName}
                            className="btn-primary flex items-center"
                        >
                            {isUploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Đang upload...
                                </>
                            ) : (
                                <>
                                    <Upload size={16} className="mr-2" />
                                    Upload Actor
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadActorModal; 