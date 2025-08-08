import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Play, Square, Copy, Download, RefreshCw } from 'lucide-react';
import { actorsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const RunLog = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // States
    const [runLogs, setRunLogs] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [runStatus, setRunStatus] = useState('idle'); // idle, running, succeeded, failed
    const [runStats, setRunStats] = useState({
        results: 0,
        requests: { handled: 0, total: 0 },
        usage: '$0.000',
        started: null,
        duration: '0s'
    });

    // Mock actor data
    const actorData = {
        actorId: `daisan/${id}`,
        actorName: id === 'mock-actor-1' ? 'Web Scraper Actor' :
            id === 'mock-actor-2' ? 'E-commerce Crawler' :
                id === 'mock-actor-3' ? 'News Aggregator' : 'My Actor',
        version: '0.0.1'
    };

    // Fetch actor data
    const { data: actor } = useQuery({
        queryKey: ['actor', id],
        queryFn: () => actorsAPI.get(id),
        enabled: !!id
    });

    // Generate run logs based on actual code
    const generateRunLogs = (actorCode) => {
        const logs = [
            { timestamp: new Date().toISOString(), level: 'info', message: 'Starting actor execution...' },
            { timestamp: new Date().toISOString(), level: 'info', message: 'Pulling Docker image...' },
            { timestamp: new Date().toISOString(), level: 'info', message: 'Creating Docker container...' },
            { timestamp: new Date().toISOString(), level: 'info', message: 'Starting Docker container...' },
            { timestamp: new Date().toISOString(), level: 'info', message: 'System info: Apify 3.8.5, Crawlee 3.13.9, OS: Linux, Node.js: 18.19.0' },
        ];

        // Analyze the actual code for more realistic logs
        if (actorCode && actorCode.includes('CheerioCrawler')) {
            logs.push(
                { timestamp: new Date().toISOString(), level: 'info', message: 'CheerioCrawler: Starting the crawler.' },
                { timestamp: new Date().toISOString(), level: 'info', message: 'CheerioCrawler: Processing request: https://example.com' },
                { timestamp: new Date().toISOString(), level: 'info', message: 'CheerioCrawler: Đã lấy xong dữ liệu sản phẩm!' },
                { timestamp: new Date().toISOString(), level: 'info', message: 'CheerioCrawler: All requests from the queue have been processed, the crawler will shut down.' },
                { timestamp: new Date().toISOString(), level: 'info', message: 'CheerioCrawler: Final request statistics: {requestsFinished:1, requestsFailed:0, retryHistogram:[1], requestAvgFailedDurationMillis:null, requestAvgFinishedDurationMillis:2621, requestsFinishedPerMinute:17, requestsFailedPerMinute:0, requestTotalDurationMillis:2621, requestsTotal:1, crawlDurationMillis:2621}' },
                { timestamp: new Date().toISOString(), level: 'info', message: 'CheerioCrawler: Finished! Total 1 requests: 1 succeeded, 0 failed. {terminal:true}' }
            );
        }

        if (actorCode && actorCode.includes('Dataset')) {
            logs.push(
                { timestamp: new Date().toISOString(), level: 'info', message: 'Dataset: Saving data to default dataset...' },
                { timestamp: new Date().toISOString(), level: 'info', message: 'Dataset: Data saved successfully (1 items)' }
            );
        }

        if (actorCode && actorCode.includes('Actor.exit()')) {
            logs.push(
                { timestamp: new Date().toISOString(), level: 'info', message: 'Actor: Exiting with exit code 0' },
                { timestamp: new Date().toISOString(), level: 'success', message: '✓ Succeeded Finished! Total 1 requests: 1 succeeded, 0 failed.' }
            );
        }

        return logs;
    };

    // Start run
    const handleStartRun = () => {
        setIsRunning(true);
        setRunStatus('running');
        setRunStats(prev => ({
            ...prev,
            started: new Date().toISOString()
        }));

        // Get actual code from localStorage or API
        let actorCode = localStorage.getItem(`actor_code_${id}`);

        if (!actorCode) {
            // Fallback to API
            actorsAPI.getSource(id, 'main.js').then(response => {
                actorCode = response.content;
                const logs = generateRunLogs(actorCode);
                setRunLogs(logs);

                // Simulate run completion after 3 seconds
                setTimeout(() => {
                    setIsRunning(false);
                    setRunStatus('succeeded');
                    setRunStats(prev => ({
                        ...prev,
                        results: 1,
                        requests: { handled: 1, total: 1 },
                        duration: '3s'
                    }));
                }, 3000);
            });
        } else {
            const logs = generateRunLogs(actorCode);
            setRunLogs(logs);

            // Simulate run completion after 3 seconds
            setTimeout(() => {
                setIsRunning(false);
                setRunStatus('succeeded');
                setRunStats(prev => ({
                    ...prev,
                    results: 1,
                    requests: { handled: 1, total: 1 },
                    duration: '3s'
                }));
            }, 3000);
        }
    };

    // Stop run
    const handleStopRun = () => {
        setIsRunning(false);
        setRunStatus('failed');
        setRunLogs(prev => [...prev, {
            timestamp: new Date().toISOString(),
            level: 'error',
            message: 'Run stopped by user'
        }]);
    };

    // Copy logs
    const copyLogs = () => {
        if (runLogs && runLogs.length > 0) {
            const logText = runLogs
                .filter(log => log && log.timestamp && log.message)
                .map(log => `${log.timestamp} ${log.level.toUpperCase()}: ${log.message}`)
                .join('\n');
            navigator.clipboard.writeText(logText);
            toast.success('Logs copied to clipboard!');
        }
    };

    // Download logs
    const downloadLogs = () => {
        if (runLogs && runLogs.length > 0) {
            const logText = runLogs
                .filter(log => log && log.timestamp && log.message)
                .map(log => `${log.timestamp} ${log.level.toUpperCase()}: ${log.message}`)
                .join('\n');

            const blob = new Blob([logText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `run-logs-${id}-${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('Logs downloaded!');
        }
    };

    // Initialize logs on component mount
    useEffect(() => {
        let actorCode = localStorage.getItem(`actor_code_${id}`);

        if (!actorCode) {
            // Try to get from API
            actorsAPI.getSource(id, 'main.js').then(response => {
                actorCode = response.content;
                const logs = generateRunLogs(actorCode);
                setRunLogs(logs);
            }).catch(() => {
                // Fallback to basic logs
                const logs = generateRunLogs('');
                setRunLogs(logs);
            });
        } else {
            const logs = generateRunLogs(actorCode);
            setRunLogs(logs);
        }
    }, [id]);

    const getStatusColor = () => {
        switch (runStatus) {
            case 'running': return 'bg-blue-500';
            case 'succeeded': return 'bg-green-500';
            case 'failed': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusText = () => {
        switch (runStatus) {
            case 'running': return 'Running...';
            case 'succeeded': return '✓ Succeeded';
            case 'failed': return '✗ Failed';
            default: return 'Ready to run';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate(`/actors/${id}`)}
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ChevronLeft size={20} />
                            <span className="ml-1">Actor</span>
                        </button>
                        <div className="text-xl font-semibold text-gray-900">
                            {actorData.actorName} - Run
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                            <RefreshCw size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-white font-medium ${getStatusColor()}`}>
                    {getStatusText()}
                </div>

                {runStatus === 'succeeded' && (
                    <div className="mt-2 text-sm text-gray-600">
                        Finished! Total {runStats.requests.total} requests: {runStats.requests.handled} succeeded, 0 failed.
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="grid grid-cols-5 gap-4 text-sm">
                    <div>
                        <div className="text-gray-500">RESULTS</div>
                        <div className="font-semibold">{runStats.results}</div>
                    </div>
                    <div>
                        <div className="text-gray-500">REQUESTS</div>
                        <div className="font-semibold">{runStats.requests.handled} of {runStats.requests.total} handled</div>
                    </div>
                    <div>
                        <div className="text-gray-500">USAGE</div>
                        <div className="font-semibold">{runStats.usage}</div>
                    </div>
                    <div>
                        <div className="text-gray-500">STARTED</div>
                        <div className="font-semibold">
                            {runStats.started ? new Date(runStats.started).toLocaleString() : '-'}
                        </div>
                    </div>
                    <div>
                        <div className="text-gray-500">DURATION</div>
                        <div className="font-semibold">{runStats.duration}</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200 px-6">
                <div className="flex space-x-8">
                    <button className="px-4 py-2 text-sm font-medium text-gray-500 border-b-2 border-transparent">
                        Output 1
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
                        Log
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-500 border-b-2 border-transparent">
                        Input
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-500 border-b-2 border-transparent">
                        Storage
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-500 border-b-2 border-transparent">
                        Live view
                    </button>
                </div>
            </div>

            {/* Log Content */}
            <div className="flex-1 p-6">
                <div className="bg-white rounded-lg border border-gray-200">
                    {/* Log Header */}
                    <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleStartRun}
                                disabled={isRunning}
                                className="btn-primary flex items-center"
                            >
                                <Play size={16} className="mr-2" />
                                {isRunning ? 'Running...' : 'Start Run'}
                            </button>

                            {isRunning && (
                                <button
                                    onClick={handleStopRun}
                                    className="btn-secondary flex items-center"
                                >
                                    <Square size={16} className="mr-2" />
                                    Stop
                                </button>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={copyLogs}
                                className="p-2 text-gray-400 hover:text-gray-600"
                                title="Copy logs"
                            >
                                <Copy size={16} />
                            </button>
                            <button
                                onClick={downloadLogs}
                                className="p-2 text-gray-400 hover:text-gray-600"
                                title="Download logs"
                            >
                                <Download size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Log Display */}
                    <div className="p-4 bg-gray-900 text-green-400 font-mono text-sm h-96 overflow-y-auto">
                        {runLogs && runLogs.length > 0 ? (
                            runLogs.map((log, index) => {
                                if (!log || !log.timestamp || !log.message) return null;

                                const timestamp = new Date(log.timestamp).toISOString();
                                const levelClass = log.level === 'error' ? 'text-red-400' :
                                    log.level === 'warning' ? 'text-yellow-400' :
                                        log.level === 'success' ? 'text-green-400' : 'text-blue-400';

                                return (
                                    <div key={index} className="mb-1">
                                        <span className="text-gray-500">{timestamp}</span>
                                        <span className={`ml-2 ${levelClass}`}>
                                            {log.level.toUpperCase()}:
                                        </span>
                                        <span className="ml-2 text-white">{log.message}</span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-gray-500">
                                Đang khởi tạo run logs...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RunLog;
