import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo
} from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Initialize auth token from localStorage
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  // Indicates whether the session expired (e.g. after 401)
  const [sessionExpired, setSessionExpired] = useState(false);

  // Sync token state with localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken !== token) {
      setToken(storedToken);
    }
  }, []);

  // Persist token and reset session state on login
  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setSessionExpired(false);
  };

  // Clear auth state and localStorage
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setSessionExpired(false);
  };

  // Marks the session as expired without logging out immediately
  const triggerSessionExpired = () => {
    setSessionExpired(true);
  };

  const isAuthenticated = !!token && token !== "undefined";

  // Memoized context value to avoid unnecessary re-renders
  const value = useMemo(
    () => ({
      token,
      login,
      logout,
      isAuthenticated,
      sessionExpired,
      triggerSessionExpired,
    }),
    [token, isAuthenticated, sessionExpired]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  // Ensures hook is used within AuthProvider
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
