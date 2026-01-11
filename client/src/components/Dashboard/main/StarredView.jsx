import { useEffect, useState } from "react";
import { getStarredFiles, setStarred, setImportant } from "../../../api/filesApi";
import FileListItem from "../widgets/FileListItem";
import FileViewerModal from "../widgets/FileViewerModal";

function StarredView({ onChangeView }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openedFile, setOpenedFile] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getStarredFiles();
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e?.message ?? "Failed to load starred");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function onOpen(item) {
    if (item.type === "folder") {
      // ✅ עוברים ל-My Drive ואז פותחים את התיקייה שם
      onChangeView?.("mydrive");
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("open-folder", { detail: { folderId: item.id } }));
      }, 0);
      return;
    }

    // file
    setOpenedFile(item);
  }

  async function handleToggleStar(item, newValue) {
    try {
      await setStarred(item.id, newValue);
      if (!newValue) {
        setItems((prev) => prev.filter((x) => x.id !== item.id));
      } else {
        setItems((prev) =>
          prev.map((x) => (x.id === item.id ? { ...x, starred: true } : x))
        );
      }
    } catch (e) {
      alert(e?.message ?? "Failed to toggle starred");
    }
  }

  async function handleToggleImportant(item, newValue) {
    try {
      await setImportant(item.id, newValue);
      setItems((prev) =>
        prev.map((x) => (x.id === item.id ? { ...x, important: newValue } : x))
      );
    } catch (e) {
      alert(e?.message ?? "Failed to toggle important");
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div className="mainarea">
      <h2>Starred</h2>

      <div className="files-container">
        {items.map((item) => (
          <FileListItem
            key={item.id}
            item={item}
            onOpen={onOpen}
            onEdit={() => alert("יש לממש")}
            onShare={() => alert("יש לממש")}
            onDelete={() => alert("יש לממש")}
            onToggleStar={handleToggleStar}
            onToggleImportant={handleToggleImportant}
          />
        ))}
      </div>

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

export default StarredView;
