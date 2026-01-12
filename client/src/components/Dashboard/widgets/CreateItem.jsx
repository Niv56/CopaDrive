import { useState, useEffect, useRef } from "react";
import { getRootFiles, createItem } from "../../../api/filesApi";
import FileUploadHandler from "./FileUploadHandler";
import './CreateItem.css';

// ייבוא הקומפוננטות הפיזיות החדשות שיצרנו
import FolderCreator from "./creation/FolderCreator";
import TextFileCreator from "./creation/TextFileCreator";
import FileImporter from "./creation/FileImporter";

function CreateItem({ onItemCreated, currentFolderId }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [parentId, setParentId] = useState(currentFolderId || null);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mimeType, setMimeType] = useState("");
  const uploadHandlerRef = useRef(null);

  useEffect(() => {
    if (modalType) loadFolders();
  }, [modalType]);

  async function loadFolders() {
    try {
      const data = await getRootFiles();
      setFolders(Array.isArray(data) ? data.filter(f => f.type === "folder") : []);
    } catch (e) {
      console.error("Failed to load folders:", e);
    }
  }

  function openCreate(type) {
    setModalType(type);
    setMenuOpen(false);
    setName("");
    setContent("");
    setMimeType("");
    setParentId(currentFolderId || null);
  }

  function closeModal() {
    setModalType(null);
  }

  async function onSaveClicked() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const typeForServer = modalType === "upload" ? "file" : modalType;
      const created = await createItem({
        name: name.trim(),
        type: typeForServer,
        parentId: parentId || null,
        content: content,
        mimeType: typeForServer === "file" ? (mimeType || "text/plain") : ""
      });
      closeModal();
      if (onItemCreated) onItemCreated(created);
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

  // משימה 2: פונקציית עזר לקבלת כותרת דינמית
  const getModalTitle = () => {
    switch (modalType) {
      case "folder": return "Create New Folder";
      case "file": return "Create New Text File";
      case "upload": return "Import File from Computer";
      default: return "";
    }
  };

  return (
    <>
      <button className="fab" onClick={() => setMenuOpen(!menuOpen)} type="button">+</button>

      {menuOpen && (
        <div className="fab-menu">
          <button type="button" className="fab-menu-item" onClick={() => openCreate("folder")}>📁 New folder</button>
          <button type="button" className="fab-menu-item" onClick={() => openCreate("file")}>📄 New file</button>
          <button type="button" className="fab-menu-item" onClick={() => openCreate("upload")}>📤 Upload file</button>
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
              <div className="modal-title-text">{getModalTitle()}</div>
              <button type="button" className="share-btn" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              {/* משימה 1: החלפה דינמית של הקומפוננטות */}
              {modalType === "folder" && (
                <FolderCreator name={name} setName={setName} loading={loading} />
              )}

              {modalType === "file" && (
                <TextFileCreator 
                  name={name} setName={setName} 
                  content={content} setContent={setContent} 
                  loading={loading} 
                />
              )}

              {modalType === "upload" && (
                <FileImporter 
                  name={name} setName={setName} 
                  content={content} mimeType={mimeType}
                  loading={loading}
                  triggerUpload={() => uploadHandlerRef.current.triggerUpload()}
                />
              )}

              <label className="modal-label mt-3">Location</label>
              <select
                className="modal-input"
                value={parentId ?? ""}
                onChange={(e) => setParentId(e.target.value || null)}
                disabled={loading}
              >
                <option value="">My Drive</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>📁 {f.name}</option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn secondary" onClick={closeModal} disabled={loading}>Cancel</button>
              <button type="button" className="btn primary" onClick={onSaveClicked} disabled={!name.trim() || loading}>
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      <FileUploadHandler ref={uploadHandlerRef} onFileProcessed={handleFileProcessed} />
    </>
  );
}

export default CreateItem;