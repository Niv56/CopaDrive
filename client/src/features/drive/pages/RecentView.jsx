import { useEffect, useState, useCallback, useMemo } from "react";
import { getRecentFiles, formatLastAccessed } from "features/drive/api/filesApi";
import { useAuth } from "app/providers/AuthContext";
import { useFileActions } from "features/drive/hooks/useFileActions";
import { useOwnersMap } from "features/drive/hooks/useOwnersMap";
import { useViewMode } from "features/drive/providers/ViewModeContext";

import FileListItem from "features/drive/widgets/FileListItem";
import FileGridItem from "features/drive/widgets/FileGridItem";
import FileViewerModal from "features/drive/widgets/FileViewerModal";
import FileEditorView from "components/Dashboard/widgets/FileEditorView"; // ✅ ייבוא העורך
import ViewModeToggle from "features/drive/widgets/ViewModeToggle";
import ShareModal from "features/drive/modals/ShareModal/ShareModal";
import { FiClock } from "react-icons/fi";

function RecentView() {
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { viewMode } = useViewMode();

  const myUserId = useMemo(() => {
    if (!token) return null;
    try {
      return JSON.parse(
        window.atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
      ).userId;
    } catch {
      return null;
    }
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

  // ✅ Destructuring כולל פונקציות עריכה
  const {
    sharingItem, setSharingItem,
    openedFile, setOpenedFile,
    editingFile, setEditingFile,
    openedRole,
    handleOpen,
    handleToggleStar,
    handleToggleImportant,
    handleDelete,
    handleEdit,     // ✅
    handleSaveEdit  // ✅
  } = useFileActions(myUserId, loadRecent);

  useEffect(() => {
    loadRecent();
    window.addEventListener("reset-recent", loadRecent);
    return () => window.removeEventListener("reset-recent", loadRecent);
  }, [loadRecent]);

  const ownersMap = useOwnersMap(recentFiles);

  const getOwnerLabel = useCallback((item) => {
    if (!item?.ownerId) return "Unknown";
    if (item.ownerId === myUserId) return "Me";
    const u = ownersMap[item.ownerId];
    const fullName = [u?.firstName, u?.lastName].filter(Boolean).join(" ").trim();
    return fullName || u?.email || "External";
  }, [ownersMap, myUserId]);

  const getOwnerAvatar = useCallback((item) => {
    if (!item?.ownerId) return "";
    const u = ownersMap[item.ownerId];
    return u?.image || "";
  }, [ownersMap]);

  const dateLabelForRecent = useCallback((item) => (item?.lastAccessed ? formatLastAccessed(item.lastAccessed) : "—"), []);

  return (
    <div className="mainarea">
      <div className="page-title-container">
        <h2>Recent</h2>
        <ViewModeToggle />
      </div>

      {recentFiles.length === 0 ? (
        <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "50vh", textAlign: "center" }}>
          <div className="d-flex align-items-center justify-content-center"
            style={{
              width: "100px", height: "100px", borderRadius: "50%",
              background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)",
              border: "1px solid var(--border-color)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
            }}>
            <FiClock size={42} style={{ color: "var(--text-primary)", opacity: 0.9 }} />
          </div>
        </div>
      ) : viewMode === "list" ? (
        <>
          <div className="d-flex align-items-center px-3 pb-2 border-bottom mb-2"
            style={{ fontSize: "13px", fontWeight: 600, gap: "10px", color: "var(--text-secondary)", textShadow: "var(--text-shadow-global)" }}>
            <div style={{ flex: 1 }}>Name</div>
            <div style={{ width: "150px" }}>Owner</div>
            <div style={{ width: "150px" }}>Last opened</div>
            <div style={{ width: "100px" }}>Size</div>
            <div style={{ width: "100px" }} />
          </div>

          <div className="files-container">
            {recentFiles.map((item) => (
              <FileListItem key={item.id} item={item} ownerLabel={getOwnerLabel(item)} ownerAvatar={getOwnerAvatar(item)}
                dateLabel={dateLabelForRecent(item)} onOpen={handleOpen} onShare={setSharingItem}
                onToggleStar={handleToggleStar} onToggleImportant={handleToggleImportant} onDelete={handleDelete}
                onEdit={handleEdit} // ✅ מחובר לפונקציה האמיתית
              />
            ))}
          </div>
        </>
      ) : (
        <div className="files-grid">
          {recentFiles.map((item) => (
            <FileGridItem key={item.id} item={item} ownerLabel={getOwnerLabel(item)} ownerAvatar={getOwnerAvatar(item)}
              dateLabel={dateLabelForRecent(item)} showSize={true} onOpen={handleOpen} />
          ))}
        </div>
      )}

      <FileViewerModal
        file={openedFile}
        role={openedRole}
        onClose={() => setOpenedFile(null)}
        onShare={setSharingItem}
        onToggleStar={handleToggleStar}
        onToggleImportant={handleToggleImportant}
        onEdit={handleEdit} // ✅
        onDelete={async () => { if (!openedFile) return; await handleDelete(openedFile); setOpenedFile(null); }}
      />

      {/* ✅ מודל העריכה */}
      {editingFile && (
        <div className="modal-overlay" onClick={() => setEditingFile(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ minWidth: "600px" }}>
            <div className="p-4">
              <h4 className="mb-4">Edit File</h4>
              <FileEditorView
                file={editingFile}
                initialData={editingFile}
                folders={[]} // Recent files don't show folder structure for move
                onSave={handleSaveEdit}
                onCancel={() => setEditingFile(null)}
              />
            </div>
          </div>
        </div>
      )}

      {sharingItem && <ShareModal item={sharingItem} onClose={() => setSharingItem(null)} />}
    </div>
  );
}

export default RecentView;