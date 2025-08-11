import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { actorsAPI } from '../../services/api';
import { CAMPAIGN_STATUS } from '../../utils/constants';

const useCampaignForm = (campaign, isOpen) => {
    const { token } = useAuthStore();
    const [actors, setActors] = useState([]);
    const [loadingActors, setLoadingActors] = useState(false);
    const isEditMode = Boolean(campaign);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: CAMPAIGN_STATUS.DRAFT,
        actorId: '',
        input_schema: {
            title: 'Multi-Website Product Crawler',
            type: 'object',
            schemaVersion: 1,
            properties: {}
        }
    });

    const [inputMode, setInputMode] = useState('manual');
    const [jsonInput, setJsonInput] = useState('');
    const [collapsedSections, setCollapsedSections] = useState({
        pagination: false,
        selectors: false,
        arrays: false,
        productData: false,
        images: false,
        settings: false
    });

    // Fetch actors from API (only for create mode)
    const fetchActors = async () => {
        if (isEditMode) return;

        try {
            setLoadingActors(true);
            const response = await actorsAPI.getAll();

            console.log('🔍 Actors API response:', response);

            if (response.data?.data && Array.isArray(response.data.data)) {
                setActors(response.data.data);
            } else if (response.data && Array.isArray(response.data)) {
                setActors(response.data);
            } else {
                console.log('Using mock actors data - unexpected API format');
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
            setFormData(prev => ({
                ...prev,
                input_schema: parsed
            }));
        } catch (error) {
            // Invalid JSON, don't update formData
        }
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
        }
    }, [isOpen, isEditMode, token]);

    useEffect(() => {
        if (isOpen && !campaign) {
            setFormData(prev => ({
                ...prev,
                actorId: ''
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
                input_schema: {
                    title: 'Multi-Website Product Crawler',
                    type: 'object',
                    schemaVersion: 1,
                    properties: {}
                }
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
        isEditMode,

        // Handlers
        handleInputChange,
        handleSchemaChange,
        handleJsonInputChange,
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
