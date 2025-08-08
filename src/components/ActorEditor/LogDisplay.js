import React, { useState, useEffect } from 'react';
import { X, Download, Copy, RefreshCw } from 'lucide-react';
import { actorsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const LogDisplay = ({ isOpen, onClose, actorId, type = 'build' }) => {
    const [logs, setLogs] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchLogs = async () => {
        if (!actorId) return;

        setIsLoading(true);
        try {
            // Get list of log files
            const filesResponse = await actorsAPI.getFiles(actorId);
            const logFiles = filesResponse.data.files.filter(file =>
                file.startsWith('logs/') && file.includes(`${type}_`)
            );

            if (logFiles.length > 0) {
                // Get the most recent log file
                const latestLogFile = logFiles.sort().pop();
                const logResponse = await actorsAPI.getFile(actorId, latestLogFile);
                setLogs(logResponse.data.content);
                setLastUpdated(new Date());
            } else {
                setLogs(`Chưa có log ${type} nào.`);
            }
        } catch (error) {
            console.error(`Error fetching ${type} logs:`, error);
            setLogs(`Lỗi khi tải log: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && actorId) {
            fetchLogs();
        }
    }, [isOpen, actorId, type]);

    const copyLogs = () => {
        navigator.clipboard.writeText(logs);
        toast.success('Đã copy logs vào clipboard');
    };

    const downloadLogs = () => {
        const blob = new Blob([logs], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_log_${actorId}_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Đã tải logs xuống');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-4/5 h-4/5 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center space-x-2">
                        <h2 className="text-lg font-semibold">
                            {type === 'build' ? 'Build Logs' : 'Run Logs'} - Actor {actorId}
                        </h2>
                        {lastUpdated && (
                            <span className="text-sm text-gray-500">
                                Cập nhật: {lastUpdated.toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={fetchLogs}
                            disabled={isLoading}
                            className="p-2 text-gray-600 hover:text-gray-800"
                            title="Refresh logs"
                        >
                            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={copyLogs}
                            className="p-2 text-gray-600 hover:text-gray-800"
                            title="Copy logs"
                        >
                            <Copy size={16} />
                        </button>
                        <button
                            onClick={downloadLogs}
                            className="p-2 text-gray-600 hover:text-gray-800"
                            title="Download logs"
                        >
                            <Download size={16} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-600 hover:text-gray-800"
                            title="Close"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Log Content */}
                <div className="flex-1 p-4 overflow-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2">Đang tải logs...</span>
                        </div>
                    ) : (
                        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg h-full overflow-auto text-sm font-mono whitespace-pre-wrap">
                            {logs || 'Không có logs để hiển thị.'}
                        </pre>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LogDisplay;
