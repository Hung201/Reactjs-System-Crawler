import React from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import ElementSelector from '../Common/ElementSelector';

// Component con để tái sử dụng cho các input selector
const SelectorInput = ({
    label,
    value,
    onChange,
    placeholder,
    description
}) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <ElementSelector
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                compact={true}
            />
            {description && (
                <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
        </div>
    );
};

const InputSchemaTab = ({
    inputMode,
    setInputMode,
    jsonInput,
    handleJsonInputChange,
    handleInputModeChange,
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
                        type="button"
                        onClick={() => handleInputModeChange('manual')}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${inputMode === 'manual'
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Manual
                    </button>
                    <button
                        type="button"
                        onClick={() => handleInputModeChange('json')}
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
                    <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Input Data JSON
                        </label>
                    </div>

                    {/* Thông tin hướng dẫn */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h4 className="text-sm font-medium text-blue-800">Thông tin về Input Data JSON</h4>
                                <div className="mt-1 text-sm text-blue-700">
                                    <p>• Đây là dữ liệu input thực tế sẽ được gửi về API</p>
                                    <p>• Bạn có thể chỉnh sửa trực tiếp JSON này</p>
                                    <p>• Khi chuyển về Manual mode, các thay đổi sẽ được áp dụng</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <textarea
                        value={jsonInput}
                        onChange={(e) => handleJsonInputChange(e.target.value)}
                        rows={20}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Paste your input data JSON here..."
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
                            type="button"
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
                            type="button"
                            onClick={() => toggleSection('selectors')}
                            className="flex items-center justify-between w-full mb-4"
                        >
                            <h4 className="text-md font-medium text-gray-900">Selectors</h4>
                            {collapsedSections.selectors ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                        </button>

                        {!collapsedSections.selectors && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <SelectorInput
                                        label="Product Link Selector"
                                        value={getSchemaValue('productLinkSelector', '')}
                                        onChange={(value) => handleSchemaChange('productLinkSelector', value)}
                                        placeholder=".list-item-img a"
                                    />
                                    <SelectorInput
                                        label="Title Selector"
                                        value={getSchemaValue('titleClass', '')}
                                        onChange={(value) => handleSchemaChange('titleClass', value)}
                                        placeholder=".product-detail_title h1"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <SelectorInput
                                        label="Price Selector"
                                        value={getSchemaValue('priceClass', '')}
                                        onChange={(value) => handleSchemaChange('priceClass', value)}
                                        placeholder=".price"
                                    />
                                    <SelectorInput
                                        label="SKU Selector"
                                        value={getSchemaValue('skuClass', '')}
                                        onChange={(value) => handleSchemaChange('skuClass', value)}
                                        placeholder="Leave empty for auto-generate"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <SelectorInput
                                        label="Description Selector"
                                        value={getSchemaValue('descriptionClass', '')}
                                        onChange={(value) => handleSchemaChange('descriptionClass', value)}
                                        placeholder=".product-attribute"
                                    />
                                    <SelectorInput
                                        label="Content Selector"
                                        value={getSchemaValue('contentClass', '')}
                                        onChange={(value) => handleSchemaChange('contentClass', value)}
                                        placeholder=".description-info"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <SelectorInput
                                        label="Thumbnail Selector"
                                        value={getSchemaValue('thumbnailClass', '')}
                                        onChange={(value) => handleSchemaChange('thumbnailClass', value)}
                                        placeholder=".image-slider-item img"
                                    />
                                    <SelectorInput
                                        label="Images Selector"
                                        value={getSchemaValue('imagesClass', '')}
                                        onChange={(value) => handleSchemaChange('imagesClass', value)}
                                        placeholder=".thumb-slider .swiper-container .swiper-wrapper .swiper-slide"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Product Link Patterns Section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <button
                            type="button"
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
                                                type="button"
                                                onClick={() => removeArrayItem('productLinkIncludePatterns', index)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
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
                                                type="button"
                                                onClick={() => removeArrayItem('productLinkExcludePatterns', index)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
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
                            type="button"
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
                                                type="button"
                                                onClick={() => removeArrayItem('includePatterns', index)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
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
                                                type="button"
                                                onClick={() => removeArrayItem('excludePatterns', index)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
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
                            type="button"
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
                                        <select
                                            value={getSchemaValue('category', '')}
                                            onChange={(e) => handleSchemaChange('category', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="">Chọn category</option>
                                            <option value="Product">Product</option>
                                            <option value="News">News</option>
                                            <option value="Video">Video</option>
                                        </select>
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
