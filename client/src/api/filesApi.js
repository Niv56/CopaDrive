function getAuthToken() {
  return localStorage.getItem("token");
}

const BASE_URL = "http://localhost:3000";

async function request(url, options = {}) {
  const token = getAuthToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (res.status === 204) return null;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(data?.error || data?.message || "Request failed");
  }

  return data;
}

// ✅ Files list (My Drive / includes shared items too)
export async function getRootFiles() {
  return request(`${BASE_URL}/api/files`, { method: "GET" });
}

// ✅ Usage (owned files only, from backend)
export async function getStorageUsage() {
  return request(`${BASE_URL}/api/files/usage`, { method: "GET" });
}

export async function getFileById(fileId) {
  if (!fileId) throw new Error("fileId is required");
  return request(`${BASE_URL}/api/files/${fileId}`, { method: "GET" });
}

export async function createItem({ name, type, parentId = null, content = "" }) {
  const body = {
    name,
    type,
    parentId,
    content: type === "file" ? content : "",
  };

  return request(`${BASE_URL}/api/files`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function deleteItem(fileId) {
  if (!fileId) throw new Error("fileId is required");
  return request(`${BASE_URL}/api/files/${fileId}`, { method: "DELETE" });
}

export async function updateItem(fileId, patch) {
  if (!fileId) throw new Error("fileId is required");
  return request(`${BASE_URL}/api/files/${fileId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
}

// Lists
export async function getStarredFiles() {
  return request(`${BASE_URL}/api/files/starred`, { method: "GET" });
}

export async function getImportantFiles() {
  return request(`${BASE_URL}/api/files/important`, { method: "GET" });
}

// Toggles
export async function setStarred(fileId, starred) {
  if (!fileId) throw new Error("fileId is required");

  return request(`${BASE_URL}/api/files/${fileId}/star`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ starred: !!starred }),
  });
}

export async function setImportant(fileId, important) {
  if (!fileId) throw new Error("fileId is required");

  return request(`${BASE_URL}/api/files/${fileId}/important`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ important: !!important }),
  });
}
export async function getUsage() {
  return request(`${BASE_URL}/api/files/usage`, { method: "GET" });
}
