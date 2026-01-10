import React, { useState, useEffect } from 'react';

/**
 * Step 3: Handles email address and secure password creation.
 */
const Step3 = ({ formData, setFormData, errors }) => {
    const [passwordStrength, setPasswordStrength] = useState({
        hasLength: false,
        hasUpper: false,
        hasLower: false,
        hasNumber: false
    });

    // Check password strength in real-time
    useEffect(() => {
        const pwd = formData.password;
        setPasswordStrength({
            hasLength: pwd.length >= 8,
            hasUpper: /[A-Z]/.test(pwd),
            hasLower: /[a-z]/.test(pwd),
            hasNumber: /[0-9]/.test(pwd)
        });
    }, [formData.password]);

    return (
        <div className="copa-input-stack">
            <div>
                <input
                    type="email"
                    className="copa-input"
                    placeholder="👤 Email address"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
                {errors.email && <small className="text-danger d-block mt-1">{errors.email}</small>}
            </div>

            <div>
                <input
                    type="password"
                    className="copa-input"
                    placeholder="🔒 Password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                />

                {/* Password strength indicator */}
                {formData.password && (
                    <div className="password-requirements mt-2">
                        <small className={passwordStrength.hasLength ? 'text-success' : 'text-muted'}>
                            {passwordStrength.hasLength ? '✓' : '○'} At least 8 characters
                        </small>
                        <br />
                        <small className={passwordStrength.hasUpper ? 'text-success' : 'text-muted'}>
                            {passwordStrength.hasUpper ? '✓' : '○'} One uppercase letter (A-Z)
                        </small>
                        <br />
                        <small className={passwordStrength.hasLower ? 'text-success' : 'text-muted'}>
                            {passwordStrength.hasLower ? '✓' : '○'} One lowercase letter (a-z)
                        </small>
                        <br />
                        <small className={passwordStrength.hasNumber ? 'text-success' : 'text-muted'}>
                            {passwordStrength.hasNumber ? '✓' : '○'} One number (0-9)
                        </small>
                    </div>
                )}

                {errors.password && <small className="text-danger d-block mt-1">{errors.password}</small>}
            </div>

            <div>
                <input
                    type="password"
                    className="copa-input"
                    placeholder="🔒 Confirm Password"
                    value={formData.verifyPassword}
                    onChange={e => setFormData({ ...formData, verifyPassword: e.target.value })}
                />
                {errors.verifyPassword && <small className="text-danger d-block mt-1">{errors.verifyPassword}</small>}
            </div>
        </div>
    );
};

// Validation function for Step3
export const validateStep3 = (formData) => {
    const errors = {};

    // Email validation
    if (!formData.email.trim()) {
        errors.email = "Enter your email address";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = "Enter a valid email address";
    }

    // Advanced password validation
    if (!formData.password) {
        errors.password = "Enter your password";
    } else {
        const password = formData.password;
        const passwordErrors = [];

        // Check minimum length
        if (password.length < 8) {
            passwordErrors.push("at least 8 characters");
        }

        // Check uppercase letter
        if (!/[A-Z]/.test(password)) {
            passwordErrors.push("one uppercase letter (A-Z)");
        }

        // Check lowercase letter
        if (!/[a-z]/.test(password)) {
            passwordErrors.push("one lowercase letter (a-z)");
        }

        // Check number
        if (!/[0-9]/.test(password)) {
            passwordErrors.push("one number (0-9)");
        }

        // If there are errors, display clear message
        if (passwordErrors.length > 0) {
            errors.password = `Password must contain ${passwordErrors.join(", ")}`;
        }
    }

    // Password confirmation validation
    if (!formData.verifyPassword) {
        errors.verifyPassword = "Confirm your password";
    } else if (formData.password !== formData.verifyPassword) {
        errors.verifyPassword = "Passwords don't match";
    }

    return errors;
};

export default Step3;