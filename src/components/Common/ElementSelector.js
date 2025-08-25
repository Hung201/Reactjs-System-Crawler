import React from 'react';

const ElementSelector = ({ value, onChange, placeholder = "Chọn element để lấy class...", compact = false }) => {
    return (
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
    );
};

export default ElementSelector;
