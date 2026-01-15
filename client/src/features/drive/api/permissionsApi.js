import { request } from "./request";

/** Maps raw API permission objects to a consistent internal schema */
function normalizePermission(p) {
    const u = p?.user || {};
    return {
        id: p?.id ?? p?._id ?? p?.permissionId,
        userId: p?.userId ?? u?.id ?? u?._id,
        email: p?.email ?? p?.userEmail ?? u?.email ?? "",
        role: p?.role ?? "viewer",
        firstName: p?.firstName ?? u?.firstName ?? "",
        lastName: p?.lastName ?? u?.lastName ?? "",
        image: p?.image ?? u?.image ?? u?.avatar ?? ""
    };
}

/** Fetches and normalizes permission list and user's own role for a file */
export async function getPermissions(fileId) {
    const data = await request(`/api/files/${fileId}/permissions`, { method: "GET" });
    if (Array.isArray(data)) {
        return { myRole: null, permissions: data.map(normalizePermission) };
    }
    return {
        myRole: data?.myRole ?? null,
        permissions: Array.isArray(data?.permissions) ? data.permissions.map(normalizePermission) : [],
    };
}

/** Grants a user access to a file with a specified role */
export async function addPermission(fileId, userId, role = "viewer") {
    return request(`/api/files/${fileId}/permissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
    });
}

/** Toggles or updates the role of an existing permission */
export async function togglePermissionRole(fileId, permissionId) {
    return request(`/api/files/${fileId}/permissions/${permissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
    });
}

/** Revokes access by deleting a specific permission record */
export async function deletePermission(fileId, permissionId) {
    return request(`/api/files/${fileId}/permissions/${permissionId}`, {
        method: "DELETE",
    });
}

/** Searches for a registered user by email for sharing purposes */
export async function findUserByEmail(email) {
    const safe = encodeURIComponent(String(email).trim());
    return request(`/api/users/email/${safe}`, { method: "GET" });
}