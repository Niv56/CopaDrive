import React, { useState, useEffect } from "react";
import FilePreviewContent from "./FilePreviewContent";
import FileEditorView from "./FileEditorView";

// 🛠️ הגדרת ה-Placeholder כקבוע לשימוש בכל הפונקציות
const NEWLINE_PLACEHOLDER = "_@NL@_";

function FileViewerModal({
  file,
  startInEditMode = false,
  onClose,
  onShare,
  onDelete,
  onToggleStar,
  onToggleImportant,
  onUpdate,
  role,
  folders = []
}) {
  const [isEditing, setIsEditing] = useState(startInEditMode);
  const [editData, setEditData] = useState({ name: "", content: "", parentId: "", mimeType: "" });

  useEffect(() => {
    setIsEditing(startInEditMode);
  }, [file?.id, startInEditMode]);

  // 1. 🛠️ הכנת הנתונים לעריכה: המרה של ה-Placeholders ל-Newlines
  useEffect(() => {
    if (file) {
      const isTxt = file.mimeType === "text/plain" || file.name.endsWith(".txt");
      let displayContent = file.content || "";

      if (isTxt && displayContent.includes(NEWLINE_PLACEHOLDER)) {
        displayContent = displayContent.replaceAll(NEWLINE_PLACEHOLDER, "\n");
      }

      setEditData({
        name: file.name || "",
        content: displayContent,
        parentId: file.parentId || null,
        mimeType: file.mimeType || ""
      });
    }
  }, [file, isEditing]);

  if (!file) return null;

  const stop = (e) => { e.stopPropagation(); };
  const actualRole = role || file.role || "viewer";
  const canEdit = actualRole === "owner" || actualRole === "editor";
  const isFolder = file.type === "folder";
  const isFileLoading = !isFolder && file.content === undefined;

  // 2. 🛠️ טיפול בהורדה: החזרת ה-Newlines לקובץ הפיזי
  const handleDownload = () => {
    if (!file || !file.content) return;

    try {
      let blob;
      const isPlainText = file.mimeType === "text/plain" || file.name.endsWith(".txt");

      if (isPlainText) {
        // המרה חזרה לפורמט טקסט סטנדרטי עבור הקובץ שיירד למחשב
        const cleanContent = file.content.replaceAll(NEWLINE_PLACEHOLDER, "\n");
        blob = new Blob([cleanContent], { type: "text/plain" });
      } else {
        // עבור קבצים בינאריים - פענוח מ-Base64 כרגיל
        const byteCharacters = atob(file.content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        blob = new Blob([new Uint8Array(byteNumbers)], { type: file.mimeType });
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download failed:", e);
    }
  };

  // 3. 🛠️ לוגיקת שמירה: המרה חזרה ל-Placeholders לפני השליחה לשרת
  const handleSave = async (updatedFields) => {
    if (!onUpdate || !file) return;

    const patch = {};
    const isTxt = file.mimeType === "text/plain" || file.name.endsWith(".txt");

    if (updatedFields.name !== file.name) {
      patch.name = updatedFields.name.trim();
    }
    if (updatedFields.parentId !== file.parentId) {
      patch.parentId = updatedFields.parentId || null;
    }

    if (!isFolder) {
      if (updatedFields.content !== file.content) {
        // החלפת ה-Newlines ב-Placeholders כדי שה-Socket יקבל את המידע תקין
        patch.content = isTxt 
          ? updatedFields.content.replaceAll("\n", NEWLINE_PLACEHOLDER)
          : updatedFields.content;
      }
      if (updatedFields.mimeType !== file.mimeType) {
        patch.mimeType = updatedFields.mimeType;
      }
    }

    if (Object.keys(patch).length > 0) {
      try {
        await onUpdate(file.id, patch);
      } catch (err) {
        return; 
      }
    }

    if (isFolder) {
      onClose();
    } else {
      setIsEditing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-card viewer-modal ${isEditing ? "edit-mode" : ""}`} 
           onClick={stop} 
           style={{ maxWidth: isEditing ? "800px" : "650px", transition: "all 0.3s ease" }}>
        
        <div className="modal-title-row d-flex align-items-center justify-content-between">
          <div className="modal-title-text" style={{ flex: 1, overflow: "hidden" }}>
            <h2 className="fw-bold m-0 text-truncate" title={file.name}>
              {isEditing ? `Editing: ${file.name}` : file.name}
            </h2>
          </div>

          <div className="modal-action-buttons d-flex gap-2 ms-3">
            {!isEditing && (
              <>
                <button className="action-icon-btn" onClick={() => onToggleStar(file, !file.starred)} style={file.starred ? { color: "#FFD54F" } : {}}>
                  {file.starred ? "★" : "☆"}
                </button>
                <button className="action-icon-btn" onClick={() => onToggleImportant(file, !file.important)} style={file.important ? { color: "#EF5350" } : {}}>
                  {file.important ? "🔖" : "🏷️"}
                </button>
                {canEdit && (
                  <button className="action-icon-btn" onClick={() => setIsEditing(true)} title="Edit">✏️</button>
                )}
                <button className="action-icon-btn delete" onClick={() => onDelete(file)} title="Delete">🗑️</button>
              </>
            )}
            <button className="share-btn close-x-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="modal-body mt-4">
          {isEditing ? (
            <FileEditorView 
              file={file} 
              initialData={editData} 
              folders={folders}
              onSave={handleSave}
              onCancel={isFolder ? onClose : () => setIsEditing(false)}
            />
          ) : isFileLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">טוען תוכן קובץ...</p>
            </div>
          ) : (
            <FilePreviewContent file={file} />
          )}
        </div>

        {!isEditing && !isFolder && (
          <div className="modal-actions mt-4 d-flex justify-content-end gap-2 border-top pt-3">
             <button className="btn btn-secondary" onClick={onClose}>Close</button>
             <button className="btn btn-primary" onClick={handleDownload} disabled={isFileLoading}>Download</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileViewerModal;