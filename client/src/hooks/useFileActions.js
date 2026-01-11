import { useState } from "react";
import { setStarred, setImportant, deleteItem, openItem } from "../api/filesApi";

export function useFileActions(myUserId, onRefresh) {
    const [sharingItem, setSharingItem] = useState(null);
    const [openedFile, setOpenedFile] = useState(null);
    const [openedRole, setOpenedRole] = useState("viewer");
    const [loadingFile, setLoadingFile] = useState(false);

    const handleOpen = async (item, onFolderOpen) => {
        if (!item) return;
        setLoadingFile(true);
        try {
            const role = item.ownerId === myUserId ? "owner" : "viewer";
            setOpenedRole(role);

            const fullFile = await openItem(item, (folder) => {
                if (onFolderOpen) onFolderOpen(folder);
            });

            if (fullFile) setOpenedFile(fullFile);
        } catch (e) {
            alert("Error opening item: " + e.message);
        } finally {
            setLoadingFile(false);
        }
    };

    const handleToggleStar = async (item, newValue) => {
        try {
            await setStarred(item.id, newValue);
            if (onRefresh) onRefresh();
        } catch (e) {
            alert("Failed to update star status");
        }
    };

    const handleToggleImportant = async (item, newValue) => {
        try {
            await setImportant(item.id, newValue);
            if (onRefresh) onRefresh();
        } catch (e) {
            alert("Failed to update importance status");
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) return;
        try {
            await deleteItem(item.id);
            if (onRefresh) onRefresh();
            if (openedFile?.id === item.id) setOpenedFile(null);
        } catch (e) {
            alert("Delete failed: " + e.message);
        }
    };

    return {
        sharingItem,
        setSharingItem,
        openedFile,
        setOpenedFile,
        openedRole,
        loadingFile,
        handleOpen,
        handleToggleStar,
        handleToggleImportant,
        handleDelete
    };
}