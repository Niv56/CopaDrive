// src/api/http.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export async function http(path, options = {}) {
  const url = `${BASE_URL}${path}`;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = localStorage.getItem("token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorBody = null;
    try {
      errorBody = await res.json();
    } catch {
      // ignore
    }
    const err = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    err.body = errorBody;
    throw err;
  }

  // אם אין תוכן (204), נחזיר null
  if (res.status === 204) return null;

  // ברירת מחדל: JSON
  return res.json();
}
