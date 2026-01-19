const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export async function request(path, options = {}) {
  const cleanPath = path.startsWith('/api') ? path.replace('/api', '') : path;
  const url = `${API_BASE_URL}${cleanPath}`;

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  if (options.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      body: isFormData ? options.body : JSON.stringify(options.body),
    });

    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }

    if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);
    return data;
  } catch (error) {
    console.error("❌ Request Error:", error.message);
    throw error;
  }
}