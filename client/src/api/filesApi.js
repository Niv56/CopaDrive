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
   (NO new files. Purely inside filesApi.js)
------------------------------ */

const RECENT_KEY = "copa_recent_v1";
const RECENT_LIMIT = 50;

function safeJsonParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

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
export async function getRecentFiles() {
  const data = await getRootFiles();
  const files = Array.isArray(data) ? data : [];

  const recentMap = readRecentMap();

  // merge local timestamps into items (only for files)
  const merged = files.map((f) => {
    if (f?.type !== "file") return f;

    const localIso = recentMap?.[f.id];
    if (!localIso) return f;

    // if server has lastAccessed, take the latest between server/local
    const serverIso = f.lastAccessed;
    if (!serverIso) return { ...f, lastAccessed: localIso };

    const best =
      new Date(localIso) > new Date(serverIso) ? localIso : serverIso;

    return { ...f, lastAccessed: best };
  });

  return merged
    .filter((f) => f.type === "file" && f.lastAccessed)
    .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))
    .slice(0, 20);
}


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

// 🎯 Open item:
// - folders open locally
// - files: update local recent immediately + try PATCH to server (if exists) + fetch file content
export async function openItem(item, onFolderOpen = null) {
  if (!item) throw new Error("No item provided");

  if (item.type === "folder") {
    if (onFolderOpen) onFolderOpen(item);
    return null;
  }

  // 1) update local recent immediately (so Recent screen ALWAYS works)
  touchRecentLocal(item.id);
  window.dispatchEvent(new CustomEvent("reset-recent"));

  // 2) try update access time in backend (optional)
  request(`/api/files/${item.id}/access`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
  }).catch(() => { });

  // 3) fetch file
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
      body: JSON.stringify({ userId: targetUserId }), // השרת קובע תפקיד "viewer" כברירת מחדל
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
