import React, { useRef, useState } from 'react';
import { X, Upload, Folder, File, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const UploadModal = ({
    isOpen,
    onClose,
    onUpload,
    uploadProgress,
    uploadStatus,
    uploadedFiles
}) => {
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = (files) => {
        const fileArray = Array.from(files);
        setSelectedFiles(fileArray);
    };

    const handleUpload = () => {
        if (selectedFiles.length > 0) {
            onUpload(selectedFiles);
        }
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Upload Actor Folder</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Upload Area */}
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Kéo thả folder hoặc click để chọn
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Chọn folder chứa các file của actor (main.js, package.json, Dockerfile, etc.)
                        </p>
                        <button
                            onClick={openFileDialog}
                            className="btn-primary"
                        >
                            Chọn Folder
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            webkitdirectory=""
                            multiple
                            onChange={handleFileInput}
                            className="hidden"
                        />
                    </div>

                    {/* Selected Files */}
                    {selectedFiles.length > 0 && (
                        <div className="mt-6">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">
                                Files đã chọn ({selectedFiles.length})
                            </h4>
                            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50">
                                        <div className="flex items-center space-x-2">
                                            <File size={16} className="text-gray-400" />
                                            <span className="text-sm text-gray-700">
                                                {file.webkitRelativePath || file.name}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => removeFile(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upload Progress */}
                    {uploadProgress > 0 && (
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">
                                    {uploadStatus}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {uploadProgress}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Upload Results */}
                    {uploadedFiles.length > 0 && (
                        <div className="mt-6">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">
                                Kết quả upload
                            </h4>
                            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                                {uploadedFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-2">
                                        <div className="flex items-center space-x-2">
                                            {file.status === 'success' ? (
                                                <CheckCircle size={16} className="text-green-500" />
                                            ) : (
                                                <XCircle size={16} className="text-red-500" />
                                            )}
                                            <span className="text-sm text-gray-700">
                                                {file.name}
                                            </span>
                                        </div>
                                        <span className={`text-xs ${file.status === 'success' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {file.status === 'success' ? 'Thành công' : 'Thất bại'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={selectedFiles.length === 0 || uploadProgress > 0}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploadProgress > 0 ? 'Đang upload...' : 'Upload Files'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadModal;
