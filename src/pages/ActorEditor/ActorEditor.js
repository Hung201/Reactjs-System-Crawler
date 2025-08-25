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
import MonacoEditorWrapper from '../../components/ActorEditor/MonacoEditorWrapper';
import StreamingOutput from '../../components/ActorEditor/StreamingOutput';
import LogDisplay from '../../components/ActorEditor/LogDisplay';
import UploadModal from '../../components/ActorEditor/UploadModal';

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
    const [showOutput, setShowOutput] = useState(false);
    const [outputStream, setOutputStream] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [showBuildLogs, setShowBuildLogs] = useState(false);
    const [showRunLogs, setShowRunLogs] = useState(false);

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

    // States for file/folder creation
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createType, setCreateType] = useState('file'); // 'file' or 'folder'
    const [createName, setCreateName] = useState('');
    const [createParent, setCreateParent] = useState(''); // parent folder path

    // States for file/folder deletion
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // States for upload functionality
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState([]);

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

    // Real API mutations - File-based approach
    const saveSourceMutation = useMutation({
        mutationFn: ({ actorId, filePath, content }) => {
            return actorsAPI.saveFile(actorId, filePath, content);
        },
        onSuccess: (data) => {
            toast.success('Đã lưu thành công vào file system!');
            setIsEditing(false);
            queryClient.invalidateQueries(['actor', id]);
        },
        onError: (error) => {
            console.error('Save to file system error:', error);
            toast.error(error.response?.data?.message || 'Không thể lưu file vào file system');
        },
    });

    // Build mutation using new endpoint
    const buildActorMutation = useMutation({
        mutationFn: (actorId) => actorsAPI.build(actorId),
        onSuccess: (data) => {
            toast.success('Actor đã được build thành công!');
            queryClient.invalidateQueries(['actor', id]);
            // Show build logs after successful build
            setShowBuildLogs(true);
        },
        onError: (error) => {
            console.error('Build error:', error);
            toast.error(error.response?.data?.message || 'Không thể build actor');
        },
    });

    // Run mutation using new endpoint
    const runActorMutation = useMutation({
        mutationFn: ({ actorId, input }) => actorsAPI.run(actorId, input),
        onSuccess: (data) => {
            toast.success('Actor đã được chạy thành công!');
            queryClient.invalidateQueries(['actor', id]);
            // Show run logs after successful run
            setShowRunLogs(true);
        },
        onError: (error) => {
            console.error('Run error:', error);
            toast.error(error.response?.data?.message || 'Không thể chạy actor');
        },
    });

    // Streaming run mutation
    const runActorStreamMutation = useMutation({
        mutationFn: ({ actorId, input }) => actorsAPI.runStream(actorId, input),
        onSuccess: (response) => {
            // Handle streaming response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            reader.read().then(function processText({ done, value }) {
                if (done) {
                    setIsRunning(false);
                    return;
                }

                const text = decoder.decode(value);
                setOutputStream(prev => prev + text);

                // Continue reading
                return reader.read().then(processText);
            });
        },
        onError: (error) => {
            setIsRunning(false);
            toast.error(error.response?.data?.message || 'Không thể chạy actor');
        },
    });



    // Store file content in memory to prevent loss
    const [fileContentCache, setFileContentCache] = useState({});

    // Load file content from localStorage, file system, or use default
    useEffect(() => {
        if (actorData && selectedFile) {
            // First, try to get content from localStorage (persisted data)
            const localStorageKey = `actor_${id}_${selectedFile}`;
            const savedContent = localStorage.getItem(localStorageKey);

            if (savedContent) {
                setFileContent(savedContent);
                setFileContentCache(prev => ({
                    ...prev,
                    [selectedFile]: savedContent
                }));
                return;
            }

            // If not in localStorage, try to get from cache
            if (fileContentCache[selectedFile]) {
                setFileContent(fileContentCache[selectedFile]);
                return;
            }

            // If not in cache, try to get content from file system API
            const loadFromFileSystem = async () => {
                try {
                    const response = await actorsAPI.getFile(id, selectedFile);
                    const content = response.data.content;
                    setFileContent(content);
                    setFileContentCache(prev => ({
                        ...prev,
                        [selectedFile]: content
                    }));
                    // Also save to localStorage for persistence
                    localStorage.setItem(localStorageKey, content);
                    return;
                } catch (error) {
                }
            };

            // Try to load from file system first
            loadFromFileSystem().then(() => {
                // If file system load failed, check if we have content in actorData
                if (!fileContent && actorData.sourceCode && actorData.sourceCode[selectedFile]) {
                    const content = actorData.sourceCode[selectedFile];
                    setFileContent(content);
                    setFileContentCache(prev => ({
                        ...prev,
                        [selectedFile]: content
                    }));
                    localStorage.setItem(localStorageKey, content);
                    return;
                }

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
}`,
                    'Dockerfile': `FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S apify -u 1001

# Change ownership of the app directory
RUN chown -R apify:nodejs /usr/src/app
USER apify

# Expose port
EXPOSE 8080

# Start the application
CMD [ "npm", "start" ]`
                };

                const content = defaultContent[selectedFile] || '// File content not available';
                setFileContent(content);
                setFileContentCache(prev => ({
                    ...prev,
                    [selectedFile]: content
                }));
                // Save default content to localStorage for persistence
                localStorage.setItem(localStorageKey, content);
            });
        }
    }, [actorData, selectedFile, id]);

    // Handle file selection
    const handleFileSelect = (fileName) => {
        // Save current content to localStorage before switching
        if (selectedFile && fileContent) {
            const localStorageKey = `actor_${id}_${selectedFile}`;
            localStorage.setItem(localStorageKey, fileContent);
            setFileContentCache(prev => ({
                ...prev,
                [selectedFile]: fileContent
            }));
        }

        setSelectedFile(fileName);
        setIsEditing(false);

        // Load content from localStorage first, then cache, then API, then default
        const localStorageKey = `actor_${id}_${fileName}`;
        const savedContent = localStorage.getItem(localStorageKey);

        if (savedContent) {
            setFileContent(savedContent);
            setFileContentCache(prev => ({
                ...prev,
                [fileName]: savedContent
            }));
        } else if (fileContentCache[fileName]) {
            setFileContent(fileContentCache[fileName]);
        } else if (actorData?.sourceCode?.[fileName]) {
            setFileContent(actorData.sourceCode[fileName]);
        } else {
            // Load default content
            const defaultContent = getDefaultContent(fileName);
            setFileContent(defaultContent);
        }
    };

    // Test file-based storage function
    const testFileBasedStorage = async () => {
        try {

            // Test 1: Save a test file
            const testContent = `// Test file created at ${new Date().toISOString()}
console.log('Hello from test file!');`;

            const saveResult = await actorsAPI.saveFile(id, 'test.js', testContent);

            // Test 2: Read the test file back
            const readResult = await actorsAPI.getFile(id, 'test.js');

            // Test 3: Verify content matches
            if (readResult.data.content === testContent) {
                toast.success('File-based storage hoạt động tốt!');

                // Test 4: Test build API
                try {
                    const buildResult = await actorsAPI.build(id);
                    toast.success('Build API cũng hoạt động tốt!');
                } catch (buildError) {
                    console.log('Build test failed (expected if no Docker):', buildError);
                }

                return true;
            } else {
                console.log('❌ File-based storage test FAILED - content mismatch');
                toast.error('File-based storage test failed - content mismatch');
                return false;
            }
        } catch (error) {
            console.error('❌ File-based storage test FAILED:', error);
            toast.error(`File-based storage test failed: ${error.message}`);
            return false;
        }
    };

    // Test localStorage function
    const testLocalStorage = () => {
        try {
            const testKey = 'test_save_function';
            const testValue = 'test_content_' + Date.now();
            localStorage.setItem(testKey, testValue);
            const retrieved = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            return retrieved === testValue;
        } catch (error) {
            console.error('localStorage test failed:', error);
            return false;
        }
    };

    // Handle save - File-based approach
    const handleSave = () => {
        if (!selectedFile) {
            toast.error('Không có file nào được chọn');
            return;
        }

        if (!fileContent) {
            toast.error('Nội dung file trống');
            return;
        }

        try {
            // Update cache with current content
            setFileContentCache(prev => ({
                ...prev,
                [selectedFile]: fileContent
            }));

            // Save to localStorage for persistence (all files)
            const localStorageKey = `actor_${id}_${selectedFile}`;
            localStorage.setItem(localStorageKey, fileContent);

            // Also save to localStorage for build process (main.js)
            if (selectedFile === 'main.js') {
                localStorage.setItem(`actor_code_${id}`, fileContent);
            }

            // Show immediate feedback
            toast.success('Đã lưu vào localStorage. Đang lưu vào file system...');

            // Save to file system via API (new file-based approach)
            saveSourceMutation.mutate({
                actorId: id,
                filePath: selectedFile,
                content: fileContent
            }, {
                onSuccess: () => {
                    toast.success('Đã lưu thành công vào file system!');
                    setIsEditing(false);
                },
                onError: (error) => {
                    console.error('Save error:', error);
                    toast.error(`Lỗi khi lưu vào file system: ${error.response?.data?.message || error.message || 'Không thể lưu file'}`);
                }
            });
        } catch (error) {
            console.error('Error in handleSave:', error);
            toast.error(`Lỗi: ${error.message}`);
        }
    };

    // Handle run with streaming
    const handleRunStream = () => {
        // Save current code to localStorage before running
        if (selectedFile === 'main.js' && fileContent) {
            localStorage.setItem(`actor_code_${id}`, fileContent);
        }

        // Run actor using new API
        runActorMutation.mutate({ actorId: id, input: {} });
    };

    // Handle stop
    const handleStop = () => {
        setIsRunning(false);
        // TODO: Implement stop functionality
    };

    // Handle build
    const handleBuild = () => {
        // Save current code to localStorage before building
        if (selectedFile === 'main.js' && fileContent) {
            localStorage.setItem(`actor_code_${id}`, fileContent);
        }

        // Build actor using new API
        buildActorMutation.mutate(id);
    };

    // Handle create file/folder
    const handleCreateFile = (parentPath = '') => {
        setCreateType('file');
        setCreateParent(parentPath);
        setCreateName('');
        setShowCreateModal(true);
    };

    const handleCreateFolder = (parentPath = '') => {
        setCreateType('folder');
        setCreateParent(parentPath);
        setCreateName('');
        setShowCreateModal(true);
    };

    const handleConfirmCreate = () => {
        if (!createName.trim()) {
            toast.error('Vui lòng nhập tên file/folder');
            return;
        }

        // Add new file/folder to structure
        const newItem = {
            name: createName.trim(),
            type: createType,
            children: createType === 'folder' ? [] : undefined
        };

        if (createParent) {
            // Add to specific folder
            const updatedStructure = addToFolder(fileStructure, createParent, newItem);
            setFileStructure(updatedStructure);
        } else {
            // Add to root
            setFileStructure(prev => [...prev, newItem]);
        }

        // Set default content for new files
        if (createType === 'file') {
            const defaultContent = getDefaultContent(createName);
            if (defaultContent) {
                setFileContent(defaultContent);
                setSelectedFile(createName);
                // Add to cache
                setFileContentCache(prev => ({
                    ...prev,
                    [createName]: defaultContent
                }));
                // Save to localStorage
                const localStorageKey = `actor_${id}_${createName}`;
                localStorage.setItem(localStorageKey, defaultContent);
            }
        }

        setShowCreateModal(false);
        setCreateName('');
        toast.success(`${createType === 'file' ? 'File' : 'Folder'} đã được tạo thành công!`);
    };

    // Helper function to add item to specific folder
    const addToFolder = (items, parentName, newItem) => {
        return items.map(item => {
            if (item.name === parentName && item.type === 'folder') {
                return {
                    ...item,
                    children: [...(item.children || []), newItem]
                };
            } else if (item.children) {
                return {
                    ...item,
                    children: addToFolder(item.children, parentName, newItem)
                };
            }
            return item;
        });
    };

    // Helper function to get default content for new files
    const getDefaultContent = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        switch (ext) {
            case 'js':
                return `// ${fileName}
console.log('Hello from ${fileName}!');`;
            case 'json':
                return `{
  "name": "${fileName.replace('.json', '')}",
  "version": "1.0.0"
}`;
            case 'md':
                return `# ${fileName.replace('.md', '')}

Description here.`;
            case 'txt':
                return `# ${fileName.replace('.txt', '')}

Content here.`;
            case 'dockerfile':
                return `# Sử dụng base image của Apify cho Node.js
FROM apify/actor-node:18

# Thiết lập thư mục làm việc
WORKDIR /usr/src/app

# Copy package.json và package-lock.json (nếu có)
COPY package*.json ./

# Cài đặt dependencies
RUN npm ci --only=production

# Copy toàn bộ source code
COPY . ./

# Build ứng dụng (nếu cần)
RUN npm run build

# Expose port 8080
EXPOSE 8080

# Chạy ứng dụng
CMD [ "npm", "start" ]`;
            default:
                return `// ${fileName}
// Add your content here.`;
        }
    };

    // Handle delete file/folder
    const handleDeleteItem = (item, parentPath = '') => {
        setItemToDelete({ ...item, parentPath });
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        if (!itemToDelete) return;

        // Remove item from structure
        if (itemToDelete.parentPath) {
            // Remove from specific folder
            const updatedStructure = removeFromFolder(fileStructure, itemToDelete.parentPath, itemToDelete.name);
            setFileStructure(updatedStructure);
        } else {
            // Remove from root
            setFileStructure(prev => prev.filter(item => item.name !== itemToDelete.name));
        }

        // Clear selected file if it was deleted
        if (selectedFile === itemToDelete.name) {
            setSelectedFile('main.js');
            setFileContent('// main.js content');
            // Remove from cache
            setFileContentCache(prev => {
                const newCache = { ...prev };
                delete newCache[itemToDelete.name];
                return newCache;
            });
            // Remove from localStorage
            const localStorageKey = `actor_${id}_${itemToDelete.name}`;
            localStorage.removeItem(localStorageKey);
        }

        setShowDeleteModal(false);
        setItemToDelete(null);
        toast.success(`${itemToDelete.type === 'file' ? 'File' : 'Folder'} đã được xóa!`);
    };

    // Helper function to remove item from specific folder
    const removeFromFolder = (items, parentName, itemName) => {
        return items.map(item => {
            if (item.name === parentName && item.type === 'folder') {
                return {
                    ...item,
                    children: item.children.filter(child => child.name !== itemName)
                };
            } else if (item.children) {
                return {
                    ...item,
                    children: removeFromFolder(item.children, parentName, itemName)
                };
            }
            return item;
        });
    };

    // Upload functionality
    const handleUploadFolder = () => {
        setShowUploadModal(true);
        setUploadProgress(0);
        setUploadStatus('');
        setUploadedFiles([]);
    };

    const handleFileUpload = async (files) => {
        setUploadStatus('Đang upload files...');
        setUploadProgress(0);
        setUploadedFiles([]);

        const totalFiles = files.length;
        let successCount = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const relativePath = file.webkitRelativePath || file.name;

            try {
                const content = await readFileAsText(file);

                // Upload to backend
                await actorsAPI.saveFile(id, relativePath, content);

                successCount++;
                setUploadedFiles(prev => [...prev, { name: relativePath, status: 'success' }]);

                // Update progress
                const progress = Math.round(((i + 1) / totalFiles) * 100);
                setUploadProgress(progress);

                toast.success(`Uploaded: ${relativePath}`);
            } catch (error) {
                console.error('Upload error:', error);
                setUploadedFiles(prev => [...prev, { name: relativePath, status: 'error', error: error.message }]);
                toast.error(`Failed to upload: ${relativePath}`);
            }
        }

        setUploadStatus(`Upload completed: ${successCount}/${totalFiles} files`);

        if (successCount > 0) {
            // Refresh file structure
            queryClient.invalidateQueries(['actor', id]);
            toast.success(`Successfully uploaded ${successCount} files!`);
        }
    };

    const readFileAsText = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    };

    const updateFileStructureFromUpload = (uploadedFiles) => {
        const newStructure = [...fileStructure];

        uploadedFiles.forEach(file => {
            const pathParts = file.name.split('/');
            let currentLevel = newStructure;

            for (let i = 0; i < pathParts.length - 1; i++) {
                const folderName = pathParts[i];
                let folder = currentLevel.find(item => item.name === folderName && item.type === 'folder');

                if (!folder) {
                    folder = { name: folderName, type: 'folder', children: [] };
                    currentLevel.push(folder);
                }

                currentLevel = folder.children;
            }

            const fileName = pathParts[pathParts.length - 1];
            const existingFile = currentLevel.find(item => item.name === fileName);
            if (!existingFile) {
                currentLevel.push({ name: fileName, type: 'file' });
            }
        });

        setFileStructure(newStructure);
    };

    // Render file tree
    const renderFileTree = (items, level = 0) => {
        return items.map((item, index) => (
            <div key={index} style={{ paddingLeft: level * 16 }}>
                <div
                    className={`flex items-center py-1 px-2 rounded cursor-pointer hover:bg-gray-100 group ${selectedFile === item.name ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                    onClick={() => item.type === 'file' && handleFileSelect(item.name)}
                >
                    {item.type === 'folder' ? (
                        <Folder size={16} className="mr-2 text-blue-500" />
                    ) : (
                        <File size={16} className="mr-2 text-gray-500" />
                    )}
                    <span className="text-sm flex-1">{item.name}</span>

                    {/* Context menu for folders */}
                    {item.type === 'folder' && (
                        <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 ml-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCreateFile(item.name);
                                }}
                                className="p-1 text-gray-400 hover:text-blue-600"
                                title="Tạo file mới"
                            >
                                <Plus size={12} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCreateFolder(item.name);
                                }}
                                className="p-1 text-gray-400 hover:text-blue-600"
                                title="Tạo folder mới"
                            >
                                <Folder size={12} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteItem(item);
                                }}
                                className="p-1 text-gray-400 hover:text-red-600"
                                title="Xóa folder"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    )}

                    {/* Context menu for files */}
                    {item.type === 'file' && (
                        <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 ml-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteItem(item);
                                }}
                                className="p-1 text-gray-400 hover:text-red-600"
                                title="Xóa file"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    )}
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
                            title="Build actor với Docker"
                        >
                            {buildActorMutation.isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Đang build...
                                </>
                            ) : (
                                <>
                                    <Package size={16} className="mr-2" />
                                    ▷ Build
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleRunStream}
                            disabled={runActorMutation.isLoading}
                            className="btn-primary flex items-center"
                            title="Chạy actor và xem log"
                        >
                            {runActorMutation.isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Đang chạy...
                                </>
                            ) : (
                                <>
                                    <Play size={16} className="mr-2" />
                                    ▷ Run
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => setShowBuildLogs(true)}
                            className="btn-secondary flex items-center"
                            title="Xem build logs"
                        >
                            <Package size={16} className="mr-2" />
                            Build Logs
                        </button>
                        <button
                            onClick={() => setShowRunLogs(true)}
                            className="btn-secondary flex items-center"
                            title="Xem run logs"
                        >
                            <Play size={16} className="mr-2" />
                            Run Logs
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
                                <button
                                    onClick={() => handleCreateFile()}
                                    className="p-1 text-gray-400 hover:text-blue-600"
                                    title="Tạo file mới"
                                >
                                    <Plus size={14} />
                                </button>
                                <button
                                    onClick={() => handleCreateFolder()}
                                    className="p-1 text-gray-400 hover:text-blue-600"
                                    title="Tạo folder mới"
                                >
                                    <Folder size={14} />
                                </button>
                                <button
                                    onClick={handleUploadFolder}
                                    className="p-1 text-gray-400 hover:text-gray-600"
                                    title="Upload folder"
                                >
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
                            <button
                                className="p-1 text-gray-400 hover:text-gray-600"
                                onClick={() => {
                                    console.log('Debug info:', {
                                        selectedFile,
                                        fileContent: fileContent?.substring(0, 100) + '...',
                                        isEditing,
                                        localStorageTest: testLocalStorage(),
                                        localStorageKeys: Object.keys(localStorage).filter(key => key.includes('actor_'))
                                    });
                                    toast.success('Đã log debug info vào console');
                                }}
                                title="Debug info"
                            >
                                <Code size={16} />
                            </button>
                            <button
                                className="p-1 text-gray-400 hover:text-gray-600"
                                onClick={testFileBasedStorage}
                                title="Test file-based storage"
                            >
                                <FileText size={16} />
                            </button>
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
                                {saveSourceMutation.isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} className="mr-2" />
                                        Save
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Monaco Editor */}
                    <div className="flex-1">
                        <MonacoEditorWrapper
                            value={fileContent}
                            onChange={(value) => {
                                setFileContent(value);
                                setIsEditing(true);

                                // Save to localStorage for persistence (all files)
                                const localStorageKey = `actor_${id}_${selectedFile}`;
                                localStorage.setItem(localStorageKey, value);

                                // Also save to localStorage for build process (main.js)
                                if (selectedFile === 'main.js') {
                                    localStorage.setItem(`actor_code_${id}`, value);
                                }
                            }}
                            language="javascript"
                            theme="vs-dark"
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
                        {buildActorMutation.isLoading ? 'Đang build...' : 'Build now'}
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
            {/* Streaming Output Modal */}
            <StreamingOutput
                isOpen={showOutput}
                onClose={() => setShowOutput(false)}
                output={outputStream}
                isRunning={isRunning}
                onRun={handleRunStream}
                onStop={handleStop}
            />

            {/* Build Logs Modal */}
            <LogDisplay
                isOpen={showBuildLogs}
                onClose={() => setShowBuildLogs(false)}
                actorId={id}
                type="build"
            />

            {/* Run Logs Modal */}
            <LogDisplay
                isOpen={showRunLogs}
                onClose={() => setShowRunLogs(false)}
                actorId={id}
                type="run"
            />

            {/* Create File/Folder Modal */}
            <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${showCreateModal ? '' : 'hidden'}`}>
                <div className="bg-white rounded-lg p-6 w-96">
                    <h3 className="text-lg font-semibold mb-4">
                        Tạo {createType === 'file' ? 'File' : 'Folder'} mới
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tên {createType === 'file' ? 'file' : 'folder'}
                            </label>
                            <input
                                type="text"
                                value={createName}
                                onChange={(e) => setCreateName(e.target.value)}
                                placeholder={createType === 'file' ? 'example.js' : 'new-folder'}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                            />
                        </div>

                        {createParent && (
                            <div className="text-sm text-gray-500">
                                Tạo trong: <span className="font-medium">{createParent}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end space-x-3 mt-6">
                        <button
                            onClick={() => setShowCreateModal(false)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleConfirmCreate}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Tạo
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete File/Folder Modal */}
            <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${showDeleteModal ? '' : 'hidden'}`}>
                <div className="bg-white rounded-lg p-6 w-96">
                    <h3 className="text-lg font-semibold mb-4 text-red-600">
                        Xóa {itemToDelete?.type === 'file' ? 'File' : 'Folder'}
                    </h3>

                    <div className="space-y-4">
                        <p className="text-gray-700">
                            Bạn có chắc chắn muốn xóa <strong>{itemToDelete?.name}</strong>?
                        </p>
                        {itemToDelete?.type === 'folder' && (
                            <p className="text-sm text-red-500">
                                ⚠️ Tất cả file và folder bên trong sẽ bị xóa!
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-end space-x-3 mt-6">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleConfirmDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Xóa
                        </button>
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            <UploadModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onUpload={handleFileUpload}
                uploadProgress={uploadProgress}
                uploadStatus={uploadStatus}
                uploadedFiles={uploadedFiles}
            />
        </div>
    );
};

export default ActorEditor; 