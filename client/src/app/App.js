import React, { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider, useAuth } from "./providers/AuthContext";
import { ThemeProvider } from "./providers/ThemeProvider";
import AppRoutes from "./AppRoutes";

import SessionExpiredModal from "features/drive/widgets/SessionExpiredModal";
import { setUnauthorizedHandler } from "features/drive/api/filesApi";

function AppContent() {
  const { sessionExpired, logout, triggerSessionExpired } = useAuth();

  // Register a global 401 (Unauthorized) handler to trigger the session expiry modal
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
    // Global Context Providers Setup
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;