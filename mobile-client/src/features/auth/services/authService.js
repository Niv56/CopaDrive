import { request } from "../../../shared_code/hooks/api/request";
import AsyncStorage from '@react-native-async-storage/async-storage';

const isWeb = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

// Login User
export const authenticateUser = async (email, password) => {
  try {
    const data = await request("/api/tokens", {
      method: "POST",
      body: { email, password },
    });
    
    return { success: true, token: data.token, error: null };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: error.message || "Login failed" };
  }
};

// Register User
export const registerUser = async (userData) => {
  try {
    const data = await request("/api/users", {
      method: "POST",
      body: userData,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: error.message || "Registration failed" };
  }
};

// Storage Helpers
export const saveToken = async (token) => {
  if (isWeb) localStorage.setItem('token', token);
  else await AsyncStorage.setItem('token', token);
};

export const removeToken = async () => {
  if (isWeb) localStorage.removeItem('token');
  else await AsyncStorage.removeItem('token');
};

export const getToken = async () => {
  if (isWeb) return localStorage.getItem('token');
  return await AsyncStorage.getItem('token');
};