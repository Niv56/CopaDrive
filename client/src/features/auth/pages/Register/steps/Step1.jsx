import React from "react";
import { FiUser } from "react-icons/fi";

/** Form step for collecting basic user identity */
const Step1 = ({ formData, setFormData, errors }) => {
  return (
    <div className="d-grid gap-3">
      <div className="input-wrapper">
        <FiUser className="input-icon" />
        <input
          type="text"
          className={`form-control form-control-lg rounded-pill ${errors.firstName ? "is-invalid" : ""
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

export default Step1;