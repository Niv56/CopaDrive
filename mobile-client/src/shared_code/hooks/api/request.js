import Constants from "expo-constants";

/**
 * Resolves the backend base URL dynamically.
 * Priority: 
 * 1. Environment variable (Production/Staging)
 * 2. Expo Debugger Host (Local development on physical devices)
 * 3. Localhost fallback
 */
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL.replace(/\/api\/?$/, "").replace(/\/$/, "");
  }

  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(":")[0];

  if (!localhost) {
    return "http://localhost:3000";
  }

  return `http://${localhost}:3000`;
};

const API_BASE_URL = getBaseUrl();

/**
 * Core network request utility wrapper around the Fetch API.
 * Handles header injection, JWT authorization, and standardized error parsing.
 * * @param {string} path - API endpoint path (e.g., "/api/files")
 * @param {object} options - Fetch options including method, body, and token
 */
export async function request(path, options = {}) {
  // Normalize path to ensure it starts with a leading slash
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalizedPath}`;

  try {
    const isFormData = options.body instanceof FormData;

    // Set default headers; skip Content-Type for FormData to let the browser set the boundary
    const headers = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    };

    // Attach Bearer token if provided in the options
    if (options.token) {
      headers["Authorization"] = `Bearer ${options.token}`;
    }

    const res = await fetch(url, {
      ...options,
      headers,
      body: isFormData ? options.body : (options.body ? JSON.stringify(options.body) : undefined),
    });

    const text = await res.text();
    let data = null;

    // Safely parse JSON or return the raw text if parsing fails
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }


    // Standardized error handling for non-2xx responses
    if (!res.ok) {
      const msg =
        (data && (data.message || data.error)) ||
        (typeof data === "string" && data) ||
        `Request failed (${res.status})`;
      throw new Error(msg);
    }

    return data;
  } catch (error) {
    throw error;
  }
}