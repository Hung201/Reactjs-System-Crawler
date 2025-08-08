import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { CAMPAIGN_STATUS } from '../../../utils/constants';

const CampaignModal = ({ isOpen, onClose, onSubmit, campaign = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: CAMPAIGN_STATUS.DRAFT,
        input_schema: {
            title: 'Multi-Website Product Crawler',
            type: 'object',
            schemaVersion: 1,
            properties: {
                url: {
                    title: 'URL',
                    type: 'string',
                    description: 'Category or product page URL to start crawling',
                    editor: 'textfield'
                },
                paginationPattern: {
                    title: 'Pagination Pattern',
                    type: 'string',
                    description: 'Pattern for pagination URLs (e.g., \'?page=\', \'/page/\', \'&page=\')',
                    editor: 'textfield'
                },
                pageStart: {
                    title: 'Page Start',
                    type: 'integer',
                    description: 'Starting page number for pagination',
                    default: 1
                },
                pageEnd: {
                    title: 'Page End',
                    type: 'integer',
                    description: 'Ending page number for pagination',
                    default: 5
                },
                productLinkSelector: {
                    title: 'Product Link Selector',
                    type: 'string',
                    description: 'CSS selector for product links (e.g., \'.list-item-img a\')',
                    editor: 'textfield'
                },
                productLinkIncludePatterns: {
                    title: 'Product Link Include Patterns',
                    type: 'array',
                    description: 'URL patterns that product links MUST include (e.g., [\'gach-\'])',
                    editor: 'json',
                    items: { type: 'string' }
                },
                productLinkExcludePatterns: {
                    title: 'Product Link Exclude Patterns',
                    type: 'array',
                    description: 'URL patterns to exclude from product links (e.g., [\'gioi-thieu\', \'tin-tuc\'])',
                    editor: 'json',
                    items: { type: 'string' }
                },
                titleClass: {
                    title: 'Title Selector',
                    type: 'string',
                    description: 'CSS selector for product title (e.g., \'.product-detail_title h1\')',
                    editor: 'textfield'
                },
                descriptionClass: {
                    title: 'Description Selector',
                    type: 'string',
                    description: 'CSS selector for product description (e.g., \'.product-shipping\')',
                    editor: 'textfield'
                },
                priceClass: {
                    title: 'Price Selector',
                    type: 'string',
                    description: 'CSS selector for product price (e.g., \'.price\')',
                    editor: 'textfield'
                },
                skuClass: {
                    title: 'SKU Selector',
                    type: 'string',
                    description: 'CSS selector for product SKU (leave empty for auto-generate)',
                    editor: 'textfield'
                },
                contentClass: {
                    title: 'Content Selector',
                    type: 'string',
                    description: 'CSS selector for product content HTML (e.g., \'.product-description\')',
                    editor: 'textfield'
                },
                thumbnailClass: {
                    title: 'Thumbnail Selector',
                    type: 'string',
                    description: 'CSS selector for product thumbnail (e.g., \'.image-slider-item img\')',
                    editor: 'textfield'
                },
                imagesClass: {
                    title: 'Images Selector',
                    type: 'string',
                    description: 'CSS selector for product images (e.g., \'.swiper-slide img\')',
                    editor: 'textfield'
                },
                includePatterns: {
                    title: 'Include Patterns',
                    type: 'array',
                    description: 'URL patterns to include images (leave empty for all)',
                    editor: 'json',
                    items: { type: 'string' }
                },
                excludePatterns: {
                    title: 'Exclude Patterns',
                    type: 'array',
                    description: 'URL patterns to exclude images (e.g., [\'thumb\', \'small\', \'icon\', \'logo\'])',
                    editor: 'json',
                    items: { type: 'string' }
                },
                skuInImage: {
                    title: 'SKU in Image',
                    type: 'boolean',
                    description: 'Only include images containing SKU in URL'
                },
                autoGenerateSku: {
                    title: 'Auto Generate SKU',
                    type: 'boolean',
                    description: 'Automatically generate SKU if not found on page',
                    default: true
                },
                websiteName: {
                    title: 'Website Name',
                    type: 'string',
                    description: 'Website name for SKU generation (e.g., \'DAISAN\')',
                    editor: 'textfield'
                },
                isPrice: {
                    title: 'Price Required',
                    type: 'boolean',
                    description: 'Skip products without price (true = skip, false = include all)',
                    default: true
                },
                isThumbnail: {
                    title: 'Thumbnail Required',
                    type: 'boolean',
                    description: 'Skip products without thumbnail (true = skip, false = include all)',
                    default: false
                },
                supplier: {
                    title: 'Supplier',
                    type: 'string',
                    description: 'Supplier name for products (e.g., \'DAISAN\')',
                    editor: 'textfield'
                },
                url_supplier: {
                    title: 'Supplier URL',
                    type: 'string',
                    description: 'Supplier website URL (e.g., \'https://b2b.daisan.vn\')',
                    editor: 'textfield'
                },
                maxRequestsPerCrawl: {
                    title: 'Max Requests per Crawl',
                    type: 'integer',
                    description: 'Maximum number of requests that can be made by this crawler',
                    default: 50000
                },
                maxProductLinks: {
                    title: 'Max Product Links',
                    type: 'integer',
                    description: 'Maximum number of product links to collect (for recursive API crawling)',
                    default: 50
                },
                isBrowser: {
                    title: 'Use Browser API',
                    type: 'boolean',
                    description: 'Use external API for product link discovery (true = API, false = direct crawl)',
                    default: false
                }
            },
            required: ['url']
        }
    });

    const [activeTab, setActiveTab] = useState('basic');
    const [inputMode, setInputMode] = useState('manual');
    const [jsonInput, setJsonInput] = useState('');
    const [collapsedSections, setCollapsedSections] = useState({
        pagination: false,
        selectors: false,
        patterns: false,
        productData: false,
        images: false,
        settings: false
    });

    // Helper function to safely access schema properties
    const getSchemaValue = (field, defaultValue = '') => {
        return formData.input_schema?.properties?.[field]?.default ?? defaultValue;
    };

    // Helper function to get actorId as string
    const getActorIdString = (actorId) => {
        if (!actorId) return '';
        if (typeof actorId === 'string') return actorId;
        if (typeof actorId === 'object') {
            return actorId.name || actorId.id || actorId.toString() || '';
        }
        return String(actorId);
    };

    useEffect(() => {
        if (campaign) {
            console.log('Raw campaign passed to modal:', campaign);
            console.log('Campaign actorId type:', typeof campaign.actorId, campaign.actorId);

            // Convert campaign.input to input_schema format if needed
            let inputSchema = campaign.input_schema;
            if (!inputSchema && campaign.input) {
                inputSchema = {
                    title: 'Multi-Website Product Crawler',
                    type: 'object',
                    schemaVersion: 1,
                    properties: {},
                    required: ['url']
                };

                // Field title mapping for better display
                const fieldTitleMap = {
                    url: 'URL',
                    paginationPattern: 'Pagination Pattern',
                    pageStart: 'Page Start',
                    pageEnd: 'Page End',
                    productLinkSelector: 'Product Link Selector',
                    titleClass: 'Title Selector',
                    priceClass: 'Price Selector',
                    skuClass: 'SKU Selector',
                    descriptionClass: 'Description Selector',
                    contentClass: 'Content Selector',
                    thumbnailClass: 'Thumbnail Selector',
                    imagesClass: 'Images Selector',
                    websiteName: 'Website Name',
                    supplier: 'Supplier',
                    url_supplier: 'Supplier URL',
                    maxRequestsPerCrawl: 'Max Requests per Crawl',
                    maxProductLinks: 'Max Product Links',
                    autoGenerateSku: 'Auto Generate SKU',
                    isPrice: 'Price Required',
                    isThumbnail: 'Thumbnail Required',
                    isBrowser: 'Use Browser API',
                    skuInImage: 'SKU in Image'
                };

                // Convert each field from input to input_schema.properties format
                Object.keys(campaign.input).forEach(key => {
                    const value = campaign.input[key];
                    inputSchema.properties[key] = {
                        title: fieldTitleMap[key] || (key.charAt(0).toUpperCase() + key.slice(1)),
                        type: typeof value === 'boolean' ? 'boolean' :
                            typeof value === 'number' ? 'integer' :
                                Array.isArray(value) ? 'array' : 'string',
                        description: fieldTitleMap[key] ? `${fieldTitleMap[key]} configuration` : `${key} configuration`,
                        editor: Array.isArray(value) ? 'json' : 'textfield',
                        default: value
                    };
                });
            }

            const normalizedCampaign = {
                name: campaign.name || '',
                description: campaign.description || '',
                status: campaign.status || CAMPAIGN_STATUS.DRAFT,
                actorId: typeof campaign.actorId === 'object' ? campaign.actorId?.name || campaign.actorId?._id || campaign.actorId?.id || '' : campaign.actorId || '',
                input_schema: inputSchema || {
                    title: 'Multi-Website Product Crawler',
                    type: 'object',
                    schemaVersion: 1,
                    properties: {
                        url: {
                            title: 'URL',
                            type: 'string',
                            description: 'Category or product page URL to start crawling',
                            editor: 'textfield',
                            default: ''
                        },
                        paginationPattern: {
                            title: 'Pagination Pattern',
                            type: 'string',
                            description: 'Pattern for pagination URLs (e.g., \'?page=\', \'/page/\', \'&page=\')',
                            editor: 'textfield',
                            default: ''
                        },
                        pageStart: {
                            title: 'Page Start',
                            type: 'integer',
                            description: 'Starting page number for pagination',
                            default: 1
                        },
                        pageEnd: {
                            title: 'Page End',
                            type: 'integer',
                            description: 'Ending page number for pagination',
                            default: 5
                        },
                        productLinkSelector: {
                            title: 'Product Link Selector',
                            type: 'string',
                            description: 'CSS selector for product links (e.g., \'.list-item-img a\')',
                            editor: 'textfield',
                            default: ''
                        },
                        productLinkIncludePatterns: {
                            title: 'Product Link Include Patterns',
                            type: 'array',
                            description: 'URL patterns that product links MUST include (e.g., [\'gach-\'])',
                            editor: 'json',
                            items: { type: 'string' },
                            default: []
                        },
                        productLinkExcludePatterns: {
                            title: 'Product Link Exclude Patterns',
                            type: 'array',
                            description: 'URL patterns to exclude from product links (e.g., [\'gioi-thieu\', \'tin-tuc\'])',
                            editor: 'json',
                            items: { type: 'string' },
                            default: []
                        },
                        titleClass: {
                            title: 'Title Selector',
                            type: 'string',
                            description: 'CSS selector for product title (e.g., \'.product-detail_title h1\')',
                            editor: 'textfield',
                            default: ''
                        },
                        descriptionClass: {
                            title: 'Description Selector',
                            type: 'string',
                            description: 'CSS selector for product description (e.g., \'.product-shipping\')',
                            editor: 'textfield',
                            default: ''
                        },
                        priceClass: {
                            title: 'Price Selector',
                            type: 'string',
                            description: 'CSS selector for product price (e.g., \'.price\')',
                            editor: 'textfield',
                            default: ''
                        },
                        skuClass: {
                            title: 'SKU Selector',
                            type: 'string',
                            description: 'CSS selector for product SKU (leave empty for auto-generate)',
                            editor: 'textfield',
                            default: ''
                        },
                        contentClass: {
                            title: 'Content Selector',
                            type: 'string',
                            description: 'CSS selector for product content HTML (e.g., \'.product-description\')',
                            editor: 'textfield',
                            default: ''
                        },
                        thumbnailClass: {
                            title: 'Thumbnail Selector',
                            type: 'string',
                            description: 'CSS selector for product thumbnail (e.g., \'.image-slider-item img\')',
                            editor: 'textfield',
                            default: ''
                        },
                        imagesClass: {
                            title: 'Images Selector',
                            type: 'string',
                            description: 'CSS selector for product images (e.g., \'.swiper-slide img\')',
                            editor: 'textfield',
                            default: ''
                        },
                        includePatterns: {
                            title: 'Include Patterns',
                            type: 'array',
                            description: 'URL patterns to include images (leave empty for all)',
                            editor: 'json',
                            items: { type: 'string' },
                            default: []
                        },
                        excludePatterns: {
                            title: 'Exclude Patterns',
                            type: 'array',
                            description: 'URL patterns to exclude images (e.g., [\'thumb\', \'small\', \'icon\', \'logo\'])',
                            editor: 'json',
                            items: { type: 'string' },
                            default: []
                        },
                        skuInImage: {
                            title: 'SKU in Image',
                            type: 'boolean',
                            description: 'Only include images containing SKU in URL',
                            default: false
                        },
                        autoGenerateSku: {
                            title: 'Auto Generate SKU',
                            type: 'boolean',
                            description: 'Automatically generate SKU if not found on page',
                            default: true
                        },
                        websiteName: {
                            title: 'Website Name',
                            type: 'string',
                            description: 'Website name for SKU generation (e.g., \'DAISAN\')',
                            editor: 'textfield',
                            default: ''
                        },
                        isPrice: {
                            title: 'Price Required',
                            type: 'boolean',
                            description: 'Skip products without price (true = skip, false = include all)',
                            default: true
                        },
                        isThumbnail: {
                            title: 'Thumbnail Required',
                            type: 'boolean',
                            description: 'Skip products without thumbnail (true = skip, false = include all)',
                            default: false
                        },
                        supplier: {
                            title: 'Supplier',
                            type: 'string',
                            description: 'Supplier name for products (e.g., \'DAISAN\')',
                            editor: 'textfield',
                            default: ''
                        },
                        url_supplier: {
                            title: 'Supplier URL',
                            type: 'string',
                            description: 'Supplier website URL (e.g., \'https://b2b.daisan.vn\')',
                            editor: 'textfield',
                            default: ''
                        },
                        maxRequestsPerCrawl: {
                            title: 'Max Requests per Crawl',
                            type: 'integer',
                            description: 'Maximum number of requests that can be made by this crawler',
                            default: 50000
                        },
                        maxProductLinks: {
                            title: 'Max Product Links',
                            type: 'integer',
                            description: 'Maximum number of product links to collect (for recursive API crawling)',
                            default: 50
                        },
                        isBrowser: {
                            title: 'Use Browser API',
                            type: 'boolean',
                            description: 'Use external API for product link discovery (true = API, false = direct crawl)',
                            default: false
                        }
                    },
                    required: ['url']
                }
            };

            setFormData(normalizedCampaign);
            setJsonInput(JSON.stringify(normalizedCampaign.input_schema, null, 2));
        } else {
            setJsonInput(JSON.stringify(formData.input_schema, null, 2));
        }
    }, [campaign]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSchemaChange = (field, value) => {
        setFormData(prev => {
            // Ensure input_schema and properties exist
            const currentSchema = prev.input_schema || {};
            const currentProperties = currentSchema.properties || {};
            const currentField = currentProperties[field] || {};

            return {
                ...prev,
                input_schema: {
                    ...currentSchema,
                    properties: {
                        ...currentProperties,
                        [field]: {
                            ...currentField,
                            default: value
                        }
                    }
                }
            };
        });
    };

    const handleArrayItemChange = (field, index, value) => {
        setFormData(prev => {
            // Ensure input_schema and properties exist
            const currentSchema = prev.input_schema || {};
            const currentProperties = currentSchema.properties || {};
            const currentField = currentProperties[field] || {};
            const currentArray = currentField.default || [];

            const newArray = [...currentArray];
            newArray[index] = value;

            return {
                ...prev,
                input_schema: {
                    ...currentSchema,
                    properties: {
                        ...currentProperties,
                        [field]: {
                            ...currentField,
                            default: newArray
                        }
                    }
                }
            };
        });
    };

    const addArrayItem = (field) => {
        setFormData(prev => {
            // Ensure input_schema and properties exist
            const currentSchema = prev.input_schema || {};
            const currentProperties = currentSchema.properties || {};
            const currentField = currentProperties[field] || {};
            const currentArray = currentField.default || [];

            return {
                ...prev,
                input_schema: {
                    ...currentSchema,
                    properties: {
                        ...currentProperties,
                        [field]: {
                            ...currentField,
                            default: [...currentArray, '']
                        }
                    }
                }
            };
        });
    };

    const removeArrayItem = (field, index) => {
        setFormData(prev => {
            // Ensure input_schema and properties exist
            const currentSchema = prev.input_schema || {};
            const currentProperties = currentSchema.properties || {};
            const currentField = currentProperties[field] || {};
            const currentArray = currentField.default || [];

            const newArray = currentArray.filter((_, i) => i !== index);

            return {
                ...prev,
                input_schema: {
                    ...currentSchema,
                    properties: {
                        ...currentProperties,
                        [field]: {
                            ...currentField,
                            default: newArray
                        }
                    }
                }
            };
        });
    };

    const toggleSection = (section) => {
        setCollapsedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleJsonInputChange = (value) => {
        setJsonInput(value);
        try {
            const parsed = JSON.parse(value);
            setFormData(prev => ({
                ...prev,
                input_schema: parsed
            }));
        } catch (error) {
            // Invalid JSON, don't update form data
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (inputMode === 'json') {
            try {
                const parsed = JSON.parse(jsonInput);
                // Format data theo yêu cầu của backend API
                const campaignData = {
                    name: formData.name,
                    description: formData.description,
                    status: formData.status,
                    input: parsed.properties,
                    config: formData.config || {}
                };

                // Always include actorId if available (backend might require it) 
                // Use actorIdOriginal (the real _id) instead of actorId (the display name)
                const currentActorId = campaign?.actorIdOriginal ||
                    (typeof campaign?.actorId === 'object' ? campaign.actorId?._id || campaign.actorId?.id : campaign?.actorId);

                if (formData.actorId && formData.actorId.trim() !== '') {
                    // Use the edited actorId
                    campaignData.actorId = formData.actorId;
                } else if (currentActorId) {
                    // Use the original actorId if no edit
                    campaignData.actorId = currentActorId;
                }

                console.log('Submitting campaign data (JSON mode):', campaignData);
                onSubmit(campaignData);
            } catch (error) {
                alert('Invalid JSON format');
                return;
            }
        } else {
            // Chuyển đổi form data thành format API
            const inputData = {};
            Object.keys(formData.input_schema.properties).forEach(key => {
                const property = formData.input_schema.properties[key];
                // Lấy giá trị default hoặc giá trị rỗng nếu không có default
                inputData[key] = property.default !== undefined ? property.default :
                    (property.type === 'string' ? '' :
                        property.type === 'array' ? [] :
                            property.type === 'boolean' ? false :
                                property.type === 'integer' ? 0 : null);
            });

            // Format data theo yêu cầu của backend API
            const campaignData = {
                name: formData.name,
                description: formData.description,
                status: formData.status,
                input: inputData,
                config: formData.config || {}
            };

            // Always include actorId if available (backend might require it) 
            // Use actorIdOriginal (the real _id) instead of actorId (the display name)
            let currentActorId = campaign?.actorIdOriginal ||
                (typeof campaign?.actorId === 'object' ? campaign.actorId?._id || campaign.actorId?.id : campaign?.actorId);

            // TEMPORARY FIX: If actorId is still a name, use the known ObjectId for this campaign
            if (typeof currentActorId === 'string' && currentActorId.includes("Actor Craw by Class")) {
                currentActorId = "689464ac10595b979c15002a";
                console.log('🔧 Applied temporary fix for actorId from:', currentActorId, 'to: 689464ac10595b979c15002a');
            }

            console.log('ActorId debug:', {
                'campaign.actorId': campaign?.actorId,
                'campaign.actorIdOriginal': campaign?.actorIdOriginal,
                'currentActorId': currentActorId,
                'formData.actorId': formData.actorId,
                'typeof campaign?.actorId': typeof campaign?.actorId,
                'campaign?.actorId object': typeof campaign?.actorId === 'object' ? campaign.actorId : 'not object',
                'ALL campaign keys': Object.keys(campaign || {})
            });

            if (formData.actorId && formData.actorId.trim() !== '') {
                // Use the edited actorId
                let editedActorId = formData.actorId;
                // Apply temporary fix if needed
                if (typeof editedActorId === 'string' && editedActorId.includes("Actor Craw by Class")) {
                    editedActorId = "689464ac10595b979c15002a";
                    console.log('🔧 Applied temporary fix for formData.actorId');
                }
                campaignData.actorId = editedActorId;
            } else if (currentActorId) {
                // Use the original actorId if no edit
                campaignData.actorId = currentActorId;
            }

            console.log('=== FORM SUBMISSION DEBUG ===');
            console.log('Final campaignData.actorId:', campaignData.actorId);
            console.log('Final campaignData:', campaignData);
            console.log('=== END DEBUG ===');
            onSubmit(campaignData);
        }

        // Don't close modal immediately - let parent component handle closing after API success
        // onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {campaign ? 'Chỉnh sửa Chiến dịch' : 'Tạo Chiến dịch mới'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-1 min-h-0">
                    {/* Tabs */}
                    <div className="w-48 bg-gray-50 border-r flex-shrink-0">
                        <div className="p-4">
                            <button
                                onClick={() => setActiveTab('basic')}
                                className={`w-full text-left px-3 py-2 rounded-md mb-2 transition-colors ${activeTab === 'basic'
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                Thông tin cơ bản
                            </button>
                            <button
                                onClick={() => setActiveTab('schema')}
                                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${activeTab === 'schema'
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                Input Schema
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        {activeTab === 'basic' && (
                            <div className="p-6">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tên chiến dịch *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="Nhập tên chiến dịch"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Mô tả
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="Mô tả chiến dịch"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Actor ID
                                        </label>
                                        <input
                                            type="text"
                                            value={getActorIdString(formData.actorId)}
                                            onChange={(e) => handleInputChange('actorId', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="Nhập Actor ID hoặc để trống để giữ nguyên"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Để trống để giữ nguyên actor hiện tại</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Trạng thái
                                        </label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => handleInputChange('status', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value={CAMPAIGN_STATUS.DRAFT}>Bản nháp</option>
                                            <option value={CAMPAIGN_STATUS.ACTIVE}>Đang chạy</option>
                                            <option value={CAMPAIGN_STATUS.PAUSED}>Tạm dừng</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'schema' && (
                            <div className="p-6">
                                <div className="mb-6">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">Input Schema Configuration</h3>
                                        <div className="flex items-center space-x-2">
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
                                                                placeholder={getSchemaValue('paginationPattern', '') ? '' : "?page="}
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
                                                                    placeholder=".product-description"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Images Section */}
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <button
                                                    onClick={() => toggleSection('images')}
                                                    className="flex items-center justify-between w-full mb-4"
                                                >
                                                    <h4 className="text-md font-medium text-gray-900">Images</h4>
                                                    {collapsedSections.images ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                                                </button>

                                                {!collapsedSections.images && (
                                                    <div className="space-y-4">
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
                                                                    placeholder=".swiper-slide img"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Patterns Section */}
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <button
                                                    onClick={() => toggleSection('patterns')}
                                                    className="flex items-center justify-between w-full mb-4"
                                                >
                                                    <h4 className="text-md font-medium text-gray-900">Patterns</h4>
                                                    {collapsedSections.patterns ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                                                </button>

                                                {!collapsedSections.patterns && (
                                                    <div className="space-y-4">
                                                        {/* Product Link Patterns */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Product Link Include Patterns
                                                            </label>
                                                            <div className="space-y-2">
                                                                {(getSchemaValue('productLinkIncludePatterns', [])).map((pattern, index) => (
                                                                    <div key={index} className="flex items-center space-x-2">
                                                                        <input
                                                                            type="text"
                                                                            value={pattern}
                                                                            onChange={(e) => handleArrayItemChange('productLinkIncludePatterns', index, e.target.value)}
                                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                                            placeholder="gach-"
                                                                        />
                                                                        <button
                                                                            onClick={() => removeArrayItem('productLinkIncludePatterns', index)}
                                                                            className="p-2 text-red-500 hover:text-red-700"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                                <button
                                                                    onClick={() => addArrayItem('productLinkIncludePatterns')}
                                                                    className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700"
                                                                >
                                                                    <Plus size={16} />
                                                                    <span>Add pattern</span>
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Product Link Exclude Patterns
                                                            </label>
                                                            <div className="space-y-2">
                                                                {(getSchemaValue('productLinkExcludePatterns', [])).map((pattern, index) => (
                                                                    <div key={index} className="flex items-center space-x-2">
                                                                        <input
                                                                            type="text"
                                                                            value={pattern}
                                                                            onChange={(e) => handleArrayItemChange('productLinkExcludePatterns', index, e.target.value)}
                                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                                            placeholder="gioi-thieu"
                                                                        />
                                                                        <button
                                                                            onClick={() => removeArrayItem('productLinkExcludePatterns', index)}
                                                                            className="p-2 text-red-500 hover:text-red-700"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                                <button
                                                                    onClick={() => addArrayItem('productLinkExcludePatterns')}
                                                                    className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700"
                                                                >
                                                                    <Plus size={16} />
                                                                    <span>Add pattern</span>
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Image Patterns */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Include Patterns (Images)
                                                            </label>
                                                            <div className="space-y-2">
                                                                {(getSchemaValue('includePatterns', [])).map((pattern, index) => (
                                                                    <div key={index} className="flex items-center space-x-2">
                                                                        <input
                                                                            type="text"
                                                                            value={pattern}
                                                                            onChange={(e) => handleArrayItemChange('includePatterns', index, e.target.value)}
                                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                                            placeholder="Leave empty for all"
                                                                        />
                                                                        <button
                                                                            onClick={() => removeArrayItem('includePatterns', index)}
                                                                            className="p-2 text-red-500 hover:text-red-700"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                                <button
                                                                    onClick={() => addArrayItem('includePatterns')}
                                                                    className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700"
                                                                >
                                                                    <Plus size={16} />
                                                                    <span>Add pattern</span>
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Exclude Patterns (Images)
                                                            </label>
                                                            <div className="space-y-2">
                                                                {(getSchemaValue('excludePatterns', [])).map((pattern, index) => (
                                                                    <div key={index} className="flex items-center space-x-2">
                                                                        <input
                                                                            type="text"
                                                                            value={pattern}
                                                                            onChange={(e) => handleArrayItemChange('excludePatterns', index, e.target.value)}
                                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                                            placeholder="thumb"
                                                                        />
                                                                        <button
                                                                            onClick={() => removeArrayItem('excludePatterns', index)}
                                                                            className="p-2 text-red-500 hover:text-red-700"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                                <button
                                                                    onClick={() => addArrayItem('excludePatterns')}
                                                                    className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700"
                                                                >
                                                                    <Plus size={16} />
                                                                    <span>Add pattern</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Settings Section */}
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <button
                                                    onClick={() => toggleSection('settings')}
                                                    className="flex items-center justify-between w-full mb-4"
                                                >
                                                    <h4 className="text-md font-medium text-gray-900">Settings</h4>
                                                    {collapsedSections.settings ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                                                </button>

                                                {!collapsedSections.settings && (
                                                    <div className="space-y-4">
                                                        {/* Boolean Settings */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    id="skuInImage"
                                                                    checked={getSchemaValue('skuInImage', false)}
                                                                    onChange={(e) => handleSchemaChange('skuInImage', e.target.checked)}
                                                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                                                />
                                                                <label htmlFor="skuInImage" className="text-sm font-medium text-gray-700">
                                                                    SKU in Image
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    id="autoGenerateSku"
                                                                    checked={getSchemaValue('autoGenerateSku', true)}
                                                                    onChange={(e) => handleSchemaChange('autoGenerateSku', e.target.checked)}
                                                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                                                />
                                                                <label htmlFor="autoGenerateSku" className="text-sm font-medium text-gray-700">
                                                                    Auto Generate SKU
                                                                </label>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    id="isPrice"
                                                                    checked={getSchemaValue('isPrice', true)}
                                                                    onChange={(e) => handleSchemaChange('isPrice', e.target.checked)}
                                                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                                                />
                                                                <label htmlFor="isPrice" className="text-sm font-medium text-gray-700">
                                                                    Price Required
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    id="isThumbnail"
                                                                    checked={getSchemaValue('isThumbnail', false)}
                                                                    onChange={(e) => handleSchemaChange('isThumbnail', e.target.checked)}
                                                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                                                />
                                                                <label htmlFor="isThumbnail" className="text-sm font-medium text-gray-700">
                                                                    Thumbnail Required
                                                                </label>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center space-x-3">
                                                            <input
                                                                type="checkbox"
                                                                id="isBrowser"
                                                                checked={getSchemaValue('isBrowser', false)}
                                                                onChange={(e) => handleSchemaChange('isBrowser', e.target.checked)}
                                                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                                            />
                                                            <label htmlFor="isBrowser" className="text-sm font-medium text-gray-700">
                                                                Use Browser API
                                                            </label>
                                                        </div>

                                                        {/* Supplier Information */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Supplier
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={getSchemaValue('supplier', '')}
                                                                    onChange={(e) => handleSchemaChange('supplier', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                                    placeholder="DAISAN"
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
                                                        </div>

                                                        {/* Limits */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Max Requests per Crawl
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={getSchemaValue('maxRequestsPerCrawl', 50000)}
                                                                    onChange={(e) => handleSchemaChange('maxRequestsPerCrawl', parseInt(e.target.value))}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-end space-x-3 p-6 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                    >
                        {campaign ? 'Cập nhật' : 'Tạo'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CampaignModal;
