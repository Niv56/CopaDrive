import { useState } from "react";
import { setStarred, setImportant, moveToTrash, openItem, updateItem } from "../api/filesApi";
import { getPermissions } from "../api/permissionsApi";
import { useToast } from "app/providers/ToastContext";

const NEWLINE_PLACEHOLDER = "_@NL@_";

// Custom hook for managing file-related states and server-side actions 
export function useFileActions(myUserId, onRefresh) {
  const { addToast } = useToast();
  const [sharingItem, setSharingItem] = useState(null);
  const [openedFile, setOpenedFile] = useState(null);
  const [editingFile, setEditingFile] = useState(null);
  const [openedRole, setOpenedRole] = useState("viewer");
  const [loadingFile, setLoadingFile] = useState(false);

  // Resolves user permissions and retrieves full item data for viewing 
  const handleOpen = async (item, onFolderOpen) => {
    if (!item) return;
    setLoadingFile(true);
    try {
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
          console.error("Defaulting to viewer:", e);
        }
      }

      setOpenedRole(role);

      const fullFile = await openItem(item, (folder) => {
        if (onFolderOpen) onFolderOpen(folder);
      });

      if (fullFile) {
        setOpenedFile({ ...fullFile, role });
      }
    } catch (e) {
      addToast(e.message || "Failed to open item", "error");
    } finally {
      setLoadingFile(false);
    }
  };

  // Updates starred status via API and syncs local state 
  const handleToggleStar = async (item, newValue) => {
    try {
      await setStarred(item.id, newValue);
      if (onRefresh) onRefresh();

      if (openedFile?.id === item.id) {
        setOpenedFile(prev => ({ ...prev, starred: newValue }));
      }
    } catch (e) {
      addToast(e.message || "Failed to update star status", "error");
    }
  };

  // Updates importance flag via API and syncs local state 
  const handleToggleImportant = async (item, newValue) => {
    try {
      await setImportant(item.id, newValue);
      if (onRefresh) onRefresh();

      if (openedFile?.id === item.id) {
        setOpenedFile(prev => ({ ...prev, important: newValue }));
      }
    } catch (e) {
      addToast(e.message || "Failed to update importance status", "error");
    }
  };

  // Switches view from preview to edit mode 
  const handleEdit = (file) => {
    setOpenedFile(null);
    setEditingFile(file);
  };

  // Detects changes, sanitizes text content, and persists updates 
  const handleSaveEdit = async (updatedData) => {
    try {
      if (!updatedData.name || updatedData.name.trim() === "") {
        return;
      }

      const patch = {};

      if (updatedData.name !== editingFile.name) {
        patch.name = updatedData.name.trim();
      }

      if (updatedData.parentId !== editingFile.parentId) {
        patch.parentId = updatedData.parentId || null;
      }

      if (editingFile.type === "file") {
        if (updatedData.content !== editingFile.content) {
          let contentToSave = updatedData.content;
          const isTxtFile = updatedData.name.toLowerCase().endsWith('.txt') || updatedData.mimeType === "text/plain";

          // Format newlines for database compatibility
          if (isTxtFile && contentToSave) {
            contentToSave = contentToSave.replaceAll("\n", NEWLINE_PLACEHOLDER);
          }

          patch.content = contentToSave;
          patch.mimeType = updatedData.mimeType;
        }
      }

      if (Object.keys(patch).length === 0) {
        setEditingFile(null);
        return;
      }

      await updateItem(editingFile.id, patch);

      setEditingFile(null);
      if (onRefresh) onRefresh();
    } catch (e) {
      addToast(e.message || "Failed to save changes", "error");
    }
  };

  const handleDelete = async (item) => {
    if (!item?.id) return;
    try {
      await moveToTrash(item.id);
      if (onRefresh) onRefresh();
      if (openedFile?.id === item.id) setOpenedFile(null);
    } catch (e) {
      addToast(e.message || "Failed to move to trash", "error");
    }
  };

  return {
    sharingItem, setSharingItem,
    openedFile, setOpenedFile,
    editingFile, setEditingFile,
    openedRole,
    loadingFile,
    handleOpen,
    handleToggleStar,
    handleToggleImportant,
    handleEdit,
    handleSaveEdit,
    handleDelete,
  };
}