import { useState } from "react";

function CreateItem({ folders = [] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // null | "folder" | "file"
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [parentId, setParentId] = useState(null);

  function openCreate(type) {
    setParentId(null);
    setModalType(type);
    setMenuOpen(false);
    setName("");
    setContent("");
  }

  function closeModal() {
    setModalType(null);
    setName("");
    setContent("");
  }

  function onSaveClicked() {
    alert("יש לממש");
    closeModal();
  }

  return (
    <>
      <button
        className="fab"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Create"
        type="button"
      >
        +
      </button>

      {menuOpen && (
        <div className="fab-menu">
          <button
            type="button"
            className="fab-menu-item"
            onClick={() => openCreate("folder")}
          >
            New folder
          </button>
          <button
            type="button"
            className="fab-menu-item"
            onClick={() => openCreate("file")}
          >
            New file
          </button>
        </div>
      )}

      {modalType && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">
              {modalType === "folder" ? "Create new folder" : "Create new file"}
            </div>

            <label className="modal-label">Name</label>
            <input
              className="modal-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={modalType === "folder" ? "Folder name" : "File title"}
            />

            <label className="modal-label">Destination</label>
            <select
              className="modal-input"
              value={parentId ?? ""}
              onChange={(e) => setParentId(e.target.value || null)}
            >
              <option value="">/ (top level)</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>

            {modalType === "file" && (
              <>
                <label className="modal-label">Content</label>
                <textarea
                  className="modal-textarea"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write something..."
                  rows={8}
                />
              </>
            )}

            <div className="modal-actions">
              <button type="button" className="btn secondary" onClick={closeModal}>
                Cancel
              </button>
              <button
                type="button"
                className="btn primary"
                onClick={onSaveClicked}
                disabled={!name.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CreateItem;
