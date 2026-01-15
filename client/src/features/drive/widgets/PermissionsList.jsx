import React, { useMemo } from "react";

/**
 * PermissionsList Component
 * Renders a managed list of users with access to a specific item.
 * * Features:
 * - Avatar/Initials fallback.
 * - Role labels (Owner, Editor, Viewer) with dynamic styling.
 * - Interactive role toggling (Editor <-> Viewer) for owners.
 * - Access revocation (Remove) for owners.
 */
function PermissionsList({ isOwner, permissions, itemOwnerId, onToggleRole, onDelete }) {

    /** * Normalizes raw permission data for UI rendering.
     * Assigns specific labels and CSS classes based on roles and ownership.
     */
    const normalized = useMemo(() => {
        return (permissions || []).map((p) => {
            const role = (p.role || "").toLowerCase();
            const isOwnerRow = p.userId === itemOwnerId;

            const label = isOwnerRow ? "Owner" : role === "editor" ? "Editor" : "Viewer";
            const cls = isOwnerRow
                ? "share-role-owner"
                : role === "editor" ? "share-role-editor" : "share-role-viewer";

            const email = p.userEmail || p.email || "Unknown";
            const image = p.userImage || p.image || null;

            return { ...p, _ui: { label, cls, isOwnerRow, email, image } };
        });
    }, [permissions, itemOwnerId]);

    /** Generates 1-2 character initials from an email for fallback avatars */
    const initialsFromEmail = (email) => {
        const safe = (email || "").trim();
        if (!safe || safe === "Unknown") return "?";
        const first = safe[0]?.toUpperCase() || "?";
        const second = safe.includes("@") ? safe.split("@")[0]?.[1]?.toUpperCase() : "";
        return (first + (second || "")).slice(0, 2);
    };

    return (
        <div className="share-list">
            {normalized.map((p) => {
                const { label, cls, isOwnerRow, email, image } = p._ui;

                /** Logic: Only the item owner can manage other users' permissions */
                const canManageThisRow = isOwner && !isOwnerRow;

                return (
                    <div className="share-row" key={p.id}>
                        {/* User Identity Section */}
                        <div className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
                            <div className="share-avatar">
                                {image ? (
                                    <img src={image} alt={email} />
                                ) : (
                                    <div className="share-avatar-initials">
                                        {initialsFromEmail(email)}
                                    </div>
                                )}
                            </div>

                            <div className="share-email text-truncate">{email}</div>
                        </div>

                        {/* Management Actions Section */}
                        <div className="d-flex align-items-center gap-2">
                            <button
                                type="button"
                                className={`share-role ${cls} ${canManageThisRow ? "share-role-clickable" : ""}`}
                                disabled={!canManageThisRow}
                                title={canManageThisRow ? "Click to toggle Viewer/Editor" : "Role"}
                                onClick={() => {
                                    if (!canManageThisRow) return;
                                    onToggleRole?.(p.id);
                                }}
                            >
                                {label}
                            </button>

                            {canManageThisRow && (
                                <button
                                    className="btn share-btn-danger btn-sm rounded-pill px-3"
                                    type="button"
                                    onClick={() => onDelete?.(p.id)}
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default PermissionsList;