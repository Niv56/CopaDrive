/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

const API_BASE_URL = 'http://localhost:3000/api';

export const authenticateUser = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/tokens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok) {
            return { success: true, token: data.token, error: null };
        }

        if (response.status === 404) {
            return { success: false, error: "User not found. Please check your email or create an account." };
        }

        if (response.status === 401) {
            return { success: false, error: "Incorrect password. Please try again." };
        }

        return { success: false, error: data.error || "An error occurred on the server." };

    } catch (error) {
        console.error("Authentication error:", error);
        return { success: false, error: "Server connection error. Ensure the backend is running." };
    }
};

export const saveToken = (token) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');
export const getToken = () => localStorage.getItem('token');