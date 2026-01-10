function getAuthToken() {
  return localStorage.getItem("accessToken");
}

export async function getRootFiles() {
  const token = getAuthToken();
  if (!token) throw new Error("Not authenticated");



//Get api/files - all files in top level
  const response = await fetch("/api/files", {
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

  const response = await fetch("/api/files", {
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
