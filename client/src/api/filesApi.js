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

// client/src/api/filesApi.js
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