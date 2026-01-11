import React from "react";

/**
 * Step 2: Handles profile picture upload and formatted Israeli phone number.
 */
const Step2 = ({ formData, setFormData, preview, setPreview, fileInputRef, errors }) => {

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData({ ...formData, image: file });
    setPreview(URL.createObjectURL(file));
  };

  // פונקציה לפירמוט אוטומטי של הטלפון (05X-XXX-XXXX)
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // הסרת כל מה שאינו ספרה
    if (value.length > 10) value = value.slice(0, 10); // הגבלה ל-10 ספרות

    let formatted = value;
    if (value.length > 3 && value.length <= 6) {
      formatted = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else if (value.length > 6) {
      formatted = `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6)}`;
    }

    setFormData({ ...formData, phoneNumber: formatted });
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
          >
            {preview ? (
              <img src={preview} alt="Profile" />
            ) : (
              <span className="copa-avatar-icon">🖼️</span>
            )}
          </div>
        </div>
        {errors.image && <div className="text-danger mt-2" style={{ fontSize: 13 }}>{errors.image}</div>}
        <input type="file" ref={fileInputRef} onChange={handleImageChange} hidden accept="image/*" />
      </div>

      {/* Phone number field */}
      <div>
        <input
          type="tel"
          className={`form-control form-control-lg rounded-pill ${hasPhoneError ? "is-invalid" : ""}`}
          placeholder="05X-XXX-XXXX"
          value={formData.phoneNumber}
          onChange={handlePhoneChange}
        />
        <div className="form-text ps-3 small text-secondary">Israeli mobile numbers only (e.g., 054-123-4567)</div>
        {errors.phoneNumber && (
          <div className="invalid-feedback d-block ps-3">{errors.phoneNumber}</div>
        )}
      </div>
    </div>
  );
};

export const validateStep2 = (formData) => {
  const errors = {};
  const cleanPhone = formData.phoneNumber.replace(/\D/g, "");
  const blockedPrefixes = ["056", "057", "059"];

  if (!cleanPhone) {
    errors.phoneNumber = "Phone number is required";
  } else if (cleanPhone.length !== 10) {
    errors.phoneNumber = "Number must be exactly 10 digits";
  } else if (!cleanPhone.startsWith("05")) {
    errors.phoneNumber = "Must start with 05";
  } else if (blockedPrefixes.includes(cleanPhone.slice(0, 3))) {
    errors.phoneNumber = `Prefix ${cleanPhone.slice(0, 3)} is not supported`;
  }

  if (formData.image && formData.image.size > 5000000) {
    errors.image = "Image size must be less than 5MB";
  }

  return errors;
};

export default Step2;