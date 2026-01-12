import React from "react";
import ImageViewer from "./viewers/ImageViewer";
import TextViewer from "./viewers/TextViewer";
import BinaryViewer from "./viewers/BinaryViewer";

function FileViewerModal({
  file,
  onClose,
  onShare,
  onDelete,
  onToggleStar,
  onToggleImportant,
  onDownload
}) {
  if (!file) return null;

  // פונקציית עזר לעצירת אירועים כפי שמומשה ב-FileListItem
  const stop = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const renderViewer = () => {
    const mime = file.mimeType || "";
    if (mime.startsWith("image/")) return <ImageViewer file={file} />;
    if (mime === "text/plain" || file.type === "file") return <TextViewer file={file} />;
    return <BinaryViewer file={file} onDownload={() => onDownload(file)} />;
  };

  // שליפת הערכים המעודכנים (שימוש בשמות השדות מה-API: starred/important)
  const isStarred = !!file.starred;
  const isImportant = !!file.important;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card viewer-modal" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-title-row d-flex align-items-center justify-content-between">
          <div className="modal-title-text">
            <h2 className="fw-bold m-0">{file.name}</h2>
          </div>

          <div className="modal-action-buttons d-flex gap-2 align-items-center">
            {/* כפתור כוכב עם עצירת אירוע ושינוי מצב */}
            <button 
              className="action-icon-btn" 
              onClick={(e) => { stop(e); onToggleStar(file, !isStarred); }}
              style={isStarred ? { color: "#FFD54F" } : {}}
            >
              {isStarred ? "★" : "☆"}
            </button>

            {/* כפתור חשוב עם עצירת אירוע ושינוי מצב */}
            <button 
              className="action-icon-btn" 
              onClick={(e) => { stop(e); onToggleImportant(file, !isImportant); }}
              style={isImportant ? { color: "#EF5350" } : {}}
            >
              {isImportant ? "🔖" : "🏷️"}
            </button>

            <button className="action-icon-btn" onClick={(e) => { stop(e); onShare(file); }}>
              🔗
            </button>

            {(file.mimeType === "text/plain" || file.type === "file") && (
              <button className="action-icon-btn" onClick={(e) => { stop(e); alert("Edit mode coming soon!"); }}>
                ✏️
              </button>
            )}

            <button className="action-icon-btn delete" onClick={(e) => { stop(e); onDelete(file); }}>
              🗑️
            </button>

            <button className="share-btn close-x-btn ms-2" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="modal-body mt-4">
          {renderViewer()}
        </div>

        <div className="modal-actions mt-4 d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          <button type="button" className="btn btn-primary" onClick={(e) => { stop(e); onDownload(file); }}>Download</button>
        </div>
      </div>
    </div>
  );
}

export default FileViewerModal;