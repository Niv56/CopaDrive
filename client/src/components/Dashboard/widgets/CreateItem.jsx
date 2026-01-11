import { useState, useEffect } from "react";
import { getRootFiles, createItem } from "../../../api/filesApi";


function CreateItem({ onItemCreated, currentFolderId }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [parentId, setParentId] = useState(currentFolderId || null);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (modalType) {
      loadFolders();
    }
  }, [modalType]);

  async function loadFolders() {
    try {
      const data = await getRootFiles();
      const allFolders = Array.isArray(data) ? data.filter(f => f.type === "folder") : [];
      setFolders(allFolders);
    } catch (e) {
      console.error("Failed to load folders:", e);
    }
  }

  function openCreate(type) {
    setParentId(currentFolderId || null);
    setModalType(type);
    setMenuOpen(false);
    setName("");
    setContent("");
  }

  function closeModal() {
    setModalType(null);
    setName("");
    setContent("");
    setParentId(null);
  }

  async function onSaveClicked() {
    if (!name.trim()) return;

    setLoading(true);
    try {
      await createItem({
        name: name.trim(),
        type: modalType,
        parentId: parentId || null,
        content: modalType === "file" ? content : ""
      });

      closeModal();

      // קרא ל-callback במקום window.location.reload()
      if (onItemCreated) {
        onItemCreated();
      }
    } catch (error) {
      alert(`Failed to create ${modalType}: ${error.message}`);
    } finally {
      setLoading(false);
    }
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
            📁 New folder
          </button>
          <button
            type="button"
            className="fab-menu-item"
            onClick={() => openCreate("file")}
          >
            📄 New file
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
              placeholder={modalType === "folder" ? "Folder name" : "File name"}
              disabled={loading}
              autoFocus
            />

            <label className="modal-label">Location</label>
            <select
              className="modal-input"
              value={parentId ?? ""}
              onChange={(e) => setParentId(e.target.value || null)}
              disabled={loading}
            >
              <option value="">My Drive</option>

              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
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
                  placeholder="Write your content here..."
                  rows={8}
                  disabled={loading}
                />
              </>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="btn secondary"
                onClick={closeModal}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn primary"
                onClick={onSaveClicked}
                disabled={!name.trim() || loading}
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CreateItem;