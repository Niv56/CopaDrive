import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { authenticateUser } from "../../features/auth/services/authService";

type LoginResult = { ok: true } | { ok: false; error: string };

type AuthValue = {
  token: string | null;
  isAuthenticated: boolean;
  sessionExpired: boolean;
  isHydrating: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  triggerSessionExpired: () => void;
};

const TOKEN_KEY = "token";
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
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

  const login: AuthValue["login"] = async (email, password) => {
    try {
      const res = await authenticateUser(email, password); // expected: { ok, token?, error? }
      if (!res.ok) return { ok: false, error: res.error || "Login failed" };

      const newToken = res.token;
      if (!newToken) return { ok: false, error: "No token returned from server" };

      await SecureStore.setItemAsync(TOKEN_KEY, newToken);
      setToken(newToken);
      setSessionExpired(false);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || "Login failed" };
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setSessionExpired(false);
  };

  const triggerSessionExpired = () => {
    setSessionExpired(true);
    // אופציונלי: נרוקן טוקן
    // setToken(null);
  };

  const value = useMemo<AuthValue>(
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
export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
