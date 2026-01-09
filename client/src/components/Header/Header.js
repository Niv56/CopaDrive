import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();

    /**
     * Clears authentication data and returns to login.
     */
    const handleLogout = () => {
        // Remove the JWT to prevent further access to protected routes
        localStorage.removeItem('token');
        // Navigate back to the login screen
        navigate('/login');
    };

    return (
        <nav className="header-container d-flex justify-content-between p-3 border-bottom bg-white shadow-sm">
            <span className="h4 text-primary fw-bold">CopaDrive</span>
            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                Sign Out
            </button>
        </nav>
    );
};

export default Header;