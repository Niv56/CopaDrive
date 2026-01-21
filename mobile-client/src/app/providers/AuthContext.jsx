import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
// שינינו ל-AsyncStorage כי זה מה שהתקנו בטלפון
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { useRouter } from "expo-router";

// ✅ שימוש ב-@ מונע בלבול בנתיבים
// הנתיב הזה יעבוד רק אחרי שתעביר את הקובץ לתיקיית features/auth/services
import { authenticateUser } from "@/src/features/auth/services/authService";

// וודא שגם הקובץ הזה נמצא במקום הנכון (src/features/user/services)
import { getUserProfile } from "@/src/features/user/services/userService";

const TOKEN_KEY = "token";
const USER_KEY = "user_data";
const AuthContext = createContext(null);

/** * ✅ פונקציית פענוח JWT בטוחה ל-React Native 
 * (atob לא קיים באנדרואיד/אייפון וגורם לקריסה)
 */
function getUserIdFromToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload).userId;
  } catch (e) {
    // Fallback למקרה שאין atob (כמו ב-Hermes engine)
    try {
        const payload = JSON.parse(String(Buffer.from(token.split('.')[1], 'base64')));
        return payload.userId;
    } catch (err) {
        console.log("Token decode error", err);
        return null; 
    }
  }
}

// פוליפיל פשוט למקרה ש-atob ממש לא קיים
if (!global.atob) {
    global.atob = (input) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        let str = input.replace(/=+$/, '');
        let output = '';
        if (str.length % 4 == 1) throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
        for (let bc = 0, bs = 0, buffer, i = 0; buffer = str.charAt(i++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
            buffer = chars.indexOf(buffer);
        }
        return output;
    }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const savedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const savedUser = await AsyncStorage.getItem(USER_KEY);
        
        if (savedToken) setToken(savedToken);
        if (savedUser) setUser(JSON.parse(savedUser));
        
        if (savedToken && !savedUser) {
          const uid = getUserIdFromToken(savedToken);
          // וודא ש-getUserProfile יודע לעבוד עם הנתיב החדש ב-API
          const userData = await getUserProfile(savedToken, uid); 
          if (userData) {
            setUser(userData);
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
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

      // ✅ התיקון הקריטי: בדיקה מול success במקום ok
      if (!res.success) {
          return { ok: false, error: res.error };
      }

      const newToken = res.token;
      // ✅ שימוש בפונקציה הבטוחה
      const userId = getUserIdFromToken(newToken); 
      
      // נסיון לשלוף פרופיל, אבל לא נכשיל את הלוגין אם זה נכשל
      let userData = null;
      try {
          if (userId) {
            userData = await getUserProfile(newToken, userId);
          }
      } catch (err) {
          console.log("Could not fetch user profile immediately", err);
      }

      await AsyncStorage.setItem(TOKEN_KEY, newToken);
      if (userData) await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
      
      router.replace("/(app)/home");
      return { ok: true };
    } catch (e) {
      console.error(e);
      return { ok: false, error: "Login failed unexpected" };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    router.replace("/(auth)/login");
  };

  // Refresh user data from server (call after profile update)
  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const userId = getUserIdFromToken(token);
      if (!userId) return;
      const userData = await getUserProfile(token, userId);
      if (userData) {
        setUser(userData);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      }
    } catch (e) {
      console.error("Failed to refresh user", e);
    }
  }, [token]);

  // Update user data locally (used after profile edit)
  const updateUserData = useCallback(async (nextUser) => {
    console.log("[AuthContext] updateUserData called", nextUser);
    if (!nextUser) return;
    setUser(nextUser);
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } catch (e) {
      console.error("Failed to persist user data", e);
    }
  }, []);

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: !!token,
    isHydrating,
    login,
    logout,
    refreshUser,
    updateUserData
  }), [token, user, isHydrating, refreshUser, updateUserData]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;