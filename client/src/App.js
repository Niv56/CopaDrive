import React, { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AppRoutes from "./AppRoutes";
import "bootstrap/dist/css/bootstrap.min.css";

import SessionExpiredModal from "./components/Dashboard/widgets/SessionExpiredModal";
import { setUnauthorizedHandler } from "./api/filesApi"; // ✅ שים לב ל-path

function AppContent() {
  const { sessionExpired, logout, triggerSessionExpired } = useAuth();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      triggerSessionExpired();
    });

    return () => setUnauthorizedHandler(null);
  }, [triggerSessionExpired]);

  return (
    <>
      <SessionExpiredModal isOpen={sessionExpired} onLogout={logout} />
      <AppRoutes />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
