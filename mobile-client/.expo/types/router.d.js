
const BASE_URL = "http://192.168.1.226:3000"; 

export async function request(path, options = {}) {
  const method = options.method ?? "GET";

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };

  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

function safeJson(text) {
  try { return JSON.parse(text); } catch { return null; }
}