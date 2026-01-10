import React from 'react';

const Step1 = ({ formData, setFormData, errors }) => {
    return (
        <div className="copa-input-stack">
            <div>
                <input
                    type="text"
                    className="copa-input"
                    placeholder="👤 First name"
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                />
                {errors.firstName && <small className="text-danger d-block mt-1">{errors.firstName}</small>}
            </div>

            <div>
                <input
                    type="text"
                    className="copa-input"
                    placeholder="👤 Last name (Optional)"
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                />
            </div>
        </div>
    );
};

// Validation function for Step1
export const validateStep1 = (formData) => {
    const errors = {};

    if (!formData.firstName.trim()) {
        errors.firstName = "Enter your first name";
    } else if (formData.firstName.trim().length < 2) {
        errors.firstName = "First name must be at least 2 characters";
    }

    return errors;
};

export default Step1;