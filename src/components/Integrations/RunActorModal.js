import React, { useState, useEffect } from 'react';
import { X, Play, Download, Eye, EyeOff, CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import ApifyService from '../../services/apifyService';
import toast from 'react-hot-toast';

const RunActorModal = ({ isOpen, onClose, actor, platform }) => {
    const [inputData, setInputData] = useState({});
    const [inputMode, setInputMode] = useState('form'); // 'form' or 'json'
    const [jsonInput, setJsonInput] = useState('');
    const [running, setRunning] = useState(false);
    const [runResult, setRunResult] = useState(null);
    const [showToken, setShowToken] = useState(false);
    const [actorDetails, setActorDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [inputSchema, setInputSchema] = useState(null);

    // Load actor details when modal opens
    useEffect(() => {
        if (isOpen && actor?.id && platform?.apiToken) {
            loadActorDetails();
        }
    }, [isOpen, actor, platform]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            // Don't reset input data when modal closes
            // Keep the data for next time
        }
    }, [isOpen]);

    const loadActorDetails = async () => {
        if (!actor?.id || !platform?.apiToken) return;

        setLoadingDetails(true);
        try {
            const apifyService = new ApifyService(platform.apiToken);
            const response = await apifyService.getActor(actor.id);
            // API response có cấu trúc {data: {...}}
            const details = response.data;
            // Parse input schema từ versions[0].sourceFiles
            let inputSchema = null;
            if (details?.versions && details.versions.length > 0) {
                const latestVersion = details.versions[0];
                if (latestVersion.sourceFiles) {
                    // Tìm file .actor/input_schema.json
                    const schemaFile = latestVersion.sourceFiles.find(file =>
                        file.name === '.actor/input_schema.json'
                    );

                    if (schemaFile && schemaFile.content) {
                        try {
                            inputSchema = JSON.parse(schemaFile.content);
                        } catch (parseError) {
                            console.error('Error parsing input schema JSON:', parseError);
                        }
                    } else {
                        console.log('No .actor/input_schema.json file found in source files');
                    }
                }
            }

            setActorDetails(details);
            setInputSchema(inputSchema); // Cập nhật state inputSchema

            // Initialize input data từ input schema hoặc example (chỉ khi chưa có dữ liệu)
            if (Object.keys(inputData).length === 0) {
                let initialInputData = {};

                if (inputSchema && inputSchema.properties) {
                    // Tạo default values từ schema properties
                    Object.entries(inputSchema.properties).forEach(([key, prop]) => {
                        if (prop.default !== undefined) {
                            initialInputData[key] = prop.default;
                        } else if (prop.type === 'array') {
                            initialInputData[key] = [];
                        } else if (prop.type === 'object') {
                            initialInputData[key] = {};
                        } else if (prop.type === 'boolean') {
                            initialInputData[key] = false;
                        } else if (prop.type === 'string') {
                            initialInputData[key] = '';
                        } else if (prop.type === 'integer' || prop.type === 'number') {
                            initialInputData[key] = 0;
                        }
                    });
                } else if (details?.exampleRunInput) {
                    initialInputData = details.exampleRunInput;
                } else if (actor.exampleRunInput) {
                    initialInputData = actor.exampleRunInput;
                } else {
                    initialInputData = {};
                }

                setInputData(initialInputData);
                setJsonInput(JSON.stringify(initialInputData, null, 2));
            } else {
                // Cập nhật JSON input để đồng bộ với input data hiện tại
                setJsonInput(JSON.stringify(inputData, null, 2));
            }
        } catch (error) {
            console.error('Error loading actor details:', error);
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
        } finally {
            setLoadingDetails(false);
        }
    };

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
            toast.error('Platform chưa được cấu hình API token');
            return;
        }

        // Validate required fields
        if (inputSchema?.required) {
            const missingFields = inputSchema.required.filter(field =>
                !inputData[field] || inputData[field] === ''
            );

            if (missingFields.length > 0) {
                toast.error(`Vui lòng điền đầy đủ các trường bắt buộc: ${missingFields.join(', ')}`);
                return;
            }
        }

        setRunning(true);
        setRunResult(null);

        try {
            const apifyService = new ApifyService(platform.apiToken);
            const result = await apifyService.runActor(actor.id, inputData);

            const runId = result.data?.id || result.id;
            const runUrl = result.data?.webUrls?.runDetail || `https://console.apify.com/actors/${actor.id}/runs/${runId}`;

            // Show success toast and close modal
            toast.success(`Actor "${actor.name}" đã được khởi chạy thành công! Run ID: ${runId}`);

            // Auto close modal after 1 second
            setTimeout(() => {
                onClose();
            }, 1000);

        } catch (error) {
            console.error('Run actor error:', error);
            toast.error(`Không thể chạy actor: ${error.message}`);
        } finally {
            setRunning(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const renderInputField = (key, value, schema) => {
        const fieldSchema = schema?.properties?.[key];
        const fieldType = fieldSchema?.type || typeof value;

        switch (fieldType) {
            case 'string':
                if (fieldSchema?.format === 'url') {
                    return (
                        <input
                            type="url"
                            value={inputData[key] || ''}
                            onChange={(e) => handleInputChange(key, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            placeholder="Nhập URL"
                        />
                    );
                }
                if (fieldSchema?.editor === 'textarea') {
                    return (
                        <textarea
                            value={inputData[key] || ''}
                            onChange={(e) => handleInputChange(key, e.target.value)}
                            rows="4"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            placeholder="Nhập nội dung"
                        />
                    );
                }
                return (
                    <input
                        type="text"
                        value={inputData[key] || ''}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        placeholder="Nhập giá trị"
                    />
                );
            case 'number':
            case 'integer':
                return (
                    <input
                        type="number"
                        value={inputData[key] || ''}
                        onChange={(e) => handleInputChange(key, parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        placeholder="Nhập số"
                        min={fieldSchema?.minimum}
                        max={fieldSchema?.maximum}
                        step={fieldSchema?.type === 'integer' ? '1' : 'any'}
                    />
                );
            case 'boolean':
                return (
                    <div className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            checked={inputData[key] || false}
                            onChange={(e) => handleInputChange(key, e.target.checked)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                            {fieldSchema?.title || key}
                        </span>
                    </div>
                );
            case 'array':
                return (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h4 className="text-sm font-medium text-gray-900">
                                {fieldSchema?.title || key}
                            </h4>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => {
                                        const newArray = [...(inputData[key] || []), ''];
                                        handleInputChange(key, newArray);
                                    }}
                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                >
                                    <span className="mr-1">+</span>
                                    Add {fieldSchema?.title || 'Item'}
                                </button>
                            </div>
                        </div>

                        {/* Array Items */}
                        <div className="p-4 space-y-3">
                            {(inputData[key] || []).length === 0 ? (
                                <div className="text-center py-6 text-gray-500">
                                    <p className="text-sm">No items added yet</p>
                                    <p className="text-xs mt-1">Click the button above to add items</p>
                                </div>
                            ) : (
                                (inputData[key] || []).map((item, index) => (
                                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-medium text-gray-700">
                                                    Item {index + 1}:
                                                </span>
                                                <input
                                                    type="text"
                                                    value={typeof item === 'string' ? item : JSON.stringify(item)}
                                                    onChange={(e) => {
                                                        const newArray = [...(inputData[key] || [])];
                                                        try {
                                                            // Try to parse as JSON first
                                                            const parsed = JSON.parse(e.target.value);
                                                            newArray[index] = parsed;
                                                        } catch {
                                                            // If not valid JSON, treat as string
                                                            newArray[index] = e.target.value;
                                                        }
                                                        handleInputChange(key, newArray);
                                                    }}
                                                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    placeholder="Enter value"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const newArray = [...(inputData[key] || [])];
                                                newArray.splice(index, 1);
                                                handleInputChange(key, newArray);
                                            }}
                                            className="text-red-500 hover:text-red-700 p-1 transition-colors"
                                            title="Remove item"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* JSON Editor Toggle */}
                        <div className="border-t border-gray-200 p-4">
                            <details className="group">
                                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center">
                                    <span className="mr-2">📝 Edit JSON directly</span>
                                    <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <div className="mt-3">
                                    <textarea
                                        value={JSON.stringify(inputData[key] || [], null, 2)}
                                        onChange={(e) => {
                                            try {
                                                const parsed = JSON.parse(e.target.value);
                                                handleInputChange(key, parsed);
                                            } catch (error) {
                                                // Invalid JSON, don't update
                                            }
                                        }}
                                        rows="4"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm font-mono text-sm"
                                        placeholder="[]"
                                    />
                                </div>
                            </details>
                        </div>
                    </div>
                );
            case 'object':
                return (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h4 className="text-sm font-medium text-gray-900">
                                {fieldSchema?.title || key}
                            </h4>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => {
                                        const newObject = { ...(inputData[key] || {}), 'newProperty': '' };
                                        handleInputChange(key, newObject);
                                    }}
                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                >
                                    <span className="mr-1">+</span>
                                    Add Property
                                </button>
                            </div>
                        </div>

                        {/* Object Properties */}
                        <div className="p-4 space-y-3">
                            {Object.keys(inputData[key] || {}).length === 0 ? (
                                <div className="text-center py-6 text-gray-500">
                                    <p className="text-sm">No properties added yet</p>
                                    <p className="text-xs mt-1">Click the button above to add properties</p>
                                </div>
                            ) : (
                                Object.entries(inputData[key] || {}).map(([propKey, propValue]) => (
                                    <div key={propKey} className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="text"
                                                    value={propKey}
                                                    onChange={(e) => {
                                                        const newObject = { ...(inputData[key] || {}) };
                                                        const newKey = e.target.value;
                                                        if (newKey && newKey !== propKey) {
                                                            newObject[newKey] = newObject[propKey];
                                                            delete newObject[propKey];
                                                            handleInputChange(key, newObject);
                                                        }
                                                    }}
                                                    className="w-32 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                                                    placeholder="Property name"
                                                />
                                                <span className="text-gray-500">:</span>
                                                <input
                                                    type="text"
                                                    value={typeof propValue === 'string' ? propValue : JSON.stringify(propValue)}
                                                    onChange={(e) => {
                                                        const newObject = { ...(inputData[key] || {}) };
                                                        try {
                                                            // Try to parse as JSON first
                                                            const parsed = JSON.parse(e.target.value);
                                                            newObject[propKey] = parsed;
                                                        } catch {
                                                            // If not valid JSON, treat as string
                                                            newObject[propKey] = e.target.value;
                                                        }
                                                        handleInputChange(key, newObject);
                                                    }}
                                                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    placeholder="Property value"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const newObject = { ...(inputData[key] || {}) };
                                                delete newObject[propKey];
                                                handleInputChange(key, newObject);
                                            }}
                                            className="text-red-500 hover:text-red-700 p-1 transition-colors"
                                            title="Remove property"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* JSON Editor Toggle */}
                        <div className="border-t border-gray-200 p-4">
                            <details className="group">
                                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center">
                                    <span className="mr-2">📝 Edit JSON directly</span>
                                    <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <div className="mt-3">
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
                                        rows="6"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm font-mono text-sm"
                                        placeholder="{}"
                                    />
                                </div>
                            </details>
                        </div>
                    </div>
                );
            default:
                return (
                    <input
                        type="text"
                        value={inputData[key] || ''}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập giá trị"
                    />
                );
        }
    };

    if (!isOpen || !actor) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header - Fixed */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
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

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Actor Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Thông tin Actor</h3>
                        {loadingDetails ? (
                            <div className="animate-pulse space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Tên:</span>
                                    <span className="ml-2 text-gray-900">{actorDetails?.name || actor.name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Version:</span>
                                    <span className="ml-2 text-gray-900">{actorDetails?.version || actor.version || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Runs:</span>
                                    <span className="ml-2 text-gray-900">{actorDetails?.stats?.totalRuns || actor.runCount || 0}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Status:</span>
                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${actorDetails?.isDeprecated || actor.isDeprecated
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-green-100 text-green-800'
                                        }`}>
                                        {actorDetails?.isDeprecated || actor.isDeprecated ? 'Deprecated' : 'Active'}
                                    </span>
                                </div>
                            </div>
                        )}
                        {(actorDetails?.description || actor.description) && (
                            <p className="text-sm text-gray-600 mt-3">
                                {actorDetails?.description || actor.description}
                            </p>
                        )}
                        {actorDetails && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-xs text-blue-700">
                                    <strong>Debug Info:</strong><br />
                                    • Actor ID: {actor.id}<br />
                                    • API Data loaded: {actorDetails ? 'Yes' : 'No'}<br />
                                    • Has versions: {actorDetails?.versions ? 'Yes' : 'No'}<br />
                                    • Versions count: {actorDetails?.versions?.length || 0}<br />
                                    • Has exampleRunInput: {actorDetails?.exampleRunInput ? 'Yes' : 'No'}<br />
                                    • Has input schema: {inputSchema ? 'Yes' : 'No'}<br />
                                    • Schema properties: {inputSchema?.properties ? Object.keys(inputSchema.properties).length : 0}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Input Mode Toggle */}
                    <div className="flex items-center justify-between">
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
                        <button
                            onClick={() => {
                                if (window.confirm('Bạn có chắc muốn xóa tất cả dữ liệu đã nhập?')) {
                                    setInputData({});
                                    setJsonInput('{}');
                                    toast.success('Đã xóa dữ liệu input');
                                }
                            }}
                            className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                        >
                            Reset Form
                        </button>
                    </div>

                    {/* Input Section */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Input Parameters</h3>

                        {loadingDetails ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="text-gray-500 mt-4">Đang tải thông tin actor...</p>
                            </div>
                        ) : inputMode === 'form' ? (
                            <div className="space-y-4">
                                {Object.keys(inputData).length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 mb-4">Không có input parameters</p>
                                        {actorDetails && (
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                                <p className="text-xs text-yellow-700">
                                                    <strong>Debug Info:</strong><br />
                                                    • Input data keys: {Object.keys(inputData).length}<br />
                                                    • Has exampleRunInput: {actorDetails?.exampleRunInput ? 'Yes' : 'No'}<br />
                                                    • ExampleRunInput keys: {actorDetails?.exampleRunInput ? Object.keys(actorDetails.exampleRunInput).join(', ') : 'None'}<br />
                                                    • Has versions: {actorDetails?.versions ? 'Yes' : 'No'}<br />
                                                    • Versions count: {actorDetails?.versions?.length || 0}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <p className="text-xs text-green-700">
                                                <strong>Input Parameters Found:</strong> {Object.keys(inputData).length} parameters
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                            {Object.entries(inputData).map(([key, value]) => (
                                                <div key={key} className="mb-6">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        {inputSchema?.properties?.[key]?.title || key}
                                                        {inputSchema?.required?.includes(key) && (
                                                            <span className="text-red-500 ml-1">*</span>
                                                        )}
                                                    </label>
                                                    {renderInputField(key, value, inputSchema)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <textarea
                                    value={jsonInput}
                                    onChange={(e) => handleJsonInputChange(e.target.value)}
                                    rows="12"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm font-mono text-sm"
                                    placeholder="{}"
                                />
                            </div>
                        )}
                    </div>



                </div>

                {/* Actions - Fixed */}
                <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0 bg-white">
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
    );
};

export default RunActorModal;
