// client/src/components/Dashboard/widgets/ShareModal.jsx
import React, { useMemo } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { usePermissionsManager } from "../../../hooks/usePermissionsManager";
import AddPermissionForm from "./AddPermissionForm";
import PermissionsList from "./PermissionsList";
import "./ShareModal.css";

function ShareModal({ item, onClose }) {
    const { token } = useAuth();

    const currentUserId = useMemo(() => {
        if (!token) return null;
        return JSON.parse(
            window.atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
        ).userId;
    }, [token]);

    const {
        permissions,
        loading,
        searchUser,
        shareWithUser,
        toggleRole,
        deletePermission,
    } = usePermissionsManager(item?.id);

    const isOwner = currentUserId === item?.ownerId;

    if (!item) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-card shadow-lg p-4"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: 560, width: "95%" }}
            >
                {/* Header */}
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h5 className="m-0 fw-bold" style={{ color: "#111827" }}>
                            Share “{item.name}”
                        </h5>
                        <div className="share-muted" style={{ fontSize: 13, marginTop: 4 }}>
                        </div>
                    </div>

                    <button
                        className="btn share-btn-outline"
                        onClick={onClose}
                        type="button"
                        style={{ borderRadius: 10, padding: "6px 10px", lineHeight: 1 }}
                        title="Close"
                    >
                        ✕
                    </button>
                </div>

                {/* Top section: Add users */}
                <AddPermissionForm
                    isOwner={isOwner}
                    onSearch={searchUser}
                    onShare={shareWithUser}
                />

                <hr className="my-4" style={{ borderColor: "#e5e7eb" }} />

                {/* Bottom section: Permissions list */}
                {loading ? (
                    <div className="text-center py-4 share-muted small">Loading permissions...</div>
                ) : (
                    <PermissionsList
                        permissions={permissions}
                        isOwner={isOwner}
                        currentUserId={currentUserId}
                        itemOwnerId={item.ownerId}
                        onToggleRole={toggleRole}
                        onDeletePermission={deletePermission}
                    />
                )}

                <div className="text-end mt-4">
                    <button
                        className="btn share-btn-neutral rounded-pill px-5"
                        onClick={onClose}
                        type="button"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ShareModal;
