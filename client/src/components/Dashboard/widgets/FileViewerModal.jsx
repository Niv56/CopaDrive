import React from "react";
import FilePreviewContent from "./FilePreviewContent";

function FileViewerModal({
  file,
  onClose,
  onShare,
  onDelete,
  onToggleStar,
  onToggleImportant
}) {
  if (!file) return null;

  const stop = (e) => { e.stopPropagation(); };

  const isStarred = !!file.starred;
  const isImportant = !!file.important;
  const isEditable = file.mimeType?.startsWith("text/") || file.mimeType === "application/json";

  // בדיקה האם הקובץ עדיין בשלב טעינה מהשרת
  const isFileLoading = file.type === "file" && file.content === undefined;

  // 📥 פונקציית ההורדה המרכזית
  const handleDownload = () => {
    if (!file || !file.content) {
      alert("אין תוכן זמין להורדה.");
      return;
    }

    try {
      // 1. פענוח ה-Base64 למערך בייטים
      const byteCharacters = atob(file.content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // 2. יצירת Blob עם ה-MimeType הנכון (חשוב עבור .docx, .png וכו')
      const blob = new Blob([byteArray], { type: file.mimeType || 'application/octet-stream' });

      // 3. יצירת URL והפעלת הורדה
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name; // שימוש בשם המקורי של הקובץ
      document.body.appendChild(link);
      link.click();

      // 4. ניקוי זיכרון
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("נכשלה הכנת הקובץ להורדה.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card viewer-modal" onClick={stop}>
        
        <div className="modal-title-row d-flex align-items-center justify-content-between">
          <div className="modal-title-text" style={{ overflow: "hidden", flex: 1 }}>
            <h2 className="fw-bold m-0 text-truncate" title={file.name}>
              {file.name}
            </h2>
          </div>

          <div className="modal-action-buttons d-flex gap-2 align-items-center ms-3">
            <button 
              className="action-icon-btn" 
              onClick={() => onToggleStar(file, !isStarred)}
              style={isStarred ? { color: "#FFD54F" } : {}}
              title="Star"
            >
              {isStarred ? "★" : "☆"}
            </button>

            <button 
              className="action-icon-btn" 
              onClick={() => onToggleImportant(file, !isImportant)}
              style={isImportant ? { color: "#EF5350" } : {}}
              title="Mark Important"
            >
              {isImportant ? "🔖" : "🏷️"}
            </button>

            <button className="action-icon-btn" onClick={() => onShare(file)} title="Share">🔗</button>

            {isEditable && (
              <button 
                className="action-icon-btn" 
                onClick={() => alert("Edit mode coming soon!")}
                title="Edit"
              >
                ✏️
              </button>
            )}

            <button className="action-icon-btn delete" onClick={() => onDelete(file)} title="Delete">🗑️</button>
            <button className="share-btn close-x-btn ms-2" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="modal-body mt-4" style={{ minHeight: "200px" }}>
          {isFileLoading ? (
            <div className="d-flex flex-column align-items-center justify-content-center h-100 py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-3 text-muted">טוען תוכן קובץ...</p>
            </div>
          ) : (
            <FilePreviewContent file={file} />
          )}
        </div>

        <div className="modal-actions mt-4 d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          <button 
            type="button" 
            className="btn btn-primary" // הכפתור הכחול שראינו ב-Mockup
            disabled={isFileLoading} 
            onClick={handleDownload} // חיבור הפונקציה החדשה
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

export default FileViewerModal;