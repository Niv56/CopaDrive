import React, { useMemo } from "react";

/**
 * PermissionsList
 * - מציג avatar (תמונה כמו שהיא) + email בלבד
 * - role הוא כפתור Toggle: לחיצה על Editor תהפוך ל-Viewer ולהפך
 * - Remove נשאר כפתור נפרד (רק לבעלים)
 */
function PermissionsList({ isOwner, permissions, itemOwnerId, onToggleRole, onDelete }) {
    const normalized = useMemo(() => {
        return (permissions || []).map((p) => {
            const role = (p.role || "").toLowerCase();
            const isOwnerRow = p.userId === itemOwnerId;

            const label = isOwnerRow ? "Owner" : role === "editor" ? "Editor" : "Viewer";
            const cls =
                isOwnerRow ? "share-role-owner" : role === "editor" ? "share-role-editor" : "share-role-viewer";

            const email = p.userEmail || p.email || "Unknown";
            const image = p.userImage || p.image || null;

            return { ...p, _ui: { label, cls, isOwnerRow, email, image } };
        });
    }, [permissions, itemOwnerId]);

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

                const canManageThisRow = isOwner && !isOwnerRow;

                return (
                    <div className="share-row" key={p.id}>
                        {/* Left: Avatar + Email */}
                        <div className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
                            <div className="share-avatar">
                                {image ? (
                                    <img src={image} alt={email} />
                                ) : (
                                    <div className="share-avatar-initials">{initialsFromEmail(email)}</div>
                                )}
                            </div>

                            <div className="share-email text-truncate">{email}</div>
                        </div>

                        {/* Right: Role (toggle) + Remove */}
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

                            {canManageThisRow ? (
                                <button
                                    className="btn share-btn-danger btn-sm rounded-pill px-3"
                                    type="button"
                                    onClick={() => onDelete?.(p.id)}
                                >
                                    Remove
                                </button>
                            ) : null}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default PermissionsList;
