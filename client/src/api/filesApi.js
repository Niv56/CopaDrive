function getAuthToken() {
  return localStorage.getItem("token"); // ✅ שונה מ-"accessToken"
}

export async function getRootFiles() {
  const token = getAuthToken();
  if (!token) throw new Error("Not authenticated");

  // ✅ URL מלא
  const response = await fetch("http://localhost:3000/api/files", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Failed to fetch files");
  return response.json();
}

// Post api/files 
export async function createItem({ name, type, parentId = null, content = "" }) {
  const token = getAuthToken();
  if (!token) throw new Error("Not authenticated");

  const body = {
    name,
    type,
    parentId,
    content: type === "file" ? content : "",
  };

  // ✅ URL מלא
  const response = await fetch("http://localhost:3000/api/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to create item");
  }

  return response.json();
}

export async function getFileById(id) {
  const token = getAuthToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`http://localhost:3000/api/files/${id}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Failed to fetch file content");
  return response.json();
}

export async function getCurrentUser(userId) {
  const token = localStorage.getItem("token");
  const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch user data");
  return response.json();
}

// ============================================================================
// 🕒 לוגיקת קבצים אחרונים - תוספת עבור RecentView
// ============================================================================

export async function getRecentFiles() {
  const data = await getRootFiles();
  return Array.isArray(data)
    ? data
      .filter((f) => f.type === "file")
      // מיון לפי lastAccessed (זמן פתיחה) כפי שמוגדר בשרת שלך
      .sort((a, b) => new Date(b.lastAccessed || 0) - new Date(a.lastAccessed || 0))
      .slice(0, 20)
    : [];
}

export async function openItem(item, onFolderOpen = null) {
  if (!item) throw new Error("No item provided");

  if (item.type === "folder") {
    if (onFolderOpen) onFolderOpen(item);
    return null;
  }

  const token = getAuthToken();
  // שליחה לנתיב ה-access הייעודי שהוספנו בשרת
  fetch(`http://localhost:3000/api/files/${item.id}/access`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  }).catch(() => { });

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