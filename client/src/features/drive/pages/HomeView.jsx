import { useEffect, useMemo, useState, useCallback } from "react";
import "styles/pages/MyDrive.css";
import { getRootFiles } from "features/drive/api/filesApi";
import { useAuth } from "app/providers/AuthContext";
import { useFileActions } from "features/drive/hooks/useFileActions";
import { useOwnersMap } from "features/drive/hooks/useOwnersMap";

import FileListItem from "features/drive/widgets/FileListItem";
import FileViewerModal from "features/drive/widgets/FileViewerModal";
import FileEditorView from "components/Dashboard/widgets/FileEditorView"; // ✅ ייבוא העורך
import ShareModal from "features/drive/modals/ShareModal/ShareModal";

import ViewModeToggle from "features/drive/widgets/ViewModeToggle";
import { useViewMode } from "features/drive/providers/ViewModeContext";
import FileGridItem from "features/drive/widgets/FileGridItem";
import { FiFolder, FiFile } from "react-icons/fi";

export default function HomeView({ onChangeView }) {
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

  const [loading, setLoading] = useState(true);
  const [allItems, setAllItems] = useState([]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const rootRes = await getRootFiles();
      setAllItems(Array.isArray(rootRes) ? rootRes : []);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Destructuring מלא כולל עריכה
  const {
    sharingItem, setSharingItem,
    openedFile, setOpenedFile,
    editingFile, setEditingFile,
    openedRole,
    handleOpen,
    handleToggleStar,
    handleToggleImportant,
    handleEdit,
    handleSaveEdit,
    handleDelete,
  } = useFileActions(myUserId, loadAll);

  useEffect(() => {
    loadAll();
    window.addEventListener("reset-home", loadAll);
    return () => window.removeEventListener("reset-home", loadAll);
  }, [loadAll]);

  const ownersMap = useOwnersMap(allItems);
  // כאן אנחנו כן טוענים את כל הקבצים, אז אפשר לחשב תיקיות עבור העורך
  const allFolders = useMemo(() => allItems.filter(f => f.type === 'folder'), [allItems]);

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

  const suggestedFolders = useMemo(() => allItems.filter((x) => x.type === "folder").slice(0, 6), [allItems]);
  const suggestedFiles = useMemo(() => allItems.filter((x) => x.type === "file").slice(0, 8), [allItems]);

  const openFromHome = (it) => {
    handleOpen(it, (folder) => {
      onChangeView?.("mydrive");
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("open-folder", { detail: { folderId: folder.id } }));
      }, 0);
    });
  };

  return (
    <div className="mainarea">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="mb-0" style={{ fontSize: 44, fontWeight: 700, color: "var(--text-primary)", textShadow: "var(--text-shadow-global)" }}>
          Home
        </h2>
        <ViewModeToggle />
      </div>

      {/* Suggested Folders Section */}
      <div className="mb-5">
        <div className="d-flex align-items-center gap-2 mb-2">
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", textShadow: "var(--text-shadow-global)" }}>Suggested folders</div>
        </div>

        {suggestedFolders.length === 0 ? (
          <div className="d-flex align-items-center justify-content-center py-4">
             <div className="d-flex align-items-center justify-content-center" 
                  style={{ 
                      width: "80px", height: "80px", borderRadius: "50%", 
                      background: "rgba(255,255,255,0.1)", backdropFilter: "blur(5px)",
                      border: "1px solid var(--border-color)", 
                      boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
                  }}>
                <FiFolder size={32} style={{ color: "var(--text-primary)", opacity: 0.8 }} />
             </div>
          </div>
        ) : viewMode === "list" ? (
          <div className="files-container">
            <div className="d-flex align-items-center px-3 pb-2 border-bottom mb-2"
                 style={{ fontSize: "13px", fontWeight: 600, gap: "10px", color: "var(--text-secondary)", textShadow: "var(--text-shadow-global)" }}>
              <div style={{ flex: 1 }}>Name</div>
              <div style={{ width: "150px" }}>Owner</div>
              <div style={{ width: "150px" }}>Date created</div>
              <div style={{ width: "100px" }}>Size</div>
              <div style={{ width: "100px" }} />
            </div>
            {suggestedFolders.map((item) => (
              <FileListItem key={item.id} item={item} ownerLabel={getOwnerLabel(item)} ownerAvatar={getOwnerAvatar(item)}
                dateLabel={item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                onOpen={openFromHome} onShare={setSharingItem} onToggleStar={handleToggleStar}
                onToggleImportant={handleToggleImportant} onDelete={handleDelete} onEdit={handleEdit} />
            ))}
          </div>
        ) : (
          <div className="files-grid">
            {suggestedFolders.map((item) => (
              <FileGridItem key={item.id} item={item} ownerLabel={getOwnerLabel(item)} ownerAvatar={getOwnerAvatar(item)}
                dateLabel={item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                showSize={true} onOpen={openFromHome} />
            ))}
          </div>
        )}
      </div>

      {/* Suggested Files Section */}
      <div className="mb-5">
        <div className="d-flex align-items-center gap-2 mb-2">
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", textShadow: "var(--text-shadow-global)" }}>Suggested files</div>
        </div>

        {suggestedFiles.length === 0 ? (
          <div className="d-flex align-items-center justify-content-center py-4">
             <div className="d-flex align-items-center justify-content-center" 
                  style={{ 
                      width: "80px", height: "80px", borderRadius: "50%", 
                      background: "rgba(255,255,255,0.1)", backdropFilter: "blur(5px)",
                      border: "1px solid var(--border-color)", 
                      boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
                  }}>
                <FiFile size={32} style={{ color: "var(--text-primary)", opacity: 0.8 }} />
             </div>
          </div>
        ) : viewMode === "list" ? (
          <div className="files-container">
            <div className="d-flex align-items-center px-3 pb-2 border-bottom mb-2"
                 style={{ fontSize: "13px", fontWeight: 600, gap: "10px", color: "var(--text-secondary)", textShadow: "var(--text-shadow-global)" }}>
              <div style={{ flex: 1 }}>Name</div>
              <div style={{ width: "150px" }}>Owner</div>
              <div style={{ width: "150px" }}>Date created</div>
              <div style={{ width: "100px" }}>Size</div>
              <div style={{ width: "100px" }} />
            </div>
            {suggestedFiles.map((item) => (
              <FileListItem key={item.id} item={item} ownerLabel={getOwnerLabel(item)} ownerAvatar={getOwnerAvatar(item)}
                dateLabel={item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                onOpen={openFromHome} onShare={setSharingItem} onToggleStar={handleToggleStar}
                onToggleImportant={handleToggleImportant} onDelete={handleDelete} onEdit={handleEdit} />
            ))}
          </div>
        ) : (
          <div className="files-grid">
            {suggestedFiles.map((item) => (
              <FileGridItem key={item.id} item={item} ownerLabel={getOwnerLabel(item)} ownerAvatar={getOwnerAvatar(item)}
                dateLabel={item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                showSize={true} onOpen={openFromHome} />
            ))}
          </div>
        )}
      </div>

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
                folders={allFolders} // בבית יש לנו את כל התיקיות
                onSave={handleSaveEdit}
                onCancel={() => setEditingFile(null)}
              />
            </div>
          </div>
        </div>
      )}

      {sharingItem ? <ShareModal item={sharingItem} onClose={() => setSharingItem(null)} /> : null}
    </div>
  );
}