import React from "react";

// Show a modal with file details and available actions based on the user's role.
function FileViewerModal({ file, role, onClose, onEdit, onShare, onDelete }) {
  if (!file) return null;

  const canEdit = role === "owner" || role === "editor";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <div className="modal-title" style={{ marginBottom: 4 }}>
              {file.name}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>
              Mode: {canEdit ? "Read (editable)" : "Read-only"} · Role: {role}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {canEdit && (
              <button type="button" className="btn secondary" onClick={onEdit} title="Edit">
                ✏️
              </button>
            )}

            <button
              type="button"
              className="btn secondary"
              onClick={() => onShare(file)}
              title="Share"
            >
              🔗
            </button>

            <button type="button" className="btn secondary" onClick={onDelete} title="Delete">
              🗑️
            </button>

            <button type="button" className="btn secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 12,
            padding: 12,
            minHeight: 200,
          }}
        >
          <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Content:</div>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
            {file.content || "(Empty file - no content yet)"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FileViewerModal;
