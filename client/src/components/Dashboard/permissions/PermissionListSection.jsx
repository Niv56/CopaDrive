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

            // שליפת פרטים מלאים של כל משתמש
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

            // ✅ סנן משתמשים שחסומים (blockedBy)
            // רק Owner יכול לראות אותם (כדי לדעת שהם היו ברשימה)
            const filtered = permissionsWithFullData.filter(perm => {
                // אם אין blockedBy, תציג את כולם
                if (!data.blockedBy || !Array.isArray(data.blockedBy)) return true;

                // הצג רק משתמשים שלא חסמו את הקובץ
                return !data.blockedBy.includes(perm.userId);
            });

            setPermissions(filtered);
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
            const errorMessage = e.message || "Delete failed";
            if (errorMessage.includes("permission") || errorMessage.includes("403")) {
                setErr("You don't have permission to remove this user.");
            } else {
                setErr("Unable to remove user access. Please try again.");
            }
        }
    }

    async function onToggle(p) {
        if (!p?.id) return;
        try {
            await togglePermissionRole(fileId, p.id);
            await load();
        } catch (e) {
            const errorMessage = e.message || "Toggle failed";
            if (errorMessage.includes("permission") || errorMessage.includes("403")) {
                setErr("You don't have permission to change user roles.");
            } else {
                setErr("Unable to change user role. Please try again.");
            }
        }
    }

    return (
        <div>
            {/* ✅ כותרת מותאמת לפי תפקיד */}
            <div className="perm-section-title mb-3">
                {isOwner ? "Who has access" : "People with access"}
            </div>

            {loading && permissions.length === 0 ? (
                <div className="text-muted small">Loading permissions...</div>
            ) : permissions.length === 0 && !myRole ? (
                <div className="text-muted small">
                    {isOwner ? "No other users have access yet." : "Access information unavailable."}
                </div>
            ) : permissions.length === 0 && myRole ? (
                /* ✅ הודעה ברורה יותר למשתמש שאינו owner */
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

            {err && (
                <div className="perm-error-box mt-3">
                    <svg className="perm-error-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{err}</span>
                </div>
            )}
        </div>
    );
}