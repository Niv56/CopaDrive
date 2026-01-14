import React, { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider, useAuth } from "./providers/AuthContext";
import { ThemeProvider } from "./providers/ThemeProvider";
import AppRoutes from "./AppRoutes";

import SessionExpiredModal from "features/drive/widgets/SessionExpiredModal";
import { setUnauthorizedHandler } from "features/drive/api/filesApi";
import SplashScreen from "components/SplashScreen"; // ✅ ייבוא מסך הפתיחה

function AppContent() {
  const { sessionExpired, logout, triggerSessionExpired } = useAuth();
  
  // ✅ ניהול מצב מסך הפתיחה (Splash)
  const [showSplash, setShowSplash] = useState(true);

  // Register a global 401 (Unauthorized) handler
  useEffect(() => {
    setUnauthorizedHandler(() => {
      triggerSessionExpired();
    });

    return () => setUnauthorizedHandler(null);
  }, [triggerSessionExpired]);

  // אם ה-Splash עדיין מוצג, נחזיר רק אותו
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // אחרי שה-Splash נגמר, נציג את האפליקציה הרגילה
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