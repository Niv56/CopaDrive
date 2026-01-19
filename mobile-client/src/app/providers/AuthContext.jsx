import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { authenticateUser } from "../../features/auth/services/authService";
import { getUserProfile } from "../../features/user/services/userService";

const TOKEN_KEY = "token";
const USER_KEY = "user_data";
const AuthContext = createContext(null);

/** פונקציית עזר לפענוח userId מתוך ה-JWT ללא ספריות חיצוניות */
function getUserIdFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId;
  } catch (e) { return null; }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const savedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        const savedUser = await SecureStore.getItemAsync(USER_KEY);
        if (savedToken) setToken(savedToken);
        if (savedUser) setUser(JSON.parse(savedUser));
        
        // אם יש טוקן אבל אין משתמש (למשל אחרי ריסטרט), ננסה למשוך אותו
        if (savedToken && !savedUser) {
          const uid = getUserIdFromToken(savedToken);
          const userData = await getUserProfile(savedToken, uid);
          if (userData) {
            setUser(userData);
            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
          }
        }
      } catch (e) {
        console.error("Hydration error", e);
      } finally {
        setIsHydrating(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authenticateUser(email, password);
      if (!res.ok) return { ok: false, error: res.error };

      const newToken = res.token;
      const userId = getUserIdFromToken(newToken);
      
      // שליפת נתוני המשתמש מיד לאחר קבלת הטוקן (בדיוק כמו ב-Web)
      const userData = await getUserProfile(newToken, userId);

      await SecureStore.setItemAsync(TOKEN_KEY, newToken);
      if (userData) await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
      
      router.replace("/(app)/home");
      return { ok: true };
    } catch (e) {
      return { ok: false, error: "Login failed" };
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    setToken(null);
    setUser(null);
    router.replace("/(auth)/login");
  };

  const value = useMemo(() => ({
    token, user, isAuthenticated: !!token, isHydrating, login, logout
  }), [token, user, isHydrating]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;