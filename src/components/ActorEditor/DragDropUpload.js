import React, { useState, useRef, useCallback } from 'react';
import { Upload, Folder, File, AlertCircle, CheckCircle, X } from 'lucide-react';
import { actorsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const DragDropUpload = ({ actorId, onUploadSuccess }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const fileInputRef = useRef(null);

    // Handle drag events
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(async (e) => {
        e.preventDefault();
        setIsDragOver(false);

        const items = e.dataTransfer.items;
        if (!items) return;

        const files = [];

        // Process dropped items
        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (item.kind === 'file') {
                const entry = item.webkitGetAsEntry();
                if (entry) {
                    await processEntry(entry, '', files);
                }
            }
        }

        if (files.length > 0) {
            await uploadFiles(files);
        }
    }, []);

    // Process directory entries recursively
    const processEntry = async (entry, path, files) => {
        if (entry.isFile) {
            const file = await new Promise((resolve) => {
                entry.file(resolve);
            });

            files.push({
                file,
                path: path + '/' + entry.name
            });
        } else if (entry.isDirectory) {
            const reader = entry.createReader();
            const entries = await new Promise((resolve) => {
                reader.readEntries(resolve);
            });

            for (const childEntry of entries) {
                await processEntry(childEntry, path + '/' + entry.name, files);
            }
        }
    };

    // Upload files to backend
    const uploadFiles = async (files) => {
        setIsUploading(true);
        setUploadProgress(0);
        setUploadedFiles([]);

        try {
            for (let i = 0; i < files.length; i++) {
                const { file, path } = files[i];

                // Read file content
                const content = await readFileAsText(file);

                // Upload to backend
                await actorsAPI.saveFile(actorId, path, content);

                setUploadedFiles(prev => [...prev, { name: file.name, path, size: file.size }]);

                // Update progress
                const progress = ((i + 1) / files.length) * 100;
                setUploadProgress(progress);
            }

            toast.success(`Đã upload ${files.length} files thành công!`);
            onUploadSuccess && onUploadSuccess();

        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Lỗi khi upload: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    // Read file as text
    const readFileAsText = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    };

    // Handle file input change
    const handleFileInputChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const fileList = files.map(file => ({
                file,
                path: file.name
            }));
            await uploadFiles(fileList);
        }
    };

    // Handle folder input change
    const handleFolderInputChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const fileList = files.map(file => ({
                file,
                path: file.webkitRelativePath || file.name
            }));
            await uploadFiles(fileList);
        }
    };

    return (
        <div className="relative">
            {/* Drag & Drop Zone */}
            <div
                className={`
                    border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
                    ${isDragOver
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }
                    ${isUploading ? 'pointer-events-none opacity-50' : ''}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <Upload className={`w-8 h-8 mx-auto mb-3 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />

                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {isDragOver ? 'Thả folder vào đây' : 'Kéo thả folder actor vào đây'}
                </h3>

                <p className="text-gray-500 mb-4">
                    Hoặc click để chọn folder chứa các file như main.js, package.json, Dockerfile
                </p>

                <div className="flex items-center justify-center space-x-3">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="btn-primary flex items-center"
                    >
                        <Folder className="w-4 h-4 mr-2" />
                        Chọn Folder
                    </button>

                    <span className="text-gray-400">hoặc</span>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="btn-secondary flex items-center"
                    >
                        <File className="w-4 h-4 mr-2" />
                        Chọn Files
                    </button>
                </div>

                {/* Hidden file inputs */}
                <input
                    ref={fileInputRef}
                    type="file"
                    webkitdirectory=""
                    directory=""
                    multiple
                    onChange={handleFolderInputChange}
                    className="hidden"
                    disabled={isUploading}
                />
            </div>

            {/* Upload Progress */}
            {isUploading && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-900">Đang upload...</span>
                        <span className="text-sm text-blue-700">{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Files đã upload ({uploadedFiles.length})
                    </h4>
                    <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
                        {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border-b border-gray-100 last:border-b-0">
                                <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-sm text-gray-900">{file.path}</span>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {Math.round(file.size / 1024)} KB
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-1">Hướng dẫn:</p>
                        <ul className="space-y-1 text-xs">
                            <li>• Kéo thả folder <code className="bg-yellow-100 px-1 rounded">actor-test</code> từ máy tính</li>
                            <li>• Hoặc click "Chọn Folder" để browse</li>
                            <li>• Folder phải chứa file <code className="bg-yellow-100 px-1 rounded">main.js</code></li>
                            <li>• Nên có <code className="bg-yellow-100 px-1 rounded">package.json</code> và <code className="bg-yellow-100 px-1 rounded">Dockerfile</code></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DragDropUpload;
