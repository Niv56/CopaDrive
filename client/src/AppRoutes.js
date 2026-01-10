import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Register/Register';

function AppRoutes() {
    const token = localStorage.getItem('token');
    const isAuthenticated = !!token && token !== "undefined";
    const navigate = useNavigate();

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
                path="/home"
                element={
                    isAuthenticated ? (
                        <div className="p-5">
                            <h1>CopaDrive Dashboard</h1>

                            <p>
                                JWT Token is active: {token ? token.substring(0, 10) : 'N/A'}...
                            </p>

                            <button
                                className="btn btn-danger"
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    navigate('/login');
                                }}
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />

            <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default AppRoutes;