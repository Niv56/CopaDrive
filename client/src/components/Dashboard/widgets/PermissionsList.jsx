// client/src/components/Dashboard/widgets/PermissionsList.jsx
import React, { useMemo } from "react";

/**
 * PermissionsList - Bottom section (GET)
 * Displays the list of users with access
 * OWNER can: Toggle Role (PATCH) + Delete (DELETE)
 * Non-owner users: see role badge only
 */
function PermissionsList({
    permissions,
    isOwner,
    currentUserId,
    itemOwnerId,
    onToggleRole,
    onDeletePermission,
}) {
    // Filter out current user (don't show yourself)
    const filteredPermissions = useMemo(() => {
        const list = Array.isArray(permissions) ? permissions : [];
        return list.filter((perm) => perm.userId !== currentUserId);
    }, [permissions, currentUserId]);

    if (filteredPermissions.length === 0) {
        return (
            <div className="text-center py-3 text-muted small">
                {isOwner ? "No other users have access yet." : "Only you have access to this item."}
            </div>
        );
    }

    return (
        <div>
            <p className="share-muted small fw-bold mb-2">
                People with access ({filteredPermissions.length}):
            </p>

            <div className="d-flex flex-column gap-2" style={{ maxHeight: 280, overflowY: "auto" }}>
                {filteredPermissions.map((perm) => (
                    <PermissionItem
                        key={perm.id}
                        permission={perm}
                        isOwner={isOwner}
                        itemOwnerId={itemOwnerId}
                        onToggleRole={onToggleRole}
                        onDeletePermission={onDeletePermission}
                    />
                ))}
            </div>
        </div>
    );
}

function PermissionItem({ permission, isOwner, itemOwnerId, onToggleRole, onDeletePermission }) {
    const roleLabel = permission.role === "editor" ? "EDITOR" : "VIEWER";
    const isThisUserOwner = permission.userId === itemOwnerId;

    const initials = useMemo(() => {
        const email = (permission.userEmail || "").trim();
        if (!email) return "?";
        return email.charAt(0).toUpperCase();
    }, [permission.userEmail]);

    return (
        <div
            className="d-flex align-items-center justify-content-between p-2"
            style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                background: "#fff",
            }}
        >
            {/* Left: Avatar + Email */}
            <div className="d-flex align-items-center gap-2">
                <div className="share-avatar">
                    {permission.userImage ? (
                        <img src={permission.userImage} alt="user" />
                    ) : (
                        <span className="share-avatar-initials">{initials}</span>
                    )}
                </div>

                <div className="d-flex flex-column">
                    <span className="small fw-bold text-truncate" style={{ maxWidth: 220 }}>
                        {permission.userEmail}
                    </span>

                    {isThisUserOwner && (
                        <span className="badge" style={{ background: "#16a34a", color: "white", fontSize: 10, width: "fit-content" }}>
                            Owner
                        </span>
                    )}
                </div>
            </div>

            {/* Right: Actions / badge */}
            <div className="d-flex align-items-center gap-2">
                {isThisUserOwner ? (
                    <span
                        className="badge"
                        style={{
                            background: "#16a34a",
                            color: "white",
                            fontSize: 11,
                            padding: "6px 10px",
                            borderRadius: 999,
                        }}
                    >
                        OWNER
                    </span>
                ) : isOwner ? (
                    <>
                        <button
                            className={`btn btn-sm rounded-pill ${permission.role === "editor" ? "share-btn-neutral" : "share-btn-outline"
                                }`}
                            style={{ fontSize: 11, minWidth: 84 }}
                            onClick={() => onToggleRole(permission.id)}
                            title={`Click to change to ${permission.role === "editor" ? "VIEWER" : "EDITOR"}`}
                            type="button"
                        >
                            {roleLabel}
                        </button>

                        <button
                            className="btn btn-sm share-btn-outline"
                            onClick={() => onDeletePermission(permission.id)}
                            title="Remove access"
                            type="button"
                            style={{ padding: "6px 10px" }}
                        >
                            🗑️
                        </button>
                    </>
                ) : (
                    <span
                        className="badge rounded-pill"
                        style={{
                            background: "#111827",
                            color: "white",
                            fontSize: 11,
                            padding: "6px 10px",
                            fontWeight: 500,
                        }}
                    >
                        {roleLabel}
                    </span>
                )}
            </div>
        </div>
    );
}

export default PermissionsList;
