import { useEffect, useState, useCallback, useMemo } from "react";
import { getRecentFiles, formatLastAccessed } from "../../../api/filesApi";
import { useAuth } from "../../../contexts/AuthContext";
import { useFileActions } from "../../../hooks/useFileActions";
import FileListItem from "../widgets/FileListItem";
import FileViewerModal from "../widgets/FileViewerModal";
import ShareModal from "../widgets/ShareModal";

function RecentView() {
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const myUserId = useMemo(() => {
    if (!token) return null;
    const payload = JSON.parse(window.atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.userId;
  }, [token]);

  const loadRecent = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRecentFiles();
      setRecentFiles(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  const {
    sharingItem, setSharingItem, openedFile, setOpenedFile,
    openedRole, handleOpen, handleToggleStar, handleToggleImportant, handleDelete
  } = useFileActions(myUserId, loadRecent);

  useEffect(() => {
    loadRecent();
    window.addEventListener("reset-recent", loadRecent);
    return () => window.removeEventListener("reset-recent", loadRecent);
  }, [loadRecent]);

  if (loading) return <div className="mainarea">Loading recent files...</div>;

  return (
    <div className="mainarea">
      <h2 className="mb-4">Recent</h2>
      <div className="files-container">
        {recentFiles.length === 0 ? (
          <div className="text-center p-5 text-muted">No recent files found.</div>
        ) : (
          recentFiles.map(item => (
            <FileListItem
              key={item.id}
              item={item}
              onOpen={handleOpen}
              onShare={setSharingItem}
              onToggleStar={handleToggleStar}
              onToggleImportant={handleToggleImportant}
              onDelete={handleDelete}
              onEdit={() => alert("Edit to be implemented")}
              extraInfo={`Opened ${formatLastAccessed(item.lastAccessed)}`}
            />
          ))
        )}
      </div>

      <FileViewerModal file={openedFile} role={openedRole} onClose={() => setOpenedFile(null)} onShare={setSharingItem} />
      {sharingItem && <ShareModal item={sharingItem} onClose={() => setSharingItem(null)} />}
    </div>
  );
}

export default RecentView;