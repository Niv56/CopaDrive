import React from "react";
import { FiUser } from "react-icons/fi"; // ✅ Elegant Icon

const Step1 = ({ formData, setFormData, errors }) => {
  return (
    <div className="d-grid gap-3">
      {/* First Name Input */}
      <div className="input-wrapper">
        <FiUser className="input-icon" />
        <input
          type="text"
          className={`form-control form-control-lg rounded-pill ${
            errors.firstName ? "is-invalid" : ""
          }`}
          placeholder="First name"
          value={formData.firstName}
          onChange={(e) =>
            setFormData({ ...formData, firstName: e.target.value })
          }
        />
        {errors.firstName && (
          <div className="invalid-feedback d-block">{errors.firstName}</div>
        )}
      </div>

      {/* Last Name Input */}
      <div className="input-wrapper">
        <FiUser className="input-icon" />
        <input
          type="text"
          className="form-control form-control-lg rounded-pill"
          placeholder="Last name (Optional)"
          value={formData.lastName}
          onChange={(e) =>
            setFormData({ ...formData, lastName: e.target.value })
          }
        />
      </div>
    </div>
  );
};

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