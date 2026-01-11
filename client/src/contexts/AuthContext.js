import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo
} from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  // ✅ חדש: מצב גלובלי לסשן שפג תוקף
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken !== token) {
      setToken(storedToken);
    }
  }, []);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setSessionExpired(false); // אם התחברנו מחדש – אין סשן שפג
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setSessionExpired(false);
  };

  // ✅ חדש: מפעיל את המודאל (לא מתנתק מיד)
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

      // ✅ חדש
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
