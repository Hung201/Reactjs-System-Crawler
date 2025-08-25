import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Save, Globe, Database, Target, Code, ChevronRight, ChevronLeft } from 'lucide-react';
import { templatesAPI } from '../../services/api';
import toast from 'react-hot-toast';

const TemplateModal = ({ isOpen, onClose, template = null, onSuccess }) => {
    // Step management
    const [currentStep, setCurrentStep] = useState(1);
    // Actors and schema
    const [actors, setActors] = useState([]);
    const [selectedActor, setSelectedActor] = useState(null);
    const [actorSchema, setActorSchema] = useState(null);
    const [isLoadingActors, setIsLoadingActors] = useState(false);
    const [isLoadingSchema, setIsLoadingSchema] = useState(false);
    const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);

    // Form data - use useMemo to prevent unnecessary re-initialization
    const initialFormData = useMemo(() => ({
        name: '',
        description: '',
        website: '',
        urlPattern: '',
        category: 'ecommerce',
        isPublic: true,
        tags: [],
        actorId: '',
        actorType: 'web-scraper',
        input: {
            url: '',
            paginationPattern: 'page',
            pageStart: 1,
            pageEnd: 2,
            productLinkSelector: '',
            titleClass: '',
            priceClass: '',
            descriptionClass: '',
            contentClass: '',
            thumbnailClass: '',
            imagesClass: '',
            websiteName: '',
            category: '',
            supplier: '',
            url_supplier: '',
            maxRequestsPerCrawl: 50000,
            maxProductLinks: 50,
            isBrowser: false
        }
    }), []);

    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.margin = '0';
            document.body.style.padding = '0';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.margin = '';
            document.body.style.padding = '';
            document.documentElement.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.margin = '';
            document.body.style.padding = '';
            document.documentElement.style.overflow = '';
        };
    }, [isOpen]);

    // Fetch actors
    const fetchActors = useCallback(async () => {
        if (actors.length > 0) return; // Don't fetch if already loaded
        setIsLoadingActors(true);
        try {
            const response = await templatesAPI.getActors();
            if (response.success) {
                setActors(response.data);
            }
        } catch (error) {
            console.error('Error fetching actors:', error);
            toast.error('Không thể tải danh sách actors');
        } finally {
            setIsLoadingActors(false);
        }
    }, [actors.length]);

    // Fetch actor schema
    const fetchActorSchema = useCallback(async (actorId) => {
        setIsLoadingSchema(true);
        try {
            const response = await templatesAPI.getActorSchema(actorId);
            if (response.success) {
                setActorSchema(response.data);
                // Initialize input data with default values
                const defaultData = {};
                response.data.schema.fields.forEach(field => {
                    if (field.default !== undefined) {
                        defaultData[field.name] = field.default;
                    }
                });

                // Special configuration for specific actor ID
                if (actorId === '689464ac10595b979c15002a') {
                    const daisanConfig = {
                        url: "https://daisanstore.com/collections/g%E1%BA%A1ch-th%E1%BA%BB",
                        paginationPattern: "?page=",
                        pageStart: 1,
                        pageEnd: 2,
                        productLinkSelector: ".product-card a, #ProductsList a",
                        productLinkIncludePatterns: [
                            "/products/"
                        ],
                        productLinkExcludePatterns: [
                            "gioi-thieu",
                            "tin-tuc",
                            "du-an",
                            "lien-he",
                            "about",
                            "news",
                            "contact",
                            "p="
                        ],
                        titleClass: "h1, .product-title, .product-detail_title h1",
                        descriptionClass: ".product-attribute",
                        priceClass: ".price, .product-price, [class*='price']",
                        skuClass: "",
                        contentClass: ".description-info",
                        thumbnailClass: "img, .product-card_image img, .image-slider-item img",
                        imagesClass: "img, .product-gallery img, .thumb-slider .swiper-container .swiper-wrapper .swiper-slide",
                        includePatterns: [],
                        excludePatterns: [
                            "thumb",
                            "small",
                            "icon",
                            "logo"
                        ],
                        skuInImage: false,
                        autoGenerateSku: true,
                        websiteName: "DAISANSTORE",
                        isPrice: true,
                        isThumbnail: true,
                        category: "Gạch ốp tường",
                        supplier: "DAISANSTORE",
                        url_supplier: "https://daisanstore.com",
                        maxRequestsPerCrawl: 50000,
                        maxProductLinks: 50,
                        isBrowser: false
                    };

                    // Merge with default values, prioritizing daisan config
                    Object.keys(daisanConfig).forEach(key => {
                        if (response.data.schema.fields.some(field => field.name === key)) {
                            defaultData[key] = daisanConfig[key];
                        }
                    });
                }

                setFormData(prev => ({
                    ...prev,
                    input: { ...prev.input, ...defaultData }
                }));
            } else {
                console.error('Actor schema response not successful:', response);
            }
        } catch (error) {
            console.error('Error fetching actor schema:', error);
            toast.error('Không thể tải schema của actor');
        } finally {
            setIsLoadingSchema(false);
        }
    }, []);

    // Initialize actors when modal opens for new template
    useEffect(() => {
        if (isOpen && !template) {
            fetchActors();
        }
    }, [isOpen, template, fetchActors]);

    // Load actor schema when actor is selected
    useEffect(() => {
        if (selectedActor && isOpen) {
            fetchActorSchema(selectedActor._id);
            setFormData(prev => ({
                ...prev,
                actorId: selectedActor._id,
                actorType: selectedActor.type || 'web-scraper'
            }));
        }
    }, [selectedActor, isOpen, fetchActorSchema]);

    // Load template data for editing - fetch from API
    useEffect(() => {
        if (template) {

            // Check if we have template ID (could be id or _id)
            const templateId = template.id || template._id;

            if (templateId) {
                const fetchTemplateData = async () => {
                    setIsLoadingTemplate(true);
                    try {
                        const response = await templatesAPI.getById(templateId);

                        if (response.success) {
                            const templateData = response.data;

                            const actorId = templateData.actorId?.id || templateData.actorId || '';

                            // Set selected actor for UI display
                            if (templateData.actorId) {
                                const selectedActorData = {
                                    _id: actorId,
                                    name: templateData.actorId.name || 'Unknown Actor',
                                    type: templateData.actorType || 'web-scraper',
                                    category: templateData.category || 'ecommerce'
                                };
                                setSelectedActor(selectedActorData);
                            }

                            const formDataToSet = {
                                name: templateData.name || '',
                                description: templateData.description || '',
                                website: templateData.website || templateData.input?.url || '',
                                urlPattern: templateData.urlPattern || `*.${templateData.website || 'example.com'}/*`,
                                category: templateData.category || 'ecommerce',
                                isPublic: templateData.isPublic !== undefined ? templateData.isPublic : true,
                                tags: templateData.tags || [],
                                actorId: actorId,
                                actorType: templateData.actorType || 'web-scraper',
                                input: {
                                    url: templateData.input?.url || templateData.website || '',
                                    paginationPattern: templateData.input?.paginationPattern || '?page=',
                                    pageStart: templateData.input?.pageStart || 1,
                                    pageEnd: templateData.input?.pageEnd || 2,
                                    productLinkSelector: templateData.input?.productLinkSelector || '',
                                    titleClass: templateData.input?.titleClass || '',
                                    priceClass: templateData.input?.priceClass || '',
                                    descriptionClass: templateData.input?.descriptionClass || '',
                                    contentClass: templateData.input?.contentClass || '.description-info',
                                    thumbnailClass: templateData.input?.thumbnailClass || '',
                                    imagesClass: templateData.input?.imagesClass || '',
                                    websiteName: templateData.input?.websiteName || '',
                                    category: templateData.input?.category || '',
                                    supplier: templateData.input?.supplier || '',
                                    url_supplier: templateData.input?.url_supplier || '',
                                    maxRequestsPerCrawl: templateData.input?.maxRequestsPerCrawl || 50000,
                                    maxProductLinks: templateData.input?.maxProductLinks || 50,
                                    isBrowser: templateData.input?.isBrowser || false,
                                    skuInImage: templateData.input?.skuInImage || false,
                                    autoGenerateSku: templateData.input?.autoGenerateSku !== undefined ? templateData.input.autoGenerateSku : true,
                                    isPrice: templateData.input?.isPrice !== undefined ? templateData.input.isPrice : true,
                                    isThumbnail: templateData.input?.isThumbnail !== undefined ? templateData.input.isThumbnail : true,
                                    skuClass: templateData.input?.skuClass || '',
                                    includePatterns: templateData.input?.includePatterns || [],
                                    excludePatterns: templateData.input?.excludePatterns || [],
                                    productLinkIncludePatterns: templateData.input?.productLinkIncludePatterns || [],
                                    productLinkExcludePatterns: templateData.input?.productLinkExcludePatterns || [],
                                    ...templateData.input
                                }
                            };
                            setFormData(formDataToSet);
                            setCurrentStep(2); // Start at step 2 for editing

                            // Load actor schema for editing
                            if (actorId) {
                                fetchActorSchema(actorId);
                            } else {
                            }
                        } else {
                            console.error('Failed to fetch template:', response);
                            // Fallback: use template data directly if API fails
                            const templateData = template;
                            const actorId = templateData.actorId?.id || templateData.actorId || '';

                            // Set selected actor for UI display
                            if (templateData.actorId) {
                                const selectedActorData = {
                                    _id: actorId,
                                    name: templateData.actorId.name || 'Unknown Actor',
                                    type: templateData.actorType || 'web-scraper',
                                    category: templateData.category || 'ecommerce'
                                };
                                setSelectedActor(selectedActorData);
                            }

                            const formDataToSet = {
                                name: templateData.name || '',
                                description: templateData.description || '',
                                website: templateData.website || templateData.input?.url || '',
                                urlPattern: templateData.urlPattern || `*.${templateData.website || 'example.com'}/*`,
                                category: templateData.category || 'ecommerce',
                                isPublic: templateData.isPublic !== undefined ? templateData.isPublic : true,
                                tags: templateData.tags || [],
                                actorId: actorId,
                                actorType: templateData.actorType || 'web-scraper',
                                input: {
                                    url: templateData.input?.url || templateData.website || '',
                                    paginationPattern: templateData.input?.paginationPattern || '?page=',
                                    pageStart: templateData.input?.pageStart || 1,
                                    pageEnd: templateData.input?.pageEnd || 2,
                                    productLinkSelector: templateData.input?.productLinkSelector || '',
                                    titleClass: templateData.input?.titleClass || '',
                                    priceClass: templateData.input?.priceClass || '',
                                    descriptionClass: templateData.input?.descriptionClass || '',
                                    contentClass: templateData.input?.contentClass || '.description-info',
                                    thumbnailClass: templateData.input?.thumbnailClass || '',
                                    imagesClass: templateData.input?.imagesClass || '',
                                    websiteName: templateData.input?.websiteName || '',
                                    category: templateData.input?.category || '',
                                    supplier: templateData.input?.supplier || '',
                                    url_supplier: templateData.input?.url_supplier || '',
                                    maxRequestsPerCrawl: templateData.input?.maxRequestsPerCrawl || 50000,
                                    maxProductLinks: templateData.input?.maxProductLinks || 50,
                                    isBrowser: templateData.input?.isBrowser || false,
                                    skuInImage: templateData.input?.skuInImage || false,
                                    autoGenerateSku: templateData.input?.autoGenerateSku !== undefined ? templateData.input.autoGenerateSku : true,
                                    isPrice: templateData.input?.isPrice !== undefined ? templateData.input.isPrice : true,
                                    isThumbnail: templateData.input?.isThumbnail !== undefined ? templateData.input.isThumbnail : true,
                                    skuClass: templateData.input?.skuClass || '',
                                    includePatterns: templateData.input?.includePatterns || [],
                                    excludePatterns: templateData.input?.excludePatterns || [],
                                    productLinkIncludePatterns: templateData.input?.productLinkIncludePatterns || [],
                                    productLinkExcludePatterns: templateData.input?.productLinkExcludePatterns || [],
                                    ...templateData.input
                                }
                            };
                            setFormData(formDataToSet);
                            setCurrentStep(2);

                            // Load actor schema for editing
                            if (actorId) {
                                fetchActorSchema(actorId);
                            }
                        }
                    } catch (error) {
                        console.error('Error fetching template:', error);
                        if (error.response?.status === 429) {
                            toast.error('Quá nhiều yêu cầu. Vui lòng thử lại sau.');
                        } else {
                            toast.error('Không thể tải dữ liệu template');
                        }
                    } finally {
                        setIsLoadingTemplate(false);
                    }
                };

                fetchTemplateData();
            } else {
                // If no template ID, use the template data directly
                const templateData = template;
                const actorId = templateData.actorId?.id || templateData.actorId || '';

                // Set selected actor for UI display
                if (templateData.actorId) {
                    const selectedActorData = {
                        _id: actorId,
                        name: templateData.actorId.name || 'Unknown Actor',
                        type: templateData.actorType || 'web-scraper',
                        category: templateData.category || 'ecommerce'
                    };
                    setSelectedActor(selectedActorData);
                }

                const formDataToSet = {
                    name: templateData.name || '',
                    description: templateData.description || '',
                    website: templateData.website || templateData.input?.url || '',
                    urlPattern: templateData.urlPattern || `*.${templateData.website || 'example.com'}/*`,
                    category: templateData.category || 'ecommerce',
                    isPublic: templateData.isPublic !== undefined ? templateData.isPublic : true,
                    tags: templateData.tags || [],
                    actorId: actorId,
                    actorType: templateData.actorType || 'web-scraper',
                    input: {
                        url: templateData.input?.url || templateData.website || '',
                        paginationPattern: templateData.input?.paginationPattern || '?page=',
                        pageStart: templateData.input?.pageStart || 1,
                        pageEnd: templateData.input?.pageEnd || 2,
                        productLinkSelector: templateData.input?.productLinkSelector || '',
                        titleClass: templateData.input?.titleClass || '',
                        priceClass: templateData.input?.priceClass || '',
                        descriptionClass: templateData.input?.descriptionClass || '',
                        contentClass: templateData.input?.contentClass || '.description-info',
                        thumbnailClass: templateData.input?.thumbnailClass || '',
                        imagesClass: templateData.input?.imagesClass || '',
                        websiteName: templateData.input?.websiteName || '',
                        category: templateData.input?.category || '',
                        supplier: templateData.input?.supplier || '',
                        url_supplier: templateData.input?.url_supplier || '',
                        maxRequestsPerCrawl: templateData.input?.maxRequestsPerCrawl || 50000,
                        maxProductLinks: templateData.input?.maxProductLinks || 50,
                        isBrowser: templateData.input?.isBrowser || false,
                        skuInImage: templateData.input?.skuInImage || false,
                        autoGenerateSku: templateData.input?.autoGenerateSku !== undefined ? templateData.input.autoGenerateSku : true,
                        isPrice: templateData.input?.isPrice !== undefined ? templateData.input.isPrice : true,
                        isThumbnail: templateData.input?.isThumbnail !== undefined ? templateData.input.isThumbnail : true,
                        skuClass: templateData.input?.skuClass || '',
                        includePatterns: templateData.input?.includePatterns || [],
                        excludePatterns: templateData.input?.excludePatterns || [],
                        productLinkIncludePatterns: templateData.input?.productLinkIncludePatterns || [],
                        productLinkExcludePatterns: templateData.input?.productLinkExcludePatterns || [],
                        ...templateData.input
                    }
                };
                setFormData(formDataToSet);
                setCurrentStep(2); // Start at step 2 for editing

                // Load actor schema for editing
                if (actorId) {
                    fetchActorSchema(actorId);
                } else {
                }
            }
        }
    }, [template, fetchActorSchema]); // Add fetchActorSchema to dependencies

    // Reset form when modal closes
    const handleClose = useCallback(() => {
        if (!template) {
            setFormData(initialFormData);
            setCurrentStep(1);
            setSelectedActor(null);
            setActorSchema(null);
        }
        onClose();
    }, [template, initialFormData, onClose]);

    // Handle form submissions
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Validate required fields
            if (!formData.name.trim()) {
                toast.error('Tên template là bắt buộc');
                return;
            }
            if (!formData.website.trim()) {
                toast.error('Website là bắt buộc');
                return;
            }
            if (!formData.urlPattern.trim()) {
                toast.error('URL Pattern là bắt buộc');
                return;
            }
            if (!formData.actorId) {
                toast.error('Vui lòng chọn actor');
                return;
            }

            // Validate URL format
            const urlToValidate = formData.input.url || formData.website.trim();
            if (urlToValidate && !urlToValidate.startsWith('http://') && !urlToValidate.startsWith('https://')) {
                toast.error('URL phải bắt đầu bằng http:// hoặc https://');
                return;
            }

            // Prepare data for API
            const submitData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                website: formData.website.trim(),
                urlPattern: formData.urlPattern.trim(),
                category: formData.category,
                actorId: formData.actorId,
                actorType: formData.actorType,
                input: {
                    ...formData.input,
                    // Ensure URL is properly formatted
                    url: formData.input.url || formData.website.trim(),
                    // Clean up pagination pattern
                    paginationPattern: formData.input.paginationPattern || '?page=',
                    // Ensure content class has proper format
                    contentClass: formData.input.contentClass || '.description-info',
                    // Ensure all required fields are present
                    pageStart: formData.input.pageStart || 1,
                    pageEnd: formData.input.pageEnd || 2,
                    productLinkSelector: formData.input.productLinkSelector || '',
                    titleClass: formData.input.titleClass || '',
                    priceClass: formData.input.priceClass || '',
                    descriptionClass: formData.input.descriptionClass || '',
                    thumbnailClass: formData.input.thumbnailClass || '',
                    imagesClass: formData.input.imagesClass || '',
                    websiteName: formData.input.websiteName || '',
                    category: formData.input.category || '',
                    supplier: formData.input.supplier || '',
                    url_supplier: formData.input.url_supplier || '',
                    maxRequestsPerCrawl: formData.input.maxRequestsPerCrawl || 50000,
                    maxProductLinks: formData.input.maxProductLinks || 50,
                    isBrowser: formData.input.isBrowser || false,
                    skuInImage: formData.input.skuInImage || false,
                    autoGenerateSku: formData.input.autoGenerateSku || true,
                    isPrice: formData.input.isPrice || true,
                    isThumbnail: formData.input.isThumbnail || true,
                    skuClass: formData.input.skuClass || '',
                    includePatterns: formData.input.includePatterns || [],
                    excludePatterns: formData.input.excludePatterns || [],
                    productLinkIncludePatterns: formData.input.productLinkIncludePatterns || [],
                    productLinkExcludePatterns: formData.input.productLinkExcludePatterns || []
                },
                isPublic: formData.isPublic,
                tags: formData.tags
            };

            let result;

            if (template) {
                // Editing existing template - check for both id and _id
                const templateId = template.id || template._id;
                if (!templateId) {
                    toast.error('Không tìm thấy ID template để cập nhật');
                    return;
                }
                result = await templatesAPI.update(templateId, submitData);
            } else {
                // Creating new template
                result = await templatesAPI.create(submitData);
            }

            if (result.success) {
                toast.success(template ? 'Template đã được cập nhật!' : 'Template đã được tạo!');
                onSuccess && onSuccess(result.data);
                handleClose();
            } else {
                toast.error(result.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Template submit error:', error);

            // Handle specific error cases
            if (error.response?.status === 400) {
                const errorMessage = error.response?.data?.message || 'Dữ liệu không hợp lệ';
                toast.error(errorMessage);
            } else if (error.response?.status === 401) {
                toast.error('Phiên đăng nhập đã hết hạn');
            } else if (error.response?.status === 403) {
                toast.error('Bạn không có quyền thực hiện hành động này');
            } else if (error.response?.status === 409) {
                toast.error('Template đã tồn tại');
            } else {
                toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo template');
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, template, onSuccess, handleClose]);

    // Handle form changes - use useCallback to prevent recreation
    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const handleInputDataChange = useCallback((fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            input: {
                ...prev.input,
                [fieldName]: value
            }
        }));
    }, []);

    const handleTagsChange = useCallback((value) => {
        const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        setFormData(prev => ({
            ...prev,
            tags: tags
        }));
    }, []);

    // Navigation
    const nextStep = useCallback(() => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    }, [currentStep]);

    const prevStep = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    }, [currentStep]);

    // Validation
    const canProceedToStep2 = useCallback(() => {
        return selectedActor !== null;
    }, [selectedActor]);

    const canProceedToStep3 = useCallback(() => {
        return formData.name.trim() && formData.website.trim() && formData.urlPattern.trim();
    }, [formData.name, formData.website, formData.urlPattern]);

    const getCategoryIcon = useCallback((category) => {
        switch (category) {
            case 'ecommerce':
                return <Database className="w-4 h-4" />;
            case 'blog':
            case 'wordpress':
                return <Globe className="w-4 h-4" />;
            case 'news':
                return <Target className="w-4 h-4" />;
            default:
                return <Code className="w-4 h-4" />;
        }
    }, []);

    // Actor Selector Component
    const ActorSelector = useMemo(() => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Code className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Chọn Actor</h3>
                <p className="text-gray-500">Chọn actor để tạo template từ schema có sẵn</p>
            </div>

            {isLoadingActors ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {actors.map((actor) => (
                        <div
                            key={actor._id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedActor?._id === actor._id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                }`}
                            onClick={() => setSelectedActor(actor)}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <Code className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{actor.name}</h4>
                                    <p className="text-sm text-gray-500">{actor.description}</p>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                            {actor.type}
                                        </span>
                                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                            {actor.category}
                                        </span>
                                    </div>
                                </div>
                                {selectedActor?._id === actor._id && (
                                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    ), [isLoadingActors, actors, selectedActor]);

    // Template Info Component
    const TemplateInfoForm = useMemo(() => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Thông tin Template</h3>
                <p className="text-gray-500">Nhập thông tin cơ bản cho template</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên template *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-colors"
                        placeholder="Nhập tên template"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loại template
                    </label>
                    <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-colors"
                    >
                        <option value="ecommerce">E-commerce</option>
                        <option value="news">Tin tức</option>
                        <option value="blog">Blog</option>
                        <option value="social">Social</option>
                        <option value="other">Khác</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-colors"
                    rows={3}
                    placeholder="Mô tả template"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website *
                    </label>
                    <input
                        type="text"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-colors"
                        placeholder="example.com"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL Pattern *
                    </label>
                    <input
                        type="text"
                        value={formData.urlPattern}
                        onChange={(e) => handleInputChange('urlPattern', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-colors"
                        placeholder="*.example.com/*"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags
                    </label>
                    <input
                        type="text"
                        value={formData.tags.join(', ')}
                        onChange={(e) => handleTagsChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-colors"
                        placeholder="tag1, tag2, tag3"
                    />
                    <p className="text-xs text-gray-500 mt-1">Phân cách tags bằng dấu phẩy</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trạng thái
                    </label>
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.isPublic}
                                onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Template công khai</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    ), [formData, handleInputChange, handleTagsChange]);

    // Selector Configuration Component
    const SelectorConfigForm = useMemo(() => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Cấu hình Selector</h3>
                <p className="text-gray-500">Cấu hình các selector để crawl dữ liệu</p>
            </div>

            {/* Actor Schema Fields */}
            {isLoadingTemplate ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Code className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h4 className="text-lg font-medium text-gray-900">Đang tải template...</h4>
                            <p className="text-sm text-gray-500">Vui lòng chờ trong giây lát</p>
                        </div>
                    </div>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-10 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            ) : isLoadingSchema ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Code className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h4 className="text-lg font-medium text-gray-900">Đang tải schema...</h4>
                            <p className="text-sm text-gray-500">Vui lòng chờ trong giây lát</p>
                        </div>
                    </div>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-10 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            ) : actorSchema ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Code className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h4 className="text-lg font-medium text-gray-900">{selectedActor?.name}</h4>
                            <p className="text-sm text-gray-500">Schema: {actorSchema.schema.fields.length} trường</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {actorSchema.schema.fields.filter(field => field.type !== 'boolean').map((field) => (
                            <div key={field.name} className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>

                                {field.type === 'text' && (
                                    <input
                                        type="text"
                                        value={formData.input[field.name] || ''}
                                        onChange={(e) => handleInputDataChange(field.name, e.target.value)}
                                        placeholder={field.placeholder}
                                        required={field.required}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-colors"
                                    />
                                )}

                                {field.type === 'url' && (
                                    <input
                                        type="url"
                                        value={formData.input[field.name] || ''}
                                        onChange={(e) => handleInputDataChange(field.name, e.target.value)}
                                        placeholder={field.placeholder}
                                        required={field.required}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-colors"
                                    />
                                )}

                                {field.type === 'number' && (
                                    <input
                                        type="number"
                                        value={formData.input[field.name] || ''}
                                        onChange={(e) => handleInputDataChange(field.name, e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                                        placeholder={field.placeholder}
                                        min={field.min}
                                        max={field.max}
                                        required={field.required}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-colors"
                                    />
                                )}

                                {field.type === 'array' && (
                                    <input
                                        type="text"
                                        value={formData.input[field.name]?.join(', ') || ''}
                                        onChange={(e) => handleInputDataChange(field.name, e.target.value.split(',').map(item => item.trim()).filter(item => item.length > 0))}
                                        placeholder={field.placeholder}
                                        required={field.required}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-colors"
                                    />
                                )}

                                {field.description && (
                                    <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Additional Settings Section */}
                    <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                <Target className="w-4 h-4 text-white" />
                            </div>
                            <span>Additional Settings</span>
                        </h4>

                        {/* Advanced Configuration Section */}
                        <div className="mb-6">
                            <h5 className="text-md font-medium text-gray-800 mb-3">Cấu hình nâng cao</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Max Requests Per Crawl
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.input.maxRequestsPerCrawl || 50000}
                                        onChange={(e) => handleInputDataChange('maxRequestsPerCrawl', parseInt(e.target.value) || 50000)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-colors"
                                        placeholder="50000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Max Product Links
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.input.maxProductLinks || 50}
                                        onChange={(e) => handleInputDataChange('maxProductLinks', parseInt(e.target.value) || 50)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-colors"
                                        placeholder="50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Page Start
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.input.pageStart || 1}
                                        onChange={(e) => handleInputDataChange('pageStart', parseInt(e.target.value) || 1)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-colors"
                                        placeholder="1"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Page End
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.input.pageEnd || 2}
                                        onChange={(e) => handleInputDataChange('pageEnd', parseInt(e.target.value) || 2)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-colors"
                                        placeholder="2"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Pattern Configuration */}
                        <div className="mb-6">
                            <h5 className="text-md font-medium text-gray-800 mb-3">Cấu hình Pattern</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Include Patterns
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.input.includePatterns?.join(', ') || ''}
                                        onChange={(e) => handleInputDataChange('includePatterns', e.target.value.split(',').map(item => item.trim()).filter(item => item.length > 0))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-colors"
                                        placeholder="pattern1, pattern2"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Phân cách bằng dấu phẩy</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Exclude Patterns
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.input.excludePatterns?.join(', ') || ''}
                                        onChange={(e) => handleInputDataChange('excludePatterns', e.target.value.split(',').map(item => item.trim()).filter(item => item.length > 0))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-colors"
                                        placeholder="thumb, small, icon, logo"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Phân cách bằng dấu phẩy</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Product Link Include Patterns
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.input.productLinkIncludePatterns?.join(', ') || ''}
                                        onChange={(e) => handleInputDataChange('productLinkIncludePatterns', e.target.value.split(',').map(item => item.trim()).filter(item => item.length > 0))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-colors"
                                        placeholder="/products/"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Phân cách bằng dấu phẩy</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Product Link Exclude Patterns
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.input.productLinkExcludePatterns?.join(', ') || ''}
                                        onChange={(e) => handleInputDataChange('productLinkExcludePatterns', e.target.value.split(',').map(item => item.trim()).filter(item => item.length > 0))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-colors"
                                        placeholder="gioi-thieu, tin-tuc, about, news"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Phân cách bằng dấu phẩy</p>
                                </div>
                            </div>
                        </div>

                        {/* Website Information */}
                        <div className="mb-6">
                            <h5 className="text-md font-medium text-gray-800 mb-3">Thông tin Website</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Website Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.input.websiteName || ''}
                                        onChange={(e) => handleInputDataChange('websiteName', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-colors"
                                        placeholder="DAISANSTORE"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.input.category || ''}
                                        onChange={(e) => handleInputDataChange('category', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-colors"
                                        placeholder="Gạch ốp tường"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Supplier
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.input.supplier || ''}
                                        onChange={(e) => handleInputDataChange('supplier', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-colors"
                                        placeholder="DAISANSTORE"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Supplier URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.input.url_supplier || ''}
                                        onChange={(e) => handleInputDataChange('url_supplier', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-colors"
                                        placeholder="https://daisanstore.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        SKU Class
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.input.skuClass || ''}
                                        onChange={(e) => handleInputDataChange('skuClass', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-colors"
                                        placeholder=".sku-class"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Boolean fields from schema */}
                            {actorSchema.schema.fields.filter(field => field.type === 'boolean').map((field) => (
                                <div key={field.name} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.input[field.name] || false}
                                            onChange={(e) => handleInputDataChange(field.name, e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:outline-none"
                                        />
                                        <span className="ml-3 text-sm font-medium text-gray-700">{field.label}</span>
                                    </label>
                                    {field.description && (
                                        <div className="ml-2">
                                            <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                                                <span className="text-xs text-gray-500">?</span>
                                            </div>
                                            <div className="absolute z-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 mt-1">
                                                {field.description}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Manual boolean fields for DaisanStore */}
                            {(selectedActor?._id === '689464ac10595b979c15002a' || formData.actorId === '689464ac10595b979c15002a') && (
                                <>
                                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.input.skuInImage || false}
                                                onChange={(e) => handleInputDataChange('skuInImage', e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:outline-none"
                                            />
                                            <span className="ml-3 text-sm font-medium text-gray-700">SKU in Image</span>
                                        </label>
                                    </div>

                                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.input.autoGenerateSku || false}
                                                onChange={(e) => handleInputDataChange('autoGenerateSku', e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:outline-none"
                                            />
                                            <span className="ml-3 text-sm font-medium text-gray-700">Auto Generate SKU</span>
                                        </label>
                                    </div>

                                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.input.isPrice || false}
                                                onChange={(e) => handleInputDataChange('isPrice', e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:outline-none"
                                            />
                                            <span className="ml-3 text-sm font-medium text-gray-700">Is Price</span>
                                        </label>
                                    </div>

                                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.input.isThumbnail || false}
                                                onChange={(e) => handleInputDataChange('isThumbnail', e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:outline-none"
                                            />
                                            <span className="ml-3 text-sm font-medium text-gray-700">Is Thumbnail</span>
                                        </label>
                                    </div>
                                </>
                            )}

                            {/* Additional boolean fields from API */}
                            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.input.isBrowser || false}
                                        onChange={(e) => handleInputDataChange('isBrowser', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:outline-none"
                                    />
                                    <span className="ml-3 text-sm font-medium text-gray-700">Is Browser</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Target className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có schema</h3>
                    <p className="text-gray-500">Vui lòng chọn actor để xem cấu hình selector</p>
                </div>
            )}
        </div>
    ), [formData, isLoadingSchema, actorSchema, selectedActor, handleInputDataChange]);

    console.log('TemplateModal render check - isOpen:', isOpen, 'template:', template);
    if (!isOpen) {
        console.log('TemplateModal not rendering - isOpen is false');
        return null;
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                margin: 0,
                padding: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                minWidth: '100vw',
                boxSizing: 'border-box',
                overflow: 'hidden',
                transform: 'translateZ(0)',
                willChange: 'transform',
                backfaceVisibility: 'hidden',
                perspective: '1000px',
                WebkitOverflowScrolling: 'touch',
                WebkitTransform: 'translateZ(0)',
                MozTransform: 'translateZ(0)',
                msTransform: 'translateZ(0)',
                OTransform: 'translateZ(0)',
                WebkitBackfaceVisibility: 'hidden',
                MozBackfaceVisibility: 'hidden',
                msBackfaceVisibility: 'hidden'
            }}
        >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {template ? 'Chỉnh sửa Template' : 'Tạo Template mới'}
                        </h2>

                        {/* Step indicator */}
                        {!template && (
                            <div className="flex items-center space-x-2">
                                {[1, 2, 3].map((step) => (
                                    <div key={step} className="flex items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === step
                                            ? 'bg-blue-500 text-white'
                                            : currentStep > step
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-200 text-gray-500'
                                            }`}>
                                            {currentStep > step ? '✓' : step}
                                        </div>
                                        {step < 3 && (
                                            <div className={`w-8 h-1 mx-2 ${currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                                                }`}></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {currentStep === 1 && ActorSelector}
                    {currentStep === 2 && TemplateInfoForm}
                    {currentStep === 3 && SelectorConfigForm}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200">
                    <div className="flex items-center space-x-3">
                        {currentStep > 1 && (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                            >
                                <ChevronLeft size={16} />
                                <span>Quay lại</span>
                            </button>
                        )}
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Hủy
                        </button>

                        {!template && currentStep < 2 && (
                            <button
                                type="button"
                                onClick={nextStep}
                                disabled={!canProceedToStep2()}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                            >
                                <span>Tiếp theo</span>
                                <ChevronRight size={16} />
                            </button>
                        )}

                        {currentStep === 2 && (
                            <>
                                {!template && (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={!canProceedToStep3()}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                                    >
                                        <span>Tiếp theo</span>
                                        <ChevronRight size={16} />
                                    </button>
                                )}
                                {template && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2"
                                        >
                                            <span>Xem cấu hình</span>
                                            <ChevronRight size={16} />
                                        </button>
                                        <button
                                            type="submit"
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                                        >
                                            <Save size={16} />
                                            <span>{isSubmitting ? 'Đang lưu...' : 'Cập nhật'}</span>
                                        </button>
                                    </>
                                )}
                            </>
                        )}

                        {currentStep === 3 && (
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                            >
                                <Save size={16} />
                                <span>{isSubmitting ? 'Đang lưu...' : (template ? 'Cập nhật' : 'Tạo template')}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateModal;
