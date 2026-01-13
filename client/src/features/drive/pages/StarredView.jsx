import { useEffect, useState, useMemo, useCallback } from "react";
import { getStarredFiles, getCurrentUser } from "features/drive/api/filesApi";
import { useAuth } from "app/providers/AuthContext";
import { useFileActions } from "features/drive/hooks/useFileActions";
import { useOwnersMap } from "features/drive/hooks/useOwnersMap";
import { useViewMode } from "features/drive/providers/ViewModeContext";

import FileListItem from "features/drive/widgets/FileListItem";
import FileGridItem from "features/drive/widgets/FileGridItem";
import FileViewerModal from "features/drive/widgets/FileViewerModal";
import ViewModeToggle from "features/drive/widgets/ViewModeToggle";
import ShareModal from "features/drive/modals/ShareModal/ShareModal";
import { FiStar } from "react-icons/fi"; 

function StarredView({ onChangeView }) {
  const [items, setItems] = useState([]);
  // Loading state exists internally
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const { token } = useAuth();
  const { viewMode } = useViewMode();

  const myUserId = useMemo(() => {
    if (!token) return null;
    try {
      const payload = JSON.parse(
        window.atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
      );
      return payload.userId;
    } catch {
      return null;
    }
  }, [token]);

  useEffect(() => {
    if (myUserId) {
        getCurrentUser(myUserId).then(setCurrentUser).catch(() => {});
    }
  }, [myUserId]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getStarredFiles();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load starred items", e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const { sharingItem, setSharingItem, openedFile, setOpenedFile, openedRole, handleOpen, handleToggleStar, handleToggleImportant, handleDelete } = useFileActions(myUserId, loadData);

  useEffect(() => { loadData(); }, [loadData]);
  const ownersMap = useOwnersMap(items);

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

  const onOpenFolder = (folder) => {
    onChangeView?.("mydrive");
    setTimeout(() => window.dispatchEvent(new CustomEvent("open-folder", { detail: { folderId: folder.id } })), 0);
  };

  return (
    <div className="mainarea" style={{ height: "100%", overflowY: "auto", padding: "24px" }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="m-0" style={{ color: "var(--text-primary)", textShadow: "var(--text-shadow-global)" }}>Starred</h2>
        <ViewModeToggle />
      </div>

      {items.length === 0 ? (
         /* ✅ Empty State - Glass Star Icon */
         <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "50vh", textAlign: "center" }}>
           <div className="d-flex align-items-center justify-content-center" 
                style={{ 
                    width: "100px", height: "100px", borderRadius: "50%", 
                    background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)",
                    border: "1px solid var(--border-color)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
                }}>
              <FiStar size={42} style={{ color: "var(--text-primary)", opacity: 0.8 }} />
           </div>
         </div>
      ) : viewMode === "list" ? (
        <>
          <div className="d-flex align-items-center px-3 pb-2 border-bottom mb-2"
               style={{ fontSize: "13px", fontWeight: 600, gap: "10px", color: "var(--text-secondary)", textShadow: "var(--text-shadow-global)" }}>
            <div style={{ flex: 1 }}>Name</div>
            <div style={{ width: "150px" }}>Owner</div>
            <div style={{ width: "150px" }}>Date created</div>
            <div style={{ width: "100px" }}>Size</div>
            <div style={{ width: "100px" }} />
          </div>
          <div className="files-container">
            {items.map((item) => (
              <FileListItem key={item.id} item={item} ownerLabel={getOwnerLabel(item)} ownerAvatar={getOwnerAvatar(item)}
                dateLabel={item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                onOpen={(it) => handleOpen(it, onOpenFolder)} onShare={setSharingItem} onToggleStar={handleToggleStar}
                onToggleImportant={handleToggleImportant} onDelete={handleDelete} />
            ))}
          </div>
        </>
      ) : (
        <div className="files-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {items.map((item) => (
            <FileGridItem key={item.id} item={item} ownerLabel={getOwnerLabel(item)} ownerAvatar={getOwnerAvatar(item)}
              dateLabel={item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
              showSize={true} onOpen={(it) => handleOpen(it, onOpenFolder)} />
          ))}
        </div>
      )}

      <FileViewerModal file={openedFile} role={openedRole} onClose={() => setOpenedFile(null)} onShare={setSharingItem}
        onDelete={async () => { if (!openedFile) return; await handleDelete(openedFile); setOpenedFile(null); }} />
      {sharingItem && <ShareModal item={sharingItem} onClose={() => setSharingItem(null)} />}
    </div>
  );
}

export default StarredView;