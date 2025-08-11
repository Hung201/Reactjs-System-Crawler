import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useCampaignForm } from './useCampaignForm';
import BasicInfoTab from './BasicInfoTab';
import InputSchemaTab from './InputSchemaTab';

const CampaignModal = ({ isOpen, onClose, onSubmit, campaign = null }) => {
    const [activeTab, setActiveTab] = useState('basic');

    const {
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
    } = useCampaignForm(campaign, isOpen);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Convert input_schema.properties to input object for backend
        const input = {};
        if (formData.input_schema?.properties) {
            Object.entries(formData.input_schema.properties).forEach(([key, field]) => {
                // Include all values that are not empty/undefined
                const value = field.default;
                if (value !== undefined && value !== null) {
                    // Handle different data types
                    if (field.type === 'array' && Array.isArray(value)) {
                        // Only include non-empty arrays
                        if (value.length > 0) {
                            input[key] = value;
                        }
                    } else if (field.type === 'boolean') {
                        // Include all boolean values (including false)
                        input[key] = value;
                    } else if (field.type === 'integer') {
                        // Include all numbers (including 0)
                        if (typeof value === 'number' || (typeof value === 'string' && value !== '')) {
                            input[key] = typeof value === 'string' ? parseInt(value) : value;
                        }
                    } else {
                        // String and other types - only include non-empty values
                        if (value !== '') {
                            input[key] = value;
                        }
                    }
                }
            });
        }

        const campaignData = {
            name: formData.name,
            description: formData.description,
            status: formData.status,
            input_schema: formData.input_schema,
            input: input  // Add converted input object
        };

        // Add actorId for both create and edit modes
        if (formData.actorId && formData.actorId.trim() !== '') {
            // Check if formData.actorId is a valid ID (24 character hex string)
            const isValidId = /^[0-9a-fA-F]{24}$/.test(formData.actorId);
            if (isValidId) {
                campaignData.actorId = formData.actorId;
            } else {
                // Fall through to fallback logic
            }
        }

        // Fallback logic if formData.actorId is not valid or empty
        if (!campaignData.actorId && campaign) {
            let fallbackActorId = '';

            // Priority 1: Use actorIdOriginal if available
            if (campaign.actorIdOriginal) {
                fallbackActorId = campaign.actorIdOriginal;
            }
            // Priority 2: Handle array structure
            else if (Array.isArray(campaign.actorId)) {
                fallbackActorId = campaign.actorId[0]?.id || campaign.actorId[0]?._id || '';
            }
            // Priority 3: Handle object structure
            else if (typeof campaign.actorId === 'object') {
                fallbackActorId = campaign.actorId._id || campaign.actorId.id || '';
            }
            // Priority 4: Use string (but this might be name, not ID)
            else if (campaign.actorId) {
                fallbackActorId = campaign.actorId;
            }

            campaignData.actorId = fallbackActorId;
        }

        if (isEditMode) {
            // Edit mode: Actor ID is read-only, don't include in update payload
            // But still update input object from schema changes

            // Merge with existing campaign data to preserve unchanged fields
            if (campaign && campaign.input) {
                // Create new merged input object: existing + new values
                const mergedInput = { ...campaign.input, ...input };
                campaignData.input = mergedInput; // Update the campaignData.input
            }
        }



        onSubmit(campaignData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {isEditMode ? 'Chỉnh sửa Chiến dịch' : 'Tạo Chiến dịch mới'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-200 flex-shrink-0">
                        <button
                            type="button"
                            onClick={() => setActiveTab('basic')}
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'basic'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Thông tin cơ bản
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('schema')}
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'schema'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Input Schema
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-6 min-h-0">
                        {activeTab === 'basic' && (
                            <BasicInfoTab
                                formData={formData}
                                handleInputChange={handleInputChange}
                                getActorIdString={getActorIdString}
                                isEditMode={isEditMode}
                                actors={actors}
                                loadingActors={loadingActors}
                            />
                        )}

                        {activeTab === 'schema' && (
                            <InputSchemaTab
                                inputMode={inputMode}
                                setInputMode={setInputMode}
                                jsonInput={jsonInput}
                                handleJsonInputChange={handleJsonInputChange}
                                getSchemaValue={getSchemaValue}
                                handleSchemaChange={handleSchemaChange}
                                collapsedSections={collapsedSections}
                                toggleSection={toggleSection}
                                handleArrayChange={handleArrayChange}
                                addArrayItem={addArrayItem}
                                removeArrayItem={removeArrayItem}
                            />
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            {isEditMode ? 'Cập nhật' : 'Tạo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CampaignModal;
