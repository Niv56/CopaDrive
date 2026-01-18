const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  console.warn("Missing EXPO_PUBLIC_API_BASE_URL in .env");
}

type LoginApiResult =
  | { ok: true; token: string; error?: null }
  | { ok: false; error: string; token?: null };

type RegisterApiResult =
  | { success: true; user?: any; error?: null }
  | { success: false; error: string; user?: null };

async function jsonRequest(path: string, options?: RequestInit) {
  const url = `${API_BASE_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return { ok: res.ok, status: res.status, data };
}

export async function authenticateUser(email: string, password: string): Promise<LoginApiResult> {
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

export async function registerUser(payload: any): Promise<RegisterApiResult> {
  const { ok, data } = await jsonRequest("/api/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!ok) return { success: false, error: data?.error || data?.message || "Register failed" };
  return { success: true, user: data };
}