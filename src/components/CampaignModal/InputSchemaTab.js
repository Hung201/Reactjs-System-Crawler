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
    removeArrayItem,
    formData,
    templates
}) => {
    return (
        <div className="space-y-6">
            {/* Template Info */}
            {formData?.selectedTemplate && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h4 className="text-sm font-semibold text-blue-900">
                                Template: {templates.find(t => t._id === formData.selectedTemplate)?.name || 'Unknown Template'}
                            </h4>
                            <p className="text-sm text-blue-700 mt-1">
                                {templates.find(t => t._id === formData.selectedTemplate)?.description || 'No description available'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

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
                                            placeholder=".product-attribute"
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
                                            placeholder=".thumb-slider .swiper-container .swiper-wrapper .swiper-slide"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Product Link Patterns Section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <button
                            onClick={() => toggleSection('productPatterns')}
                            className="flex items-center justify-between w-full mb-4"
                        >
                            <h4 className="text-md font-medium text-gray-900">Product Link Patterns</h4>
                            {collapsedSections.productPatterns ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                        </button>

                        {!collapsedSections.productPatterns && (
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

                    {/* Image Patterns Section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <button
                            onClick={() => toggleSection('imagePatterns')}
                            className="flex items-center justify-between w-full mb-4"
                        >
                            <h4 className="text-md font-medium text-gray-900">Image Patterns</h4>
                            {collapsedSections.imagePatterns ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                        </button>

                        {!collapsedSections.imagePatterns && (
                            <div className="space-y-4">
                                {/* Image Include Patterns */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Image Include Patterns
                                    </label>
                                    {(getSchemaValue('includePatterns', []) || []).map((pattern, index) => (
                                        <div key={index} className="flex items-center gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={pattern}
                                                onChange={(e) => handleArrayChange('includePatterns', index, e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                placeholder="product"
                                            />
                                            <button
                                                onClick={() => removeArrayItem('includePatterns', index)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addArrayItem('includePatterns', '')}
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
                                    >
                                        <Plus size={16} />
                                        Add Include Pattern
                                    </button>
                                </div>

                                {/* Image Exclude Patterns */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Image Exclude Patterns
                                    </label>
                                    {(getSchemaValue('excludePatterns', []) || []).map((pattern, index) => (
                                        <div key={index} className="flex items-center gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={pattern}
                                                onChange={(e) => handleArrayChange('excludePatterns', index, e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                placeholder="thumb"
                                            />
                                            <button
                                                onClick={() => removeArrayItem('excludePatterns', index)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addArrayItem('excludePatterns', '')}
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
                            <div>
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
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Max Requests Per Crawl
                                        </label>
                                        <input
                                            type="number"
                                            value={getSchemaValue('maxRequestsPerCrawl', 50000)}
                                            onChange={(e) => handleSchemaChange('maxRequestsPerCrawl', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                </div>

                                {/* Boolean Settings */}
                                <div className="mt-4">
                                    <h5 className="text-sm font-medium text-gray-900 mb-3">Crawl Options</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="isPrice"
                                                checked={getSchemaValue('isPrice', true)}
                                                onChange={(e) => handleSchemaChange('isPrice', e.target.checked)}
                                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="isPrice" className="ml-2 block text-sm text-gray-700">
                                                Extract Price
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="isThumbnail"
                                                checked={getSchemaValue('isThumbnail', true)}
                                                onChange={(e) => handleSchemaChange('isThumbnail', e.target.checked)}
                                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="isThumbnail" className="ml-2 block text-sm text-gray-700">
                                                Extract Thumbnail
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="autoGenerateSku"
                                                checked={getSchemaValue('autoGenerateSku', true)}
                                                onChange={(e) => handleSchemaChange('autoGenerateSku', e.target.checked)}
                                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="autoGenerateSku" className="ml-2 block text-sm text-gray-700">
                                                Auto Generate SKU
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="skuInImage"
                                                checked={getSchemaValue('skuInImage', false)}
                                                onChange={(e) => handleSchemaChange('skuInImage', e.target.checked)}
                                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="skuInImage" className="ml-2 block text-sm text-gray-700">
                                                SKU in Image
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="isBrowser"
                                                checked={getSchemaValue('isBrowser', false)}
                                                onChange={(e) => handleSchemaChange('isBrowser', e.target.checked)}
                                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="isBrowser" className="ml-2 block text-sm text-gray-700">
                                                Use Browser
                                            </label>
                                        </div>
                                    </div>
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
