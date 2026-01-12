// client/src/hooks/useFileActions.js
import { useState } from "react";
import {
  setStarred,
  setImportant,
  moveToTrash,
  openItem,
  getFilePermissions,
} from "../api/filesApi";

export function useFileActions(myUserId, onRefresh) {
  const [sharingItem, setSharingItem] = useState(null);
  const [openedFile, setOpenedFile] = useState(null);
  const [openedRole, setOpenedRole] = useState("viewer");
  const [loadingFile, setLoadingFile] = useState(false);

  // ✅ from your branch: cache fileId -> "viewer" | "editor" | "owner"
  const [resolvedRoles, setResolvedRoles] = useState({});

  const handleOpen = async (item, onFolderOpen) => {
    if (!item) return;
    setLoadingFile(true);

    try {
      // MAIN4 default role
      let role = item.ownerId === myUserId ? "owner" : "viewer";

      // ✅ from your branch: if not owner, check permissions to detect editor/viewer
      if (role !== "owner" && myUserId) {
        try {
          const data = await getFilePermissions(item.id);

          const list = Array.isArray(data)
            ? data
            : Array.isArray(data?.permissions)
            ? data.permissions
            : [];

          const myPerm = list.find((p) => p.userId === myUserId);
          if (myPerm?.role) role = myPerm.role; // "editor" / "viewer"
        } catch {
          // אם נכשל — נשאר viewer (לא מפוצצים פתיחה)
        }
      }

      // ✅ keep modal role
      setOpenedRole(role);

      // ✅ keep list role synced
      setResolvedRoles((prev) => ({ ...prev, [item.id]: role }));

      // MAIN4 open logic
      const fullFile = await openItem(item, (folder) => {
        if (onFolderOpen) onFolderOpen(folder);
      });

      if (fullFile) setOpenedFile(fullFile);
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

  // ✅ MAIN4: Move to trash (soft delete) — without confirm
  const handleDelete = async (item) => {
    if (!item?.id) return;

    try {
      await moveToTrash(item.id); // DELETE /api/files/:id
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

    // ✅ from branch
    resolvedRoles,

    handleOpen,
    handleToggleStar,
    handleToggleImportant,
    handleDelete,
  };
}
