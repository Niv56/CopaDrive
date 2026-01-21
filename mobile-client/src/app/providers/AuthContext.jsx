import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
// שינינו ל-AsyncStorage כי זה מה שהתקנו בטלפון
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { useRouter, useSegments } from "expo-router";

// ✅ וודא שהנתיבים האלו נכונים אצלך בפרויקט
import { authenticateUser } from "../../features/auth/services/authService";
import { getUserProfile } from "../../features/user/services/userService";

const TOKEN_KEY = "token";
const USER_KEY = "user_data";
const AuthContext = createContext(null);

function getUserIdFromToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload).userId;
  } catch (e) {
    try {
        const payload = JSON.parse(String(Buffer.from(token.split('.')[1], 'base64')));
        return payload.userId;
    } catch (err) {
        return null; 
    }
  }
}

// Polyfill for atob
if (!global.atob) {
    global.atob = (input) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        let str = input.replace(/=+$/, '');
        let output = '';
        if (str.length % 4 == 1) throw new Error("'atob' failed");
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
  const segments = useSegments();

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const savedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const savedUser = await AsyncStorage.getItem(USER_KEY);
        
        if (savedToken && isMounted) {
            setToken(savedToken);
            if (savedUser) setUser(JSON.parse(savedUser));
            
            // בדיקת פרופיל ברקע
            const uid = getUserIdFromToken(savedToken);
            if (uid) {
                getUserProfile(savedToken, uid).then(userData => {
                    if (userData && isMounted) {
                        setUser(userData);
                        AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
                    }
                }).catch(() => {});
            }
        }
      } catch (e) {
        console.error("Hydration error", e);
      } finally {
        if (isMounted) setIsHydrating(false);
      }
    })();

    return () => { isMounted = false; };
  }, []);

  // ✅ הגנה על הניווט: אם המשתמש לא מחובר והוא בתוך האפליקציה, זרוק אותו ללוגין
  useEffect(() => {
    if (isHydrating) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    if (!token && !inAuthGroup) {
        // אם אין טוקן ולא נמצאים בקבוצת auth -> לך ללוגין
        router.replace('/(auth)/login');
    } else if (token && inAuthGroup) {
        // אם יש טוקן ונמצאים בקבוצת auth -> לך לבית
        router.replace('/(app)/home');
    }
  }, [token, isHydrating, segments]);

  const login = async (email, password) => {
    try {
      const res = await authenticateUser(email, password);
      if (!res.success) return { ok: false, error: res.error };

      const newToken = res.token;
      const userId = getUserIdFromToken(newToken); 
      
      let userData = null;
      if (userId) {
         try { userData = await getUserProfile(newToken, userId); } catch (err) {}
      }

      await AsyncStorage.setItem(TOKEN_KEY, newToken);
      if (userData) await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
      
      // הניווט יתבצע אוטומטית ב-useEffect למעלה
      return { ok: true };
    } catch (e) {
      return { ok: false, error: "Login failed unexpected" };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
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

  // ✅ התיקון הקריטי: לא מציגים את האפליקציה עד שסיימנו לטעון את הטוקן
  // זה מונע את הקפיצה למסך הלוגין כשיש משתמש מחובר
  if (isHydrating) {
      return null; // או שים כאן רכיב <SplashScreen />
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;