import React from "react";

/**
 * Step 3: Date of birth + Gender
 */
const Step3 = ({ formData, setFormData, errors }) => {
  return (
    <div className="copa-input-stack">
      {/* Date of birth */}
      <div>
        <input
          type="date"
          className={`copa-input ${errors.dateOfBirth ? "error" : ""}`}
          value={formData.dateOfBirth || ""}
          onChange={(e) =>
            setFormData({ ...formData, dateOfBirth: e.target.value })
          }
        />
        {errors.dateOfBirth && (
          <small className="text-danger d-block">{errors.dateOfBirth}</small>
        )}
      </div>

      {/* Gender */}
      <div>
        <select
          className={`copa-input ${errors.gender ? "error" : ""}`}
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
          <small className="text-danger d-block">{errors.gender}</small>
        )}
      </div>
    </div>
  );
};

/**
 * Validate Step 3
 */
export const validateStep3 = (formData) => {
  const errors = {};

  // dateOfBirth: required + basic YYYY-MM-DD format
  if (!formData.dateOfBirth || String(formData.dateOfBirth).trim() === "") {
    errors.dateOfBirth = "Date of birth is required";
  } else {
    const dob = String(formData.dateOfBirth).trim();
    const dobOk = /^\d{4}-\d{2}-\d{2}$/.test(dob);
    if (!dobOk) errors.dateOfBirth = "Date of birth must be YYYY-MM-DD";
  }

  // gender: required + allowed values
  const allowed = new Set(["male", "female", "other", "prefer_not_to_say"]);
  if (!formData.gender || String(formData.gender).trim() === "") {
    errors.gender = "Gender is required";
  } else if (!allowed.has(formData.gender)) {
    errors.gender = "Invalid gender value";
  }

  return errors;
};

export default Step3;
