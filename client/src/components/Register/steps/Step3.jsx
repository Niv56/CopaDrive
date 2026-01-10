import React from "react";

/**
 * Step 3: Date of birth + Gender
 */
const Step3 = ({ formData, setFormData, errors }) => {
  const hasDobError = Boolean(errors.dateOfBirth);
  const hasGenderError = Boolean(errors.gender);

  return (
    <div className="d-grid gap-3">
      <div>
        <input
          type="date"
          className={`form-control form-control-lg rounded-pill ${
            hasDobError ? "is-invalid" : ""
          }`}
          value={formData.dateOfBirth || ""}
          onChange={(e) =>
            setFormData({ ...formData, dateOfBirth: e.target.value })
          }
        />
        {errors.dateOfBirth && (
          <div className="invalid-feedback d-block">{errors.dateOfBirth}</div>
        )}
      </div>

      <div>
        <select
          className={`form-select form-select-lg rounded-pill ${
            hasGenderError ? "is-invalid" : ""
          }`}
          value={formData.gender || ""}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
        >
          <option value="" disabled>
            Select gender
          </option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>

        {errors.gender && (
          <div className="invalid-feedback d-block">{errors.gender}</div>
        )}
      </div>
    </div>
  );
};

export const validateStep3 = (formData) => {
  const errors = {};

  if (!formData.dateOfBirth || String(formData.dateOfBirth).trim() === "") {
    errors.dateOfBirth = "Date of birth is required";
  } else {
    const dob = String(formData.dateOfBirth).trim();
    const dobOk = /^\d{4}-\d{2}-\d{2}$/.test(dob);
    if (!dobOk) errors.dateOfBirth = "Date of birth must be YYYY-MM-DD";
  }

  const allowed = new Set(["male", "female", "other", "prefer_not_to_say"]);
  if (!formData.gender || String(formData.gender).trim() === "") {
    errors.gender = "Gender is required";
  } else if (!allowed.has(formData.gender)) {
    errors.gender = "Invalid gender value";
  }

  return errors;
};

export default Step3;
