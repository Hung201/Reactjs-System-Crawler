import React, { useState, useEffect } from 'react';
import { X, Play, StopCircle, Copy, Download } from 'lucide-react';

const StreamingOutput = ({ isOpen, onClose, output, isRunning, onRun, onStop }) => {
    const [outputText, setOutputText] = useState('');
    const [autoScroll, setAutoScroll] = useState(true);

    useEffect(() => {
        if (output) {
            setOutputText(prev => prev + output);
        }
    }, [output]);

    useEffect(() => {
        if (autoScroll && outputText) {
            const outputElement = document.getElementById('output-content');
            if (outputElement) {
                outputElement.scrollTop = outputElement.scrollHeight;
            }
        }
    }, [outputText, autoScroll]);

    const clearOutput = () => {
        setOutputText('');
    };

    const copyOutput = () => {
        navigator.clipboard.writeText(outputText);
    };

    const downloadOutput = () => {
        const blob = new Blob([outputText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `actor-output-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-11/12 h-5/6 max-w-4xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">Actor Output</h3>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={onRun}
                            disabled={isRunning}
                            className="btn-primary flex items-center"
                        >
                            <Play size={16} className="mr-1" />
                            Run
                        </button>
                        <button
                            onClick={onStop}
                            disabled={!isRunning}
                            className="btn-secondary flex items-center"
                        >
                            <StopCircle size={16} className="mr-1" />
                            Stop
                        </button>
                        <button
                            onClick={copyOutput}
                            className="btn-secondary flex items-center"
                        >
                            <Copy size={16} className="mr-1" />
                            Copy
                        </button>
                        <button
                            onClick={downloadOutput}
                            className="btn-secondary flex items-center"
                        >
                            <Download size={16} className="mr-1" />
                            Download
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-gray-700"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between p-2 border-b bg-gray-50">
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={autoScroll}
                                onChange={(e) => setAutoScroll(e.target.checked)}
                                className="mr-2"
                            />
                            Auto-scroll
                        </label>
                        <button
                            onClick={clearOutput}
                            className="text-sm text-red-600 hover:text-red-800"
                        >
                            Clear Output
                        </button>
                    </div>
                    <div className="text-sm text-gray-500">
                        {isRunning && (
                            <span className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                Running...
                            </span>
                        )}
                    </div>
                </div>

                {/* Output Content */}
                <div className="flex-1 p-4 overflow-hidden">
                    <div
                        id="output-content"
                        className="w-full h-full bg-black text-green-400 font-mono text-sm p-4 rounded overflow-auto"
                        style={{ fontFamily: 'Consolas, Monaco, monospace' }}
                    >
                        {outputText || 'No output yet. Click Run to start the actor.'}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-2 border-t bg-gray-50 text-xs text-gray-500">
                    Output will be streamed in real-time from the server
                </div>
            </div>
        </div>
    );
};

export default StreamingOutput; 