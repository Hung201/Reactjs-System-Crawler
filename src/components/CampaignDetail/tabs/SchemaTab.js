import React from 'react';

const SchemaTab = ({ campaign }) => {
    return (
        <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Input Schema Configuration</h3>
            <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-800 overflow-x-auto">
                    {JSON.stringify(campaign.input || campaign.inputSchema, null, 2)}
                </pre>
            </div>
        </div>
    );
};

export default SchemaTab;
