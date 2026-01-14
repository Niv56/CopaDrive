import React, { useEffect, useState } from "react";
import { getPermissions, deletePermission, togglePermissionRole } from "../../api/permissionsApi";
import { getCurrentUser } from "../../api/filesApi"; 
import PermissionRow from "./PermissionRow";

export default function PermissionListSection({ fileId, isOwner, myUserId, ownerId, refreshTrigger }) {
    const [loading, setLoading] = useState(true);
    const [permissions, setPermissions] = useState([]);

    async function load() {
        try {
            setLoading(true);
            const data = await getPermissions(fileId);
            const enriched = await Promise.all(data.permissions.map(async (perm) => {
                try {
                    const user = await getCurrentUser(perm.userId); 
                    const isActuallyOwner = String(perm.userId) === String(ownerId);
                    return { 
                        ...perm, 
                        role: isActuallyOwner ? "owner" : perm.role,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        image: user.image 
                    };
                } catch { return perm; }
            }));
            setPermissions(enriched);
        } catch (e) {
            console.error("Failed to load permissions", e);
        } finally { setLoading(false); }
    }

    useEffect(() => { load(); }, [fileId, refreshTrigger, ownerId]);

    return (
        <div className="perm-list-section mt-4">
            <div className="perm-section-title">People with access</div>
            <div className="perm-rows-container mt-2">
                {permissions.length === 0 && !loading ? (
                    <div className="text-center opacity-50 small py-3">No one else has access yet</div>
                ) : (
                    permissions.map(p => (
                        <PermissionRow 
                            key={p.id || p.userId} 
                            permission={p} 
                            canManage={isOwner && p.role !== "owner"} 
                            onDelete={async () => { await deletePermission(fileId, p.id); load(); }}
                            onToggle={async () => { await togglePermissionRole(fileId, p.id); load(); }}
                        />
                    ))
                )}
            </div>
        </div>
    );
}