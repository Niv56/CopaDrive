import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Register/Register';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/home"
          element={
            isAuthenticated ? (
              <div className="p-5">
                <h1>CopaDrive Dashboard</h1>
                <button className="btn btn-danger" onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/login';
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