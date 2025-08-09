import React from 'react';
import {
    RefreshCw,
    Clock,
    CheckCircle,
    XCircle,
    Play,
    Info
} from 'lucide-react';

const RunsTab = ({
    runHistory,
    runStatus,
    loadRunHistory,
    formatDate,
    getRunStatusIcon
}) => {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Lịch sử chạy gần đây</h3>
                <button
                    onClick={loadRunHistory}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <RefreshCw size={16} />
                    Tải lại
                </button>
            </div>
            <div className="space-y-3">
                {runStatus && (
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                            {getRunStatusIcon(runStatus.status)}
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    Run hiện tại
                                </p>
                                <p className="text-xs text-gray-500">
                                    {runStatus.message}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            {runStatus.runId && (
                                <p className="text-xs text-gray-500">ID: {runStatus.runId}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Real run history */}
                {runHistory && runHistory.length > 0 ? (
                    <div className="space-y-3">
                        {runHistory.map((run, index) => (
                            <div key={run._id || index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                                <div className="flex items-center gap-3">
                                    {getRunStatusIcon(run.status)}
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            Run #{run.runId || run._id?.slice(-8) || (index + 1)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatDate(run.startTime || run.createdAt)}
                                            {run.endTime && (
                                                <span> - {formatDate(run.endTime)}</span>
                                            )}
                                        </p>
                                        {run.error && (
                                            <p className="text-xs text-red-500 mt-1">
                                                Lỗi: {run.error}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                        {run.status === 'completed' ? 'Thành công' :
                                            run.status === 'failed' ? 'Thất bại' :
                                                run.status === 'running' ? 'Đang chạy' : 'Không xác định'}
                                    </p>
                                    {run.duration && (
                                        <p className="text-xs text-gray-500">
                                            {Math.round(run.duration / 1000)} giây
                                        </p>
                                    )}
                                    {run.dataCollected && (
                                        <p className="text-xs text-green-600">
                                            {run.dataCollected} items
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <Clock className="mx-auto h-8 w-8 mb-2" />
                        <p>Chưa có lịch sử chạy</p>
                        <p className="text-xs mt-1">Chạy campaign để tạo lịch sử</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RunsTab;
