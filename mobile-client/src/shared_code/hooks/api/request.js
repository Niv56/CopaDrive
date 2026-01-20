// Base URL without /api - paths include /api prefix (e.g., /api/users, /api/files)
const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.1.114:3000").replace(/\/api\/?$/, "").replace(/\/$/, "");

console.log("🔧 API_BASE_URL:", API_BASE_URL);

export async function request(path, options = {}) {
  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : /${path};
  
  // Build the full URL
  const url = ${API_BASE_URL}${normalizedPath};
  
  console.log("📡 Request:", options.method || "GET", url);

  try {
    const isFormData = options.body instanceof FormData;

    const headers = {
      // הוספת JSON Content-Type רק אם זה לא FormData
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    };

    if (options.token) {
      headers["Authorization"] = Bearer ${options.token};
    }

    const res = await fetch(url, {
      ...options,
      headers,
      body: isFormData ? options.body : (options.body ? JSON.stringify(options.body) : undefined),
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
        Request failed (${res.status});
      throw new Error(msg);
    }

    return data;
  } catch (error) {
    console.error("Request Error:", error?.message || error);
    throw error;
  }
}