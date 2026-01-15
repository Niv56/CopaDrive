import React, { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider, useAuth } from "./providers/AuthContext";
import { ThemeProvider } from "./providers/ThemeProvider";
import AppRoutes from "./AppRoutes";

import SessionExpiredModal from "features/drive/widgets/SessionExpiredModal";
import { setUnauthorizedHandler } from "features/drive/api/filesApi";
import SplashScreen from "components/SplashScreen";

/** Main application layout and session logic */
function AppContent() {
  const { sessionExpired, logout, triggerSessionExpired } = useAuth();

  const [showSplash, setShowSplash] = useState(true);

  // Register global 401 handler
  useEffect(() => {
    setUnauthorizedHandler(() => {
      triggerSessionExpired();
    });

    return () => setUnauthorizedHandler(null);
  }, [triggerSessionExpired]);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <>
      <SessionExpiredModal isOpen={sessionExpired} onLogout={logout} />
      <AppRoutes />
    </>
  );
}

/** Root component with global providers */
function App() {
  return (
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