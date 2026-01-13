import { useState } from "react";
// החלפת openItem ב-getFileData לצורך הפרדת מסלול הקריאה מהעדכון
import { setStarred, setImportant, moveToTrash, getFileData } from "../api/filesApi";
import { getPermissions } from "../api/permissionsApi";

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
      // 1. קביעת Role (נשאר ללא שינוי)
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

      // 2. טיפול בנתיב הקריאה (Clean Read Path)
      if (item.type === "folder") {
        // עבור תיקיות, נפעיל רק את ה-callback המקומי
        if (onFolderOpen) onFolderOpen(item);
      } else {
        // עבור קבצים, נשתמש ב-getFileData שמבצע GET בלבד ללא PATCH ל-access
        const fullFile = await getFileData(item.id);
        if (fullFile) {
          setOpenedFile({ ...fullFile, role });
        }
      }
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

<<<<<<< HEAD:client/src/features/drive/hooks/useFileActions.js
<<<<<<< HEAD:client/src/features/drive/hooks/useFileActions.js
  // Soft delete (Move to Trash) - No confirmation dialog required here
=======
>>>>>>> d20b577 (Permissions Added):client/src/hooks/useFileActions.js
  const handleDelete = async (item) => {
    if (!item?.id) return;
    try {
      await moveToTrash(item.id);
      if (onRefresh) onRefresh();
<<<<<<< HEAD:client/src/features/drive/hooks/useFileActions.js
      
      // Close the modal if the currently opened file was deleted
=======
>>>>>>> d20b577 (Permissions Added):client/src/hooks/useFileActions.js
      if (openedFile?.id === item.id) setOpenedFile(null);
    } catch (e) {
      alert("Move to trash failed: " + (e?.message || "unknown"));
    }
  };
<<<<<<< HEAD:client/src/features/drive/hooks/useFileActions.js
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
=======
>>>>>>> d20b577 (Permissions Added):client/src/hooks/useFileActions.js

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