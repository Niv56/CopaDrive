import { useEffect, useState } from "react";
import { getImportantFiles, setStarred, setImportant } from "../../../api/filesApi";
import FileListItem from "../widgets/FileListItem";
import FileViewerModal from "../widgets/FileViewerModal";

function ImportantView({ onChangeView }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openedFile, setOpenedFile] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getImportantFiles();
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e?.message ?? "Failed to load important");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function onOpen(item) {
    if (item.type === "folder") {
      onChangeView?.("mydrive");
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("open-folder", { detail: { folderId: item.id } }));
      }, 0);
      return;
    }

    setOpenedFile(item);
  }

  async function handleToggleStar(item, newValue) {
    try {
      await setStarred(item.id, newValue);
      setItems((prev) =>
        prev.map((x) => (x.id === item.id ? { ...x, starred: newValue } : x))
      );
    } catch (e) {
      alert(e?.message ?? "Failed to toggle starred");
    }
  }

  async function handleToggleImportant(item, newValue) {
    try {
      await setImportant(item.id, newValue);
      if (!newValue) {
        setItems((prev) => prev.filter((x) => x.id !== item.id));
      } else {
        setItems((prev) =>
          prev.map((x) => (x.id === item.id ? { ...x, important: true } : x))
        );
      }
    } catch (e) {
      alert(e?.message ?? "Failed to toggle important");
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div className="mainarea">
      <h2>Important</h2>

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

export default ImportantView;
