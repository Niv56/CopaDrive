import React from "react";
const BASE_URL = "http://localhost:3000";

export default function PermissionRow({ permission, canManage, onDelete, onToggle }) {
    const isOwner = permission.role === "owner";
    const displayName = `${permission.firstName || ""} ${permission.lastName || ""}`.trim()
        || (permission.email ? permission.email.split('@')[0] : "User");

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