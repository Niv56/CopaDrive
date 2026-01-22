import { request } from "../../../shared_code/hooks/api/request";

/**
 * File Service
 * Handles all API interactions for file and folder management.
 */

// Basic CRUD operations
export async function getFiles(token) {
  return request("/api/files", { method: "GET", token });
}

export async function getFileById(token, fileId) {
  return request(`/api/files/${fileId}`, { method: "GET", token });
}

export async function updateItem(token, fileId, patch) {
  return request(`/api/files/${fileId}`, { method: "PATCH", token, body: patch });
}

// Unified creation logic for folders and files
export async function createItem(
  token,
  { name, type, parentId = null, content = "", mimeType = "" }
) {
  return request("/api/files", {
    method: "POST",
    token,
    body: {
      name,
      type,
      parentId,
      content: type === "file" ? content : "",
      mimeType: type === "file" ? mimeType : "",
    },
  });
}

export async function createFile(token, fileData) {
  return createItem(token, { ...fileData, type: "file" });
}

export async function createFolder(token, name, parentId = null) {
  return createItem(token, { name, type: "folder", parentId });
}

// Specialized list views and stats
export async function getUsage(token) {
  return request("/api/files/usage", { method: "GET", token });
}

export async function getRecentFiles(token) {
  return request("/api/files/recent", { method: "GET", token });
}

export async function getImportantFiles(token) {
  return request("/api/files/important", { method: "GET", token });
}


export async function recordAccess(token, fileId) {
  if (!fileId) return null;
  return request(`/api/files/${fileId}/access`, { method: "PATCH", token });
}

// Trash management logic
export async function getTrashFiles(token) {
  return request("/api/files/trash", { method: "GET", token });
}

export async function moveToTrash(token, fileId) {
  return request(`/api/files/${fileId}/trash`, {
    method: "PATCH",
    token,
    body: { trashed: true },
  });
}

export async function restoreFromTrash(token, fileId) {
  return request(`/api/files/${fileId}/trash`, {
    method: "PATCH",
    token,
    body: { trashed: false },
  });
}

export async function deleteForever(token, fileId) {
  return request(`/api/files/${fileId}/forever`, { method: "DELETE", token });
}

export async function emptyTrash(token) {
  return request("/api/files/trash/empty", { method: "DELETE", token });
}

// Item flag toggles
export async function setStarred(token, fileId, starred) {
  return request(`/api/files/${fileId}/star`, {
    method: "PATCH",
    token,
    body: { starred: !!starred },
  });
}

export async function setImportant(token, fileId, important) {
  return request(`/api/files/${fileId}/important`, {
    method: "PATCH",
    token,
    body: { important: !!important },
  });
}

export async function renameItem(token, fileId, name) {
  return request(`/api/files/${fileId}`, {
    method: "PATCH",
    token,
    body: { name },
  });
}

/** Utility: Calculates remaining days before permanent deletion (30-day policy) */
export function getDaysLeft(trashedAt) {
  if (!trashedAt) return "";
  const trashDate = new Date(trashedAt);
  const deleteDate = new Date(trashDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diffTime = deleteDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? `${diffDays} days left` : "Deleting soon";
}

/** Utility: Formats date string into a relative human-readable format */
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