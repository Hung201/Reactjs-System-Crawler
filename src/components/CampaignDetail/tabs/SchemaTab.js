import React from 'react';

const SchemaTab = ({ campaign }) => {
    return (
        <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Input Schema Configuration</h3>

            {/* Template Info */}
            {campaign.selectedTemplate && (
                <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h4 className="text-sm font-semibold text-blue-900">
                                Template: {campaign.templateName || 'Unknown Template'}
                            </h4>
                            <p className="text-sm text-blue-700 mt-1">
                                {campaign.templateDescription || 'No description available'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-800 overflow-x-auto">
                    {JSON.stringify(campaign.input || campaign.inputSchema, null, 2)}
                </pre>
            </div>
        </div>
    );
};

export default SchemaTab;
