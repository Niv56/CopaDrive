import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "app/providers/AuthContext";
import PermissionAddSection from "../permissions/PermissionAddSection";
import PermissionListSection from "../permissions/PermissionListSection";
import "../../../../styles/widgets/Permissions.css";

/** Decodes JWT to extract the userId */
function decodeUserId(token) {
    try {
        const payload = JSON.parse(window.atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        return payload.userId || null;
    } catch { return null; }
}

/** Modal for managing item permissions and sharing */
function ShareModal({ item, onClose }) {
    const { token } = useAuth();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const myUserId = useMemo(() => (token ? decodeUserId(token) : null), [token]);

    const ownerId = item?.ownerId || item?.owner?.id || null;
    const isOwner = !!ownerId && !!myUserId && String(ownerId) === String(myUserId);
    const fileId = item?.id;

    // Trigger refresh when file selection changes
    useEffect(() => {
        setRefreshTrigger(prev => prev + 1);
    }, [fileId]);

    if (!fileId) return null;

    return (
        <div className="modal-overlay" onMouseDown={onClose}>
            <div className="modal-card" onMouseDown={(e) => e.stopPropagation()} style={{ padding: '24px' }}>
                <div className="modal-title mb-4">Share "{item?.name}"</div>

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

                <PermissionListSection
                    fileId={fileId}
                    isOwner={isOwner}
                    myUserId={myUserId}
                    ownerId={ownerId}
                    refreshTrigger={refreshTrigger}
                />

                {!isOwner && (
                    <div className="perm-owner-note mt-3">
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