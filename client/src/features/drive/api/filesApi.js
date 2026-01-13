let unauthorizedHandler = null;

// Set a callback to run when the backend returns 401 (used by App.js).
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

// Read the JWT token from localStorage.
function getAuthToken() {
  return localStorage.getItem("token");
}

const BASE_URL = "http://localhost:3000";

<<<<<<< HEAD:client/src/features/drive/api/filesApi.js
// Send an authenticated request, handle 401 via unauthorizedHandler, and parse JSON/empty bodies safely.
async function request(path, options = {}) {
=======
/**
 * Unified request helper:
 * - Adds Authorization header
 * - Triggers unauthorizedHandler on 401
 * - Safely parses JSON / empty bodies
 * - Returns: parsed JSON, or null for 204/empty body
 */
export async function request(path, options = {}) {
>>>>>>> d20b577 (Permissions Added):client/src/api/filesApi.js
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
    // backend might return {error} or {message}
    const msg =
      (data && typeof data === "object" && (data.error || data.message)) || "Request failed";
    throw new Error(msg);
  }

  return data;
}

<<<<<<< HEAD:client/src/features/drive/api/filesApi.js
// Get the root files list (owned + shared as returned by backend).
=======
/* -----------------------------
   Files / Drive
------------------------------ */

// ✅ Files list (My Drive + shared, as backend returns)
>>>>>>> 9d61e09 (Revert "Register validation"):client/src/api/filesApi.js
export async function getRootFiles() {
  return request("/api/files", { method: "GET" });
}

<<<<<<< HEAD:client/src/features/drive/api/filesApi.js
// Get storage usage for owned files only.
=======
// ✅ Backend usage (owned files only)
>>>>>>> 9d61e09 (Revert "Register validation"):client/src/api/filesApi.js
export async function getStorageUsage() {
  return request("/api/files/usage", { method: "GET" });
}

<<<<<<< HEAD:client/src/features/drive/api/filesApi.js
// Backward-compatible alias.
=======
// Backward compat (you had both names)
>>>>>>> 9d61e09 (Revert "Register validation"):client/src/api/filesApi.js
export async function getUsage() {
  return getStorageUsage();
}

// Fetch a file/folder by id.
export async function getFileById(fileId) {
  if (!fileId) throw new Error("fileId is required");
  return request(`/api/files/${fileId}`, { method: "GET" });
}

