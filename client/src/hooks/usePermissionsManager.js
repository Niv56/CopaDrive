// client/src/hooks/usePermissionsManager.js
import { useState, useEffect, useCallback } from "react";
import {
    findUserByEmail,
    addFilePermission,
    getFilePermissions,
    patchFilePermission,
    deleteFilePermission,
} from "../api/filesApi";

/**
 * usePermissionsManager Hook
 * מנהל את כל הלוגיקה של הרשאות - שליפה, הוספה, עדכון, מחיקה
 *
 * @param {string} itemId - מזהה הקובץ/תיקייה
 * @returns {Object} - פונקציות ומצבים לניהול הרשאות
 */
export function usePermissionsManager(itemId) {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * טעינת רשימת ההרשאות
     */
    const loadPermissions = useCallback(async () => {
        if (!itemId) return;

        setLoading(true);
        setError(null);

        try {
            const res = await getFilePermissions(itemId);

            // backend might return array directly OR {permissions: []}
            const list = Array.isArray(res)
                ? res
                : Array.isArray(res?.permissions)
                    ? res.permissions
                    : [];

            setPermissions(list);
        } catch (err) {
            setError(err.message || "Failed to load permissions");
        } finally {
            setLoading(false);
        }
    }, [itemId]);

    useEffect(() => {
        loadPermissions();
    }, [loadPermissions]);

    /**
     * חיפוש משתמש לפי אימייל
     */
    const searchUser = async (email) => {
        if (!email?.trim()) return null;
        return await findUserByEmail(email.trim());
    };

    /**
     * שיתוף - הוספת הרשאה חדשה (POST)
     */
    const shareWithUser = async (targetUserId) => {
        if (!itemId) return;
        await addFilePermission(itemId, targetUserId);
        await loadPermissions();
    };

    /**
     * Toggle Role (PATCH)
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
