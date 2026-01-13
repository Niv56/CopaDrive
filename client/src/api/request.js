// client/src/api/request.js

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
    unauthorizedHandler = handler;
}

export function getToken() {
    return localStorage.getItem("token");
}

export async function request(path, options = {}) {
    const token = getToken();

    const headers = {
        ...(options.headers || {}),
    };

    // אם אין header Authorization ועדיין יש token - נוסיף
    if (token && !headers.Authorization) {
        headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(path, {
        ...options,
        headers,
    });

    // טיפול ב-401 אחיד
    if (res.status === 401) {
        if (typeof unauthorizedHandler === "function") unauthorizedHandler();
        const text = await res.text().catch(() => "");
        throw new Error(text || "Unauthorized");
    }

    // שגיאות כלליות
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Request failed (${res.status})`);
    }

    // לא תמיד יש גוף (204 וכו׳)
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) return res.json();
    return res.text();
}
