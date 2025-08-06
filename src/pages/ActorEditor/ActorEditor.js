import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    AlertTriangle
} from 'lucide-react';
import { actorsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Editor from '@monaco-editor/react';

const ActorEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // States
    const [selectedFile, setSelectedFile] = useState('main.js');
    const [fileContent, setFileContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [showEnvVars, setShowEnvVars] = useState(false);
    const [envVars, setEnvVars] = useState({});
    const [inputSchema, setInputSchema] = useState({});
    const [actorInfo, setActorInfo] = useState({});

    // File structure
    const [fileStructure, setFileStructure] = useState([
        {
            name: '.actor',
            type: 'folder',
            children: [
                { name: 'actor.json', type: 'file' },
                { name: 'input_schema.json', type: 'file' }
            ]
        },
        {
            name: 'src',
            type: 'folder',
            children: [
                { name: 'main.js', type: 'file' }
            ]
        },
        { name: '.dockerignore', type: 'file' },
        { name: '.editorconfig', type: 'file' },
        { name: '.gitignore', type: 'file' },
        { name: '.prettierrc', type: 'file' },
        { name: 'Dockerfile', type: 'file' },
        { name: 'README.md', type: 'file' },
        { name: 'eslint.config.mjs', type: 'file' },
        { name: 'package.json', type: 'file' }
    ]);

    // Mock actor data for testing
    const mockActor = {
        _id: id,
        actorName: id === 'mock-actor-1' ? 'Web Scraper Actor' :
            id === 'mock-actor-2' ? 'E-commerce Crawler' :
                id === 'mock-actor-3' ? 'News Aggregator' : 'My Actor',
        actorId: `daisan/${id}`,
        description: id === 'mock-actor-1' ? 'Actor để crawl dữ liệu từ website' :
            id === 'mock-actor-2' ? 'Crawl sản phẩm từ các trang thương mại điện tử' :
                id === 'mock-actor-3' ? 'Thu thập tin tức từ nhiều nguồn khác nhau' : 'Actor description',
        version: '0.0.1',
        status: id === 'mock-actor-1' ? 'ready' :
            id === 'mock-actor-2' ? 'running' : 'error',
        uploadedBy: {
            _id: 'user_id',
            name: 'Admin User'
        },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z'
    };

    // Fetch actor data from API
    const { data: actor, isLoading, error } = useQuery({
        queryKey: ['actor', id],
        queryFn: () => actorsAPI.getById(id),
        enabled: !!id,
        retry: 1,
        onError: (error) => {
            console.error('Actor API error:', error);
        }
    });

    // Use API data or fallback to mock data
    const actorData = actor?.data || mockActor;

    // Real API mutations
    const saveSourceMutation = useMutation({
        mutationFn: ({ actorId, filePath, content }) => actorsAPI.saveSource(actorId, filePath, content),
        onSuccess: () => {
            toast.success('Đã lưu thành công!');
            setIsEditing(false);
            queryClient.invalidateQueries(['actor', id]);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Không thể lưu file');
        },
    });

    const runActorMutation = useMutation({
        mutationFn: (actorId) => actorsAPI.run(actorId),
        onSuccess: () => {
            toast.success('Actor đang chạy!');
            queryClient.invalidateQueries(['actor', id]);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Không thể chạy actor');
        },
    });

    const buildActorMutation = useMutation({
        mutationFn: (actorId) => actorsAPI.build(actorId),
        onSuccess: () => {
            toast.success('Actor đã được build thành công!');
            queryClient.invalidateQueries(['actor', id]);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Không thể build actor');
        },
    });

    // Load file content from API or use default
    useEffect(() => {
        if (actorData && selectedFile) {
            // Try to get content from API first
            if (actorData.sourceCode && actorData.sourceCode[selectedFile]) {
                setFileContent(actorData.sourceCode[selectedFile]);
            } else {
                // Fallback to default content
                const defaultContent = {
                    'main.js': `import { Actor } from 'apify';
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
await Actor.exit();`,
                    'package.json': `{
  "name": "${actorData.name || 'my-actor'}",
  "version": "${actorData.version || '0.0.1'}",
  "description": "${actorData.description || 'A web scraping actor'}",
  "main": "src/main.js",
  "type": "module",
  "dependencies": {
    "apify": "^3.0.0",
    "crawlee": "^3.0.0"
  },
  "scripts": {
    "start": "node src/main.js"
  }
}`,
                    'input_schema.json': `{
  "title": "Input Schema",
  "type": "object",
  "schemaVersion": 1,
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
}`
                };

                setFileContent(defaultContent[selectedFile] || '// File content not available');
            }
        }
    }, [actorData, selectedFile]);

    // Handle file selection
    const handleFileSelect = (fileName) => {
        setSelectedFile(fileName);
        setIsEditing(false);
    };

    // Handle save
    const handleSave = () => {
        if (selectedFile && fileContent) {
            saveSourceMutation.mutate({
                actorId: id,
                filePath: selectedFile,
                content: fileContent
            });
        }
    };

    // Handle run
    const handleRun = () => {
        runActorMutation.mutate(id);
    };

    // Handle build
    const handleBuild = () => {
        buildActorMutation.mutate(id);
    };

    // Render file tree
    const renderFileTree = (items, level = 0) => {
        return items.map((item, index) => (
            <div key={index} style={{ paddingLeft: level * 16 }}>
                <div
                    className={`flex items-center py-1 px-2 rounded cursor-pointer hover:bg-gray-100 ${selectedFile === item.name ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                    onClick={() => item.type === 'file' && handleFileSelect(item.name)}
                >
                    {item.type === 'folder' ? (
                        <Folder size={16} className="mr-2 text-blue-500" />
                    ) : (
                        <File size={16} className="mr-2 text-gray-500" />
                    )}
                    <span className="text-sm">{item.name}</span>
                </div>
                {item.children && renderFileTree(item.children, level + 1)}
            </div>
        ));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <p className="text-red-500">Lỗi khi tải actor</p>
                    <button
                        onClick={() => navigate('/actors')}
                        className="mt-4 btn-primary"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

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
                                    {actorData?.name || 'My Actor 1'}
                                </h1>
                                <p className="text-sm text-gray-500">
                                    {actorData?._id || 'daisan/my-actor-1'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-500">
                            Version 0.0 (latest)
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
                        {renderFileTree(fileStructure)}
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

export default ActorEditor; 