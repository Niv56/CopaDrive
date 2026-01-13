import { useEffect, useMemo, useState, useCallback } from "react";
import { getRootFiles, getUsage, getCurrentUser } from "features/drive/api/filesApi";
import { useAuth } from "app/providers/AuthContext";
import { useFileActions } from "features/drive/hooks/useFileActions";
import { formatBytes } from "shared/utils/formatBytes";
import { useOwnersMap } from "features/drive/hooks/useOwnersMap";

import FileListItem from "features/drive/widgets/FileListItem";
import FileViewerModal from "features/drive/widgets/FileViewerModal";
import ShareModal from "features/drive/modals/ShareModal/ShareModal";

import ViewModeToggle from "features/drive/widgets/ViewModeToggle";
import { useViewMode } from "features/drive/providers/ViewModeContext";
import FileGridItem from "features/drive/widgets/FileGridItem";
import { FiHardDrive } from "react-icons/fi";

export default function StorageView({ onChangeView }) {
  const [usage, setUsage] = useState({ usedBytes: 0, quotaBytes: 15 * 1024 * 1024 * 1024 });
  const [files, setFiles] = useState([]);
  // Loading state exists internally
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const { token } = useAuth();
  const { viewMode } = useViewMode();

  const myUserId = useMemo(() => {
    if (!token) return null;
    try {
      return JSON.parse(
        window.atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
      ).userId;
    } catch { return null; }
  }, [token]);

  useEffect(() => {
    if (myUserId) {
        getCurrentUser(myUserId).then(setCurrentUser).catch(() => {});
    }
  }, [myUserId]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, all] = await Promise.all([getUsage(), getRootFiles()]);
      setUsage({ usedBytes: u?.usedBytes ?? 0, quotaBytes: u?.quotaBytes ?? 15 * 1024 * 1024 * 1024 });
      setFiles(Array.isArray(all) ? all : []);
    } finally {
      setLoading(false);
    }
  }, []);

  const { sharingItem, setSharingItem, openedFile, setOpenedFile, openedRole, handleOpen, handleToggleStar, handleToggleImportant, handleDelete } = useFileActions(myUserId, load);

  useEffect(() => { load(); }, [load]);

  const sortedFiles = useMemo(() => [...files].filter((f) => f.type === "file").sort((a, b) => (b.sizeBytes ?? 0) - (a.sizeBytes ?? 0)), [files]);
  const ownersMap = useOwnersMap(sortedFiles);

  const getOwnerLabel = useCallback((item) => {
      if (!item?.ownerId) return "Unknown";
      if (item.ownerId === myUserId) return "Me";
      const u = ownersMap[item.ownerId];
      const fullName = [u?.firstName, u?.lastName].filter(Boolean).join(" ").trim();
      return fullName || u?.email || "External";
  }, [ownersMap, myUserId]);

  const getOwnerAvatar = useCallback((item) => {
      if (!item?.ownerId) return "";
      if (item.ownerId === myUserId) return currentUser?.image || "";
      const u = ownersMap[item.ownerId];
      return u?.image || "";
  }, [ownersMap, myUserId, currentUser]);

  return (
    <div className="mainarea">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="m-0" style={{ color: "var(--text-primary)", textShadow: "var(--text-shadow-global)" }}>Storage</h2>
        <ViewModeToggle />
      </div>

      <div className="d-inline-flex align-items-center gap-3 px-4 py-3 rounded-4 mb-4" 
           style={{ 
               background: "rgba(255, 255, 255, 0.2)", 
               backdropFilter: "blur(10px)", 
               border: "1px solid var(--border-color)",
               boxShadow: "0 4px 15px rgba(0,0,0,0.05)"
           }}>
        <FiHardDrive size={20} style={{ color: "var(--text-primary)" }} />
        <div style={{ color: "var(--text-primary)", fontSize: "16px", fontWeight: 600, textShadow: "var(--text-shadow-global)" }}>
          {formatBytes(usage.usedBytes)} of {formatBytes(usage.quotaBytes)} used
        </div>
      </div>

      {viewMode !== "grid" && (
        <div className="d-flex align-items-center px-3 pb-2 border-bottom mb-2"
             style={{ fontSize: "13px", fontWeight: 600, gap: "10px", color: "var(--text-secondary)", textShadow: "var(--text-shadow-global)" }}>
          <div style={{ flex: 1 }}>Name</div>
          <div style={{ width: "150px" }}>Owner</div>
          <div style={{ width: "150px" }}>Date created</div>
          <div style={{ width: "100px" }}>Size</div>
          <div style={{ width: "100px" }} />
        </div>
      )}

      <div className="files-container">
        {viewMode === "grid" ? (
          <div className="d-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            {sortedFiles.map((f) => (
              <FileGridItem key={f.id} item={f} ownerLabel={getOwnerLabel(f)} ownerAvatar={getOwnerAvatar(f)}
                dateLabel={f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "—"}
                onOpen={(it) => handleOpen(it, (folder) => {
                    onChangeView?.("mydrive");
                    setTimeout(() => window.dispatchEvent(new CustomEvent("open-folder", { detail: { folderId: folder.id } })), 0);
                })}
                onShare={setSharingItem} onToggleStar={handleToggleStar} onToggleImportant={handleToggleImportant} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          sortedFiles.map((f) => (
            <FileListItem key={f.id} item={f} ownerLabel={getOwnerLabel(f)} ownerAvatar={getOwnerAvatar(f)}
              dateLabel={f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "—"}
              onOpen={(it) => handleOpen(it, (folder) => {
                  onChangeView?.("mydrive");
                  setTimeout(() => window.dispatchEvent(new CustomEvent("open-folder", { detail: { folderId: folder.id } })), 0);
              })}
              onShare={setSharingItem} onToggleStar={handleToggleStar} onToggleImportant={handleToggleImportant} onDelete={handleDelete} />
          ))
        )}
      </div>

      <FileViewerModal file={openedFile} role={openedRole} onClose={() => setOpenedFile(null)} onShare={setSharingItem}
        onDelete={async () => { if (!openedFile) return; await handleDelete(openedFile); setOpenedFile(null); }} />
      {sharingItem ? <ShareModal item={sharingItem} onClose={() => setSharingItem(null)} /> : null}
    </div>
  );
}