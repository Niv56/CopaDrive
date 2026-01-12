// client/src/components/Dashboard/permissions/PermissionListSection.jsx
import React, { useEffect, useState } from "react";
import {
    deletePermission,
    getPermissions,
    togglePermissionRole,
} from "../../../api/permissionsApi";
import { getCurrentUser } from "../../../api/filesApi";
import PermissionRow from "./PermissionRow";

export default function PermissionListSection({ fileId, isOwner, myUserId, ownerId, refreshTrigger }) {
    const [loading, setLoading] = useState(true);
    const [permissions, setPermissions] = useState([]);
    const [myRole, setMyRole] = useState(null);
    const [err, setErr] = useState("");

    async function load() {
        setErr("");
        setLoading(true);
        try {
            const data = await getPermissions(fileId);
            console.log("Raw permissions data:", data);
            console.log("File ownerId:", ownerId);

            // שמירת ה-role שלי
            if (data.myRole) {
                setMyRole(data.myRole);
            }

            // שלוף פרטים מלאים של כל משתמש
            const permissionsWithFullData = await Promise.all(
                data.permissions.map(async (perm) => {
                    try {
                        const fullUser = await getCurrentUser(perm.userId);
                        console.log("Full user data for", perm.userId, ":", fullUser);

                        // זיהוי הבעלים - אם ה-userId של ההרשאה שווה ל-ownerId, זה הבעלים
                        const isFileOwner = ownerId && perm.userId === ownerId;
                        const correctedRole = isFileOwner ? "owner" : (perm.role || "viewer");

                        const enrichedPerm = {
                            ...perm,
                            role: correctedRole, // תיקון ה-role
                            email: perm.email || fullUser?.email || "",
                            firstName: fullUser?.firstName || "",
                            lastName: fullUser?.lastName || "",
                            image: fullUser?.image || "",
                        };

                        console.log("Enriched permission:", enrichedPerm);
                        return enrichedPerm;
                    } catch (e) {
                        console.error("Failed to get user details:", e);
                        return perm;
                    }
                })
            );

            console.log("Final permissions with full data:", permissionsWithFullData);

            // כעת הבעלים נשאר ברשימה - לא מסננים אותו
            // הוא יוצג עם עיצוב מיוחד ב-PermissionRow
            setPermissions(permissionsWithFullData);
        } catch (e) {
            console.error("Load permissions error:", e);
            setErr(e.message || "Failed to load permissions");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (fileId) load();
    }, [fileId, refreshTrigger, ownerId]);

    async function onDelete(p) {
        if (!p?.id) return;
        try {
            await deletePermission(fileId, p.id);
            await load();
        } catch (e) {
            setErr(e.message || "Delete failed");
        }
    }

    async function onToggle(p) {
        if (!p?.id) return;
        try {
            await togglePermissionRole(fileId, p.id);
            await load();
        } catch (e) {
            setErr(e.message || "Toggle failed");
        }
    }

    return (
        <div>
            <div className="perm-section-title mb-3">
                {isOwner ? "People with access" : "Your access"}
            </div>

            {loading && permissions.length === 0 ? (
                <div className="text-muted small">Loading permissions...</div>
            ) : permissions.length === 0 && !myRole ? (
                <div className="text-muted small">
                    {isOwner ? "No other users have access." : "Access information unavailable."}
                </div>
            ) : permissions.length === 0 && myRole ? (
                <div className="alert alert-info py-2 px-3" style={{ fontSize: '14px', borderRadius: '10px' }}>
                    You have <strong>{myRole}</strong> access to this file
                </div>
            ) : (
                <div className="d-flex flex-column">
                    {permissions.map((p) => {
                        console.log("Rendering permission row:", p);
                        return (
                            <PermissionRow
                                key={p.id || p.userId}
                                permission={p}
                                canManage={isOwner}
                                onDelete={onDelete}
                                onToggle={onToggle}
                            />
                        );
                    })}
                </div>
            )}

            {err && <div className="perm-error mt-2">{err}</div>}
        </div>
    );
}