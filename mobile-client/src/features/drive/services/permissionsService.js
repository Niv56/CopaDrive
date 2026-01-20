// mobile-client/src/features/drive/services/permissionService.js

import { request } from "../../../shared_code/hooks/api/request";

/** Get all permissions for a file */
export async function getPermissions(token, fileId) {
    return request(`/api/files/${fileId}/permissions`, {
        method: "GET",
        token,
    });
}

/** Add permission (share with user) */
export async function addPermission(token, fileId, userId, role = "viewer") {
    return request(`/api/files/${fileId}/permissions`, {
        method: "POST",
        token,
        body: { userId, role },
    });
}

/** Update permission role */
export async function updatePermission(token, fileId, permissionId, role) {
    return request(`/api/files/${fileId}/permissions/${permissionId}`, {
        method: "PATCH",
        token,
        body: { role },
    });
}

/** Delete permission (revoke access) */
export async function deletePermission(token, fileId, permissionId) {
    return request(`/api/files/${fileId}/permissions/${permissionId}`, {
        method: "DELETE",
        token,
    });
}

/** Find user by email (for sharing) */
export async function findUserByEmail(token, email) {
    const safe = encodeURIComponent(String(email).trim());
    return request(`/api/users/email/${safe}`, {
        method: "GET",
        token,
    });
}