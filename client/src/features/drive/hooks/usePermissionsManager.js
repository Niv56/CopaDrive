import { useState, useEffect, useCallback, useRef } from "react";
import {
    findUserByEmail,
    addFilePermission,
    getFilePermissions,
    patchFilePermission,
    deleteFilePermission,
    getCurrentUser,
} from "../api/filesApi";

/** * Manages file permissions including fetching, profile enrichment, 
 * and CRUD operations for access control.
 */
export function usePermissionsManager(itemId) {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cache to prevent redundant profile requests
    const userCacheRef = useRef(new Map());

    /** Retrieves user profile from cache or API based on ID */
    const getUserCached = useCallback(async (userId) => {
        if (!userId) return null;

        const cache = userCacheRef.current;
        if (cache.has(userId)) return cache.get(userId);

        try {
            const user = await getCurrentUser(userId);
            cache.set(userId, user);
            return user;
        } catch (e) {
            cache.set(userId, null);
            return null;
        }
    }, []);

    /** * Fetches raw permission records and enriches them with 
     * cached user details (name, email, image).
     */
    const loadPermissions = useCallback(async () => {
        if (!itemId) return;

        setLoading(true);
        setError(null);

        try {
            const res = await getFilePermissions(itemId);

            const list = Array.isArray(res)
                ? res
                : Array.isArray(res?.permissions)
                    ? res.permissions
                    : [];

            const enriched = await Promise.all(
                list.map(async (perm) => {
                    const user = await getUserCached(perm.userId);

                    const firstName = user?.firstName || "";
                    const lastName = user?.lastName || "";
                    const fullName = `${firstName} ${lastName}`.trim();

                    return {
                        ...perm,
                        userName: fullName || null,
                        userEmail: user?.email || null,
                        userImage: user?.image || null,
                    };
                })
            );

            setPermissions(enriched);
        } catch (err) {
            setError(err?.message || "Failed to load permissions");
            setPermissions([]);
        } finally {
            setLoading(false);
        }
    }, [itemId, getUserCached]);

    useEffect(() => {
        loadPermissions();
    }, [loadPermissions]);

    /** Finds user metadata via email address */
    const searchUser = async (email) => {
        if (!email?.trim()) return null;
        const user = await findUserByEmail(email.trim());
        if (!user) throw new Error("User not found");
        return user;
    };

    /** Grants file access to a user and refreshes permission list */
    const shareWithUser = async (targetUserId) => {
        if (!itemId) return;
        await addFilePermission(itemId, targetUserId);
        await loadPermissions();
    };

    /** Switches user role between viewer and editor */
    const toggleRole = async (permissionId) => {
        if (!itemId) return;
        await patchFilePermission(itemId, permissionId);
        await loadPermissions();
    };

    /** Revokes access for a specific permission record */
    const deletePermission = async (permissionId) => {
        if (!itemId) return;
        await deleteFilePermission(itemId, permissionId);
        await loadPermissions();
    };

    return {
        permissions,
        loading,
        error,
        loadPermissions,
        searchUser,
        shareWithUser,
        toggleRole,
        deletePermission,
    };
}