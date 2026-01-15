import { useState } from "react";
import { setStarred, setImportant, moveToTrash, openItem, updateItem } from "../api/filesApi";
import { getPermissions } from "../api/permissionsApi";

export function useFileActions(myUserId, onRefresh) {
  const [sharingItem, setSharingItem] = useState(null);
  const [openedFile, setOpenedFile] = useState(null);
  const [editingFile, setEditingFile] = useState(null); 
  const [openedRole, setOpenedRole] = useState("viewer");
  const [loadingFile, setLoadingFile] = useState(false);

  // --- Viewing Logic ---
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
      alert("Error opening item: " + (e?.message || "unknown"));
    } finally {
      setLoadingFile(false);
    }
  };

  // --- Toggles Logic ---
  const handleToggleStar = async (item, newValue) => {
    try {
      await setStarred(item.id, newValue);
      if (onRefresh) onRefresh();
      
      if (openedFile?.id === item.id) {
        setOpenedFile(prev => ({ ...prev, starred: newValue }));
      }
    } catch (e) {
      alert("Failed to update star status");
    }
  };

  const handleToggleImportant = async (item, newValue) => {
    try {
      await setImportant(item.id, newValue);
      if (onRefresh) onRefresh();

      if (openedFile?.id === item.id) {
        setOpenedFile(prev => ({ ...prev, important: newValue }));
      }
    } catch (e) {
      alert("Failed to update importance status");
    }
  };

  // --- Edit Logic ---
  const handleEdit = (file) => {
    setOpenedFile(null); 
    setEditingFile(file);
  };

  const handleSaveEdit = async (updatedData) => {
    try {
      
      const patch = {
        name: updatedData.name,
        parentId: updatedData.parentId || null
      };

      if (editingFile.type === "file") {
        patch.content = updatedData.content;
        
        
        patch.mimeType = updatedData.mimeType;
      }

      await updateItem(editingFile.id, patch);
      
      setEditingFile(null); 
      if (onRefresh) onRefresh(); 
    } catch (e) {
        alert("Failed to save changes: " + e.message);
    }
  };

  const handleDelete = async (item) => {
    if (!item?.id) return;
    try {
      await moveToTrash(item.id);
      if (onRefresh) onRefresh();
      if (openedFile?.id === item.id) setOpenedFile(null);
    } catch (e) {
      alert("Move to trash failed");
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