// client/src/api/filesApi.js

// 1) Internal callback for unauthorized responses
let unauthorizedHandler = null;

// 2) Exported setter that App.js expects
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

function getAuthToken() {
  return localStorage.getItem("token");
}

const BASE_URL = "http://localhost:3000";

/**
 * Unified request helper:
 * - Adds Authorization header
 * - Triggers unauthorizedHandler on 401
 * - Safely parses JSON / empty bodies
 * - Returns: parsed JSON, or null for 204/empty body
 */
export async function request(path, options = {}) {
  const token = getAuthToken();
  if (!token) throw new Error("Not authenticated");

  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (res.status === 401 && unauthorizedHandler) {
    unauthorizedHandler(); // triggers Modal in App.js
  }

  // No Content
  if (res.status === 204) return null;

  // Try read body (may be empty)
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
    // backend might return {error} or {message}
    const msg =
      (data && typeof data === "object" && (data.error || data.message)) ||
      "Request failed";
    throw new Error(msg);
  }

  return data;
}

/* -----------------------------
   Files / Drive
------------------------------ */

// ✅ Files list (My Drive + shared, as backend returns)
export async function getRootFiles() {
  return request("/api/files", { method: "GET" });
}

// ✅ Backend usage (owned files only)
export async function getStorageUsage() {
  return request("/api/files/usage", { method: "GET" });
}

// Backward compat (you had both names)
export async function getUsage() {
  return getStorageUsage();
}

export async function getFileById(fileId) {
  if (!fileId) throw new Error("fileId is required");
  return request(`/api/files/${fileId}`, { method: "GET" });
}


/**
 * Creates a new file or folder in the system.
 * Sends the data to the Node.js backend, which interacts with the C++ server via TCP.
 */
export async function createItem({
  name,
  type,
  parentId = null,
  content = "",
  mimeType = ""
}) {
  const body = {
    name,
    type,
    parentId,
    content: type === "file" ? content : "",
    mimeType: type === "file" ? mimeType : ""
  };

  return request("/api/files", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
  });
}

/**
 * ✅ Move to trash (soft delete)
 * Backend: DELETE /api/files/:id
 */
export async function deleteItem(fileId) {
  if (!fileId) throw new Error("fileId is required");
  return request(`/api/files/${fileId}`, { method: "DELETE" });
}

// nicer alias for UI wording
export async function moveToTrash(fileId) {
  return deleteItem(fileId);
}

export async function updateItem(fileId, patch) {
  if (!fileId) throw new Error("fileId is required");
  return request(`/api/files/${fileId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
}

/* -----------------------------
   Trash
------------------------------ */

/**
 * ✅ List trash
 * GET /api/files/trash
 */
export async function getTrashFiles() {
  return request("/api/files/trash", { method: "GET" });
}

/**
 * ✅ Restore from trash
 * PATCH /api/files/:id/trash  { trashed:false }
 */
export async function restoreFromTrash(fileId) {
  if (!fileId) throw new Error("fileId is required");
  return request(`/api/files/${fileId}/trash`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trashed: false }),
  });
}

/**
 * ✅ Delete forever
 * DELETE /api/files/:id/forever
 */
export async function deleteForever(fileId) {
  if (!fileId) throw new Error("fileId is required");
  return request(`/api/files/${fileId}/forever`, { method: "DELETE" });
}

/**
 * ✅ Empty trash
 * DELETE /api/files/trash/empty
 */
export async function emptyTrash() {
  return request("/api/files/trash/empty", { method: "DELETE" });
}

/* -----------------------------
   Starred / Important
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ starred: !!starred }),
  });
}

export async function setImportant(fileId, important) {
  if (!fileId) throw new Error("fileId is required");
  return request(`/api/files/${fileId}/important`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ important: !!important }),
  });
}

/* -----------------------------
   Recent / Access tracking
------------------------------ */

// ✅ Recent files: fetch from server only (per-user)
export async function getRecentFiles() {
  return request("/api/files/recent", { method: "GET" });
}

/**
 * Clean GET Flow: Fetches only the file metadata and content.
 */
export async function getFileData(fileId) {
  if (!fileId) throw new Error("fileId is required");
  return getFileById(fileId);
}

// 🎯 Open item:
// - folders open locally
// - files: PATCH to server for access tracking + fetch file content
export async function openItem(item, onFolderOpen = null) {
  if (!item) throw new Error("No item provided");

  if (item.type === "folder") {
    if (onFolderOpen) onFolderOpen(item);
    return null;
  }

  // ✅ עדכון per-user בשרת בלבד
  try {
    await request(`/api/files/${item.id}/access`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    });

    // ✅ רענן את Recent מהשרת
    window.dispatchEvent(new CustomEvent("reset-recent"));
  } catch (err) {
    console.error("Failed to record access:", err);
  }

  // שלוף את הקובץ
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

export async function findUserByEmail(email) {
  const token = getAuthToken();
  const response = await fetch(
    `http://localhost:3000/api/users/email/${email}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!response.ok) return null;
  return response.json();
}

export async function addFilePermission(fileId, targetUserId) {
  const token = getAuthToken();
  const response = await fetch(
    `http://localhost:3000/api/files/${fileId}/permissions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: targetUserId }),
    }
  );
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to share");
  }
  return response.json();
}

/* -----------------------------
   Search
------------------------------ */

export async function searchItems(query) {
  if (query === undefined || query === null)
    throw new Error("query is required");
  const q = encodeURIComponent(String(query));
  return request(`/api/search/${q}`, { method: "GET" });
}

/* -----------------------------
   Users
------------------------------ */

export async function getCurrentUser(userId) {
  if (!userId) throw new Error("userId is required");
  return request(`/api/users/${userId}`, { method: "GET" });
}

export async function updateUserProfile(userId, patch) {
  if (!userId) throw new Error("userId is required");
  return request(`/api/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
}

export async function changeUserPassword(userId, currentPassword, newPassword) {
  if (!userId) throw new Error("userId is required");
  return request(`/api/users/${userId}/password`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}