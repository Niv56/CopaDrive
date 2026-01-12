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
        try {
            return JSON.parse(
                window.atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
            ).userId;
        } catch {
            return null;
        }
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

    const isOwner = currentUserId === item?.ownerId;

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
                        <span className="share-muted small">Manage access for this item</span>
                    </div>

                    <button
                        className="btn btn-light rounded-circle"
                        onClick={onClose}
                        type="button"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                {/* Top section: Add users / warning for non-owner */}
                <AddPermissionForm isOwner={isOwner} onSearch={searchUser} onShare={shareWithUser} />

                <hr className="my-4" style={{ borderColor: "#e5e7eb" }} />

                {/* Bottom section: Permissions list */}
                {loading ? (
                    <div className="text-center py-4 share-muted small">
                        Loading permissions...
                    </div>
                ) : (
                    <>
                        {error ? (
                            <div className="alert alert-danger py-2">{error}</div>
                        ) : null}

                        <PermissionsList
                            permissions={permissions}
                            isOwner={isOwner}
                            itemOwnerId={item.ownerId}
                            onToggleRole={toggleRole}
                            onDelete={deletePermission}
                        />
                    </>
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
