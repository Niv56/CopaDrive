import Constants from "expo-constants";

// פונקציה חכמה שמחלצת את ה-IP של המחשב שמריץ את ה-Expo
const getBaseUrl = () => {
  // אם הוגדר משתנה סביבה ידני (למשל בפרודקשן) - נשתמש בו
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL.replace(/\/api\/?$/, "").replace(/\/$/, "");
  }

  // אחרת, נשתמש בכתובת של ה-Debugger של Expo (זה בעצם ה-IP של המחשב שלך ברשת ה-Wifi)
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(":")[0];

  if (!localhost) {
    // Fallback למקרה קיצון (כמו סימולטור מקומי)
    return "http://localhost:3000";
  }

  // מחזיר את הכתובת הדינמית עם הפורט של השרת (3000)
  return `http://${localhost}:3000`;
};

const API_BASE_URL = getBaseUrl();

console.log("🔧 Dynamic API_BASE_URL:", API_BASE_URL);

export async function request(path, options = {}) {
  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  
  // Build the full URL
  const url = `${API_BASE_URL}${normalizedPath}`;
  
  console.log("📡 Request:", options.method || "GET", url);

  try {
    const isFormData = options.body instanceof FormData;

    const headers = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    };

    if (options.token) {
      headers["Authorization"] = `Bearer ${options.token}`;
    }

    const res = await fetch(url, {
      ...options,
      headers,
      body: isFormData ? options.body : (options.body ? JSON.stringify(options.body) : undefined),
    });

    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const msg =
        (data && (data.message || data.error)) ||
        (typeof data === "string" && data) ||
        `Request failed (${res.status})`;
      throw new Error(msg);
    }

    return data;
  } catch (error) {
    console.error("Request Error:", error?.message || error);
    throw error;
  }
}