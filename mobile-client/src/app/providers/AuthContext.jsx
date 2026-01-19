import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { authenticateUser } from "../../features/auth/services/authService";

const TOKEN_KEY = "token";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);

  // hydrate token once
  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync(TOKEN_KEY);
        setToken(saved ?? null);
      } finally {
        setIsHydrating(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authenticateUser(email, password);
      if (!res.ok) return { ok: false, error: res.error || "Login failed" };

      const newToken = res.token;
      if (!newToken) return { ok: false, error: "No token returned from server" };

      await SecureStore.setItemAsync(TOKEN_KEY, newToken);
      setToken(newToken);
      setSessionExpired(false);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e?.message || "Login failed" };
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setSessionExpired(false);
    setIsHydrating(false);
  }

  const triggerSessionExpired = async () => {
    setSessionExpired(true);
    await logout();
  };

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: !!token,
      sessionExpired,
      isHydrating,
      login,
      logout,
      triggerSessionExpired,
    }),
    [token, sessionExpired, isHydrating]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** ✅ זה ההוק הרשמי באפליקציה */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}