const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export async function request(path, options = {}) {
  // הסרת /api מהנתיב אם הוא כבר קיים ב-BASE_URL כדי למנוע /api/api
  const cleanPath = path.startsWith('/api') ? path.replace('/api', '') : path;
  const url = `${API_BASE_URL}${cleanPath}`;

  console.log(`📡 DEBUG: Fetching from ${url}`);

  try {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    // הוספת טוקן אם הוא קיים ב-options
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
        throw new Error(data?.message || data?.error || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (error) {
    console.error("❌ Request Error:", error.message);
    throw error;
  }
}