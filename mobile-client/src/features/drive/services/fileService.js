import { request } from "../../../shared_code/hooks/api/request";

export async function getFiles(token) {
    return request("/api/files", { method: "GET", token: token });
}

// פונקציה חדשה ליצירת פריט
export async function createFile(token, fileData) {
    /* ===========================================================
       📍 אזור קריאה לשרת - התאמה עתידית ל-MONGODB 📍
       כאן מתבצעת הבקשה ל-NodeJS. כשנרצה לשנות ל-MongoDB, 
       נוודא שה-Body תואם לסכימה החדשה שלנו.
       ===========================================================
    */
    return request("/api/files", {
        method: "POST",
        token: token,
        body: fileData // מכיל { name, type: 'file', content, mimeType }
    });
}