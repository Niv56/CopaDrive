// client/src/components/Dashboard/permissions/PermissionRow.jsx
import React from "react";

const BASE_URL = "http://localhost:3000";

export default function PermissionRow({ permission, canManage, onDelete, onToggle }) {
    console.log("PermissionRow received:", permission);

    const role = (permission.role || "viewer").toLowerCase();
    const isOwner = role === "owner";

    // בניית שם מלא מהנתונים שנשלפו
    const displayName = `${permission.firstName || ""} ${permission.lastName || ""}`.trim()
        || (permission.email ? permission.email.split('@')[0] : "User");

    // טיפול בתמונת פרופיל
    const rawImg = permission.image || "";
    const avatarUrl = rawImg
        ? (rawImg.startsWith("data:") || rawImg.startsWith("http")
            ? rawImg
            : `${BASE_URL}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`)
        : "";

    const initial = displayName[0]?.toUpperCase() || "?";

    console.log("Display values:", { displayName, email: permission.email, avatarUrl, role, isOwner });

    return (
        <div className={`perm-profile-row ${isOwner ? 'is-owner' : ''}`}>
            <div className="perm-profile-left">
                {/* תמונת פרופיל */}
                <div className="perm-avatar">
                    {avatarUrl ? (
                        <img className="perm-avatar-img" src={avatarUrl} alt="avatar" />
                    ) : (
                        <span>{initial}</span>
                    )}
                </div>

                {/* שם ואימייל */}
                <div className="perm-profile-text">
                    <div className="perm-profile-name">
                        {displayName}
                        {isOwner && <span className="owner-badge">Owner</span>}
                    </div>
                    <div className="perm-profile-email">
                        {permission.email || "No email"}
                    </div>
                </div>
            </div>

            {/* כפתורים או תצוגת הרשאה */}
            <div className="d-flex align-items-center gap-2">
                {isOwner ? (
                    /* הבעלים רואה רק תג owner ללא אפשרות עריכה */
                    <span className="perm-role-owner">{role}</span>
                ) : canManage ? (
                    <>
                        {/* כפתור Toggle Role */}
                        <button
                            className="perm-role-toggle-btn"
                            onClick={() => onToggle?.(permission)}
                            title="Click to change role"
                        >
                            {role}
                        </button>

                        {/* כפתור Delete */}
                        <button
                            className="perm-delete-text-btn"
                            onClick={() => onDelete?.(permission)}
                            title="Remove access"
                        >
                            Delete
                        </button>
                    </>
                ) : (
                    /* תצוגה בלבד למשתמשים שאינם בעלים */
                    <span className="perm-role-display">{role}</span>
                )}
            </div>
        </div>
    );
}