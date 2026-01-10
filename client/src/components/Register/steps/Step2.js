import React from 'react';

/**
 * Step 2: Handles profile picture upload and phone number input.
 */
const Step2 = ({ formData, setFormData, preview, setPreview, fileInputRef, errors }) => {

    // Handles image selection and creates a local preview URL
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    return (
        <div className="copa-input-stack">
            {/* Custom file upload trigger using a profile circle */}
            <div className="text-center mb-3">
                <div className="copa-profile-upload mx-auto mb-2" onClick={() => fileInputRef.current.click()}>
{preview ? (
  <img src={preview} alt="Profile" /> 
) : (
  <span style={{
    fontSize: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%'
  }}>
    🖼️
  </span>
)}  </div>
                {errors.image && <small className="text-danger d-block">{errors.image}</small>}
            </div>

            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                hidden
                accept="image/*"
            />

            <div>
                <input
                    type="tel"
                    className="copa-input"
                    placeholder="📞 Phone number"
                    value={formData.phoneNumber}
                    onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
                {errors.phoneNumber && <small className="text-danger d-block mt-1">{errors.phoneNumber}</small>}
            </div>
        </div>
    );
};

// Validation function for Step2
export const validateStep2 = (formData) => {
    const errors = {};

    // Phone number validation
    if (!formData.phoneNumber.trim()) {
        errors.phoneNumber = "Enter your phone number";
    } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
        errors.phoneNumber = "Enter a valid 10-digit phone number";
    }

    // Image is optional - but if provided, validate it's valid
    if (formData.image && formData.image.size > 5000000) {
        errors.image = "Image size must be less than 5MB";
    }

    return errors;
};

export default Step2;