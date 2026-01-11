import { useEffect, useMemo, useState } from "react";
import { getRootFiles, getFileById } from "../../../api/filesApi";
import CreateItem from "../widgets/CreateItem";
import FileViewerModal from "../widgets/FileViewerModal";
import FileListItem from "../widgets/FileListItem";
import "./MyDrive.css";

function MyDrive() {
  const [allFiles, setAllFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [openedFile, setOpenedFile] = useState(null);

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    const handleReset = () => {
      setCurrentFolderId(null);
      loadFiles();
    };

    window.addEventListener("reset-mydrive", handleReset);

    return () => window.removeEventListener("reset-mydrive", handleReset);
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

  const currentFolder = useMemo(() => {
    return allFiles.find((f) => f.id === currentFolderId);
  }, [allFiles, currentFolderId]);

  const currentItems = useMemo(() => {
    return allFiles.filter((f) => f.parentId === currentFolderId);
  }, [allFiles, currentFolderId]);

  async function onOpen(item) {
    if (item.type === "folder") {
      setCurrentFolderId(item.id);
    } else {
      try {
        const fullFile = await getFileById(item.id);
        setOpenedFile(fullFile);
      } catch (e) {
        alert("Error loading file: " + e.message);
      }
    }
  }

  // Callback שנקרא אחרי יצירה מוצלחת
  function handleItemCreated(created) {
  if (!created) {
    loadFiles();
    return;
  }
  setAllFiles((prev) => [...prev, created]);
}


  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div className="mainarea">
      <div className="d-flex align-items-center gap-2 mb-4" style={{ fontSize: "1.1rem" }}>
        <span
          style={{ cursor: "pointer", color: "#1a73e8", fontWeight: !currentFolderId ? "bold" : "normal" }}
          onClick={() => setCurrentFolderId(null)}
        >
          My Drive
        </span>

        {currentFolderId && (
          <>
            <span className="text-muted">/</span>
            <button
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
              onClick={() => setCurrentFolderId(currentFolder?.parentId || null)}
            >
              ⬅️ Back
            </button>
            <strong className="ms-2">{currentFolder?.name}</strong>
          </>
        )}
      </div>

      <div className="files-container">
        {currentItems.length === 0 ? (
          <div style={{ textAlign: "center", color: "#999", padding: "40px" }}>
            No files or folders here.
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

      <CreateItem onItemCreated={handleItemCreated} currentFolderId={currentFolderId} />

      <FileViewerModal
        file={openedFile}
        role={"viewer"}
        onClose={() => setOpenedFile(null)}
        onEdit={() => alert("יש לממש")}
        onShare={() => alert("יש לממש")}
        onDelete={() => alert("יש לממש")}
      />
    </div>
  );
}

export default MyDrive;