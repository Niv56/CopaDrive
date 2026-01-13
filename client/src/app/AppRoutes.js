import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./providers/AuthContext";
import Login from "features/auth/pages/Login/Login";
import Register from "features/auth/pages/Register/Register";
import Dashboard from "features/drive/pages/Dashboard";

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  // Define app routes and protect authenticated pages.
  return (
    <Routes>
      <Route path="/dev-dashboard" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/home"
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />}
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;
