import { useState } from "react";
import { setStarred, setImportant, moveToTrash, openItem } from "../api/filesApi";

/**
 * Custom hook to manage common file operations across different views.
 * Handles opening, starring, marking as important, and soft deleting files.
 */
export function useFileActions(myUserId, onRefresh) {
  const [sharingItem, setSharingItem] = useState(null);
  const [openedFile, setOpenedFile] = useState(null);
  const [openedRole, setOpenedRole] = useState("viewer");
  const [loadingFile, setLoadingFile] = useState(false);

<<<<<<< HEAD:client/src/features/drive/hooks/useFileActions.js
  // Handle opening a file or folder
=======
>>>>>>> 9d61e09 (Revert "Register validation"):client/src/hooks/useFileActions.js
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
      alert("Error opening item: " + (e?.message || "unknown"));
    } finally {
      setLoadingFile(false);
    }
  };

  // Toggle "Starred" status
  const handleToggleStar = async (item, newValue) => {
    try {
      await setStarred(item.id, newValue);
      if (onRefresh) onRefresh();
    } catch (e) {
      alert("Failed to update star status: " + (e?.message || "unknown"));
    }
  };

  // Toggle "Important" status
  const handleToggleImportant = async (item, newValue) => {
    try {
      await setImportant(item.id, newValue);
      if (onRefresh) onRefresh();
    } catch (e) {
      alert("Failed to update importance status: " + (e?.message || "unknown"));
    }
  };
// ✅ Move to trash (soft delete) — without confirm
const handleDelete = async (item) => {
  if (!item?.id) return;

<<<<<<< HEAD:client/src/features/drive/hooks/useFileActions.js
  // Soft delete (Move to Trash) - No confirmation dialog required here
  const handleDelete = async (item) => {
    if (!item?.id) return;

    try {
      await moveToTrash(item.id);
      if (onRefresh) onRefresh();
      
      // Close the modal if the currently opened file was deleted
      if (openedFile?.id === item.id) setOpenedFile(null);
    } catch (e) {
      alert("Move to trash failed: " + (e?.message || "unknown"));
    }
  };
=======
  try {
    await moveToTrash(item.id); // DELETE /api/files/:id
    if (onRefresh) onRefresh();
    if (openedFile?.id === item.id) setOpenedFile(null);
  } catch (e) {
    alert("Move to trash failed: " + (e?.message || "unknown"));
  }
};
>>>>>>> 9d61e09 (Revert "Register validation"):client/src/hooks/useFileActions.js

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