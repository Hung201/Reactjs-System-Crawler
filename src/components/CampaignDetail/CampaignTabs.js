import React from 'react';

const CampaignTabs = ({ activeTab, setActiveTab, crawledData }) => {
    const tabs = [
        { id: 'overview', label: 'Tổng quan' },
        { id: 'schema', label: 'Input Schema' },
        {
            id: 'data',
            label: 'Dữ liệu cào',
            badge: crawledData && (
                <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    {Array.isArray(crawledData) ? crawledData.length : '1'}
                </span>
            )
        },
        { id: 'runs', label: 'Lịch sử chạy' },
        { id: 'settings', label: 'Cài đặt' }
    ];

    const getTabClassName = (tabId) => {
        const baseClass = "py-4 px-1 border-b-2 font-medium text-sm transition-colors";
        const activeClass = "border-primary-500 text-primary-600";
        const inactiveClass = "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300";

        return `${baseClass} ${activeTab === tabId ? activeClass : inactiveClass}`;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border">
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={getTabClassName(tab.id)}
                        >
                            {tab.label}
                            {tab.badge}
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
};

export default CampaignTabs;
