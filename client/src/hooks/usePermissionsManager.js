import { useState, useEffect, useCallback, useRef } from "react";
import {
    findUserByEmail,
    addFilePermission,
    getFilePermissions,
    patchFilePermission,
    deleteFilePermission,
    getCurrentUser,
} from "../api/filesApi";

/**
 * usePermissionsManager Hook
 * מנהל את כל הלוגיקה של הרשאות - שליפה, הוספה, עדכון (toggle), מחיקה
 * + enrichment: מביא email/image לכל permission דרך getCurrentUser(userId)
 */
export function usePermissionsManager(itemId) {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cache כדי לא לקרוא שוב ושוב ל /api/users/:id
    const userCacheRef = useRef(new Map());

    const getUserCached = useCallback(async (userId) => {
        if (!userId) return null;

        const cache = userCacheRef.current;
        if (cache.has(userId)) return cache.get(userId);

        try {
            const user = await getCurrentUser(userId); // uses request() + token
            cache.set(userId, user);
            return user;
        } catch (e) {
            // לא שוברים את המסך אם אין משתמש/אין הרשאה
            cache.set(userId, null);
            return null;
        }
    }, []);

    /**
     * טעינת רשימת ההרשאות
     * - backend יכול להחזיר array או { permissions: [] }
     * - enrichment: מוסיף userEmail/userImage
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

    /**
     * חיפוש משתמש לפי אימייל (משמש את ה-form למעלה)
     */
    const searchUser = async (email) => {
        if (!email?.trim()) return null;
        const user = await findUserByEmail(email.trim());
        if (!user) throw new Error("User not found");
        return user;
    };

    /**
     * שיתוף - הוספת הרשאה (viewer ברירת מחדל בשרת)
     */
    const shareWithUser = async (targetUserId) => {
        if (!itemId) return;
        await addFilePermission(itemId, targetUserId);
        await loadPermissions();
    };

    /**
     * Toggle Role (PATCH) - מחליף viewer <-> editor
     */
    const toggleRole = async (permissionId) => {
        if (!itemId) return;
        await patchFilePermission(itemId, permissionId);
        await loadPermissions();
    };

    /**
     * מחיקת הרשאה (DELETE)
     */
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
