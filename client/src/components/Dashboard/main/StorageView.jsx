import { useEffect, useMemo, useState } from "react";
import { getRootFiles, getUsage } from "../../../api/filesApi";
import { useAuth } from "../../../contexts/AuthContext";
import { useFileActions } from "../../../hooks/useFileActions";
import { formatBytes } from "../../../utils/formatBytes";
import FileListItem from "../widgets/FileListItem";
import FileViewerModal from "../widgets/FileViewerModal";
import ShareModal from "../widgets/ShareModal";

export default function StorageView({ onChangeView }) {
  const [usage, setUsage] = useState({ usedBytes: 0, quotaBytes: 15 * 1024 * 1024 * 1024 });
  const [files, setFiles] = useState([]);
  const { token } = useAuth();

  const myUserId = useMemo(() => {
    if (!token) return null;
    return JSON.parse(window.atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).userId;
  }, [token]);

  async function load() {
    const [u, all] = await Promise.all([getUsage(), getRootFiles()]);
    setUsage({ usedBytes: u?.usedBytes ?? 0, quotaBytes: u?.quotaBytes ?? 15 * 1024 * 1024 * 1024 });
    setFiles(Array.isArray(all) ? all : []);
  }

  const {
    sharingItem, setSharingItem, openedFile, setOpenedFile, openedRole,
    handleOpen, handleToggleStar, handleToggleImportant, handleDelete
  } = useFileActions(myUserId, load);

  useEffect(() => { load(); }, []);

  const sortedFiles = useMemo(() => [...files].filter(f => f.type === "file").sort((a, b) => b.sizeBytes - a.sizeBytes), [files]);

  return (
    <div className="mainarea">
      <h2 className="mb-2">Storage</h2>
      <div className="text-muted mb-4">{formatBytes(usage.usedBytes)} of {formatBytes(usage.quotaBytes)} used</div>

      <div className="files-container">
        {sortedFiles.map(f => (
          <FileListItem
            key={f.id} item={f}
            onOpen={(it) => handleOpen(it, (folder) => {
              onChangeView?.("mydrive");
              setTimeout(() => window.dispatchEvent(new CustomEvent("open-folder", { detail: { folderId: folder.id } })), 0);
            })}
            onShare={setSharingItem}
            onToggleStar={handleToggleStar}
            onToggleImportant={handleToggleImportant}
            onDelete={handleDelete}
          />
        ))}
      </div>
      <FileViewerModal file={openedFile} role={openedRole} onClose={() => setOpenedFile(null)} onShare={setSharingItem} />
      {sharingItem && <ShareModal item={sharingItem} onClose={() => setSharingItem(null)} />}
    </div>
  );
}