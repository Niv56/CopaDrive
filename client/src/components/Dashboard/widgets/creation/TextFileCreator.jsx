import React from "react";

function TextFileCreator({ name, setName, content, setContent, loading }) {
  return (
    <div className="creation-form">
      <label className="modal-label">File Name</label>
      <input
        className="modal-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. notes.txt"
        disabled={loading}
        autoFocus
      />
      
      <label className="modal-label">Content</label>
      <textarea
        className="modal-textarea"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start typing your content here..."
        rows={8}
        disabled={loading}
      />
    </div>
  );
}

export default TextFileCreator;