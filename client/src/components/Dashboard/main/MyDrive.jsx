import { useEffect, useMemo, useState } from "react";
import {
  getRootFiles,
  getFileById,
  openItem,
  setStarred,
  setImportant,
} from "../../../api/filesApi";

import FileListItem from "../widgets/FileListItem";
import CreateItem from "../widgets/CreateItem";
import ShareModal from "../widgets/ShareModal";
import FileViewerModal from "../widgets/FileViewerModal";
import { useAuth } from "../../../contexts/AuthContext";
import "./MyDrive.css";

function MyDrive() {
  const [allFiles, setAllFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFile, setLoadingFile] = useState(false);
  const [error, setError] = useState(null);

  const [sharingItem, setSharingItem] = useState(null);

  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const [openedFile, setOpenedFile] = useState(null);
  const [openedRole, setOpenedRole] = useState("viewer");

  const { token } = useAuth();

  const myUserId = useMemo(() => {
    if (!token) return null;
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(window.atob(base64));
      return payload.userId || null;
    } catch {
      return null;
    }
  }, [token]);

  useEffect(() => {
    loadFiles();
  }, []);

  // reset from outside
  useEffect(() => {
    function handleReset() {
      setCurrentFolderId(null);
      setFolderPath([]);
      setOpenedFile(null);
    }

    window.addEventListener("reset-mydrive", handleReset);
    return () => window.removeEventListener("reset-mydrive", handleReset);
  }, []);

  // ✅ open folder/file from outside (Starred/Important/Storage etc.)
  useEffect(() => {
    function handleOpenFolder(e) {
      const folderId = e?.detail?.folderId;
      if (!folderId) return;

      const folder = allFiles.find((f) => f.id === folderId);
      setCurrentFolderId(folderId);
      setFolderPath([{ id: folderId, name: folder?.name || "Folder" }]);
      setOpenedFile(null);
    }

    function handleOpenFile(e) {
      const fileId = e?.detail?.fileId;
      if (!fileId) return;

      (async () => {
        try {
          const full = await getFileById(fileId);
          if (!full) return;

          const parentId = full.parentId ?? null;
          setCurrentFolderId(parentId);

          if (parentId) {
            const parent = allFiles.find((f) => f.id === parentId);
            setFolderPath([{ id: parentId, name: parent?.name || "Folder" }]);
          } else {
            setFolderPath([]);
          }

          const role =
            full.ownerId && myUserId && full.ownerId === myUserId ? "owner" : "viewer";
          setOpenedRole(role);

          setOpenedFile(full);
        } catch (err) {
          alert(err?.message ?? "Failed to open file");
        }
      })();
    }

    window.addEventListener("open-folder", handleOpenFolder);
    window.addEventListener("open-file", handleOpenFile);

    return () => {
      window.removeEventListener("open-folder", handleOpenFolder);
      window.removeEventListener("open-file", handleOpenFile);
    };
  }, [allFiles, myUserId]);

  async function loadFiles() {
    try {
      setLoading(true);
      setError(null);

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
    return allFiles.find((f) => f.id === currentFolderId) || null;
  }, [allFiles, currentFolderId]);

  async function onOpen(item) {
    if (!item) return;

    setLoadingFile(true);
    try {
      const role =
        item.ownerId && myUserId && item.ownerId === myUserId ? "owner" : "viewer";
      setOpenedRole(role);

      const fullFile = await openItem(item, (folder) => {
        setCurrentFolderId(folder.id);
        setFolderPath((prev) => [...prev, { id: folder.id, name: folder.name }]);
        setOpenedFile(null);
      });

      if (fullFile) setOpenedFile(fullFile);
    } catch (e) {
      alert(e?.message ?? "Failed to open item");
    } finally {
      setLoadingFile(false);
    }
  }

  function goBack() {
    setFolderPath((prev) => {
      if (prev.length === 0) return prev;

      const next = prev.slice(0, -1);
      const last = next[next.length - 1];

      setCurrentFolderId(last ? last.id : null);
      return next;
    });
  }

  function goToRoot() {
    setCurrentFolderId(null);
    setFolderPath([]);
    setOpenedFile(null);
  }

  function handleItemCreated() {
    loadFiles();
    window.dispatchEvent(new Event("storage-changed"));
  }

  // ✅ STAR / IMPORTANT handlers (works for files + folders)
  async function handleToggleStar(item, newValue) {
    try {
      await setStarred(item.id, newValue);
      setAllFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, starred: newValue } : f))
      );
      window.dispatchEvent(new Event("storage-changed"));
    } catch (e) {
      alert(e?.message ?? "Failed to toggle starred");
    }
  }

  async function handleToggleImportant(item, newValue) {
    try {
      await setImportant(item.id, newValue);
      setAllFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, important: newValue } : f))
      );
      window.dispatchEvent(new Event("storage-changed"));
    } catch (e) {
      alert(e?.message ?? "Failed to toggle important");
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "crimson" }}>{error}</div>;

  return (
    <div className="mainarea">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            margin: 0,
            cursor: "pointer",
            color: currentFolderId ? "#1a73e8" : "#202124",
            fontSize: "24px",
            fontWeight: "400",
          }}
          onClick={goToRoot}
        >
          My Drive
        </h2>

        {currentFolderId && currentFolder && (
          <>
            <span style={{ fontSize: "24px", color: "#5f6368" }}>/</span>
            <button
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
              onClick={goBack}
              style={{ fontSize: "14px" }}
            >
              ← Back
            </button>
            <span
              style={{
                fontSize: "20px",
                fontWeight: "500",
                color: "#202124",
              }}
            >
              {currentFolder.name}
            </span>
          </>
        )}

        {loadingFile && <span style={{ color: "#5f6368" }}>Opening...</span>}
      </div>

      {/* Files */}
      <div className="files-container">
        {currentItems.length === 0 ? (
          <div style={{ textAlign: "center", color: "#999", padding: "40px" }}>
            No files or folders here. Click + to create one!
          </div>
        ) : (
          currentItems.map((item) => (
            <FileListItem
              key={item.id}
              item={item}
              onOpen={onOpen}
              onEdit={() => alert("יש לממש")}
              onShare={(it) => setSharingItem(it)}     // ✅ real share flow
              onDelete={() => alert("יש לממש")}
              onToggleStar={handleToggleStar}
              onToggleImportant={handleToggleImportant}
            />
          ))
        )}
      </div>

      <CreateItem onItemCreated={handleItemCreated} currentFolderId={currentFolderId} />

      <FileViewerModal
        file={openedFile}
        role={openedRole}                              // ✅ fixed "ole" -> "role"
        onClose={() => setOpenedFile(null)}
        onEdit={() => alert("יש לממש")}
        onShare={(it) => setSharingItem(it ?? openedFile)} // ✅ share from viewer
        onDelete={() => alert("יש לממש")}
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
