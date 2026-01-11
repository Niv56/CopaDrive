import { useEffect, useMemo, useState } from "react";
import { getRootFiles, getFileById } from "../../../api/filesApi";
import FileListItem from "../widgets/FileListItem";
import CreateItem from "../widgets/CreateItem";
import FileViewerModal from "../widgets/FileViewerModal";
import "./MyDrive.css";

function MyDrive() {
  const [allFiles, setAllFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [openedFile, setOpenedFile] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const [loadingFile, setLoadingFile] = useState(false);

  useEffect(() => {
    loadFiles();

    function handleReset() {
      setCurrentFolderId(null);
      setFolderPath([]);
    }

    window.addEventListener("reset-mydrive", handleReset);

    return () => {
      window.removeEventListener("reset-mydrive", handleReset);
    };
  }, []);

  // Open folder event from search
  useEffect(() => {
    const handleOpenFolder = (e) => {
      const folderId = e?.detail?.folderId ?? null;
      setCurrentFolderId(folderId);
    };

    window.addEventListener("open-folder", handleOpenFolder);
    return () => window.removeEventListener("open-folder", handleOpenFolder);
  }, []);

  async function loadFiles() {
    try {
      setLoading(true);
      setError(null);

      const data = await getRootFiles();
      const list = Array.isArray(data) ? data : [];
      setAllFiles(list);
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
    if (item.type === "folder") {
      setCurrentFolderId(item.id);
      setFolderPath([...folderPath, { id: item.id, name: item.name }]);
    } else {
      // ✅ טען את התוכן המלא מהשרת
      setLoadingFile(true);
      try {
        const fullFile = await getFileById(item.id);
        setOpenedFile(fullFile);
      } catch (e) {
        console.error("Failed to load file:", e);
        alert("Failed to open file: " + e.message);
      } finally {
        setLoadingFile(false);
      }
    }
  }

  function goBack() {
    if (folderPath.length === 0) return;

    const newPath = [...folderPath];
    newPath.pop();
    setFolderPath(newPath);

    if (newPath.length === 0) {
      setCurrentFolderId(null);
    } else {
      setCurrentFolderId(newPath[newPath.length - 1].id);
    }
  }

  function goToRoot() {
    setCurrentFolderId(null);
    setFolderPath([]);
  }

  function handleItemCreated() {
    loadFiles();
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div className="mainarea">
      {/* Header with breadcrumb */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "20px"
      }}>
        <h2
          style={{
            margin: 0,
            cursor: "pointer",
            color: currentFolderId ? "#1a73e8" : "#202124",
            fontSize: "24px",
            fontWeight: "400"
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
            <span style={{ fontSize: "20px", fontWeight: "500", color: "#202124" }}>
              {currentFolder.name}
            </span>
          </>
        )}
      </div>

      {/* Files container */}
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
              onShare={() => alert("יש לממש")}
              onDelete={() => alert("יש לממש")}
            />
          ))
        )}
      </div>

      <CreateItem
        onItemCreated={handleItemCreated}
        currentFolderId={currentFolderId}
      />

      {loadingFile && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999
        }}>
          <div style={{
            background: "white",
            padding: "20px",
            borderRadius: "8px"
          }}>
            Loading file...
          </div>
        </div>
      )}

      <FileViewerModal
        file={openedFile}
        role={openedRole}
        onClose={() => setOpenedFile(null)}
        onEdit={() => alert("יש לממש")}
        onShare={() => alert("יש לממש")}
        onDelete={() => alert("יש לממש")}
      />
    </div>
  );
}

export default MyDrive;
