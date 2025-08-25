import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { actorsAPI, templatesAPI } from '../../services/api';
import { CAMPAIGN_STATUS } from '../../utils/constants';
import toast from 'react-hot-toast';

const useCampaignForm = (campaign, isOpen) => {
    const { token } = useAuthStore();
    const [actors, setActors] = useState([]);
    const [loadingActors, setLoadingActors] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const isEditMode = Boolean(campaign);

    // Create default schema with all fields
    const createDefaultSchema = () => ({
        title: 'Multi-Website Product Crawler',
        type: 'object',
        schemaVersion: 1,
        properties: {
            url: { default: '' },
            websiteName: { default: '' },
            paginationPattern: { default: '?page=' },
            pageStart: { default: 1 },
            pageEnd: { default: 5 },
            productLinkSelector: { default: '.list-item-img a' },
            titleClass: { default: '.product-detail_title h1' },
            priceClass: { default: '.price' },
            skuClass: { default: '' },
            descriptionClass: { default: '.product-attribute' },
            contentClass: { default: '.description-info' },
            thumbnailClass: { default: '.image-slider-item img' },
            imagesClass: { default: '.thumb-slider .swiper-container .swiper-wrapper .swiper-slide' },
            productLinkIncludePatterns: { default: [] },
            productLinkExcludePatterns: { default: [] },
            includePatterns: { default: [] },
            excludePatterns: { default: [] },
            category: { default: '' },
            supplier: { default: '' },
            url_supplier: { default: '' },
            maxProductLinks: { default: 50 },
            maxRequestsPerCrawl: { default: 50000 },
            isPrice: { default: true },
            isThumbnail: { default: true },
            autoGenerateSku: { default: true },
            skuInImage: { default: false },
            isBrowser: { default: false }
        }
    });

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: CAMPAIGN_STATUS.DRAFT,
        actorId: '',
        selectedTemplate: '',
        input_schema: createDefaultSchema()
    });

    const [inputMode, setInputMode] = useState('manual');
    const [jsonInput, setJsonInput] = useState('');
    const [collapsedSections, setCollapsedSections] = useState({
        pagination: false,
        selectors: false,
        productPatterns: false,
        imagePatterns: false,
        settings: false
    });

    // Fetch actors from API (only for create mode)
    const fetchActors = async () => {
        if (isEditMode) return;

        try {
            setLoadingActors(true);
            const response = await actorsAPI.getAll();
            if (response.data?.data && Array.isArray(response.data.data)) {
                setActors(response.data.data);
            } else if (response.data && Array.isArray(response.data)) {
                setActors(response.data);
            } else {
                setActors([
                    { _id: '689464ac10595b979c15002a', name: 'Actor Craw by Class (Latest)' },
                    { _id: '689464ac10595b979c15002b', name: 'Multi-Website Product Crawler' },
                    { _id: '689464ac10595b979c15002c', name: 'News Article Crawler' },
                    { _id: '689464ac10595b979c15002d', name: 'E-commerce Product Crawler' },
                    { _id: '689464ac10595b979c15002e', name: 'Social Media Crawler' },
                    { _id: '689464ac10595b979c15002f', name: 'Real Estate Crawler' }
                ]);
            }
        } catch (error) {
            console.error('Error fetching actors:', error);
            setActors([
                { _id: '689464ac10595b979c15002a', name: 'Actor Craw by Class (Latest)' },
                { _id: '689464ac10595b979c15002b', name: 'Multi-Website Product Crawler' },
                { _id: '689464ac10595b979c15002c', name: 'News Article Crawler' },
                { _id: '689464ac10595b979c15002d', name: 'E-commerce Product Crawler' },
                { _id: '689464ac10595b979c15002e', name: 'Social Media Crawler' },
                { _id: '689464ac10595b979c15002f', name: 'Real Estate Crawler' }
            ]);
        } finally {
            setLoadingActors(false);
        }
    };

    // Fetch templates from API (only for create mode)
    const fetchTemplates = async () => {
        if (isEditMode) return;

        try {
            setLoadingTemplates(true);
            const response = await templatesAPI.getAll();
            if (response.data?.data && Array.isArray(response.data.data)) {
                setTemplates(response.data.data);
            } else if (response.data && Array.isArray(response.data)) {
                setTemplates(response.data);
            } else {
                console.log('No templates found or unexpected API format');
                setTemplates([]);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
            setTemplates([]);
        } finally {
            setLoadingTemplates(false);
        }
    };

    // Helper functions
    const getSchemaValue = (field, defaultValue = '') => {
        return formData.input_schema?.properties?.[field]?.default ?? defaultValue;
    };

    const getActorIdString = (actorId) => {
        if (!actorId) return '';
        if (typeof actorId === 'string') return actorId;
        if (typeof actorId === 'object') {
            return actorId.name || actorId.id || actorId.toString() || '';
        }
        return String(actorId);
    };

    // Form handlers
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle template selection
    const handleTemplateChange = (templateId) => {
        if (!templateId) {
            // Reset to default schema if no template selected
            setFormData(prev => ({
                ...prev,
                selectedTemplate: '',
                actorId: '', // Reset actorId when template is cleared
                input_schema: createDefaultSchema()
            }));
            return;
        }

        const selectedTemplate = templates.find(t => t._id === templateId);
        if (selectedTemplate && selectedTemplate.input) {
            // Convert template.input to input_schema format
            const templateSchema = {
                title: selectedTemplate.name || 'Template Schema',
                type: 'object',
                schemaVersion: 1,
                properties: {}
            };

            // Map template.input to input_schema.properties format
            Object.entries(selectedTemplate.input).forEach(([key, value]) => {
                templateSchema.properties[key] = {
                    title: key.charAt(0).toUpperCase() + key.slice(1),
                    type: typeof value === 'number' ? 'integer' : typeof value === 'boolean' ? 'boolean' : Array.isArray(value) ? 'array' : 'string',
                    default: value
                };
            });

            // Set actorId from template if available
            const templateActorId = selectedTemplate.actorId?.id || selectedTemplate.actorId?._id || '';

            setFormData(prev => ({
                ...prev,
                selectedTemplate: templateId,
                actorId: templateActorId, // Auto-set actorId from template
                input_schema: templateSchema
            }));
        }
    };

    const handleSchemaChange = (field, value) => {
        setFormData(prev => {
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

    const handleJsonInputChange = (value) => {
        setJsonInput(value);
        try {
            const parsed = JSON.parse(value);
            // Convert simple JSON object back to schema format
            const schemaProperties = {};
            Object.entries(parsed).forEach(([key, value]) => {
                schemaProperties[key] = {
                    title: key.charAt(0).toUpperCase() + key.slice(1),
                    type: typeof value === 'number' ? 'integer' : typeof value === 'boolean' ? 'boolean' : Array.isArray(value) ? 'array' : 'string',
                    default: value
                };
            });

            const newSchema = {
                title: 'Multi-Website Product Crawler',
                type: 'object',
                schemaVersion: 1,
                properties: schemaProperties
            };

            setFormData(prev => ({
                ...prev,
                input_schema: newSchema
            }));
        } catch (error) {
            // Invalid JSON, don't update formData
        }
    };

    // Chuyển đổi từ manual mode sang JSON mode - hiển thị dữ liệu input thực tế
    const convertManualToJson = () => {
        const inputData = {};
        if (formData.input_schema?.properties) {
            Object.entries(formData.input_schema.properties).forEach(([key, field]) => {
                const value = field.default;
                if (value !== undefined && value !== null) {
                    if (field.type === 'array' && Array.isArray(value)) {
                        if (value.length > 0) {
                            inputData[key] = value;
                        }
                    } else if (field.type === 'boolean') {
                        inputData[key] = value;
                    } else if (field.type === 'integer') {
                        if (typeof value === 'number' || (typeof value === 'string' && value !== '')) {
                            inputData[key] = typeof value === 'string' ? parseInt(value) : value;
                        }
                    } else {
                        if (value !== '') {
                            inputData[key] = value;
                        }
                    }
                }
            });
        }
        const jsonString = JSON.stringify(inputData, null, 2);
        setJsonInput(jsonString);
    };

    // Xử lý khi chuyển đổi input mode
    const handleInputModeChange = (mode) => {
        if (mode === 'json' && inputMode === 'manual') {
            // Khi chuyển từ manual sang JSON, tự động chuyển đổi dữ liệu
            convertManualToJson();
            // Hiển thị thông báo
            toast.success('Đã chuyển đổi dữ liệu từ Manual sang Input Data JSON');
        }
        setInputMode(mode);
    };

    const handleArrayChange = (field, index, value) => {
        setFormData(prev => {
            const currentArray = getSchemaValue(field, []);
            const newArray = [...currentArray];
            newArray[index] = value;

            return {
                ...prev,
                input_schema: {
                    ...prev.input_schema,
                    properties: {
                        ...prev.input_schema.properties,
                        [field]: {
                            ...prev.input_schema.properties[field],
                            default: newArray
                        }
                    }
                }
            };
        });
    };

    const addArrayItem = (field, value = '') => {
        setFormData(prev => {
            const currentArray = getSchemaValue(field, []);
            const newArray = [...currentArray, value];

            return {
                ...prev,
                input_schema: {
                    ...prev.input_schema,
                    properties: {
                        ...prev.input_schema.properties,
                        [field]: {
                            ...prev.input_schema.properties[field],
                            default: newArray
                        }
                    }
                }
            };
        });
    };

    const removeArrayItem = (field, index) => {
        setFormData(prev => {
            const currentArray = getSchemaValue(field, []);
            const newArray = currentArray.filter((_, i) => i !== index);

            return {
                ...prev,
                input_schema: {
                    ...prev.input_schema,
                    properties: {
                        ...prev.input_schema.properties,
                        [field]: {
                            ...prev.input_schema.properties[field],
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

    // Effects
    useEffect(() => {
        if (isOpen && !isEditMode) {
            fetchActors();
            fetchTemplates();
        }
    }, [isOpen, isEditMode, token]);

    useEffect(() => {
        if (isOpen && !campaign) {
            setFormData(prev => ({
                ...prev,
                actorId: '',
                selectedTemplate: ''
            }));
        }
    }, [isOpen, campaign]);

    useEffect(() => {
        if (campaign) {


            // Convert campaign.input to input_schema format if needed
            let inputSchema = campaign.input_schema;
            if (!inputSchema && campaign.input) {
                inputSchema = {
                    title: 'Multi-Website Product Crawler',
                    type: 'object',
                    schemaVersion: 1,
                    properties: {}
                };

                // Map campaign.input to input_schema.properties format
                Object.entries(campaign.input).forEach(([key, value]) => {
                    inputSchema.properties[key] = {
                        title: key.charAt(0).toUpperCase() + key.slice(1),
                        type: typeof value === 'number' ? 'integer' : typeof value === 'boolean' ? 'boolean' : Array.isArray(value) ? 'array' : 'string',
                        default: value
                    };
                });
            }

            const normalizedCampaign = {
                name: campaign.name || '',
                description: campaign.description || '',
                status: campaign.status || CAMPAIGN_STATUS.DRAFT,
                actorId: campaign.actorId || '',
                input_schema: inputSchema || {
                    title: 'Multi-Website Product Crawler',
                    type: 'object',
                    schemaVersion: 1,
                    properties: {}
                }
            };


            setFormData(normalizedCampaign);
            setJsonInput(JSON.stringify(normalizedCampaign.input_schema, null, 2));
        } else {
            // Reset form for create mode
            setFormData({
                name: '',
                description: '',
                status: CAMPAIGN_STATUS.DRAFT,
                actorId: '',
                selectedTemplate: '',
                input_schema: createDefaultSchema()
            });
            setJsonInput('');
        }
    }, [campaign]);

    return {
        // State
        formData,
        inputMode,
        setInputMode,
        jsonInput,
        collapsedSections,
        actors,
        loadingActors,
        templates,
        loadingTemplates,
        isEditMode,

        // Handlers
        handleInputChange,
        handleTemplateChange,
        handleSchemaChange,
        handleJsonInputChange,
        handleInputModeChange,
        handleArrayChange,
        addArrayItem,
        removeArrayItem,
        toggleSection,

        // Helpers
        getSchemaValue,
        getActorIdString
    };
};

export { useCampaignForm };
export default useCampaignForm;
