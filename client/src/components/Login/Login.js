import React, { useState } from 'react';
import './Login.css';
// Import the local logo from the src directory
import logo from '../../photos/logo.svg';

/**
 * Login Component
 * Handles user authentication and persistent JWT storage.
 */
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    /**
     * Handles the login form submission.
     * Validates inputs and stores the JWT in localStorage for persistence.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic client-side validation
        if (!email || !password) {
            setError("All fields are mandatory.");
            return;
        }

        try {
            // Send authentication request to the Node.js server
            const response = await fetch('http://localhost:3000/api/tokens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // SUCCESS: Save JWT to localStorage to persist after page refresh
                localStorage.setItem('token', data.token);

                // Force a full page redirect to /home to ensure App.js re-validates the token
                window.location.href = '/home';
            } else {
                // Server-side error (e.g., wrong credentials)
                setError(data.error || "Invalid email or password");
            }
        } catch (err) {
            // Network or server connection failure
            setError("Server connection error. Ensure the backend is running.");
        }
    };

    return (
        <div className="copa-login-container">
            <div className="copa-card shadow-sm">

                {/* Left Branding Side: Google-style 1000x500 split layout */}
                <div className="copa-left-side">
                    <img src={logo} alt="CopaDrive" width="90" className="mb-4" />
                    <h1 className="copa-title">Sign in</h1>
                    <p className="copa-subtitle">Use your Copa Account</p>
                </div>

                {/* Right Form Side */}
                <div className="copa-right-side">
                    <form onSubmit={handleSubmit} className="copa-form-content">
                        <div className="copa-input-stack">
                            <input
                                type="text"
                                className="copa-input"
                                placeholder="Email"
                                onChange={e => setEmail(e.target.value)}
                            />
                            <input
                                type="password"
                                className="copa-input"
                                placeholder="Password"
                                onChange={e => setPassword(e.target.value)}
                            />
                            {/* Visual feedback for errors */}
                            {error && <div className="text-danger small mt-2">{error}</div>}
                        </div>

                        {/* Footer: Links and Submit button aligned to right */}
                        <div className="copa-action-bar mt-auto">
                            <div className="d-flex justify-content-end align-items-center gap-4 w-100">
                                <a href="/register" className="btn-link-google text-decoration-none">
                                    Create account
                                </a>
                                <button type="submit" className="btn-primary-copa">Sign In</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;