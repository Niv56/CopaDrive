import React from "react";

function TextViewer({ file }) {
  return (
    <div className="viewer-container">
      <textarea
        className="form-control bg-light"
        value={file.content}
        readOnly
        rows={15}
        style={{ fontFamily: 'monospace', resize: 'none' }}
      />
    </div>
  );
}

export default TextViewer;