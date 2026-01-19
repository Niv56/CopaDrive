const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export async function request(path, options = {}) {
  const cleanPath = path.startsWith('/api') ? path.replace('/api', '') : path;
  const url = `${API_BASE_URL}${cleanPath}`;

  try {
    const isFormData = options.body instanceof FormData;

    const headers = {
      // הוספת JSON Content-Type רק אם זה לא FormData
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    };

    if (options.token) {
      headers["Authorization"] = `Bearer ${options.token}`;
    }

    const res = await fetch(url, {
      ...options,
      headers,
      // המרת אובייקט ל-JSON רק אם הוא אובייקט ולא FormData
      body: isFormData ? options.body : (options.body ? JSON.stringify(options.body) : undefined),
    });

    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }

    if (!res.ok) {
      throw new Error(data?.error || data?.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (error) {
    console.error("❌ Request Error:", error.message);
    throw error;
  }
}