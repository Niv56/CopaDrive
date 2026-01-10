import React from "react";

/**
 * Step 2: Handles profile picture upload and phone number input.
 */
const Step2 = ({ formData, setFormData, preview, setPreview, fileInputRef, errors }) => {
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData({ ...formData, image: file });
    setPreview(URL.createObjectURL(file));
  };

  const hasImageError = Boolean(errors.image);
  const hasPhoneError = Boolean(errors.phoneNumber);

  return (
    <div className="d-grid gap-3">
      {/* Profile picture */}
      <div className="text-center">
        <div className="mb-2">
          <div
            className={`copa-avatar-preview ${hasImageError ? "copa-avatar-error" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" ? fileInputRef.current?.click() : null)}
          >
            {preview ? (
              <img src={preview} alt="Profile" />
            ) : (
              <span className="copa-avatar-icon">🖼️</span>
            )}
          </div>
        </div>
        {errors.image && (
          <div className="text-danger mt-2" style={{ fontSize: 13 }}>
            {errors.image}
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          hidden
          accept="image/*"
        />
      </div>

      {/* Phone number */}
      <div>
        <input
          type="tel"
          className={`form-control form-control-lg rounded-pill ${
            hasPhoneError ? "is-invalid" : ""
          }`}
          placeholder="📱 Phone number"
          value={formData.phoneNumber}
          onChange={(e) =>
            setFormData({ ...formData, phoneNumber: e.target.value })
          }
        />
        {errors.phoneNumber && (
          <div className="invalid-feedback d-block">{errors.phoneNumber}</div>
        )}
      </div>
    </div>
  );
};

export const validateStep2 = (formData) => {
  const errors = {};

  if (!formData.phoneNumber.trim()) {
    errors.phoneNumber = "Enter your phone number";
  } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ""))) {
    errors.phoneNumber = "Enter a valid 10-digit phone number";
  }

  if (formData.image && formData.image.size > 5000000) {
    errors.image = "Image size must be less than 5MB";
  }

  return errors;
};

export default Step2;
