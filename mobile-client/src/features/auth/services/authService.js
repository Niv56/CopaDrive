const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  console.warn("Missing EXPO_PUBLIC_API_BASE_URL in .env");
}

async function jsonRequest(path, options) {
  const url = `${API_BASE_URL}${path}`;

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
}

export async function authenticateUser(email, password) {
  const { ok, data } = await jsonRequest("/api/tokens", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!ok) {
    return { ok: false, error: data?.error || data?.message || "Invalid credentials" };
  }

  const token = data?.token || data?.accessToken || data?.jwt;
  if (!token) return { ok: false, error: "Server did not return a token" };

  return { ok: true, token };
}

export async function registerUser(payload) {
  const { ok, data } = await jsonRequest("/api/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!ok) return { success: false, error: data?.error || data?.message || "Register failed" };
  return { success: true, user: data };
}