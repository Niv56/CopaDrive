import React, { useState } from 'react';
import { authenticateUser, saveToken } from '../../services/authService'; // ← הסרתי checkUserExists!
import './Login.css';
import logo from '../../logo.svg';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('All fields are mandatory.');
            return;
        }

        const result = await authenticateUser(email, password);

        if (result.success) {
            saveToken(result.token);
            window.location.href = '/home';
        } else {
            setError(result.error);
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