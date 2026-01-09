import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../../logo.svg';

// API configuration
const API_URL_USERS = 'http://localhost:3000/api/users';
const API_URL_TOKENS = 'http://localhost:3000/api/tokens';

/**
 * Login Component
 * Two-step authentication process like Google:
 * Step 1: Check if user exists
 * Step 2: Validate password
 */
const Login = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1 = email check, 2 = password check
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    // Update form field
    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
        setError(''); // Clear errors when user types
    };

    // Step 1: Check if user exists
    const checkUserExists = async () => {
        if (!formData.email.trim()) {
            setError("Please enter your email");
            return;
        }

        try {
            // Check if user exists by trying to fetch user info
            const response = await fetch(`${API_URL_USERS}/email/${formData.email}`);

            if (response.ok) {
                // User exists - move to password step
                console.log("User found");
                setStep(2);
                setError('');
            } else if (response.status === 404) {
                // User not found
                setError("User not found. Please check your email or create an account.");
            } else {
                setError("An error occurred. Please try again.");
            }
        } catch (error) {
            console.error("Connection error:", error);
            setError("Server connection error. Ensure the backend is running.");
        }
    };

    // Step 2: Authenticate with password
    const authenticateUser = async () => {
        if (!formData.password.trim()) {
            setError("Please enter your password");
            return;
        }

        try {
            const response = await fetch(API_URL_TOKENS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Success: Save JWT and redirect
                localStorage.setItem('token', data.token);
                console.log("Login successful!");
                window.location.href = '/home';
            } else if (response.status === 401) {
                // Wrong password
                setError("Incorrect password. Please try again.");
            } else {
                setError(data.error || "Login failed. Please try again.");
            }
        } catch (error) {
            console.error("Connection error:", error);
            setError("Server connection error. Ensure the backend is running.");
        }
    };

    // Handle form submission based on current step
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (step === 1) {
            await checkUserExists();
        } else {
            await authenticateUser();
        }
    };

    // Go back to email step
    const handleBack = () => {
        setStep(1);
        setFormData({ ...formData, password: '' });
        setError('');
    };

    return (
        <div className="copa-login-container">
            <div className="copa-card shadow-sm">
                {/* Centered Branding */}
                <div className="copa-left-side">
                    <img src={logo} alt="CopaDrive" width="75" />
                    <h1 className="copa-title">Sign in</h1>
                    <p className="copa-subtitle">
                        {step === 1 ? 'Use your Copa Account' : formData.email}
                    </p>
                </div>

                {/* Form Section */}
                <div className="copa-right-side">
                    <form onSubmit={handleSubmit} className="copa-form-content">
                        <div className="copa-input-stack">
                            {step === 1 ? (
                                // Step 1: Email input
                                <input
                                    type="text"
                                    className="copa-input"
                                    placeholder="Email or phone"
                                    value={formData.email}
                                    onChange={e => handleChange('email', e.target.value)}
                                    autoFocus
                                />
                            ) : (
                                // Step 2: Password input
                                <input
                                    type="password"
                                    className="copa-input"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={e => handleChange('password', e.target.value)}
                                    autoFocus
                                />
                            )}

                            {/* Visual feedback for errors */}
                            {error && <div className="text-danger">{error}</div>}
                        </div>

                        {/* Footer: Links and Submit button */}
                        <div className="copa-action-bar">
                            <div className="d-flex justify-content-between align-items-center w-100">
                                {step === 1 ? (
                                    <button
                                        type="button"
                                        className="btn-link-google"
                                        onClick={() => navigate('/register')}
                                    >
                                        Create account
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="btn-link-google"
                                        onClick={handleBack}
                                    >
                                        Back
                                    </button>
                                )}
                                <button type="submit" className="btn-primary-copa">
                                    Next
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;