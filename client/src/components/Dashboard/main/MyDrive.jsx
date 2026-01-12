import { useEffect, useMemo, useState } from "react";
import { getRootFiles } from "../../../api/filesApi";
import { useAuth } from "../../../contexts/AuthContext";
import { useFileActions } from "../../../hooks/useFileActions";
import FileListItem from "../widgets/FileListItem";
import CreateItem from "../widgets/CreateItem";
import ShareModal from "../widgets/ShareModal";
import FileViewerModal from "../widgets/FileViewerModal";
import "./MyDrive.css";

function MyDrive() {
  const [allFiles, setAllFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const { token } = useAuth();

  const myUserId = useMemo(() => {
    if (!token) return null;
    const payload = JSON.parse(window.atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.userId;
  }, [token]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await getRootFiles();
      setAllFiles(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  };

  // ✅ שימוש ב-Hook לריכוז כל הפעולות
  const {
    sharingItem, setSharingItem, openedFile, setOpenedFile, openedRole,
    handleOpen, handleToggleStar, handleToggleImportant, handleDelete
  } = useFileActions(myUserId, loadFiles);

  useEffect(() => { loadFiles(); }, []);

  // האזנה לאירועי ניווט חיצוניים (למשל מתוך ה-Storage)
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

  if (loading) return <div className="mainarea">Loading My Drive...</div>;

  return (
    <div className="mainarea">
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

      <div className="files-container">
        {currentItems.map(item => (
          <FileListItem
            key={item.id}
            item={item}
            myUserId={myUserId} // ✅ העברת ה-ID לחישוב ה-Role
            onOpen={handleOpen}
            onShare={setSharingItem}
            onToggleStar={handleToggleStar}
            onToggleImportant={handleToggleImportant}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <CreateItem onItemCreated={loadFiles} currentFolderId={currentFolderId} />
      <FileViewerModal file={openedFile} role={openedRole} onClose={() => setOpenedFile(null)} onShare={setSharingItem} />
      {sharingItem && <ShareModal item={sharingItem} onClose={() => setSharingItem(null)} />}
    </div>
  );
}
export default MyDrive;