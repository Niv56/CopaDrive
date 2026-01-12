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
        error,
        searchUser,
        shareWithUser,
        toggleRole,
        deletePermission,
    } = usePermissionsManager(item?.id);

    const isOwner = item?.ownerId === currentUserId;

    if (!item) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-card share-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="share-header">
                    <div className="d-flex flex-column">
                        <h5 className="m-0 fw-bold">Share “{item.name}”</h5>
                        <span className="share-muted small">
                            Manage access for this item
                        </span>
                    </div>

                    <button className="btn btn-light rounded-circle" onClick={onClose}>
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
                    <div className="text-center py-4 share-muted small">
                        Loading permissions...
                    </div>
                ) : (
                    <PermissionsList
                        isOwner={isOwner}
                        permissions={permissions}
                        onToggleRole={toggleRole}
                        onDelete={deletePermission}
                    />
                )}

                {error && (
                    <div className="alert alert-danger py-2 px-3 mt-3 small">
                        {error}
                    </div>
                )}

                <div className="d-flex justify-content-end mt-4">
                    <button
                        className="btn share-btn-primary rounded-pill px-4"
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
