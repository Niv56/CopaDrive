import { useEffect, useMemo, useState } from "react";
import { getRootFiles, updateItem ,getFileData } from "../../../api/filesApi"; //
import { useAuth } from "../../../contexts/AuthContext";
import { useFileActions } from "../../../hooks/useFileActions";
import FileListItem from "../widgets/FileListItem";
import FileViewerModal from "../widgets/FileViewerModal";
import ShareModal from "../widgets/ShareModal";
import "./MyDrive.css";

function MyDrive() {
  const [allFiles, setAllFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const [startInEditMode, setStartInEditMode] = useState(false);
  const { token } = useAuth();

  const myUserId = useMemo(() => {
    if (!token) return null;
    try {
      const payload = JSON.parse(window.atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      return payload.userId;
    } catch (e) { return null; }
  }, [token]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await getRootFiles();
      setAllFiles(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  };

  const {
    sharingItem, setSharingItem, openedFile, setOpenedFile, openedRole,
    handleOpen, handleToggleStar, handleToggleImportant, handleDelete,
    loadingFile
  } = useFileActions(myUserId, loadFiles);

  // --- handlers עם מנגנון Exclusivity (מניעת פתיחת כפל מודלים) ---

  const handleEditClick = async (item) => {
    setSharingItem(null); // סוגרת מודל שיתוף אם פתוח
    setStartInEditMode(true);
    if (item.type === "folder") {
      setOpenedFile(item);
    } else {
      await handleOpen(item); // טעינת תוכן הקובץ (Base64) מה-C++ Core
    }
  };

  const handleShareClick = (item) => {
    setOpenedFile(null); // סוגרת ה-Viewer אם פתוח
    setSharingItem(item);
  };

  const handleUpdateInServer = async (fileId, patch) => {
  try {
    // 1. ביצוע העדכון בשרת (PATCH)
    const updatedMetadata = await updateItem(fileId, patch); 
    
    // 2. רענון רשימת הקבצים הכללית ברקע
    await loadFiles(); 

    /**
     * 3. ניהול מצב ה-Viewer:
     * אם זו תיקייה - סוגרים את המודל כי אין לה Preview.
     * אם זה קובץ - מושכים את המידע המלא מחדש כדי לסנכרן שם, מיקום ותוכן.
     */
    if (updatedMetadata.type === "folder") {
      setOpenedFile(null); 
    } else {
      // שימוש במסלול ה-GET הנקי שהצעת
      const freshFile = await getFileData(fileId); 
      setOpenedFile(freshFile); // המודל יתעדכן עם המידע המלא והנכון
    }
  } catch (err) {
    console.error("Update failed:", err);
    alert("העדכון נכשל.");
  }
};

  // --- לוגיקה משלימה ---

  const freshOpenedFile = useMemo(() => {
    if (!openedFile) return null;
    if (openedFile.content !== undefined) return openedFile;
    return allFiles.find(f => f.id === openedFile.id) || openedFile;
  }, [allFiles, openedFile]);

  const allFolders = useMemo(() => allFiles.filter(f => f.type === "folder"), [allFiles]);

  useEffect(() => { loadFiles(); }, []);

  useEffect(() => {
    window.addEventListener("refresh-mydrive", loadFiles);
    return () => window.removeEventListener("refresh-mydrive", loadFiles);
  }, []);

  useEffect(() => {
    const onOpenFolder = (e) => {
      const folderId = e.detail.folderId;
      setCurrentFolderId(folderId);
      const folder = allFiles.find(f => f.id === folderId);
      setFolderPath([{ id: folderId, name: folder?.name || "Folder" }]);
    };
    window.addEventListener("open-folder", onOpenFolder);
    window.addEventListener("reset-mydrive", () => { setCurrentFolderId(null); setFolderPath([]); });
    return () => window.removeEventListener("open-folder", onOpenFolder);
  }, [allFiles]);

  const currentItems = useMemo(() => allFiles.filter(f => f.parentId === currentFolderId), [allFiles, currentFolderId]);
  const currentFolder = useMemo(() => allFiles.find(f => f.id === currentFolderId), [allFiles, currentFolderId]);

  return (
    <div className="mainarea" style={{ position: "relative" }}>
      {/* Loading Spinners */}
      {loading && !loadingFile && (
        <div style={{ position: "absolute", top: "15px", right: "20px", zIndex: 10 }}>
          <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
        </div>
      )}

      {loadingFile && (
        <div className="spinner-overlay" style={{ position: 'fixed', zIndex: 9999 }}>
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status"></div>
        </div>
      )}

      {/* Header & Navigation */}
      <div className="d-flex align-items-center gap-2 mb-4">
        <h2 style={{ cursor: "pointer", color: currentFolderId ? "#1a73e8" : "#202124" }}
          onClick={() => { setCurrentFolderId(null); setFolderPath([]); }}>My Drive</h2>
        {currentFolderId && (
          <>
            <span className="text-muted">/</span>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setFolderPath(p => p.slice(0, -1))}>← Back</button>
            <span className="fw-bold">{currentFolder?.name}</span>
          </>
        )}
      </div>

      {/* Files List */}
      <div className="files-container">
        {currentItems.map(item => (
          <FileListItem
            key={item.id}
            item={item}
            onOpen={async (it) => {
              setSharingItem(null); // סגירת שיתוף
              setStartInEditMode(false);
              if (it.type === "folder") {
                setCurrentFolderId(it.id);
                setFolderPath(prev => [...prev, { id: it.id, name: it.name }]);
              } else {
                await handleOpen(it);
              }
            }}
            onEdit={handleEditClick}
            onShare={handleShareClick}
            onToggleStar={handleToggleStar}
            onToggleImportant={handleToggleImportant}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Modals - ניהול תצוגה בלעדית */}
      <FileViewerModal
        file={freshOpenedFile}
        role={openedRole}
        startInEditMode={startInEditMode}
        folders={allFolders}
        onUpdate={handleUpdateInServer} //
        onClose={() => {
          setOpenedFile(null);
          setStartInEditMode(false);
        }}
        onShare={handleShareClick}
        onToggleStar={handleToggleStar}
        onToggleImportant={handleToggleImportant}
        onDelete={handleDelete}
      />

      {sharingItem && (
        <ShareModal
          item={sharingItem}
          onClose={() => setSharingItem(null)}
        />
      )}
    </div>
  );
}

export default MyDrive;