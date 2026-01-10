import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import Dashboard from './pages/Dashboard';

function App() {
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token && token !== "undefined";


  return (
    <Router>
      <Routes>
        <Route path="/dev-dashboard" element={<Dashboard />} />
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
                    window.location.href = '/login';
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
    </Router>
  );
}

export default App;
