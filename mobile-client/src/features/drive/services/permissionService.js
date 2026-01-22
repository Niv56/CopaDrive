import { request } from "../../../shared_code/hooks/api/request";

/** Get all permissions for a file */
export async function getPermissions(token, fileId) {
    try {
        const response = await request(`/api/files/${fileId}/permissions`, {
            method: "GET",
            token,
        });


        // Server might return: { myRole: "owner", permissions: [...] }
        // OR just an array [...]

        let permissionsList = [];

        if (Array.isArray(response)) {
            // Direct array response
            permissionsList = response;
        } else if (response && Array.isArray(response.permissions)) {
            // Nested in permissions property
            permissionsList = response.permissions;
        } else {
            return [];
        }


        // Map the fields to match what ShareModal expects
        const mapped = permissionsList.map(perm => {

            return {
                id: perm.id || perm._id,
                userId: perm.userId,
                email: perm.email || "",
                firstName: perm.firstName || "",
                lastName: perm.lastName || "",
                image: perm.image || null,
                role: perm.role || "viewer"
            };
        });

        return mapped;
    } catch (error) {
        throw error;
    }
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