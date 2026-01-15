// client/src/api/permissionsApi.js
import { request } from "./request";

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

export async function addPermission(fileId, userId) {
    return request(`/api/files/${fileId}/permissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
    });
}

export async function togglePermissionRole(fileId, permissionId) {
    return request(`/api/files/${fileId}/permissions/${permissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
    });
}

export async function deletePermission(fileId, permissionId) {
    return request(`/api/files/${fileId}/permissions/${permissionId}`, {
        method: "DELETE",
    });
}

export async function findUserByEmail(email) {
    const safe = encodeURIComponent(String(email).trim());
    return request(`/api/users/email/${safe}`, { method: "GET" });
}