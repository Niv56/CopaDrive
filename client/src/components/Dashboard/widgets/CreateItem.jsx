import React, { useState, useEffect, useRef, useCallback } from "react";
import { getRootFiles, createItem } from "../../../api/filesApi";
import FileUploadHandler from "./FileUploadHandler";
import { encodeTextToBase64 } from "../../../utils/base64Utils";
import ImageImporter from "./creation/ImageImporter";
import './CreateItem.css';

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

  const loadFolders = useCallback(async () => {
    try {
      const data = await getRootFiles();
      setFolders(Array.isArray(data) ? data.filter(f => f.type === "folder") : []);
    } catch (e) {
      console.error("Failed to load folders:", e);
    }
  }, []);

  useEffect(() => {
    if (modalType) {
      loadFolders();
      setParentId(currentFolderId || "");
    }
  }, [modalType, currentFolderId, loadFolders]);

  const closeModal = () => {
    setModalType(null);
    setName("");
    setContent("");
    setMimeType("");
  };

  const onSaveClicked = async () => {
    if (!name.trim()) return;
    setLoading(true);

    try {
      const typeForServer = modalType === "folder" ? "folder" : "file";
      
      // 🎯 הפתרון הפשוט: הזרקת "no content" אם השדה ריק
      let rawContent = content;
      if (!rawContent || rawContent.trim() === "") {
        rawContent = "no content";
      }

      let finalContent = rawContent;
      let finalMime = mimeType;
      const isTxtFile = name.toLowerCase().endsWith('.txt');

      // קידוד ל-Base64 עבור קבצי טקסט (כולל ה-"no content")
      if (modalType === "file" || isTxtFile || rawContent === "no content") {
        finalContent = encodeTextToBase64(rawContent);
        finalMime = "text/plain";
      }

      const newItem = {
        name: name.trim(),
        type: typeForServer,
        parentId: parentId || null,
        content: finalContent,
        mimeType: finalMime || "application/octet-stream"
      };

      const created = await createItem(newItem);
      closeModal();
      if (onItemCreated) onItemCreated(created);
    } catch (error) {
      console.error("Save error:", error);
      alert(`Failed to save: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileProcessed = (fileData) => {
    const isTxt = fileData.name.toLowerCase().endsWith('.txt') || fileData.mimeType === 'text/plain';
    const isImg = fileData.mimeType.startsWith('image/');

    if (isTxt && modalType === "file") {
      try {
        setContent(window.atob(fileData.content));
      } catch (e) {
        setContent(fileData.content);
      }
    } else {
      setContent(fileData.content);
      setMimeType(fileData.mimeType);
    }
    setName(fileData.name);
    setMenuOpen(false);
  };

  // 🛠️ וידוא שהכותרת קיימת ומוגדרת נכון
  const getModalTitle = () => {
    switch (modalType) {
      case "folder": return "Create New Folder";
      case "file": return "Text Editor"; // זו הכותרת שחיפשת
      case "image": return "Upload Picture";
      case "upload": return "Import File";
      default: return "Create Item";
    }
  };

  return (
    <>
      <button className="fab" onClick={() => setMenuOpen(!menuOpen)} type="button">+</button>

      {menuOpen && (
        <div className="fab-menu">
          <button type="button" className="fab-menu-item" onClick={() => { setModalType("folder"); setMenuOpen(false); }}>📁 New folder</button>
          <button type="button" className="fab-menu-item" onClick={() => { setModalType("file"); setMenuOpen(false); }}>📄 New file</button>
          <button type="button" className="fab-menu-item" onClick={() => { setModalType("image"); setMenuOpen(false); }}>🖼️ Upload Pic</button>
          <button type="button" className="fab-menu-item" onClick={() => { setModalType("upload"); setMenuOpen(false); }}>📥 Import File</button>
        </div>
      )}

      {modalType && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            
            {/* 🟢 כאן נמצאת הכותרת שנעלמה */}
            <div className="modal-title-row">
              <div className="modal-title-text">{getModalTitle()}</div>
              <button type="button" className="share-btn" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              {modalType === "folder" && <FolderCreator name={name} setName={setName} loading={loading} />}
              {modalType === "file" && (
                <TextFileCreator name={name} setName={setName} content={content} setContent={setContent} loading={loading} />
              )}
              {modalType === "image" && (
                <ImageImporter name={name} setName={setName} content={content} 
                  triggerUpload={() => uploadHandlerRef.current.triggerUpload("image/*")} 
                />
              )}
              {modalType === "upload" && (
                <FileImporter name={name} setName={setName} content={content} mimeType={mimeType} loading={loading}
                  triggerUpload={() => uploadHandlerRef.current.triggerUpload("*/*")} 
                />
              )}

              <label className="modal-label mt-3">Location</label>
              <select className="modal-input" value={parentId ?? ""} onChange={(e) => setParentId(e.target.value || null)}>
                <option value="">My Drive</option>
                {folders.map((f) => <option key={f.id} value={f.id}>📁 {f.name}</option>)}
              </select>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn secondary" onClick={closeModal}>Cancel</button>
              <button type="button" className="btn primary" onClick={onSaveClicked} disabled={!name.trim() || loading}>
                {loading ? "Creating..." : "Save to Drive"}
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