import { useEffect, useState, useMemo } from "react";
import { getImportantFiles } from "../../../api/filesApi";
import { useAuth } from "../../../contexts/AuthContext";
import { useFileActions } from "../../../hooks/useFileActions";
import FileListItem from "../widgets/FileListItem";
import FileViewerModal from "../widgets/FileViewerModal";
import ShareModal from "../widgets/ShareModal";

function ImportantView({ onChangeView }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const myUserId = useMemo(() => {
    if (!token) return null;
    const payload = JSON.parse(window.atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.userId;
  }, [token]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getImportantFiles();
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  const {
    sharingItem, setSharingItem, openedFile, setOpenedFile,
    openedRole, handleOpen, handleToggleStar, handleToggleImportant, handleDelete
  } = useFileActions(myUserId, loadData);

  useEffect(() => { loadData(); }, []);

  if (loading) return <div className="mainarea">Loading important items...</div>;

  return (
    <div className="mainarea">
      <h2 className="mb-4">Important</h2>
      <div className="files-container">
        {items.length === 0 ? (
          <div className="text-center p-5 text-muted">No important items yet.</div>
        ) : (
          items.map(item => (
            <FileListItem
              key={item.id}
              item={item}
              onOpen={(it) => handleOpen(it, (folder) => {
                onChangeView?.("mydrive");
                setTimeout(() => window.dispatchEvent(new CustomEvent("open-folder", { detail: { folderId: folder.id } })), 0);
              })}
              onShare={setSharingItem}
              onToggleStar={handleToggleStar}
              onToggleImportant={handleToggleImportant}
              onDelete={handleDelete}
              onEdit={() => alert("Edit to be implemented")}
            />
          ))
        )}
      </div>

      <FileViewerModal file={openedFile} role={openedRole} onClose={() => setOpenedFile(null)} onShare={setSharingItem} />
      {sharingItem && <ShareModal item={sharingItem} onClose={() => setSharingItem(null)} />}
    </div>
  );
}

export default ImportantView;