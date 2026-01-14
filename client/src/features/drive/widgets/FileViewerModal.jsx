import React from "react";
// Imports from the new sub-component architecture
import ImageViewer from "../../../components/Dashboard/widgets/viewers/ImageViewer";
import TextViewer from "../../../components/Dashboard/widgets/viewers/TextViewer";
import BinaryViewer from "../../../components/Dashboard/widgets/viewers/BinaryViewer";

function FileViewerModal({
  file,
  role,
  onClose,
  onEdit,
  onShare,
  onDelete,
  onToggleStar,
  onToggleImportant
}) {
  if (!file) return null;

  const canEdit = role === "owner" || role === "editor";
  const isStarred = !!file.starred;
  const isImportant = !!file.important;

  // Helper to stop event propagation
  const stop = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    let processedContent = file.content || "";

    // Restoration of newlines from socket placeholders
    if (!file.mimeType || file.mimeType === "text/plain") {
      processedContent = processedContent.replaceAll("_@NL@_", "\n");
    }

    if (file.mimeType && file.mimeType !== "text/plain") {
      link.href = `data:${file.mimeType};base64,${processedContent}`;
    } else {
      const blob = new Blob([processedContent], { type: "text/plain" });
      link.href = URL.createObjectURL(blob);
    }
    
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Logic from HEAD: Selecting the correct sub-viewer
  const renderViewer = () => {
    const mime = file.mimeType || "";
    if (mime.startsWith("image/")) return <ImageViewer file={file} />;
    
    // For text files, ensure we pass the content with restored newlines
    if (mime === "text/plain" || file.type === "file") {
      const displayFile = {
        ...file,
        content: file.content ? file.content.replaceAll("_@NL@_", "\n") : ""
      };
      return <TextViewer file={displayFile} />;
    }

    return <BinaryViewer file={file} onDownload={handleDownload} />;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card viewer-modal" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-title-row d-flex align-items-center justify-content-between mb-3">
          <div className="modal-title-text">
            <h2 className="fw-bold m-0" style={{ fontSize: "1.25rem" }}>{file.name}</h2>
            <div style={{ fontSize: 12, color: "#666" }}>Role: {role}</div>
          </div>

          <div className="modal-action-buttons d-flex gap-2 align-items-center">
            {/* 1. Star Toggle Button */}
            <button 
              className="btn secondary" 
              onClick={(e) => { stop(e); onToggleStar(file, !isStarred); }}
              style={isStarred ? { color: "#FFD54F" } : {}}
              title="Toggle Star"
            >
              {isStarred ? "★" : "☆"}
            </button>

            {/* 2. Important Toggle Button */}
            <button 
              className="btn secondary" 
              onClick={(e) => { stop(e); onToggleImportant(file, !isImportant); }}
              style={isImportant ? { color: "#EF5350" } : {}}
              title="Mark as Important"
            >
              {isImportant ? "🔖" : "🏷️"}
            </button>

            {/* 3. Download Button */}
            <button type="button" className="btn secondary" onClick={(e) => { stop(e); handleDownload(); }} title="Download">
              📥
            </button>

            {/* 4. Edit Button (Role Protected) */}
            {canEdit && (
              <button type="button" className="btn secondary" onClick={(e) => { stop(e); onEdit(file); }} title="Edit">
                ✏️
              </button>
            )}

            {/* 5. Share Button */}
            <button className="btn secondary" onClick={(e) => { stop(e); onShare(file); }} title="Share">
              🔗
            </button>

            {/* 6. Delete Button */}
            <button className="btn secondary text-danger" onClick={(e) => { stop(e); onDelete(file); }} title="Delete">
              🗑️
            </button>

            <button className="btn secondary ms-2" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Content Area calling the sub-viewers */}
        <div className="modal-body" style={{ border: "1px solid #eee", borderRadius: 12, padding: 20, minHeight: 300, backgroundColor: "#fafafa" }}>
          {renderViewer()}
        </div>

        <div className="modal-footer-actions mt-3 d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          <button type="button" className="btn btn-primary" onClick={handleDownload}>Download</button>
        </div>
      </div>
    </div>
  );
}

export default FileViewerModal;