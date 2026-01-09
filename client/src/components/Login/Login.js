import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../../logo.svg';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // reset previous error
        setError('');

        if (!email || !password) {
            setError('All fields are mandatory.');
            return;
        }

        try {
            const response = await fetch('/api/tokens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            // some responses may not be JSON (safety)
            let data = {};
            try {
                data = await response.json();
            } catch (_) {
                data = {};
            }

            if (response.ok) {
                if (!data.token) {
                    setError('Login succeeded but token is missing from server response.');
                    return;
                }

                localStorage.setItem('token', data.token);
                window.location.href = '/home';
            } else {
                setError(data.error || 'Invalid email or password');
            }
        } catch (err) {
            setError('Server connection error. Ensure the backend is running.');
        }
    };

    return (
        <div className="copa-login-container">
            <div className="copa-card shadow-sm">
                <div className="copa-left-side">
                    <img src={logo} alt="CopaDrive" width="90" className="mb-4" />
                    <h1 className="copa-title">Sign in</h1>
                    <p className="copa-subtitle">Use your Copa Account</p>
                </div>

                <div className="copa-right-side">
                    <form onSubmit={handleSubmit} className="copa-form-content">
                        <div className="copa-input-stack">
                            <input
                                type="text"
                                className="copa-input"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <input
                                type="password"
                                className="copa-input"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {error && <div className="text-danger small mt-2">{error}</div>}
                        </div>

                        <div className="copa-action-bar mt-auto">
                            <div className="d-flex justify-content-end align-items-center gap-4 w-100">
                                <a href="/register" className="btn-link-google text-decoration-none">
                                    Create account
                                </a>
                                <button type="submit" className="btn-primary-copa">
                                    Sign In
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
