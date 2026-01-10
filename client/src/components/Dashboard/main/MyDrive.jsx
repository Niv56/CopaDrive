import { useEffect, useMemo, useState } from "react";
import { getRootFiles } from "../../../api/filesApi";
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

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getRootFiles(); // listTopLevel
        const list = Array.isArray(data) ? data : [];
        setAllFiles(list);
      } catch (e) {
        setError(e?.message ?? "Failed to load files");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const currentItems = useMemo(() => {
    return allFiles.filter((f) => f.parentId === currentFolderId);
  }, [allFiles, currentFolderId]);

  const folders = useMemo(() => {
    return allFiles.filter((f) => f.type === "folder");
  }, [allFiles]);

  function onOpen(item) {
    if (item.type === "folder") {
      setCurrentFolderId(item.id);
    } else {
      setOpenedFile(item);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div className="mainarea">
      <h2>My Drive</h2>

      <div className="files-container">
        {currentItems.map((item) => (
          <FileListItem
            key={item.id}
            item={item}
            onOpen={onOpen}
            onEdit={() => alert("יש לממש")}
            onShare={() => alert("יש לממש")}
            onDelete={() => alert("יש לממש")}
          />
        ))}
      </div>

      <CreateItem folders={folders} />

      <FileViewerModal
        file={openedFile}
        role={"viewer"} // כרגע בלי לוגיקה
        onClose={() => setOpenedFile(null)}
        onEdit={() => alert("יש לממש")}
        onShare={() => alert("יש לממש")}
        onDelete={() => alert("יש לממש")}
      />
    </div>
  );
}

export default MyDrive;
