import React, { useState, useEffect } from 'react';
import { X, Play, Download, Eye, EyeOff, Copy, ExternalLink } from 'lucide-react';
import ApifyService from '../../../services/apifyService';

const RunActorModal = ({ isOpen, onClose, actor, platform }) => {
    const [inputData, setInputData] = useState({});
    const [inputMode, setInputMode] = useState('form'); // 'form' or 'json'
    const [jsonInput, setJsonInput] = useState('');
    const [running, setRunning] = useState(false);
    const [runResult, setRunResult] = useState(null);
    const [showToken, setShowToken] = useState(false);

    // Initialize input data from actor's example
    useEffect(() => {
        if (actor && actor.exampleRunInput) {
            setInputData(actor.exampleRunInput);
            setJsonInput(JSON.stringify(actor.exampleRunInput, null, 2));
        }
    }, [actor]);

    const handleInputChange = (key, value) => {
        setInputData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleJsonInputChange = (value) => {
        setJsonInput(value);
        try {
            const parsed = JSON.parse(value);
            setInputData(parsed);
        } catch (error) {
            // Invalid JSON, don't update inputData
        }
    };

    const handleRunActor = async () => {
        if (!platform.apiToken) {
            alert('Platform chưa được cấu hình API token');
            return;
        }

        setRunning(true);
        setRunResult(null);

        try {
            const apifyService = new ApifyService(platform.apiToken);
            const result = await apifyService.runActor(actor.id, inputData);

            setRunResult({
                success: true,
                runId: result.data?.id,
                message: 'Actor đã được khởi chạy thành công!',
                data: result
            });
        } catch (error) {
            setRunResult({
                success: false,
                message: error.message || 'Không thể chạy actor',
                error: error
            });
        } finally {
            setRunning(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const renderInputField = (key, value, schema) => {
        const fieldType = typeof value;
        const fieldSchema = schema?.properties?.[key];

        switch (fieldType) {
            case 'string':
                if (fieldSchema?.format === 'url') {
                    return (
                        <input
                            type="url"
                            value={inputData[key] || ''}
                            onChange={(e) => handleInputChange(key, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={fieldSchema?.description || `Nhập ${key}`}
                        />
                    );
                }
                return (
                    <input
                        type="text"
                        value={inputData[key] || ''}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={fieldSchema?.description || `Nhập ${key}`}
                    />
                );
            case 'number':
                return (
                    <input
                        type="number"
                        value={inputData[key] || ''}
                        onChange={(e) => handleInputChange(key, parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={fieldSchema?.description || `Nhập ${key}`}
                    />
                );
            case 'boolean':
                return (
                    <select
                        value={inputData[key] || false}
                        onChange={(e) => handleInputChange(key, e.target.value === 'true')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={true}>True</option>
                        <option value={false}>False</option>
                    </select>
                );
            case 'object':
                return (
                    <textarea
                        value={JSON.stringify(inputData[key] || {}, null, 2)}
                        onChange={(e) => {
                            try {
                                const parsed = JSON.parse(e.target.value);
                                handleInputChange(key, parsed);
                            } catch (error) {
                                // Invalid JSON, don't update
                            }
                        }}
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        placeholder="{}"
                    />
                );
            default:
                return (
                    <input
                        type="text"
                        value={inputData[key] || ''}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Nhập ${key}`}
                    />
                );
        }
    };

    if (!isOpen || !actor) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Chạy Actor: {actor.name}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Platform: {platform.name}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Actor Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Thông tin Actor</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Tên:</span>
                                <span className="ml-2 text-gray-900">{actor.name}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Version:</span>
                                <span className="ml-2 text-gray-900">{actor.version || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Runs:</span>
                                <span className="ml-2 text-gray-900">{actor.runCount || 0}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Status:</span>
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${actor.isDeprecated
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-green-100 text-green-800'
                                    }`}>
                                    {actor.isDeprecated ? 'Deprecated' : 'Active'}
                                </span>
                            </div>
                        </div>
                        {actor.description && (
                            <p className="text-sm text-gray-600 mt-3">{actor.description}</p>
                        )}
                    </div>

                    {/* Input Mode Toggle */}
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setInputMode('form')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${inputMode === 'form'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Form Input
                        </button>
                        <button
                            onClick={() => setInputMode('json')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${inputMode === 'json'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            JSON Input
                        </button>
                    </div>

                    {/* Input Section */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Input Parameters</h3>

                        {inputMode === 'form' ? (
                            <div className="space-y-4">
                                {Object.keys(inputData).length === 0 ? (
                                    <p className="text-gray-500">Không có input parameters</p>
                                ) : (
                                    Object.entries(inputData).map(([key, value]) => (
                                        <div key={key}>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {key}
                                            </label>
                                            {renderInputField(key, value, actor.inputSchema)}
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div>
                                <textarea
                                    value={jsonInput}
                                    onChange={(e) => handleJsonInputChange(e.target.value)}
                                    rows="12"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                    placeholder="{}"
                                />
                            </div>
                        )}
                    </div>

                    {/* Run Result */}
                    {runResult && (
                        <div className={`p-4 rounded-lg border ${runResult.success
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                            }`}>
                            <h4 className={`font-medium ${runResult.success ? 'text-green-800' : 'text-red-800'
                                }`}>
                                {runResult.success ? '✅ Thành công' : '❌ Lỗi'}
                            </h4>
                            <p className={`text-sm mt-1 ${runResult.success ? 'text-green-700' : 'text-red-700'
                                }`}>
                                {runResult.message}
                            </p>
                            {runResult.runId && (
                                <div className="mt-3 p-3 bg-white rounded border">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">
                                            Run ID: {runResult.runId}
                                        </span>
                                        <button
                                            onClick={() => copyToClipboard(runResult.runId)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Đóng
                        </button>
                        <button
                            onClick={handleRunActor}
                            disabled={running}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {running ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Đang chạy...
                                </>
                            ) : (
                                <>
                                    <Play className="h-4 w-4 mr-2" />
                                    Chạy Actor
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RunActorModal;
