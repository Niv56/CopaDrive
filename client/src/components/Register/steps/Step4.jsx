import React, { useEffect, useState } from "react";

/**
 * Step 4: Email + Password
 */
const Step4 = ({ formData, setFormData, errors }) => {
  const [passwordStrength, setPasswordStrength] = useState({
    hasLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
  });

  useEffect(() => {
    const pwd = formData.password || "";
    setPasswordStrength({
      hasLength: pwd.length >= 8,
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
    });
  }, [formData.password]);

  const hasEmailError = Boolean(errors.email);
  const hasPasswordError = Boolean(errors.password);
  const hasVerifyError = Boolean(errors.verifyPassword);

  const StrengthRow = ({ ok, text }) => (
    <div className={`d-flex align-items-center gap-2 ${ok ? "text-success" : "text-secondary"}`}>
      <span style={{ width: 18, textAlign: "center" }}>{ok ? "✓" : "•"}</span>
      <span style={{ fontSize: 13 }}>{text}</span>
    </div>
  );

  return (
    <div className="d-grid gap-3">
      <div>
        <input
          type="email"
          className={`form-control form-control-lg rounded-pill ${
            hasEmailError ? "is-invalid" : ""
          }`}
          placeholder="👤 Email address"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        {errors.email && (
          <div className="invalid-feedback d-block">{errors.email}</div>
        )}
      </div>

      <div>
        <input
          type="password"
          className={`form-control form-control-lg rounded-pill ${
            hasPasswordError ? "is-invalid" : ""
          }`}
          placeholder="🔒 Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />

        {formData.password && (
          <div className="mt-2 p-3 bg-white bg-opacity-75 rounded-3 border">
            <StrengthRow ok={passwordStrength.hasLength} text="At least 8 characters" />
            <StrengthRow ok={passwordStrength.hasUpper} text="One uppercase letter (A-Z)" />
            <StrengthRow ok={passwordStrength.hasLower} text="One lowercase letter (a-z)" />
            <StrengthRow ok={passwordStrength.hasNumber} text="One number (0-9)" />
          </div>
        )}

        {errors.password && (
          <div className="invalid-feedback d-block">{errors.password}</div>
        )}
      </div>

      <div>
        <input
          type="password"
          className={`form-control form-control-lg rounded-pill ${
            hasVerifyError ? "is-invalid" : ""
          }`}
          placeholder="Confirm password"
          value={formData.verifyPassword}
          onChange={(e) =>
            setFormData({ ...formData, verifyPassword: e.target.value })
          }
        />
        {errors.verifyPassword && (
          <div className="invalid-feedback d-block">{errors.verifyPassword}</div>
        )}
      </div>
    </div>
  );
};

export const validateStep4 = (formData) => {
  const errors = {};

  if (!formData.email.trim()) {
    errors.email = "Enter your email address";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = "Enter a valid email address";
  }

  if (!formData.password) {
    errors.password = "Enter your password";
  } else {
    const password = formData.password;
    const passwordErrors = [];

    if (password.length < 8) passwordErrors.push("at least 8 characters");
    if (!/[A-Z]/.test(password)) passwordErrors.push("one uppercase letter (A-Z)");
    if (!/[a-z]/.test(password)) passwordErrors.push("one lowercase letter (a-z)");
    if (!/[0-9]/.test(password)) passwordErrors.push("one number (0-9)");

    if (passwordErrors.length > 0) {
      errors.password = `Password must contain ${passwordErrors.join(", ")}`;
    }
  }

  if (!formData.verifyPassword) {
    errors.verifyPassword = "🔒 Confirm your password";
  } else if (formData.password !== formData.verifyPassword) {
    errors.verifyPassword = "Passwords don't match";
  }

  return errors;
};

export default Step4;
