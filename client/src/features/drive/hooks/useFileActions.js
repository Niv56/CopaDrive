// client/src/hooks/useFileActions.js
import { useState } from "react";
import { setStarred, setImportant, moveToTrash, openItem } from "../api/filesApi";
import { getPermissions } from "../api/permissionsApi";

export function useFileActions(myUserId, onRefresh) {
  const [sharingItem, setSharingItem] = useState(null);
  const [openedFile, setOpenedFile] = useState(null);
  const [openedRole, setOpenedRole] = useState("viewer");
  const [loadingFile, setLoadingFile] = useState(false);

  const handleOpen = async (item, onFolderOpen) => {
    if (!item) return;
    setLoadingFile(true);
    try {
      // 1. Determine Role
      let role = item.ownerId === myUserId ? "owner" : "viewer";

      if (role !== "owner" && item.id) {
        try {
          const permsData = await getPermissions(item.id);
          if (permsData.myRole) {
            role = permsData.myRole;
          } else {
            const myPerm = permsData.permissions?.find(p => p.userId === myUserId);
            if (myPerm?.role) {
              role = myPerm.role;
            }
          }
        } catch (e) {
          console.error("Failed to get permissions, defaulting to viewer:", e);
        }
      }

      setOpenedRole(role);

      // 2. ✅ CRITICAL FIX: Use openItem() to track access time!
      const fullFile = await openItem(item, (folder) => {
        if (onFolderOpen) onFolderOpen(folder);
      });

      if (fullFile) {
        setOpenedFile({ ...fullFile, role });
      }
    } catch (e) {
      alert("Error opening item: " + (e?.message || "unknown"));
    } finally {
      setLoadingFile(false);
    }
  };

  const handleToggleStar = async (item, newValue) => {
    try {
      await setStarred(item.id, newValue);
      if (onRefresh) onRefresh();
    } catch (e) {
      alert("Failed to update star status: " + (e?.message || "unknown"));
    }
  };

  const handleToggleImportant = async (item, newValue) => {
    try {
      await setImportant(item.id, newValue);
      if (onRefresh) onRefresh();
    } catch (e) {
      alert("Failed to update importance status: " + (e?.message || "unknown"));
    }
  };

  const handleDelete = async (item) => {
    if (!item?.id) return;
    try {
      await moveToTrash(item.id);
      if (onRefresh) onRefresh();
      if (openedFile?.id === item.id) setOpenedFile(null);
    } catch (e) {
      alert("Move to trash failed: " + (e?.message || "unknown"));
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
    handleDelete,
  };
}