// client/src/hooks/useFileActions.js
import { useState } from "react";
import { setStarred, setImportant, deleteItem, openItem } from "../api/filesApi";

export function useFileActions(myUserId, onRefresh) {
    const [sharingItem, setSharingItem] = useState(null);
    const [openedFile, setOpenedFile] = useState(null);
    const [openedRole, setOpenedRole] = useState("viewer");
    const [loadingFile, setLoadingFile] = useState(false);

    // ✅ cache: fileId -> "viewer" | "editor" | "owner"
    const [resolvedRoles, setResolvedRoles] = useState({});

    const handleOpen = async (item, onFolderOpen) => {
        if (!item) return;

        setLoadingFile(true);

        try {
            let role = "viewer";

            if (item.ownerId === myUserId) {
                role = "owner";
            } else {
                const token = localStorage.getItem("token");
                const res = await fetch(
                    `http://localhost:3000/api/files/${item.id}/permissions`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (res.ok) {
                    const data = await res.json();
                    const list = Array.isArray(data)
                        ? data
                        : Array.isArray(data?.permissions)
                            ? data.permissions
                            : [];

                    const myPerm = list.find((p) => p.userId === myUserId);
                    if (myPerm?.role) role = myPerm.role; // "editor" / "viewer"
                }
            }

            // ✅ keep modal role
            setOpenedRole(role);

            // ✅ keep list role synced (cache by id)
            setResolvedRoles((prev) => ({ ...prev, [item.id]: role }));

            const file = await openItem(item, onFolderOpen);
            if (file) setOpenedFile(file);
        } catch (e) {
            console.error("Failed to open item:", e);
            alert("Failed to open item");
        } finally {
            setLoadingFile(false);
        }
    };

    const handleToggleStar = async (item, val) => {
        await setStarred(item.id, val);
        if (onRefresh) onRefresh();
    };

    const handleToggleImportant = async (item, val) => {
        await setImportant(item.id, val);
        if (onRefresh) onRefresh();
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Delete "${item.name}"?`)) return;

        try {
            await deleteItem(item.id);
            if (onRefresh) onRefresh();
        } catch (e) {
            console.error("Delete failed:", e);
            alert("Failed to delete item");
        }
    };

    return {
        sharingItem,
        setSharingItem,

        openedFile,
        setOpenedFile,
        openedRole,

        loadingFile,

        // ✅ new
        resolvedRoles,

        handleOpen,
        handleToggleStar,
        handleToggleImportant,
        handleDelete,
    };
}
