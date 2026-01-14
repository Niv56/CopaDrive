import React, { useState, useEffect, useRef, useCallback } from "react";
// תיקון נתיב: עולים שלב אחד ל-drive ואז ל-api
import { getRootFiles, createItem } from "../api/filesApi";
import FileUploadHandler from "./FileUploadHandler";
// תיקון נתיב: עולים 3 שלבים ל-src ואז ל-utils
import { encodeTextToBase64 } from "../../../shared/utils/base64Utils";
// תיקון נתיב: עולים 3 שלבים ל-src ואז ל-styles
import "../../../styles/widgets/CreateItem.css";

// ✅ ייבוא אייקונים אלגנטיים במקום אימוג'ים
import { FiFolderPlus, FiFileText, FiImage, FiUpload, FiPlus } from "react-icons/fi";

// ייבוא הקומפוננטות הישנות מה-Dashboard
import FolderCreator from "../../../components/Dashboard/widgets/creation/FolderCreator";
import TextFileCreator from "../../../components/Dashboard/widgets/creation/TextFileCreator";
import FileImporter from "../../../components/Dashboard/widgets/creation/FileImporter";
import ImageImporter from "../../../components/Dashboard/widgets/creation/ImageImporter";

const NEWLINE_PLACEHOLDER = "_@NL@_";

function CreateItem({ onItemCreated, currentFolderId }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [modalType, setModalType] = useState(null); 
    const [name, setName] = useState("");
    const [content, setContent] = useState("");
    const [size, setSize] = useState(0); 
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
            setParentId(currentFolderId || null);
        }
    }, [modalType, currentFolderId, loadFolders]);

    const closeModal = () => {
        setModalType(null);
        setName("");
        setContent("");
        setMimeType("");
        setSize(0);
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const onSaveClicked = async () => {
        if (!name.trim()) return;
        setLoading(true);

        try {
            const typeForServer = modalType === "folder" ? "folder" : "file";
            
            let rawContent = content;
            if (!rawContent || rawContent.trim() === "") {
                rawContent = "no content";
            }

            let finalContent = rawContent;
            let finalMime = mimeType;
            const isTxtFile = name.toLowerCase().endsWith('.txt');

            if (modalType === "file" || isTxtFile) {
                finalContent = rawContent.replaceAll('\n', NEWLINE_PLACEHOLDER); 
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
            alert(`Failed to save: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleFileProcessed = (fileData) => {
        setName(fileData.name);
        setContent(fileData.content); 
        setMimeType(fileData.mimeType);
        setSize(fileData.size); 
        setModalType("upload");
        setMenuOpen(false);
    };

    return (
        <>
            <div className="fab-wrapper-unique">
                {menuOpen && (
                    <div className="fab-menu-unique">
                        <button type="button" className="fab-menu-item-unique" onClick={() => { setModalType("folder"); setMenuOpen(false); }}>
                            <FiFolderPlus className="fab-new-item-icon" /> New folder
                        </button>
                        <button type="button" className="fab-menu-item-unique" onClick={() => { setModalType("file"); setMenuOpen(false); }}>
                            <FiFileText className="fab-new-item-icon" /> New file
                        </button>
                        <button type="button" className="fab-menu-item-unique" onClick={() => { setModalType("image"); setMenuOpen(false); }}>
                            <FiImage className="fab-new-item-icon" /> Upload Pic
                        </button>
                        <button type="button" className="fab-menu-item-unique" onClick={() => { setModalType("upload"); setMenuOpen(false); }}>
                            <FiUpload className="fab-new-item-icon" /> Import File
                        </button>
                    </div>
                )}
                
                <button 
                    className={`fab-btn-unique ${menuOpen ? 'open' : ''}`} 
                    onClick={() => setMenuOpen(!menuOpen)} 
                    type="button"
                >
                    {/* שימוש באייקון פלוס וקטורי חד ומדויק */}
                    <FiPlus className="fab-plus-icon" />
                    <span className="fab-label-text">Add New</span>
                </button>
            </div>

            {menuOpen && <div className="fab-backdrop-unique" onClick={() => setMenuOpen(false)}></div>}

            {modalType && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-title-row">
                            <div className="modal-title-text">
                                {modalType === "folder" ? "Create New Folder" : 
                                 modalType === "file" ? "Text Editor" : 
                                 modalType === "image" ? "Upload Picture" : "Import File"}
                            </div>
                            <button type="button" className="share-btn" onClick={closeModal}>✕</button>
                        </div>

                        <div className="modal-body">
                            {modalType === "folder" && <FolderCreator name={name} setName={setName} loading={loading} />}
                            
                            {modalType === "file" && (
                                <TextFileCreator name={name} setName={setName} content={content} setContent={setContent} loading={loading} />
                            )}
                            
                            {modalType === "image" && (
                                <>
                                    {name && <div className="selected-file-info mb-3 text-primary fw-bold">Selected: {name}</div>}
                                    <ImageImporter name={name} setName={setName} content={content} 
                                        triggerUpload={() => uploadHandlerRef.current.triggerUpload("image/*")} 
                                    />
                                </>
                            )}
                            
                            {modalType === "upload" && (
                                <>
                                    {name && (
                                        <div className="file-details-header mb-4 p-3 bg-light border rounded">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h4 className="m-0 fw-bold text-dark text-truncate" style={{maxWidth: '70%'}}>{name}</h4>
                                                <span className="badge bg-secondary">{formatBytes(size)}</span>
                                            </div>
                                        </div>
                                    )}
                                    <FileImporter name={name} setName={setName} content={content} mimeType={mimeType} loading={loading}
                                        triggerUpload={() => uploadHandlerRef.current.triggerUpload("*/*")} 
                                    />
                                </>
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