<<<<<<< HEAD:client/src/features/drive/api/filesApi.js
// Create a file/folder (content is used only for files).
export async function createItem({ name, type, parentId = null, content = "" }) {
=======

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
>>>>>>> 16c8ff5 (about to finish):client/src/api/filesApi.js
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

// Move an item to trash (soft delete).
export async function deleteItem(fileId) {
  if (!fileId) throw new Error("fileId is required");
  return request(`/api/files/${fileId}`, { method: "DELETE" });
}

// Alias for UI wording.
export async function moveToTrash(fileId) {
  return deleteItem(fileId);
}

// Update a file/folder with a patch object.
export async function updateItem(fileId, patch) {
  if (!fileId) throw new Error("fileId is required");
  return request(`/api/files/${fileId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
}

<<<<<<< HEAD:client/src/features/drive/api/filesApi.js
// List items in the user's trash.
=======
/* -----------------------------
   Trash
------------------------------ */

/**
 * ✅ List trash
 * GET /api/files/trash
 */
>>>>>>> 9d61e09 (Revert "Register validation"):client/src/api/filesApi.js
export async function getTrashFiles() {
  return request("/api/files/trash", { method: "GET" });
}

<<<<<<< HEAD:client/src/features/drive/api/filesApi.js
// Restore an item from trash.
=======
/**
 * ✅ Restore from trash
 * PATCH /api/files/:id/trash  { trashed:false }
 */
>>>>>>> 9d61e09 (Revert "Register validation"):client/src/api/filesApi.js
export async function restoreFromTrash(fileId) {
  if (!fileId) throw new Error("fileId is required");
  return request(`/api/files/${fileId}/trash`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trashed: false }),
  });
}

<<<<<<< HEAD:client/src/features/drive/api/filesApi.js
// Permanently delete an item (or remove-from-trash for non-owner).
=======
/**
 * ✅ Delete forever
 * DELETE /api/files/:id/forever
 */
>>>>>>> 9d61e09 (Revert "Register validation"):client/src/api/filesApi.js
export async function deleteForever(fileId) {
  if (!fileId) throw new Error("fileId is required");
  return request(`/api/files/${fileId}/forever`, { method: "DELETE" });
}

<<<<<<< HEAD:client/src/features/drive/api/filesApi.js
// Empty the user's trash.
=======
/**
 * ✅ Empty trash
 * DELETE /api/files/trash/empty
 */
>>>>>>> 9d61e09 (Revert "Register validation"):client/src/api/filesApi.js
export async function emptyTrash() {
  return request("/api/files/trash/empty", { method: "DELETE" });
}

// List starred items.
export async function getStarredFiles() {
  return request("/api/files/starred", { method: "GET" });
}

// List important items.
export async function getImportantFiles() {
  return request("/api/files/important", { method: "GET" });
}

// Toggle the starred flag on an item.
export async function setStarred(fileId, starred) {
  if (!fileId) throw new Error("fileId is required");
  return request(`/api/files/${fileId}/star`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ starred: !!starred }),
  });
}

// Toggle the important flag on an item.
export async function setImportant(fileId, important) {
  if (!fileId) throw new Error("fileId is required");
  return request(`/api/files/${fileId}/important`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ important: !!important }),
  });
}

<<<<<<< HEAD:client/src/features/drive/api/filesApi.js
// Get recent files (fallback: sort root files by lastAccessed).
=======
/* -----------------------------
   Recent / Access tracking
------------------------------ */

<<<<<<< HEAD:client/src/features/drive/api/filesApi.js
<<<<<<< HEAD:client/src/features/drive/api/filesApi.js
// ✅ Recent files (prefer backend endpoint if exists; fallback to sorting root files)
>>>>>>> 9d61e09 (Revert "Register validation"):client/src/api/filesApi.js
export async function getRecentFiles() {
  // If you have backend route GET /api/files/recent, uncomment the next line and delete fallback:
  // return request("/api/files/recent", { method: "GET" });
=======
const RECENT_KEY = "copa_recent_v1";
const RECENT_LIMIT = 50;
>>>>>>> 7194425 (RECENT ADDED):client/src/api/filesApi.js

function safeJsonParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

<<<<<<< HEAD:client/src/features/drive/api/filesApi.js
<<<<<<< HEAD:client/src/features/drive/api/filesApi.js
<<<<<<< HEAD:client/src/features/drive/api/filesApi.js
// Open an item: folders open locally; files update access time then fetch content.
=======

/**
 * Clean GET Flow: Fetches only the file metadata and content.
 * No access tracking (PATCH) involved.
 */
export async function getFileData(fileId) {
  if (!fileId) throw new Error("fileId is required");
  
  // קריאה ישירה ל-GET /api/files/:id
  // הפונקציה הזו כבר מוגדרת אצלך ב-API ומשתמשת ב-method: "GET"
  return getFileById(fileId);
}


// 🎯 Open item: folders open locally; files update access time in background then fetch content
>>>>>>> 16c8ff5 (about to finish):client/src/api/filesApi.js
=======
// 🎯 Open item: folders open locally; files update access time in background then fetch content
>>>>>>> 9d61e09 (Revert "Register validation"):client/src/api/filesApi.js
=======
function readRecentMap() {
  // map: { [fileId]: isoDateString }
  const raw = localStorage.getItem(RECENT_KEY);
  const obj = raw ? safeJsonParse(raw, {}) : {};
  return obj && typeof obj === "object" ? obj : {};
}

function writeRecentMap(map) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(map));
  } catch {
    // ignore storage quota / privacy mode
  }
}

function touchRecentLocal(fileId) {
  if (!fileId) return;

  const nowIso = new Date().toISOString();
  const map = readRecentMap();
  map[fileId] = nowIso;

  // keep last RECENT_LIMIT by sorting keys by date
  const entries = Object.entries(map)
    .filter(([, v]) => !!v)
    .sort((a, b) => new Date(b[1]) - new Date(a[1]));

  const trimmed = entries.slice(0, RECENT_LIMIT);
  const next = {};
  for (const [id, iso] of trimmed) next[id] = iso;

  writeRecentMap(next);
}

// ✅ Recent files: merge local recent timestamps into server list
=======
// ✅ Recent files: fetch from server only (per-user)
>>>>>>> 282a37b (BUGS FIXED):client/src/api/filesApi.js
export async function getRecentFiles() {
  return request("/api/files/recent", { method: "GET" });
}

<<<<<<< HEAD:client/src/features/drive/api/filesApi.js
<<<<<<< HEAD:client/src/features/drive/api/filesApi.js
// 🎯 Open item:
// - folders open locally
// - files: update local recent immediately + try PATCH to server (if exists) + fetch file content
>>>>>>> 7194425 (RECENT ADDED):client/src/api/filesApi.js
=======

=======
>>>>>>> 282a37b (BUGS FIXED):client/src/api/filesApi.js
/**
 * Clean GET Flow: Fetches only the file metadata and content.
 */
export async function getFileData(fileId) {
  if (!fileId) throw new Error("fileId is required");
  return getFileById(fileId);
}

// 🎯 Open item:
// - folders open locally
<<<<<<< HEAD:client/src/features/drive/api/filesApi.js
>>>>>>> daea503 (fiinish edit branch):client/src/api/filesApi.js
=======
// - files: PATCH to server for access tracking + fetch file content
>>>>>>> 282a37b (BUGS FIXED):client/src/api/filesApi.js
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

// Format lastAccessed timestamps for UI.
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

<<<<<<< HEAD:client/src/features/drive/api/filesApi.js
// Find a user by email (returns null if not found).
=======
>>>>>>> 9d61e09 (Revert "Register validation"):client/src/api/filesApi.js
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

// Add a viewer permission for a target user on a given file/folder.
export async function addFilePermission(fileId, targetUserId) {
  const token = getAuthToken();
<<<<<<< HEAD:client/src/features/drive/api/filesApi.js
  const response = await fetch(`http://localhost:3000/api/files/${fileId}/permissions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId: targetUserId }),
  });

=======
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
>>>>>>> 9d61e09 (Revert "Register validation"):client/src/api/filesApi.js
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to share");
  }
