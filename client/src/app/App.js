import React, { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider, useAuth } from "./providers/AuthContext";
import { ThemeProvider } from "./providers/ThemeProvider";
import { ToastProvider } from "./providers/ToastContext";
import AppRoutes from "./AppRoutes";

import SessionExpiredModal from "features/drive/widgets/SessionExpiredModal";
import { setUnauthorizedHandler } from "features/drive/api/filesApi";
import SplashScreen from "components/SplashScreen";

// Main application layout and session logic 
function AppContent() {
  const { sessionExpired, logout, triggerSessionExpired } = useAuth();

  const [showSplash, setShowSplash] = useState(true);

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

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;