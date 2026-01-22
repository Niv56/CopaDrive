import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from "expo-router";

import { authenticateUser } from "../../features/auth/services/authService";
import { getUserProfile } from "../../features/user/services/userService";

const TOKEN_KEY = "token";
const USER_KEY = "user_data";
const AuthContext = createContext(null);

/**
 * Extracts the userId from a standard JWT payload.
 * Includes a fallback for environments where global atob might be missing.
 */
function getUserIdFromToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload).userId;
  } catch (e) {
    try {
      const { Buffer } = require("buffer");
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      return payload.userId;
    } catch (err) {
      return null;
    }
  }
}

// Polyfill for atob in environments that do not support it natively
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

/**
 * Provides authentication state, login/logout methods, and 
 * automatic route protection based on the user's auth status.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // Hydrate state from local storage on initial mount
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const savedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const savedUser = await AsyncStorage.getItem(USER_KEY);

        if (savedToken && isMounted) {
          setToken(savedToken);
          if (savedUser) setUser(JSON.parse(savedUser));

          // Sync profile data from server in the background
          const uid = getUserIdFromToken(savedToken);
          if (uid) {
            getUserProfile(savedToken, uid).then(userData => {
              if (userData && isMounted) {
                setUser(userData);
                AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
              }
            }).catch(() => { });
          }
        }
      } catch (e) {
      } finally {
        if (isMounted) setIsHydrating(false);
      }
    })();

    return () => { isMounted = false; };
  }, []);

  /**
   * Route Guard: Redirects users based on authentication status.
   * Prevents authenticated users from seeing login screens and vice versa.
   */
  useEffect(() => {
    if (isHydrating) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!token && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup) {
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
        try { userData = await getUserProfile(newToken, userId); } catch (err) { }
      }

      await AsyncStorage.setItem(TOKEN_KEY, newToken);
      if (userData) await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);

      return { ok: true };
    } catch (e) {
      return { ok: false, error: "Login failed unexpectedly" };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  /** Refresh user data from server (typically called after a profile update) */
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
    }
  }, [token]);

  /** Manually update local user state (typically used for immediate UI feedback) */
  const updateUserData = useCallback(async (nextUser) => {
    if (!nextUser) return;
    setUser(nextUser);
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } catch (e) {
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

  // Prevent application rendering until the auth state is fully hydrated
  if (isHydrating) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;