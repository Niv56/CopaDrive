type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: any;
  token?: string | null;
};

// חשוב: במובייל "localhost" לא עובד מול המחשב.
// תשים פה את ה-IP של המחשב שלך באותה רשת (כמו 192.168.1.102)
const BASE_URL = "http://192.168.1.102:3000"; // תעדכן לפי ה-web-server שלך

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? "GET";

  const headers: Record<string, string> = {
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

  return data as T;
}

function safeJson(text: string) {
  try { return JSON.parse(text); } catch { return null; }
}