<<<<<<< HEAD:client/src/features/drive/api/filesApi.js

  return response.json();
}

// Search items by query (name/content depending on backend).
export async function searchItems(query) {
  if (query === undefined || query === null) throw new Error("query is required");
  const q = encodeURIComponent(String(query));
  return request(`/api/search/${q}`, { method: "GET" });
}

// Fetch a user by id (used for owner display).
export async function getCurrentUser(userId) {
  if (!userId) throw new Error("userId is required");
  return request(`/api/users/${userId}`, { method: "GET" });
}

<<<<<<< HEAD:client/src/features/drive/api/filesApi.js
// Update the current user's profile fields.
export async function updateUserProfile(userId, patch) {
  if (!userId) throw new Error("userId is required");
  return request(`/api/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
}

// Change the current user's password.
export async function changeUserPassword(userId, currentPassword, newPassword) {
  if (!userId) throw new Error("userId is required");
  return request(`/api/users/${userId}/password`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
=======
/* -----------------------------
   Permissions
------------------------------ */

export async function getFilePermissions(fileId) {
  if (!fileId) throw new Error("fileId is required");
  return request(`/api/files/${fileId}/permissions`, { method: "GET" });
}

export async function patchFilePermission(fileId, permissionId) {
  if (!fileId) throw new Error("fileId is required");
  if (!permissionId) throw new Error("permissionId is required");
  return request(`/api/files/${fileId}/permissions/${permissionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
  });
}

export async function deleteFilePermission(fileId, permissionId) {
  if (!fileId) throw new Error("fileId is required");
  if (!permissionId) throw new Error("permissionId is required");
  return request(`/api/files/${fileId}/permissions/${permissionId}`, {
    method: "DELETE",
  });
}
>>>>>>> 9993c1b (changes):client/src/api/filesApi.js
=======
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
<<<<<<< HEAD:client/src/features/drive/api/filesApi.js
}
<<<<<<< HEAD:client/src/features/drive/api/filesApi.js

>>>>>>> 9d61e09 (Revert "Register validation"):client/src/api/filesApi.js
=======
>>>>>>> 7194425 (RECENT ADDED):client/src/api/filesApi.js
=======
}
>>>>>>> 282a37b (BUGS FIXED):client/src/api/filesApi.js
