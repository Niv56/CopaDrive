const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  console.warn("⚠️ Missing EXPO_PUBLIC_API_BASE_URL in .env");
}

async function request(path, options = {}) {
  const method = options.method || "GET";
  const body = options.body;

  const cleanPath = path.startsWith("/api") ? path.replace("/api", "") : path;
  const url = `${API_BASE_URL}${cleanPath}`;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return { ok: res.ok, status: res.status, data };
}

export async function authenticateUser(email, password) {
  const { ok, data } = await request("/tokens", {
    method: "POST",
    body: { email, password },
  });

  if (!ok) {
    return {
      ok: false,
      error: data?.error || data?.message || "Invalid credentials",
    };
  }

  const token = data?.token || data?.accessToken || data?.jwt;
  return { ok: true, token };
}

// Register via JSON (NO FormData)
export async function registerUser(payload) {
  const { ok, status, data } = await request("/users", {
    method: "POST",
    body: payload,
  });

  if (ok || status === 201) {
    return { success: true, user: data };
  }

  return {
    success: false,
    error: data?.error || data?.message || "Register failed",
  };
}
