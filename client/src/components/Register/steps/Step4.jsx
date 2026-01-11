import React, { useEffect, useState } from "react";

/**
 * Step4: Email (@copa.com restricted) + Password
 * Includes auto-completion for @copa.com
 */
const Step4 = ({ formData, setFormData, errors }) => {
  const [passwordStrength, setPasswordStrength] = useState({
    hasLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
  });

  const [isCopaEmail, setIsCopaEmail] = useState(false);

  useEffect(() => {
    const pwd = formData.password || "";
    setPasswordStrength({
      hasLength: pwd.length >= 8,
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
    });
  }, [formData.password]);

  useEffect(() => {
    const email = formData.email || "";
    setIsCopaEmail(email.toLowerCase().endsWith("@copa.com"));
  }, [formData.email]);

  // 🎯 פונקציית השלמה אוטומטית
  const handleEmailChange = (e) => {
    let value = e.target.value;
    const oldEmail = formData.email || "";

    // אם המשתמש הקליד @ (והוא לא במצב של מחיקה)
    if (value.endsWith("@") && value.length > oldEmail.length) {
      // בודקים אם כבר קיים @ בשם המשתמש (כדי לא להשלים פעמיים)
      const atCount = (value.match(/@/g) || []).length;
      if (atCount === 1) {
        value += "copa.com";
      }
    }

    setFormData({ ...formData, email: value });
  };

  const hasEmailError = Boolean(errors.email);
  const hasPasswordError = Boolean(errors.password);
  const hasVerifyError = Boolean(errors.verifyPassword);

  const InfoRow = ({ ok, text }) => (
    <div className={`d-flex align-items-center gap-2 ${ok ? "text-success" : "text-danger"}`}>
      <span style={{ width: 18, textAlign: "center" }}>{ok ? "✓" : "•"}</span>
      <span style={{ fontSize: 13 }}>{text}</span>
    </div>
  );

  return (
    <div className="d-grid gap-3">
      {/* Email address field with Auto-complete */}
      <div>
        <input
          type="email"
          className={`form-control form-control-lg rounded-pill ${hasEmailError ? "is-invalid" : ""}`}
          placeholder="username@copa.com"
          value={formData.email}
          onChange={handleEmailChange}
        />

        {formData.email && (
          <div className="mt-2 p-2 bg-light rounded-3 border ps-3">
            <InfoRow ok={isCopaEmail} text="Must end with @copa.com" />
          </div>
        )}

        {errors.email && (
          <div className="invalid-feedback d-block ps-3">{errors.email}</div>
        )}
      </div>

      {/* Password field */}
      <div>
        <input
          type="password"
          className={`form-control form-control-lg rounded-pill ${hasPasswordError ? "is-invalid" : ""}`}
          placeholder="🔒 Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        {formData.password && (
          <div className="mt-2 p-3 bg-white bg-opacity-75 rounded-3 border ps-3">
            <InfoRow ok={passwordStrength.hasLength} text="At least 8 characters" />
            <InfoRow ok={passwordStrength.hasUpper} text="One uppercase letter (A-Z)" />
            <InfoRow ok={passwordStrength.hasLower} text="One lowercase letter (a-z)" />
            <InfoRow ok={passwordStrength.hasNumber} text="One number (0-9)" />
          </div>
        )}
        {errors.password && <div className="invalid-feedback d-block ps-3">{errors.password}</div>}
      </div>

      {/* Confirm Password field */}
      <div>
        <input
          type="password"
          className={`form-control form-control-lg rounded-pill ${hasVerifyError ? "is-invalid" : ""}`}
          placeholder="🔒 Confirm password"
          value={formData.verifyPassword}
          onChange={(e) => setFormData({ ...formData, verifyPassword: e.target.value })}
        />
        {errors.verifyPassword && <div className="invalid-feedback d-block ps-3">{errors.verifyPassword}</div>}
      </div>
    </div>
  );
};

export const validateStep4 = (formData) => {
  const errors = {};
  const email = (formData.email || "").trim().toLowerCase();

  if (!email) {
    errors.email = "Email is required";
  } else if (!email.endsWith("@copa.com")) {
    errors.email = "Only @copa.com accounts are permitted";
  } else if (!/^[^\s@]+@copa\.com$/.test(email)) {
    errors.email = "Enter a valid email username";
  }

  if (!formData.password) {
    errors.password = "Password is required";
  } else {
    const pwd = formData.password;
    if (pwd.length < 8 || !/[A-Z]/.test(pwd) || !/[a-z]/.test(pwd) || !/[0-9]/.test(pwd)) {
      errors.password = "Password does not meet requirements";
    }
  }

  if (formData.password !== formData.verifyPassword) {
    errors.verifyPassword = "Passwords don't match";
  }

  return errors;
};

export default Step4;