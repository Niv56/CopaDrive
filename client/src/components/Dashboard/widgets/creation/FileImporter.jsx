import React from "react";

function FileImporter({ name, setName, content, mimeType, triggerUpload, loading }) {
  return (
    <div className="creation-form">
      <label className="modal-label">File Name</label>
      <input
        className="modal-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="File name"
        disabled={loading}
      />

      <label className="modal-label">Content</label>
      {!content ? (
        /* החזרת העיצוב מהתמונה הראשונה: תיבה גדולה, אפורה ומקווקוות */
        <div
          className="text-center p-5 border rounded mb-3 bg-light"
          style={{ cursor: "pointer", borderStyle: "dashed" }}
          onClick={triggerUpload}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>☁️</div>
          <button type="button" className="btn btn-link p-0 text-decoration-none">
            Click to browse files from computer
          </button>
        </div>
      ) : (
        /* אזור ה-Preview במידה ונבחר קובץ */
        <div className="text-center p-3 border rounded mb-3 bg-light position-relative">
          {mimeType?.startsWith("image/") ? (
            <img
              src={content.startsWith('data:') ? content : `data:${mimeType};base64,${content}`}
              alt="Preview"
              style={{ maxHeight: "200px", maxWidth: "100%", borderRadius: "4px", display: "block", margin: "0 auto" }}
            />
          ) : (
            <div className="p-4 d-flex flex-column align-items-center">
              <div style={{ fontSize: "3rem", opacity: 0.5 }}>🚫</div>
              <div className="text-muted small">No preview available for this file type</div>
            </div>
          )}
          <button 
            type="button" 
            className="btn btn-sm btn-secondary mt-3" 
            onClick={triggerUpload}
          >
            🔄 Change file
          </button>
        </div>
      )}
    </div>
  );
}

export default FileImporter;