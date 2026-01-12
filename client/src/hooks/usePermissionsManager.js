// client/src/hooks/usePermissionsManager.js
import { useState, useEffect, useCallback } from "react";
import {
    findUserByEmail,
    addFilePermission,
    getFilePermissions,
    patchFilePermission,
    deleteFilePermission,
} from "../api/filesApi";

export function usePermissionsManager(itemId) {
    const [permissions, setPermissions] = useState([]);
    const [myRole, setMyRole] = useState(null); // "owner" | "editor" | "viewer" (או null)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const enrichPermissionsWithUserData = async (permissionsList) => {
        const token = localStorage.getItem("token");
        const enriched = [];

        for (const perm of permissionsList) {
            try {
                const userResponse = await fetch(`http://localhost:3000/api/users/${perm.userId}`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    enriched.push({
                        ...perm,
                        userName: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
                        userEmail: userData.email,
                        userImage: userData.image,
                    });
                } else {
                    enriched.push(perm);
                }
            } catch {
                enriched.push(perm);
            }
        }

        return enriched;
    };

    const loadPermissions = useCallback(async () => {
        if (!itemId) return;

        setLoading(true);
        setError(null);

        try {
            const data = await getFilePermissions(itemId);

            // תומך בשני פורמטים:
            // ישן: [ ... ]
            // חדש: { myRole, permissions: [ ... ] }
            let list = [];
            let role = null;

            if (Array.isArray(data)) {
                list = data;
                role = null;
            } else {
                list = Array.isArray(data?.permissions) ? data.permissions : [];
                role = data?.myRole || null;
            }

            setMyRole(role);

            const enriched = await enrichPermissionsWithUserData(list);
            setPermissions(enriched);
        } catch (err) {
            setError(err.message || "Failed to load permissions");
            setPermissions([]);
            setMyRole(null);
        } finally {
            setLoading(false);
        }
    }, [itemId]);

    useEffect(() => {
        loadPermissions();
    }, [loadPermissions]);

    const searchUser = async (email) => {
        const user = await findUserByEmail(email);
        if (!user) throw new Error("User not found");
        return user;
    };

    const shareWithUser = async (targetUserId) => {
        await addFilePermission(itemId, targetUserId);
        await loadPermissions();
    };

    // אצלך ב-UI אתה מעביר permission.id — אז נקבל permissionId
    const toggleRole = async (permissionId) => {
        await patchFilePermission(itemId, permissionId);
        await loadPermissions();
    };

    const deletePermission = async (permissionId) => {
        await deleteFilePermission(itemId, permissionId);
        await loadPermissions();
    };

    return {
        permissions,
        myRole,
        loading,
        error,
        loadPermissions,
        searchUser,
        shareWithUser,
        toggleRole,
        deletePermission,
    };
}
