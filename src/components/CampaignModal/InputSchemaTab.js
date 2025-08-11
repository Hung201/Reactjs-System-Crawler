import React from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';

const InputSchemaTab = ({
    inputMode,
    setInputMode,
    jsonInput,
    handleJsonInputChange,
    getSchemaValue,
    handleSchemaChange,
    collapsedSections,
    toggleSection,
    handleArrayChange,
    addArrayItem,
    removeArrayItem
}) => {
    return (
        <div className="space-y-6">
            {/* Input Mode Toggle */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Input Schema</h3>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setInputMode('manual')}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${inputMode === 'manual'
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Manual
                    </button>
                    <button
                        onClick={() => setInputMode('json')}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${inputMode === 'json'
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        JSON
                    </button>
                </div>
            </div>

            {inputMode === 'json' ? (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Input Schema JSON
                    </label>
                    <textarea
                        value={jsonInput}
                        onChange={(e) => handleJsonInputChange(e.target.value)}
                        rows={20}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Paste your input schema JSON here..."
                    />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Basic Configuration */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-md font-medium text-gray-900">Basic Configuration</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    URL *
                                </label>
                                <input
                                    type="text"
                                    value={getSchemaValue('url', '')}
                                    onChange={(e) => handleSchemaChange('url', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="https://example.com/category"
                                />
                                <p className="text-xs text-gray-500 mt-1">Category or product page URL to start crawling</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Website Name
                                </label>
                                <input
                                    type="text"
                                    value={getSchemaValue('websiteName', '')}
                                    onChange={(e) => handleSchemaChange('websiteName', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="DAISAN"
                                />
                                <p className="text-xs text-gray-500 mt-1">Website name for SKU generation</p>
                            </div>
                        </div>
                    </div>

                    {/* Pagination Section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <button
                            onClick={() => toggleSection('pagination')}
                            className="flex items-center justify-between w-full mb-4"
                        >
                            <h4 className="text-md font-medium text-gray-900">Pagination</h4>
                            {collapsedSections.pagination ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                        </button>

                        {!collapsedSections.pagination && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Pagination Pattern
                                    </label>
                                    <input
                                        type="text"
                                        value={getSchemaValue('paginationPattern', '')}
                                        onChange={(e) => handleSchemaChange('paginationPattern', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="?page="
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Page Start
                                    </label>
                                    <input
                                        type="number"
                                        value={getSchemaValue('pageStart', 1)}
                                        onChange={(e) => handleSchemaChange('pageStart', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Page End
                                    </label>
                                    <input
                                        type="number"
                                        value={getSchemaValue('pageEnd', 5)}
                                        onChange={(e) => handleSchemaChange('pageEnd', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Selectors Section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <button
                            onClick={() => toggleSection('selectors')}
                            className="flex items-center justify-between w-full mb-4"
                        >
                            <h4 className="text-md font-medium text-gray-900">Selectors</h4>
                            {collapsedSections.selectors ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                        </button>

                        {!collapsedSections.selectors && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Product Link Selector
                                        </label>
                                        <input
                                            type="text"
                                            value={getSchemaValue('productLinkSelector', '')}
                                            onChange={(e) => handleSchemaChange('productLinkSelector', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder=".list-item-img a"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Title Selector
                                        </label>
                                        <input
                                            type="text"
                                            value={getSchemaValue('titleClass', '')}
                                            onChange={(e) => handleSchemaChange('titleClass', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder=".product-detail_title h1"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Price Selector
                                        </label>
                                        <input
                                            type="text"
                                            value={getSchemaValue('priceClass', '')}
                                            onChange={(e) => handleSchemaChange('priceClass', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder=".price"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            SKU Selector
                                        </label>
                                        <input
                                            type="text"
                                            value={getSchemaValue('skuClass', '')}
                                            onChange={(e) => handleSchemaChange('skuClass', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="Leave empty for auto-generate"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description Selector
                                        </label>
                                        <input
                                            type="text"
                                            value={getSchemaValue('descriptionClass', '')}
                                            onChange={(e) => handleSchemaChange('descriptionClass', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder=".product-shipping"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Content Selector
                                        </label>
                                        <input
                                            type="text"
                                            value={getSchemaValue('contentClass', '')}
                                            onChange={(e) => handleSchemaChange('contentClass', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder=".description-info"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Thumbnail Selector
                                        </label>
                                        <input
                                            type="text"
                                            value={getSchemaValue('thumbnailClass', '')}
                                            onChange={(e) => handleSchemaChange('thumbnailClass', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder=".image-slider-item img"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Images Selector
                                        </label>
                                        <input
                                            type="text"
                                            value={getSchemaValue('imagesClass', '')}
                                            onChange={(e) => handleSchemaChange('imagesClass', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder=".thumb-slider .swiper-container"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Array Fields Section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <button
                            onClick={() => toggleSection('arrays')}
                            className="flex items-center justify-between w-full mb-4"
                        >
                            <h4 className="text-md font-medium text-gray-900">Include/Exclude Patterns</h4>
                            {collapsedSections.arrays ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                        </button>

                        {!collapsedSections.arrays && (
                            <div className="space-y-4">
                                {/* Product Link Include Patterns */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Product Link Include Patterns
                                    </label>
                                    {(getSchemaValue('productLinkIncludePatterns', []) || []).map((pattern, index) => (
                                        <div key={index} className="flex items-center gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={pattern}
                                                onChange={(e) => handleArrayChange('productLinkIncludePatterns', index, e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                placeholder="gach-"
                                            />
                                            <button
                                                onClick={() => removeArrayItem('productLinkIncludePatterns', index)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addArrayItem('productLinkIncludePatterns', '')}
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
                                    >
                                        <Plus size={16} />
                                        Add Include Pattern
                                    </button>
                                </div>

                                {/* Product Link Exclude Patterns */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Product Link Exclude Patterns
                                    </label>
                                    {(getSchemaValue('productLinkExcludePatterns', []) || []).map((pattern, index) => (
                                        <div key={index} className="flex items-center gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={pattern}
                                                onChange={(e) => handleArrayChange('productLinkExcludePatterns', index, e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                placeholder="gioi-thieu"
                                            />
                                            <button
                                                onClick={() => removeArrayItem('productLinkExcludePatterns', index)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addArrayItem('productLinkExcludePatterns', '')}
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
                                    >
                                        <Plus size={16} />
                                        Add Exclude Pattern
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Additional Settings */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <button
                            onClick={() => toggleSection('settings')}
                            className="flex items-center justify-between w-full mb-4"
                        >
                            <h4 className="text-md font-medium text-gray-900">Additional Settings</h4>
                            {collapsedSections.settings ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                        </button>

                        {!collapsedSections.settings && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category
                                    </label>
                                    <input
                                        type="text"
                                        value={getSchemaValue('category', '')}
                                        onChange={(e) => handleSchemaChange('category', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="Gạch ốp tường"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Supplier
                                    </label>
                                    <input
                                        type="text"
                                        value={getSchemaValue('supplier', '')}
                                        onChange={(e) => handleSchemaChange('supplier', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="DAISANB2B"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Supplier URL
                                    </label>
                                    <input
                                        type="text"
                                        value={getSchemaValue('url_supplier', '')}
                                        onChange={(e) => handleSchemaChange('url_supplier', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="https://b2b.daisan.vn"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Max Product Links
                                    </label>
                                    <input
                                        type="number"
                                        value={getSchemaValue('maxProductLinks', 50)}
                                        onChange={(e) => handleSchemaChange('maxProductLinks', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InputSchemaTab;
