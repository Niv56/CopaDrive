const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  console.warn("⚠️ Missing EXPO_PUBLIC_API_BASE_URL in .env");
}

async function jsonRequest(path, options) {
  // הסרת /api מהנתיב אם הוא כבר קיים ב-BASE_URL כדי למנוע כפילות
  const cleanPath = path.startsWith('/api') ? path.replace('/api', '') : path;
  const url = `${API_BASE_URL}${cleanPath}`;

  console.log(`🚀 Requesting: ${options.method || 'GET'} ${url}`);

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });

    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    return { ok: res.ok, status: res.status, data };
  } catch (error) {
    console.error("❌ Network request failed:", error.message);
    throw error;
  }
}

export async function authenticateUser(email, password) {
  const { ok, data } = await jsonRequest("/tokens", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!ok) {
    return { ok: false, error: data?.error || data?.message || "Invalid credentials" };
  }

  const token = data?.token || data?.accessToken || data?.jwt;
  return { ok: true, token };
}

export async function registerUser(payload) {
  const { ok, data, status } = await jsonRequest("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (ok || status === 201) {
    return { success: true, user: data };
  }
  
  return { 
    success: false, 
    error: data?.error || data?.message || "Register failed" 
  };
}