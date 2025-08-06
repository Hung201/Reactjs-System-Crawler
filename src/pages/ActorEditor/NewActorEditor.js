import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
    ChevronLeft,
    Play,
    Save,
    Download,
    GitBranch,
    Settings,
    FileText,
    Folder,
    File,
    Code,
    Package,
    Trash2,
    Plus,
    Upload,
    Eye,
    EyeOff,
    AlertTriangle,
    X
} from 'lucide-react';
import { actorsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Editor from '@monaco-editor/react';

const NewActorEditor = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Form states
    const [showActorForm, setShowActorForm] = useState(true);
    const [actorInfo, setActorInfo] = useState({
        actorName: '',
        description: '',
        version: '0.0.1'
    });

    // Editor states
    const [selectedFile, setSelectedFile] = useState('main.js');
    const [fileContent, setFileContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [showEnvVars, setShowEnvVars] = useState(false);
    const [envVars, setEnvVars] = useState({});
    const [buildLog, setBuildLog] = useState('Chưa có log build nào.');
    const [runLog, setRunLog] = useState('Chưa có log run nào.');
    const [activeTab, setActiveTab] = useState('code');
    const [buildWarning, setBuildWarning] = useState(false);

    // Form validation
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch
    } = useForm();

    const watchedActorName = watch('actorName');

    // Default file content
    const defaultFileContent = `import { Actor } from 'apify';
import { CheerioCrawler, Dataset } from 'crawlee';

// The Apify SDK requires you to be inside an Actor
await Actor.init();

// Get input from the user
const { startUrls, maxRequestsPerCrawl } = await Actor.getInput();

// Create a proxy configuration
const proxyConfiguration = await Actor.createProxyConfiguration();

// Create a CheerioCrawler
const crawler = new CheerioCrawler({
    proxyConfiguration,
    maxRequestsPerCrawl,
    async requestHandler({ $, request, enqueueLinks }) {
        console.log('enqueueing new URLs');
        await enqueueLinks();
        
        // Extract title from the page
        const title = $('title').text();
        console.log(\`Title: \${title}\`);
        console.log(\`URL: \${request.loadedUrl}\`);
        
        // Save URL and title to dataset
        await Dataset.pushData({
            url: request.loadedUrl,
            title,
        });
    },
});

// Run the crawler
await crawler.run(startUrls);

// Exit successfully
await Actor.exit();`;

    // Mock file system for new actor
    const fileSystemTree = [
        {
            name: 'src',
            type: 'folder',
            children: [
                { name: 'main.js', type: 'file' },
            ]
        },
        { name: 'input_schema.json', type: 'file' },
        { name: 'package.json', type: 'file' },
        { name: '.gitignore', type: 'file' },
        { name: 'README.md', type: 'file' },
    ];

    // Mock file content
    const mockFileSystem = {
        'main.js': defaultFileContent,
        'input_schema.json': `{
  "title": "Input Schema",
  "type": "object",
  "properties": {
    "startUrls": {
      "type": "array",
      "description": "URLs to start crawling from",
      "items": {
        "type": "string"
      }
    },
    "maxItems": {
      "type": "integer",
      "description": "Maximum number of items to scrape",
      "default": 10
    }
  }
}`,
        'package.json': `{
  "name": "${watchedActorName || 'my-actor'}",
  "version": "0.0.1",
  "description": "${actorInfo.description || 'A web scraping actor'}",
  "dependencies": {
    "apify": "^3.0.0",
    "crawlee": "^3.0.0"
  }
}`
    };

    // Load file content
    useEffect(() => {
        if (selectedFile) {
            setFileContent(mockFileSystem[selectedFile] || `// Content for ${selectedFile}`);
        }
    }, [selectedFile, watchedActorName, actorInfo.description]);

    // Handle form submission
    const onSubmit = (data) => {
        setActorInfo({
            actorName: data.actorName,
            description: data.description || '',
            version: data.version || '0.0.1'
        });
        setShowActorForm(false);
        toast.success('Actor đã được tạo! Bây giờ bạn có thể chỉnh sửa code.');
    };

    // Mock mutations
    const saveSourceMutation = useMutation({
        mutationFn: async ({ actorId, filePath, content }) => {
            await new Promise(resolve => setTimeout(resolve, 500));
            return { success: true };
        },
        onSuccess: () => {
            toast.success('Đã lưu thành công!');
            setIsEditing(false);
        },
        onError: (error) => {
            toast.error('Không thể lưu file');
        },
    });

    const runActorMutation = useMutation({
        mutationFn: async (actorId) => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return { success: true };
        },
        onSuccess: () => {
            toast.success('Actor đang chạy!');
        },
        onError: (error) => {
            toast.error('Không thể chạy actor');
        },
    });

    const buildActorMutation = useMutation({
        mutationFn: async (actorId) => {
            await new Promise(resolve => setTimeout(resolve, 800));
            return { success: true };
        },
        onSuccess: () => {
            toast.success('Actor đã được build thành công!');
        },
        onError: (error) => {
            toast.error('Không thể build actor');
        },
    });

    // Handle file content changes
    const handleEditorChange = (value) => {
        setFileContent(value);
        setBuildWarning(true);
    };

    // Handle file selection
    const handleFileSelect = (file) => {
        setSelectedFile(file);
    };

    // Handle save
    const handleSave = () => {
        if (selectedFile && fileContent) {
            saveSourceMutation.mutate({
                actorId: 'new-actor',
                filePath: selectedFile,
                content: fileContent
            });
        }
    };

    // Handle run
    const handleRun = () => {
        runActorMutation.mutate('new-actor');
    };

    // Handle build
    const handleBuild = () => {
        buildActorMutation.mutate('new-actor');
    };

    // Render file tree
    const renderFileTree = (nodes) => (
        <ul>
            {nodes.map((node) => (
                <li key={node.name} className="mb-1">
                    <div
                        className={`flex items-center cursor-pointer p-1 rounded-md hover:bg-gray-100 ${selectedFile === node.name ? 'bg-blue-100 text-blue-800' : ''}`}
                        onClick={() => node.type === 'file' && handleFileSelect(node.name)}
                    >
                        {node.type === 'folder' ? <Folder size={16} className="mr-2 text-gray-500" /> : <File size={16} className="mr-2 text-gray-500" />}
                        <span className="text-sm">{node.name}</span>
                    </div>
                    {node.type === 'folder' && node.children && (
                        <div className="ml-4">
                            {renderFileTree(node.children)}
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );

    // Actor Creation Form
    if (showActorForm) {
        return (
            <div className="modal-overlay">
                <div className="modal-content max-w-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b">
                        <h2 className="text-xl font-semibold text-gray-900">Tạo Actor Mới</h2>
                        <button
                            onClick={() => navigate('/actors')}
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
                                        value: 2,
                                        message: 'Tên actor phải có ít nhất 2 ký tự'
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
                                {...register('description')}
                                rows={3}
                                className="input-field w-full"
                                placeholder="Mô tả về actor (tùy chọn)..."
                            />
                        </div>

                        {/* Version */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phiên bản
                            </label>
                            <input
                                type="text"
                                {...register('version')}
                                defaultValue="0.0.1"
                                className="input-field w-full"
                                placeholder="0.0.1"
                            />
                        </div>

                        {/* Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="font-medium text-blue-900 mb-2">💡 Hướng dẫn:</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Sau khi tạo, bạn sẽ được chuyển đến editor để viết code</li>
                                <li>• Code mặc định sẽ sử dụng Apify SDK và Crawlee</li>
                                <li>• Bạn có thể chỉnh sửa, build và chạy actor trực tiếp</li>
                                <li>• Tất cả thay đổi sẽ được lưu tự động</li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/actors')}
                                className="btn-secondary"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="btn-primary flex items-center"
                            >
                                <Plus size={16} className="mr-2" />
                                Tạo Actor
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // Main Editor Interface
    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/actors')}
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ChevronLeft size={20} className="mr-1" />
                            Tất cả Actors
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <span className="text-sm font-bold text-green-600">MA</span>
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">
                                    {actorInfo.actorName || 'Actor Mới'}
                                </h1>
                                <p className="text-sm text-gray-500">
                                    daisan/{actorInfo.actorName?.toLowerCase().replace(/\s+/g, '-') || 'new-actor'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-500">
                            Version {actorInfo.version} (latest)
                        </span>
                        <button
                            onClick={handleBuild}
                            disabled={buildActorMutation.isLoading}
                            className="btn-secondary flex items-center"
                        >
                            <Package size={16} className="mr-2" />
                            Build
                        </button>
                        <button
                            onClick={handleRun}
                            disabled={runActorMutation.isLoading}
                            className="btn-primary flex items-center"
                        >
                            <Play size={16} className="mr-2" />
                            Run
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center space-x-6 mt-4 border-b border-gray-200">
                    <button className="px-4 py-2 text-sm font-medium text-primary-600 border-b-2 border-primary-600">
                        Source
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                        Information
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                        Runs 0
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                        Builds 0
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                        Settings
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex">
                {/* File Explorer */}
                <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-900">Files</h3>
                            <div className="flex items-center space-x-1">
                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                    <Plus size={14} />
                                </button>
                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                    <Upload size={14} />
                                </button>
                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                    <Download size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500">0%</div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2">
                        {renderFileTree(fileSystemTree)}
                    </div>
                </div>

                {/* Code Editor */}
                <div className="flex-1 flex flex-col">
                    {/* Editor Toolbar */}
                    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <select className="text-sm border border-gray-300 rounded px-2 py-1">
                                <option>Web IDE</option>
                                <option>Local Development</option>
                            </select>

                            <div className="flex items-center space-x-1">
                                <button className="px-3 py-1 text-sm border border-gray-300 rounded bg-blue-50 text-blue-600">
                                    Code
                                </button>
                                <button className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-500 hover:text-gray-700">
                                    Last build
                                </button>
                                <button className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-500 hover:text-gray-700">
                                    Input
                                </button>
                                <button className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-500 hover:text-gray-700">
                                    Last run
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button className="p-1 text-gray-400 hover:text-gray-600">
                                <GitBranch size={16} />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-gray-600">
                                <Download size={16} />
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saveSourceMutation.isLoading || !isEditing}
                                className="btn-primary flex items-center"
                            >
                                <Save size={16} className="mr-2" />
                                Save
                            </button>
                        </div>
                    </div>

                    {/* Monaco Editor */}
                    <div className="flex-1">
                        <Editor
                            height="100%"
                            defaultLanguage="javascript"
                            value={fileContent}
                            onChange={(value) => {
                                setFileContent(value);
                                setIsEditing(true);
                            }}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                lineNumbers: 'on',
                                roundedSelection: false,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-white border-t border-gray-200 p-4">
                {/* Build Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center">
                        <AlertTriangle size={16} className="text-yellow-600 mr-2" />
                        <span className="text-sm text-yellow-800">
                            Để áp dụng thay đổi, bạn cần build Actor.
                        </span>
                    </div>
                    <button
                        onClick={handleBuild}
                        disabled={buildActorMutation.isLoading}
                        className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
                    >
                        Build now
                    </button>
                </div>

                {/* Environment Variables */}
                <div className="mt-3">
                    <button
                        onClick={() => setShowEnvVars(!showEnvVars)}
                        className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                    >
                        {showEnvVars ? <EyeOff size={16} /> : <Eye size={16} />}
                        <span className="ml-2">Environment variables</span>
                    </button>

                    {showEnvVars && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Key
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        placeholder="Ví dụ: API_KEY"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Value
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        placeholder="Nhập giá trị..."
                                    />
                                </div>
                            </div>
                            <button className="mt-3 btn-secondary text-sm">
                                Thêm biến môi trường
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewActorEditor; 