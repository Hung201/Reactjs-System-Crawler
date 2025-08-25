import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ChevronLeft, CheckCircle, XCircle, Clock, Download, Copy, ExternalLink, Play } from 'lucide-react';
import { actorsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const BuildLog = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // States
    const [buildLogs, setBuildLogs] = useState([]);
    const [buildStatus, setBuildStatus] = useState('building'); // building, succeeded, failed
    const [buildInfo, setBuildInfo] = useState({
        version: '0.0.12',
        duration: '36s',
        started: '2025-07-04 10:22',
        usage: '$0.012',
        origin: 'Web',
        exitCode: 0
    });

    // Generate build logs based on actual actor code
    const generateBuildLogs = (actorCode) => {
        const logs = [
            { timestamp: new Date().toISOString(), level: 'info', message: 'Starting build process...' },
            { timestamp: new Date().toISOString(), level: 'info', message: 'Analyzing source code...' },
        ];

        // Analyze the actual code
        if (actorCode && actorCode.includes('import { Actor }')) {
            logs.push({ timestamp: new Date().toISOString(), level: 'info', message: '✓ Found Apify SDK imports' });
        } else {
            logs.push({ timestamp: new Date().toISOString(), level: 'warning', message: '⚠️ Missing Apify SDK imports' });
        }

        if (actorCode && actorCode.includes('CheerioCrawler')) {
            logs.push({ timestamp: new Date().toISOString(), level: 'info', message: '✓ Found CheerioCrawler usage' });
        }

        if (actorCode && actorCode.includes('Dataset')) {
            logs.push({ timestamp: new Date().toISOString(), level: 'info', message: '✓ Found Dataset usage' });
        }

        if (actorCode && actorCode.includes('Actor.init()')) {
            logs.push({ timestamp: new Date().toISOString(), level: 'info', message: '✓ Found Actor initialization' });
        }

        if (actorCode && actorCode.includes('Actor.exit()')) {
            logs.push({ timestamp: new Date().toISOString(), level: 'info', message: '✓ Found Actor exit' });
        }

        // Check for common patterns
        if (actorCode && actorCode.includes('requestHandler')) {
            logs.push({ timestamp: new Date().toISOString(), level: 'info', message: '✓ Found request handler' });
        }

        if (actorCode && actorCode.includes('enqueueLinks')) {
            logs.push({ timestamp: new Date().toISOString(), level: 'info', message: '✓ Found link enqueuing' });
        }

        // Add dependency installation logs
        logs.push(
            { timestamp: new Date().toISOString(), level: 'info', message: 'Installing dependencies...' },
            { timestamp: new Date().toISOString(), level: 'info', message: 'apify@3.8.5 deduped' },
            { timestamp: new Date().toISOString(), level: 'info', message: 'crawlee@3.13.9 deduped' },
            { timestamp: new Date().toISOString(), level: 'info', message: 'tslib@2.8.1 deduped' },
            { timestamp: new Date().toISOString(), level: 'info', message: '@crawlee/cheerio@3.13.9 deduped' },
            { timestamp: new Date().toISOString(), level: 'info', message: 'inquirer@9.3.7 deduped' }
        );

        // Add Docker build logs
        logs.push(
            { timestamp: new Date().toISOString(), level: 'info', message: 'Building Docker image...' },
            { timestamp: new Date().toISOString(), level: 'info', message: 'Step 1/10 : FROM apify/actor-node:18' },
            { timestamp: new Date().toISOString(), level: 'info', message: 'Step 2/10 : WORKDIR /usr/src/app' },
            { timestamp: new Date().toISOString(), level: 'info', message: 'Step 3/10 : COPY package*.json ./' },
            { timestamp: new Date().toISOString(), level: 'info', message: 'Step 4/10 : RUN npm ci --only=production' },
            { timestamp: new Date().toISOString(), level: 'info', message: 'Step 5/10 : COPY . ./' },
            { timestamp: new Date().toISOString(), level: 'info', message: 'Step 6/10 : RUN npm run build' },
            { timestamp: new Date().toISOString(), level: 'info', message: 'Step 7/10 : EXPOSE 8080' },
            { timestamp: new Date().toISOString(), level: 'info', message: 'Step 8/10 : CMD [ "npm", "start" ]' }
        );

        // Add success logs
        logs.push(
            { timestamp: new Date().toISOString(), level: 'info', message: 'Docker image built successfully' },
            { timestamp: new Date().toISOString(), level: 'info', message: 'Pushing image to registry...' },
            { timestamp: new Date().toISOString(), level: 'success', message: 'Build completed successfully!' },
            { timestamp: new Date().toISOString(), level: 'info', message: `Image tagged as: ${actorData.actorId}:${buildInfo.version}` },
            { timestamp: new Date().toISOString(), level: 'info', message: 'Actor ready for deployment' }
        );

        return logs;
    };

    // Fetch actor data
    const { data: actor, isLoading } = useQuery({
        queryKey: ['actor', id],
        queryFn: () => actorsAPI.getById(id),
        enabled: !!id,
        retry: 1
    });

    // Mock actor data
    const actorData = actor?.data || {
        _id: id,
        name: 'Alibaba 1 Or Many Url Product Scraper',
        actorId: `daisan/${id}`,
        description: 'Cào dữ liệu 1 sản phẩm Alibaba theo đầu vào là 1 hoặc nhiều link sản phẩm Alibaba.',
        version: '0.0.12',
        status: 'ready'
    };

    // Simulate build process with actual code
    useEffect(() => {
        setBuildLogs([]);
        setBuildStatus('building');

        // Get actual actor code from localStorage or API
        const getActorCode = async () => {
            try {
                // Try to get from localStorage first (from ActorEditor)
                const savedCode = localStorage.getItem(`actor_code_${id}`);
                let actorCode = savedCode;

                // If not in localStorage, try to get from API
                if (!actorCode) {
                    const response = await actorsAPI.getSource(id, 'main.js');
                    actorCode = response?.data?.content || '';
                }

                // Generate build logs based on actual code
                const buildLogs = generateBuildLogs(actorCode);

                // Simulate streaming build logs với delay tăng lên để tránh spam
                let currentIndex = 0;
                const interval = setInterval(() => {
                    if (currentIndex < buildLogs.length) {
                        const logEntry = buildLogs[currentIndex];
                        if (logEntry && logEntry.timestamp && logEntry.message) {
                            setBuildLogs(prev => [...prev, logEntry]);
                        }
                        currentIndex++;
                    } else {
                        clearInterval(interval);
                        setBuildStatus('succeeded');
                        setBuildInfo(prev => ({ ...prev, exitCode: 0 }));
                    }
                }, 1000); // Tăng từ 500ms lên 1000ms

                return () => clearInterval(interval);
            } catch (error) {
                console.error('Error getting actor code:', error);
                // Fallback to default logs với delay tăng lên
                const defaultLogs = generateBuildLogs('');
                let currentIndex = 0;
                const interval = setInterval(() => {
                    if (currentIndex < defaultLogs.length) {
                        const logEntry = defaultLogs[currentIndex];
                        if (logEntry && logEntry.timestamp && logEntry.message) {
                            setBuildLogs(prev => [...prev, logEntry]);
                        }
                        currentIndex++;
                    } else {
                        clearInterval(interval);
                        setBuildStatus('succeeded');
                        setBuildInfo(prev => ({ ...prev, exitCode: 0 }));
                    }
                }, 1000); // Tăng từ 500ms lên 1000ms

                return () => clearInterval(interval);
            }
        };

        getActorCode();
    }, [id, actorData.actorId, buildInfo.version]);

    // Copy log to clipboard
    const copyLogs = () => {
        const logText = buildLogs && buildLogs.length > 0
            ? buildLogs.map(log => log && log.timestamp && log.message ? `[${log.timestamp}] ${log.message}` : '').filter(text => text).join('\n')
            : 'No logs available';
        navigator.clipboard.writeText(logText);
        toast.success('Đã copy logs vào clipboard!');
    };

    // Download logs
    const downloadLogs = () => {
        const logText = buildLogs && buildLogs.length > 0
            ? buildLogs.map(log => log && log.timestamp && log.message ? `[${log.timestamp}] ${log.message}` : '').filter(text => text).join('\n')
            : 'No logs available';
        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `build-log-${actorData.name}-${buildInfo.version}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const getStatusIcon = () => {
        switch (buildStatus) {
            case 'building':
                return <Clock size={20} className="text-blue-500 animate-spin" />;
            case 'succeeded':
                return <CheckCircle size={20} className="text-green-500" />;
            case 'failed':
                return <XCircle size={20} className="text-red-500" />;
            default:
                return <Clock size={20} className="text-gray-500" />;
        }
    };

    const getStatusText = () => {
        switch (buildStatus) {
            case 'building':
                return 'Đang build...';
            case 'succeeded':
                return 'Build thành công';
            case 'failed':
                return 'Build thất bại';
            default:
                return 'Không xác định';
        }
    };

    const getStatusColor = () => {
        switch (buildStatus) {
            case 'building':
                return 'text-blue-600';
            case 'succeeded':
                return 'text-green-600';
            case 'failed':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
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
                            onClick={() => navigate(`/actors/${id}/edit`)}
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ChevronLeft size={20} className="mr-1" />
                            Quay lại Editor
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <span className="text-sm font-bold text-green-600">MA</span>
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">
                                    {actorData.name} - Build {buildInfo.version} latest
                                </h1>
                                <p className="text-sm text-gray-500">
                                    {actorData.actorId}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                            {getStatusIcon()}
                            <span className={`font-medium ${getStatusColor()}`}>
                                {getStatusText()}
                            </span>
                        </div>
                        <button
                            onClick={copyLogs}
                            className="btn-secondary flex items-center"
                        >
                            <Copy size={16} className="mr-2" />
                            Copy logs
                        </button>
                        <button
                            onClick={downloadLogs}
                            className="btn-secondary flex items-center"
                        >
                            <Download size={16} className="mr-2" />
                            Download
                        </button>
                    </div>
                </div>
            </div>

            {/* Build Info */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500">DURATION:</span>
                        <span className="ml-2 font-medium">{buildInfo.duration}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">STARTED:</span>
                        <span className="ml-2 font-medium">{buildInfo.started}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">USAGE:</span>
                        <span className="ml-2 font-medium">{buildInfo.usage}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">ORIGIN:</span>
                        <span className="ml-2 font-medium">{buildInfo.origin}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">EXIT CODE:</span>
                        <span className={`ml-2 font-medium ${buildInfo.exitCode === 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {buildInfo.exitCode}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => navigate(`/actors/${id}/run`)}
                            className="btn-primary text-sm flex items-center"
                        >
                            <Play size={14} className="mr-1" />
                            Run Actor
                        </button>
                        <button className="btn-secondary text-sm">Delete</button>
                        <button className="btn-secondary text-sm">API</button>
                        <button className="btn-secondary text-sm">More details</button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200 px-6">
                <div className="flex items-center space-x-6">
                    <button className="px-4 py-2 text-sm font-medium text-primary-600 border-b-2 border-primary-600">
                        Log
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                        Webhooks
                    </button>
                </div>
            </div>

            {/* Build Logs */}
            <div className="flex-1 bg-black text-green-400 font-mono text-sm overflow-auto p-4">
                <div className="space-y-1">
                    {buildLogs && buildLogs.length > 0 ? (
                        buildLogs.map((log, index) => (
                            <div key={index} className="flex">
                                <span className="text-gray-500 mr-4 min-w-[200px]">
                                    {log && log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()}
                                </span>
                                <span className={`${log && log.level === 'error' ? 'text-red-400' :
                                    log && log.level === 'success' ? 'text-green-400' :
                                        log && log.level === 'warning' ? 'text-yellow-400' :
                                            'text-blue-400'
                                    }`}>
                                    {log && log.message ? log.message : 'Unknown log entry'}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <span className="text-gray-500">Đang khởi tạo build logs...</span>
                        </div>
                    )}
                    {buildStatus === 'building' && buildLogs && buildLogs.length > 0 && (
                        <div className="flex items-center">
                            <span className="text-gray-500 mr-4 min-w-[200px]">
                                {new Date().toLocaleTimeString()}
                            </span>
                            <span className="text-blue-400 animate-pulse">
                                ▋
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Info */}
            <div className="bg-white border-t border-gray-200 px-6 py-3">
                <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Build completed at {new Date().toLocaleString()}</span>
                    <div className="flex items-center space-x-4">
                        <span>View full log</span>
                        <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-800">
                            <ExternalLink size={14} />
                            <span>Open in new tab</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuildLog;
