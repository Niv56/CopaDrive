import { request } from "../../../shared_code/hooks/api/request";

/** מושך את כל הקבצים בתיקיית השורש */
export async function getFiles(token) {
    return request("/api/files", { 
        method: "GET", 
        token: token 
    });
}

/* ===========================================================
    📍 יצירת פריטים (קבצים ותיקיות) - עבור ה-FAB 📍
   =========================================================== */

/** * פונקציה ראשית ליצירת פריט (תיקייה או קובץ).
 * ה-FAB משתמש בפונקציה הזו כדי לתמוך בכל הסוגים.
 *
 */
export async function createItem(token, { name, type, parentId = null, content = "", mimeType = "" }) {
    return request("/api/files", {
        method: "POST",
        token: token,
        body: JSON.stringify({
            name,
            type,
            parentId,
            // תוכן נשלח רק אם זה קובץ, אחרת מחרוזת ריקה
            content: type === "file" ? content : "", 
            mimeType: type === "file" ? mimeType : ""
        })
    });
}

/** מעטפת ליצירת קובץ (משתמשת ב-createItem) */
export async function createFile(token, fileData) {
    // fileData מכיל: { name, content, mimeType }
    return createItem(token, { ...fileData, type: 'file' });
}

/** מעטפת ליצירת תיקייה (משתמשת ב-createItem) */
export async function createFolder(token, name, parentId = null) {
    return createItem(token, { name, type: 'folder', parentId });
}

/* ===========================================================
    📍 נתונים וסטטיסטיקות 📍
   =========================================================== */

export async function getUsage(token) {
    return request("/api/files/usage", {
        method: "GET",
        token: token
    }); 
}

/* ===========================================================
    📍 פונקציות נוספות (Recent, Trash, Important) 📍
   =========================================================== */

export async function getRecentFiles(token) {
    return request("/api/files/recent", { method: "GET", token });
}

export async function getImportantFiles(token) {
    return request("/api/files/important", { method: "GET", token });
}

export async function getTrashFiles(token) {
    return request("/api/files/trash", { method: "GET", token });
}

export async function restoreFromTrash(token, fileId) {
    return request(`/api/files/${fileId}/trash`, {
        method: "PATCH",
        token: token,
        body: JSON.stringify({ trashed: false }),
    });
}

export async function deleteForever(token, fileId) {
    return request(`/api/files/${fileId}/forever`, { method: "DELETE", token });
}

export async function emptyTrash(token) {
    return request("/api/files/trash/empty", { method: "DELETE", token });
}

/* ===========================================================
    📍 עזרי תאריכים (Helpers) 📍
   =========================================================== */

export function getDaysLeft(trashedAt) {
    if (!trashedAt) return "";
    const trashDate = new Date(trashedAt);
    const deleteDate = new Date(trashDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diffTime = deleteDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days left` : "Deleting soon";
}

export function formatLastAccessed(dateString) {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const diffMs = new Date() - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)} hours ago`;
    return date.toLocaleDateString();
}
export async function setStarred(token, fileId, starred) {
  // TODO: if your backend uses a different route – change ONLY this URL.
  return request(`/api/files/${fileId}`, {
    method: "PATCH",
    token,
    body: { starred: !!starred },
  });
}

// ✅ toggle important
export async function setImportant(token, fileId, important) {
  // TODO: if your backend uses a different route – change ONLY this URL.
  return request(`/api/files/${fileId}`, {
    method: "PATCH",
    token,
    body: { important: !!important },
  });
}

// ✅ rename (file or folder)
export async function renameItem(token, fileId, name) {
  // TODO: if your backend uses a different route – change ONLY this URL.
  return request(`/api/files/${fileId}`, {
    method: "PATCH",
    token,
    body: { name },
  });
}