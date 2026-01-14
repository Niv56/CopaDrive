// src/features/drive/api/filesApi.js

let unauthorizedHandler = null;

// Set a callback for 401 Unauthorized responses (used in App.js)
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

function getAuthToken() {
  return localStorage.getItem("token");
}

const BASE_URL = "http://localhost:3000";

// Unified authenticated request helper
async function request(path, options = {}) {
  const token = getAuthToken();
  if (!token) throw new Error("Not authenticated");

  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json", // Default to JSON, can be overridden
      ...(options.headers || {}),
    },
  });

  if (res.status === 401 && unauthorizedHandler) {
    unauthorizedHandler();
  }

  if (res.status === 204) return null;

  const text = await res.text();
  const data = text
    ? (() => {
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      })()
    : null;

  if (!res.ok) {
    const msg = (data && typeof data === "object" && (data.error || data.message)) || "Request failed";
    throw new Error(msg);
  }

  return data;
}

/* -----------------------------
    Files / Drive Operations
------------------------------ */

export async function getRootFiles() {
  return request("/api/files", { method: "GET" });
}

export async function getStorageUsage() {
  return request("/api/files/usage", { method: "GET" });
}

export async function getUsage() {
  return getStorageUsage();
}

export async function getFileById(fileId) {
  if (!fileId) throw new Error("fileId is required");
  return request(`/api/files/${fileId}`, { method: "GET" });
}

export async function createItem({ name, type, parentId = null, content = "", mimeType = "" }) {
  const body = {
    name,
    type,
    parentId,
    content: type === "file" ? content : "",
    mimeType: type === "file" ? mimeType : "" 
  };

  return request("/api/files", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateItem(fileId, patch) {
  if (!fileId) throw new Error("fileId is required");
  return request(`/api/files/${fileId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

/* -----------------------------
    Trash Management
------------------------------ */

export async function deleteItem(fileId) {
  if (!fileId) throw new Error("fileId is required");
  return request(`/api/files/${fileId}`, { method: "DELETE" });
}

export async function moveToTrash(fileId) {
  return deleteItem(fileId);
}

export async function getTrashFiles() {
  return request("/api/files/trash", { method: "GET" });
}

export async function restoreFromTrash(fileId) {
  if (!fileId) throw new Error("fileId is required");
  return request(`/api/files/${fileId}/trash`, {
    method: "PATCH",
    body: JSON.stringify({ trashed: false }),
  });
}

export async function deleteForever(fileId) {
  if (!fileId) throw new Error("fileId is required");
  return request(`/api/files/${fileId}/forever`, { method: "DELETE" });
}

export async function emptyTrash() {
  return request("/api/files/trash/empty", { method: "DELETE" });
}

/* -----------------------------
    Flags & Favorites
------------------------------ */

export async function getStarredFiles() {
  return request("/api/files/starred", { method: "GET" });
}

export async function getImportantFiles() {
  return request("/api/files/important", { method: "GET" });
}

export async function setStarred(fileId, starred) {
  if (!fileId) throw new Error("fileId is required");
  return request(`/api/files/${fileId}/star`, {
    method: "PATCH",
    body: JSON.stringify({ starred: !!starred }),
  });
}

export async function setImportant(fileId, important) {
  if (!fileId) throw new Error("fileId is required");
  return request(`/api/files/${fileId}/important`, {
    method: "PATCH",
    body: JSON.stringify({ important: !!important }),
  });
}

/* -----------------------------
    Recent & Access Tracking
------------------------------ */

export async function getRecentFiles() {
  return request("/api/files/recent", { method: "GET" });
}

export async function getFileData(fileId) {
  if (!fileId) throw new Error("fileId is required");
  return getFileById(fileId);
}

export async function openItem(item, onFolderOpen = null) {
  if (!item) throw new Error("No item provided");

  if (item.type === "folder") {
    if (onFolderOpen) onFolderOpen(item);
    return null;
  }

  try {
    await request(`/api/files/${item.id}/access`, {
      method: "PATCH",
    });
    window.dispatchEvent(new CustomEvent("reset-recent"));
  } catch (err) {
    console.error("Failed to record access:", err);
  }

  return getFileById(item.id);
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

/* -----------------------------
    Search & Permissions
------------------------------ */

export async function searchItems(query) {
  if (query === undefined || query === null) throw new Error("query is required");
  const q = encodeURIComponent(String(query));
  return request(`/api/search/${q}`, { method: "GET" });
}

// FIXED: Now uses the 'request' helper
export async function findUserByEmail(email) {
  return request(`/api/users/email/${email}`, { method: "GET" });
}

// FIXED: Now uses the 'request' helper
export async function addFilePermission(fileId, targetUserId) {
  return request(`/api/files/${fileId}/permissions`, {
    method: "POST",
    body: JSON.stringify({ userId: targetUserId }),
  });
}

/* -----------------------------
    User Management
------------------------------ */

export async function getCurrentUser(userId) {
  if (!userId) throw new Error("userId is required");
  return request(`/api/users/${userId}`, { method: "GET" });
}

export async function updateUserProfile(userId, patch) {
  if (!userId) throw new Error("userId is required");
  return request(`/api/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function changeUserPassword(userId, currentPassword, newPassword) {
  if (!userId) throw new Error("userId is required");
  return request(`/api/users/${userId}/password`, {
    method: "PATCH",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}