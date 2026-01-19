const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");

export async function request(path, options = {}) {
  // אם BASE כבר מסתיים ב-/api, לא נוסיף שוב
  const baseHasApi = /\/api$/i.test(API_BASE_URL);

  // ודא ש-path מתחיל ב-/
  const rawPath = path.startsWith("/") ? path : `/${path}`;
  const pathHasApi = rawPath === "/api" || rawPath.startsWith("/api/");

  // אם base כבר כולל /api וגם path כולל /api => נוריד /api מה-path
  const finalPath = baseHasApi && pathHasApi ? rawPath.replace(/^\/api/, "") : rawPath;

  const url = `${API_BASE_URL}${finalPath}`;

  console.log(`📡 DEBUG: Fetching from ${url}`);

  try {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (options.token) {
      headers["Authorization"] = `Bearer ${options.token}`;
    }

    const res = await fetch(url, {
      ...options,
      headers,
    });

    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const msg =
        (data && (data.message || data.error)) ||
        (typeof data === "string" && data) ||
        `Request failed (${res.status})`;
      throw new Error(msg);
    }

    return data;
  } catch (error) {
    console.error("❌ Request Error:", error?.message || error);
    throw error;
  }
}
