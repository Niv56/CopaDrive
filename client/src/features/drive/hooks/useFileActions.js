import { useState } from "react";
import { setStarred, setImportant, moveToTrash, openItem, updateItem } from "../api/filesApi";
import { getPermissions } from "../api/permissionsApi";

export function useFileActions(myUserId, onRefresh) {
  const [sharingItem, setSharingItem] = useState(null);
  const [openedFile, setOpenedFile] = useState(null);
  const [editingFile, setEditingFile] = useState(null); 
  const [openedRole, setOpenedRole] = useState("viewer");
  const [loadingFile, setLoadingFile] = useState(false);

  // --- פתיחת פריט (קובץ או תיקייה) ---
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
      console.error("Error opening item:", e);
      alert("שגיאה בפתיחת הפריט: " + (e?.message || "unknown"));
    } finally {
      setLoadingFile(false);
    }
  };

  // --- שינוי סטטוס כוכב / חשיבות ---
  const handleToggleStar = async (item, newValue) => {
    try {
      await setStarred(item.id, newValue);
      if (onRefresh) onRefresh();
      
      if (openedFile?.id === item.id) {
        setOpenedFile(prev => ({ ...prev, starred: newValue }));
      }
    } catch (e) {
      console.error("Failed to update star status");
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
      console.error("Failed to update importance status");
    }
  };

  // --- לוגיקת עריכה ושמירה ---
  const handleEdit = (file) => {
    setOpenedFile(null); 
    setEditingFile(file);
  };

  const handleSaveEdit = async (updatedData) => {
    try {
      // בדיקה בסיסית שהשם לא ריק
      if (!updatedData.name || updatedData.name.trim() === "") {
        alert("שם הקובץ לא יכול להיות ריק");
        return;
      }

      // 🎯 יצירת אובייקט התיקון (Patch)
      // אנחנו שולחים רק מה שצריך כדי להימנע מהשגיאה "Type cannot be updated"
      const patch = {};

      // הוספת שם אם השתנה
      if (updatedData.name !== editingFile.name) {
        patch.name = updatedData.name.trim();
      }

      // הוספת תיקיית אב אם השתנתה
      if (updatedData.parentId !== editingFile.parentId) {
        patch.parentId = updatedData.parentId || null;
      }

      // טיפול בתוכן קובץ (רק אם זה קובץ ולא תיקייה)
      if (editingFile.type === "file") {
        // שולחים תוכן וסוג MIME רק אם התוכן באמת עבר שינוי
        if (updatedData.content !== editingFile.content) {
          patch.content = updatedData.content;
          patch.mimeType = updatedData.mimeType;
        }
      }

      // אם לא בוצע שום שינוי - פשוט סוגרים את המודל
      if (Object.keys(patch).length === 0) {
        setEditingFile(null);
        return;
      }

      // שליחה לשרת
      await updateItem(editingFile.id, patch);
      
      setEditingFile(null); 
      if (onRefresh) onRefresh(); 
    } catch (e) {
      console.error("Save error:", e);
      alert("נכשל בעדכון השינויים: " + e.message);
    }
  };

  // --- מחיקה (העברה לסל מחזור) ---
  const handleDelete = async (item) => {
    if (!item?.id) return;
    try {
      await moveToTrash(item.id);
      if (onRefresh) onRefresh();
      if (openedFile?.id === item.id) setOpenedFile(null);
    } catch (e) {
      console.error("Move to trash failed");
      alert("העברה לסל המחזור נכשלה");
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