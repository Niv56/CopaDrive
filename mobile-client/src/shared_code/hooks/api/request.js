// src/shared_code/hooks/api/request.js

// 👇 תעדכן ל-IP של השרת שלך (כמו בלוגים שלך)
const DEFAULT_BASE_URL = "http://192.168.1.146:3000";

export async function request(path, options = {}) {
  const { method = "GET", token, body, headers = {}, signal } = options;

  const url = path.startsWith("http") ? path : `${DEFAULT_BASE_URL}${path}`;

  const finalHeaders = {
    Accept: "application/json",
    ...headers,
  };

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  let finalBody = body;

  if (body !== undefined && body !== null) {
    const isString = typeof body === "string";
    finalHeaders["Content-Type"] = finalHeaders["Content-Type"] || "application/json";
    if (!isString) {
      finalBody = JSON.stringify(body);
    }
  }

  try {
    const res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: finalBody,
      signal,
    });

    const text = await res.text();

    // ✅ אם זה HTML (לא JSON) – הדפס תקציר ברור במקום מגילה
    if (text && text.trim().startsWith("<!DOCTYPE html")) {
      console.log("❌ Request Error: Server returned HTML (wrong BASE_URL / route). URL:", url);
      throw new Error("Server returned HTML instead of JSON. Check DEFAULT_BASE_URL / route.");
    }

    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text || null;
    }

    if (!res.ok) {
      const msg =
        (data && (data.error || data.message)) ||
        (typeof data === "string" ? data : null) ||
        `Request failed (${res.status})`;

      console.log("❌ Request Error:", msg);
      const err = new Error(msg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    console.log("❌ Request Error:", err?.message || err);
    throw err;
  }
}
