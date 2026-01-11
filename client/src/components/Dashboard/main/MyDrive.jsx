import { useEffect, useMemo, useState } from "react";
import { getRootFiles, openItem } from "../../../api/filesApi"; // ✅ שימוש ב-openItem
import FileListItem from "../widgets/FileListItem";
import CreateItem from "../widgets/CreateItem";
import ShareModal from "../widgets/ShareModal";
import FileViewerModal from "../widgets/FileViewerModal";
import { useAuth } from "../../../contexts/AuthContext";
import "./MyDrive.css";

function MyDrive() {
  const [allFiles, setAllFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sharingItem, setSharingItem] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [openedFile, setOpenedFile] = useState(null);
  const [openedRole, setOpenedRole] = useState("viewer");
  const [folderPath, setFolderPath] = useState([]);
  const [loadingFile, setLoadingFile] = useState(false);

  const { token } = useAuth();

  const myUserId = useMemo(() => {
    if (!token) return null;
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(window.atob(base64));
      return payload.userId || null;
    } catch { return null; }
  }, [token]);

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    const handleReset = () => {
      setCurrentFolderId(null);
      setFolderPath([]);
    };
    window.addEventListener("reset-mydrive", handleReset);
    return () => window.removeEventListener("reset-mydrive", handleReset);
  }, []);

  async function loadFiles() {
    try {
      setLoading(true);
      const data = await getRootFiles();
      setAllFiles(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message ?? "Failed to load files");
    } finally {
      setLoading(false);
    }
  }

  const currentItems = useMemo(() => {
    return allFiles.filter((f) => f.parentId === currentFolderId);
  }, [allFiles, currentFolderId]);

  const currentFolder = useMemo(() => {
    if (!currentFolderId) return null;
    return allFiles.find(f => f.id === currentFolderId);
  }, [allFiles, currentFolderId]);

  async function onOpen(item) {
    setLoadingFile(true);
    try {
      const role = item.ownerId && myUserId && item.ownerId === myUserId ? "owner" : "viewer";
      setOpenedRole(role);

      const fullFile = await openItem(item, (folder) => {
        setCurrentFolderId(folder.id);
        setFolderPath((prev) => [...prev, { id: folder.id, name: folder.name }]);
      });

      if (fullFile) setOpenedFile(fullFile);
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setLoadingFile(false);
    }
  }

  function goBack() {
    const newPath = [...folderPath];
    newPath.pop();
    setFolderPath(newPath);
    setCurrentFolderId(newPath.length === 0 ? null : newPath[newPath.length - 1].id);
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="mainarea">
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <h2 style={{ cursor: "pointer", color: currentFolderId ? "#1a73e8" : "#202124" }} onClick={() => { setCurrentFolderId(null); setFolderPath([]); }}>
          My Drive
        </h2>
        {currentFolderId && (
          <>
            <span>/</span>
            <button className="btn btn-sm btn-outline-secondary" onClick={goBack}>← Back</button>
            <span>{currentFolder?.name}</span>
          </>
        )}
      </div>

      <div className="files-container">
        {currentItems.map((item) => (
          <FileListItem
            key={item.id} item={item} onOpen={onOpen}
            onShare={(item) => setSharingItem(item)}
          />
        ))}
      </div>

      <CreateItem onItemCreated={loadFiles} currentFolderId={currentFolderId} />

      <FileViewerModal
        file={openedFile}
        ole={openedRole}
        onClose={() => setOpenedFile(null)}
        onShare={(item) => setSharingItem(item)}
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