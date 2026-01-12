// client/src/components/Dashboard/widgets/PermissionsList.jsx
import React, { useMemo } from "react";

/**
 * PermissionsList - Bottom section (GET/PATCH/DELETE)
 * Shows list of permissions with role badge + actions (owner only)
 */
function PermissionsList({ isOwner, permissions, onToggleRole, onDelete }) {
    const sorted = useMemo(() => {
        const list = Array.isArray(permissions) ? [...permissions] : [];
        // keep owner at top if exists
        list.sort((a, b) => {
            if (a.role === "owner") return -1;
            if (b.role === "owner") return 1;
            return String(a.email || "").localeCompare(String(b.email || ""));
        });
        return list;
    }, [permissions]);

    if (!sorted.length) {
        return (
            <div className="text-center py-4 share-muted small">
                No permissions yet.
            </div>
        );
    }

    const roleChip = (role) => {
        const r = (role || "viewer").toLowerCase();
        const map = {
            owner: { label: "Owner", cls: "share-role-owner" },
            editor: { label: "Editor", cls: "share-role-editor" },
            viewer: { label: "Viewer", cls: "share-role-viewer" },
        };
        return map[r] || map.viewer;
    };

    return (
        <div className="d-flex flex-column gap-2">
            {sorted.map((p) => {
                const chip = roleChip(p.role);

                const initials = (p.email || "?").trim().charAt(0).toUpperCase();

                return (
                    <div
                        key={p.id}
                        className="share-row"
                    >
                        <div className="d-flex align-items-center gap-2">
                            <div className="share-avatar">
                                {p.image ? (
                                    <img src={p.image} alt="user" />
                                ) : (
                                    <span className="share-avatar-initials">{initials}</span>
                                )}
                            </div>

                            <div className="d-flex flex-column">
                                <span className="small fw-bold">{p.email || "Unknown"}</span>
                                <span className="small share-muted">{p.userId}</span>
                            </div>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            <span className={`share-role ${chip.cls}`}>{chip.label}</span>

                            {isOwner && p.role !== "owner" && (
                                <>
                                    <button
                                        className="btn share-btn-neutral btn-sm rounded-pill px-3"
                                        onClick={() => onToggleRole?.(p.id)}
                                        type="button"
                                    >
                                        Toggle
                                    </button>

                                    <button
                                        className="btn share-btn-danger btn-sm rounded-pill px-3"
                                        onClick={() => onDelete?.(p.id)}
                                        type="button"
                                    >
                                        Remove
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default PermissionsList;
