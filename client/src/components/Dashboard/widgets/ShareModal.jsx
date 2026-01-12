// client/src/components/Dashboard/widgets/ShareModal.jsx
import React, { useMemo, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import PermissionAddSection from "../permissions/PermissionAddSection";
import PermissionListSection from "../permissions/PermissionListSection";
import "../permissions/Permissions.css";

function decodeUserId(token) {
    try {
        const payload = JSON.parse(window.atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        return payload.userId || null;
    } catch { return null; }
}

function ShareModal({ item, onClose }) {
    const { token } = useAuth();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const myUserId = useMemo(() => (token ? decodeUserId(token) : null), [token]);

    const ownerId = item?.ownerId || item?.owner?.id || null;
    const isOwner = !!ownerId && !!myUserId && ownerId === myUserId;
    const fileId = item?.id;

    if (!fileId) return null;

    return (
        <div className="modal-overlay" onMouseDown={onClose}>
            <div className="modal-card" onMouseDown={(e) => e.stopPropagation()} style={{ padding: '24px' }}>
                <div className="modal-title mb-4">Share "{item?.name}"</div>

                {/* רק בעלים יכולים להוסיף משתמשים */}
                {isOwner && (
                    <>
                        <PermissionAddSection
                            fileId={fileId}
                            isOwner={isOwner}
                            onChanged={() => setRefreshTrigger(prev => prev + 1)}
                        />
                        <div className="perm-divider" />
                    </>
                )}

                {/* כולם רואים את רשימת ההרשאות (או לפחות את שלהם) */}
                <PermissionListSection
                    fileId={fileId}
                    isOwner={isOwner}
                    myUserId={myUserId}
                    ownerId={ownerId}
                    refreshTrigger={refreshTrigger}
                />

                {!isOwner && (
                    <div className="perm-owner-note">
                        Only the owner can manage sharing settings for this file.
                    </div>
                )}

                <div className="modal-actions mt-4">
                    <button className="btn btn-light px-4" onClick={onClose} style={{ borderRadius: '10px' }}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ShareModal;