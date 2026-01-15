import React from "react";
const BASE_URL = "http://localhost:3000";

/** Renders a single user record within the sharing/permission list */
export default function PermissionRow({ permission, canManage, onDelete, onToggle }) {
    const isOwner = permission.role === "owner";

    /** Derives display name from profile info or email prefix */
    const displayName = `${permission.firstName || ""} ${permission.lastName || ""}`.trim()
        || (permission.email ? permission.email.split('@')[0] : "User");

    /** Resolves relative or data-based avatar URL */
    const rawImg = permission.image || "";
    const avatarUrl = rawImg
        ? (rawImg.startsWith("data:") || rawImg.startsWith("http") ? rawImg : `${BASE_URL}${rawImg}`)
        : "";

    const initial = displayName[0]?.toUpperCase() || "?";

    return (
        <div className={`perm-profile-row ${isOwner ? 'is-owner' : ''}`}>
            <div className="perm-profile-left">
                <div className="perm-avatar">
                    {avatarUrl ? <img className="perm-avatar-img" src={avatarUrl} alt="av" /> : initial}
                </div>
                <div className="perm-profile-text">
                    <div className="perm-profile-name">
                        {displayName}
                        {isOwner && <span className="owner-badge">Owner</span>}
                    </div>
                    <div className="perm-profile-email">{permission.email}</div>
                </div>
            </div>

            <div className="d-flex align-items-center">
                {isOwner ? (
                    <span className="small opacity-50">Original Owner</span>
                ) : (
                    <>
                        {canManage ? (
                            <>
                                <button className="perm-role-toggle-btn" onClick={() => onToggle?.(permission)}>
                                    {permission.role}
                                </button>
                                <button className="perm-delete-text-btn" onClick={() => onDelete?.(permission)}>
                                    Remove
                                </button>
                            </>
                        ) : (
                            <span className="small opacity-50">{permission.role}</span>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}