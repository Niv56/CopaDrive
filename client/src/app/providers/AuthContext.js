import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo
} from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Initialize token from localStorage
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  // Global state to track if the session has expired (e.g., 401 response)
  const [sessionExpired, setSessionExpired] = useState(false);

  // Sync state if localStorage changes externally (optional safeguard)
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken !== token) {
      setToken(storedToken);
    }
  }, []);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setSessionExpired(false); // Reset expiration state on fresh login
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setSessionExpired(false);
  };

  // Trigger the "Session Expired" modal without immediately logging out the user
  // This allows the user to see *why* they are being asked to log in again
  const triggerSessionExpired = () => {
    setSessionExpired(true);
  };

  const isAuthenticated = !!token && token !== "undefined";

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
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}