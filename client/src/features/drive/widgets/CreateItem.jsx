import { useState, useEffect, useRef } from "react"; 
import { getRootFiles, createItem } from "features/drive/api/filesApi"; 
import FileUploadHandler from "./FileUploadHandler"; 
import "styles/widgets/CreateItem.css"; 

// Component handling the creation of new Files and Folders via a Floating Action Button (FAB)
function CreateItem({ onItemCreated, currentFolderId }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'folder' | 'file' | null
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [parentId, setParentId] = useState(currentFolderId || null);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const uploadHandlerRef = useRef(null);
  const [mimeType, setMimeType] = useState("");

  // Load available folders for the location dropdown when modal opens
  useEffect(() => {
    if (modalType) {
      loadFolders();
    }
  }, [modalType]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!modalType) return;

    function onKeyDown(e) {
      if (e.key === "Escape") {
        closeModal();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
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
    setMimeType("");
    setParentId(null);
  }

 async function onSaveClicked() {
    if (!name.trim()) return;
    setLoading(true);

    try {
      const typeForServer = modalType === "upload" ? "file" : modalType;

      let finalContent = content;
      if (typeForServer === "file") {
        finalContent = content.replaceAll('\n', "_@NL@_"); 
      }

      const created = await createItem({
        name: name.trim(),
        type: typeForServer,
        parentId: parentId || null,
        content: typeForServer === "file" ? finalContent : "",
        mimeType: typeForServer === "file" ? (mimeType || "text/plain") : ""
      });

      closeModal();

      if (onItemCreated) {
        onItemCreated(created);
      }
    } catch (error) {
      alert(`Failed to create item: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  const handleFileProcessed = (fileData) => {
    setName(fileData.name);
    setContent(fileData.content);
    setMimeType(fileData.mimeType);
    setModalType("upload"); 
    setMenuOpen(false);   
  };

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
          <button
            type="button"
            className="fab-menu-item"
            onClick={() => openCreate("upload")}
          >
            📤 Upload file
          </button>
        </div>
      )}

      {modalType && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            {loading && (
              <div className="spinner-overlay">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}

            <div className="modal-title-row">
              <div className="modal-title-text">
                {modalType === "folder" ? "Create new folder" :
                  modalType === "upload" ? "Upload file from computer" : "Create new file"}
              </div>

              <button
                type="button"
                className="share-btn"
                title="Share (Feature pending)"
                onClick={() => alert("Share functionality to be implemented")}
                disabled={loading}
              >
                🔗
              </button>
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
              {currentFolderId && (
                <option value={currentFolderId}>📌 Current folder</option>
              )}

              <option value="">My Drive</option>

              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
                </option>
              ))}
            </select>

            {(modalType === "file" || modalType === "upload") && (
              <>
                <label className="modal-label">Content</label>

                {!content ? (
                  <div
                    className="text-center p-5 border rounded mb-3 bg-light"
                    style={{ cursor: "pointer", borderStyle: "dashed" }}
                    onClick={() => uploadHandlerRef.current.triggerUpload()}
                  >
                    <div style={{ fontSize: "2rem" }}>☁️</div>
                    <button type="button" className="btn btn-link">
                      Click to browse files from computer
                    </button>
                  </div>
                ) :
                  (mimeType && mimeType.startsWith("image/")) ? (
                    <div className="text-center p-3 border rounded mb-3 bg-light position-relative">
                      <img
                        src={content.startsWith('data:') ? content : `data:${mimeType};base64,${content}`}
                        alt="Preview"
                        style={{ maxHeight: "200px", maxWidth: "100%", borderRadius: "4px", display: "block", margin: "0 auto" }}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary position-absolute top-0 end-0 m-2"
                        onClick={() => uploadHandlerRef.current.triggerUpload()}
                      >
                        🔄 Change
                      </button>
                    </div>
                  ) :
                    (mimeType === "text/plain" || mimeType === "") ? (
                      <textarea
                        className="modal-textarea"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your content here..."
                        rows={8}
                        disabled={loading}
                      />
                    ) :
                      (
                        <div className="text-center p-5 border rounded mb-3 bg-light d-flex flex-column align-items-center">
                          <div style={{ fontSize: "3rem", opacity: 0.5 }}>🚫</div>
                          <div className="mt-2 fw-bold text-truncate" style={{ maxWidth: "100%" }}>{name}</div>
                          <div className="text-muted small">No preview available for this file type</div>
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm mt-3"
                            onClick={() => uploadHandlerRef.current.triggerUpload()}
                          >
                            🔄 Change file
                          </button>
                        </div>
                      )}
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
      <FileUploadHandler
        ref={uploadHandlerRef}
        onFileProcessed={handleFileProcessed}
      />
    </>
  );
}

export default CreateItem;