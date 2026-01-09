import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Register/Register';

/**
 * Main Application Component
 * Focuses on JWT persistence after page refresh.
 */
function App() {
  // Directly checking localStorage on every render/refresh
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Persistence Logic: If token exists after refresh, allow access */}
        <Route
          path="/home"
          element={
            isAuthenticated ? (
              <div className="p-5">
                <h1>CopaDrive Dashboard</h1>
                <p>JWT Token is active: {localStorage.getItem('token').substring(0, 10)}...</p>
                <button className="btn btn-danger" onClick={() => {
                  localStorage.removeItem('token'); // Clear on logout
                  window.location.href = '/login'; // Force redirect
                }}>Sign Out</button>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;