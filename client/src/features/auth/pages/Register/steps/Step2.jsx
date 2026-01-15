import React from "react";
import { FiImage, FiSmartphone } from "react-icons/fi";

/** Form step for profile image upload and phone number registration */
const Step2 = ({ formData, setFormData, preview, setPreview, fileInputRef, errors }) => {

  /** Processes selected image file and updates local preview */
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData({ ...formData, image: file });
    setPreview(URL.createObjectURL(file));
  };

  /** Formats raw numeric input into 05X-XXX-XXXX pattern */
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 10) value = value.slice(0, 10);

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
              <FiImage className="copa-avatar-icon-svg" />
            )}
          </div>
        </div>

        <div className="text-secondary small">Tap to upload photo</div>

        {errors.image && (
          <div className="text-danger mt-2" style={{ fontSize: 13 }}>
            {errors.image}
          </div>
        )}

        <input type="file" ref={fileInputRef} onChange={handleImageChange} hidden accept="image/*" />
      </div>

      <div className="input-wrapper">
        <FiSmartphone className="input-icon" />
        <input
          type="tel"
          className={`form-control form-control-lg rounded-pill ${hasPhoneError ? "is-invalid" : ""}`}
          placeholder="05X-XXX-XXXX"
          value={formData.phoneNumber}
          onChange={handlePhoneChange}
        />
      </div>

      <div className="form-text ps-3 small text-secondary">
        Israeli mobile numbers only (e.g., 054-123-4567)
      </div>
      {errors.phoneNumber && (
        <div className="invalid-feedback d-block ps-3">{errors.phoneNumber}</div>
      )}
    </div>
  );
};

export default Step2;