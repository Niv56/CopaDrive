let unauthorizedHandler = null;

/** Registers a callback function to handle 401 Unauthorized responses globally */
export function setUnauthorizedHandler(handler) {
    unauthorizedHandler = handler;
}

/** Retrieves the authentication token from local storage */
export function getToken() {
    return localStorage.getItem("token");
}

/** * Enhanced fetch wrapper that injects auth headers, 
 * handles 401 errors, and parses response body 
 */
export async function request(path, options = {}) {
    const token = getToken();

    const headers = {
        ...(options.headers || {}),
    };

    // Inject Bearer token if available and not already set
    if (token && !headers.Authorization) {
        headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(path, {
        ...options,
        headers,
    });

    // Handle session expiration (401)
    if (res.status === 401) {
        if (typeof unauthorizedHandler === "function") unauthorizedHandler();
        const text = await res.text().catch(() => "");
        throw new Error(text || "Unauthorized");
    }

    // Handle non-2xx response statuses
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Request failed (${res.status})`);
    }

    // Parse response as JSON if applicable, otherwise return as plain text
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) return res.json();
    return res.text();
}