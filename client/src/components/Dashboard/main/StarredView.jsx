import { useEffect, useState, useMemo } from "react";
import { getStarredFiles } from "../../../api/filesApi";
import { useAuth } from "../../../contexts/AuthContext";
import { useFileActions } from "../../../hooks/useFileActions";
import FileListItem from "../widgets/FileListItem";
import FileViewerModal from "../widgets/FileViewerModal";
import ShareModal from "../widgets/ShareModal";

function StarredView({ onChangeView }) {
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
      const data = await getStarredFiles();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load starred items", e);
    } finally {
      setLoading(false);
    }
  };

  const {
    sharingItem, setSharingItem, openedFile, setOpenedFile,
    openedRole, handleOpen, handleToggleStar, loadingFile, handleToggleImportant, handleDelete
  } = useFileActions(myUserId, loadData);

  useEffect(() => { loadData(); }, []);

  if (loading) return <div className="mainarea">Loading starred items...</div>;

  return (
      <div className="mainarea">
      {loadingFile && (
        <div className="spinner-overlay" style={{ position: 'fixed', zIndex: 9999 }}>
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Opening file...</span>
          </div>
        </div>
      )}
      <h2 className="mb-4">Starred</h2>
      <div className="files-container">
        {items.length === 0 ? (
          <div className="text-center p-5 text-muted">No starred items yet.</div>
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

export default StarredView;