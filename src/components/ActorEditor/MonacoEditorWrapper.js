import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

const MonacoEditorWrapper = ({ value, onChange, language = 'javascript', theme = 'vs-dark', options = {} }) => {
    const editorRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        // Suppress ResizeObserver errors
        const originalError = console.error;
        console.error = (...args) => {
            if (args[0]?.includes?.('ResizeObserver')) {
                return;
            }
            originalError.apply(console, args);
        };

        return () => {
            console.error = originalError;
        };
    }, []);

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;

        // Sử dụng debounce để tránh ResizeObserver loop
        let resizeTimeout;
        const resizeObserver = new ResizeObserver(() => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                try {
                    if (editor && typeof editor.layout === 'function') {
                        editor.layout();
                    }
                } catch (error) {
                    // Bỏ qua lỗi layout
                }
            }, 100); // Delay 100ms
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        // Lưu observer và timeout để cleanup
        editor._resizeObserver = resizeObserver;
        editor._resizeTimeout = resizeTimeout;
    };

    const handleEditorWillUnmount = (editor) => {
        if (editor) {
            // Clear timeout nếu có
            if (editor._resizeTimeout) {
                clearTimeout(editor._resizeTimeout);
            }
            // Disconnect ResizeObserver
            if (editor._resizeObserver) {
                editor._resizeObserver.disconnect();
            }
        }
    };

    return (
        <div ref={containerRef} className="w-full h-full">
            <Editor
                height="100%"
                defaultLanguage={language}
                value={value}
                onChange={onChange}
                theme={theme}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: false, // Tắt automaticLayout để tránh xung đột
                    fixedOverflowWidgets: true,
                    scrollbar: {
                        vertical: 'visible',
                        horizontal: 'visible'
                    },
                    ...options
                }}
                onMount={handleEditorDidMount}
                onBeforeUnmount={handleEditorWillUnmount}
            />
        </div>
    );
};

export default MonacoEditorWrapper; 