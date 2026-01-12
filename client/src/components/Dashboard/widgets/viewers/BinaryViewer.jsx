import React from "react";

function BinaryViewer({ file, onDownload }) {
  return (
    <div className="viewer-container text-center p-5">
      <div style={{ fontSize: "5rem" }}>📄</div>
      <h4 className="mt-3">{file.name}</h4>
      <p className="text-muted">No preview available for this file type ({file.mimeType})</p>
      <button className="btn btn-primary mt-3" onClick={onDownload}>
        ⬇️ Download File
      </button>
    </div>
  );
}

export default BinaryViewer;