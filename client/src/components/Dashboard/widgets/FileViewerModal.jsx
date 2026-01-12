import React from "react";

function FileViewerModal({ file, role, onClose, onEdit, onShare, onDelete }) {
  if (!file) return null;

  const canEdit = role === "owner" || role === "editor";

  // לוגיקת הורדה
  const handleDownload = () => {
    const link = document.createElement("a");
    if (file.mimeType && file.mimeType !== "text/plain") {
      link.href = `data:${file.mimeType};base64,${file.content}`;
    } else {
      const blob = new Blob([file.content], { type: "text/plain" });
      link.href = URL.createObjectURL(blob);
    }
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <div className="modal-title" style={{ marginBottom: 4 }}>
              {file.name}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>
              Role: {role}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {/* 1. כפתור הורדה */}
            <button type="button" className="btn secondary" onClick={handleDownload} title="Download">
              📥
            </button>

            {/* 2. כפתור עריכה (רק למי שיכול) */}
            {canEdit && (
              <button type="button" className="btn secondary" onClick={onEdit} title="Edit">
                ✏️
              </button>
            )}

            {/* 3. כפתור שיתוף - הוחזר */}
            <button type="button" className="btn secondary" onClick={() => onShare(file)} title="Share">
              🔗
            </button>

            {/* 4. כפתור מחיקה - הוחזר */}
            <button type="button" className="btn secondary" onClick={onDelete} title="Delete">
              🗑️
            </button>

            <button type="button" className="btn secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 20, minHeight: 300, display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 10 }}>
            Content:
          </div>

          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>

            {/* 1. מקרה של תמונה: מציגים את התמונה עצמה */}
            {file.mimeType?.startsWith("image/") ? (
              <img
                src={`data:${file.mimeType};base64,${file.content}`}
                alt={file.name}
                style={{ maxWidth: "100%", maxHeight: "400px", borderRadius: 8, objectFit: "contain" }}
              />
            ) :

              /* 2. מקרה של טקסט: מציגים את הטקסט הנקי */
              file.mimeType === "text/plain" ? (
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, width: "100%", alignSelf: "flex-start" }}>
                  {file.content || "(Empty file)"}
                </div>
              ) :

                /* 3. מקרה של קובץ בינארי (או כל סוג אחר): מציגים No Preview */
                (
                  <div className="text-center">
                    <div style={{ fontSize: "3.5rem", marginBottom: 15 }}>🚫</div>
                    <div className="fw-bold" style={{ fontSize: "1.2rem" }}>No preview available</div>
                    <div className="text-muted mb-4">Please download the file to view its content.</div>
                    <button className="btn primary" onClick={handleDownload} style={{ padding: "10px 25px" }}>
                      📥 Download to View
                    </button>
                  </div>
                )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FileViewerModal;