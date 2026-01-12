import React from "react";

function FolderCreator({ name, setName, loading }) {
  return (
    <div className="creation-form">
      <label className="modal-label">Folder Name</label>
      <input
        className="modal-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. My Documents"
        disabled={loading}
        autoFocus
      />
    </div>
  );
}

export default FolderCreator;