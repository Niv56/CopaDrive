import { useEffect, useState, useMemo, useCallback } from "react";
import "styles/pages/MyDrive.css";
import { getRootFiles } from "features/drive/api/filesApi";
import { useAuth } from "app/providers/AuthContext";
import { useFileActions } from "features/drive/hooks/useFileActions";
import { useOwnersMap } from "features/drive/hooks/useOwnersMap";
import { useViewMode } from "features/drive/providers/ViewModeContext";
import { formatBytes } from "shared/utils/formatBytes";

import FileListItem from "features/drive/widgets/FileListItem";
import CreateItem from "features/drive/widgets/CreateItem";
import FileViewerModal from "features/drive/widgets/FileViewerModal";
import FileEditorView from "components/Dashboard/widgets/FileEditorView";
import ShareModal from "features/drive/modals/ShareModal/ShareModal";
import ViewModeToggle from "features/drive/widgets/ViewModeToggle";
import FileGridItem from "features/drive/widgets/FileGridItem";

/** Primary view for navigating the user's personal file hierarchy */
function MyDrive() {
  const [allFiles, setAllFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const { token } = useAuth();
  const { viewMode } = useViewMode();

  /** Extracts current userId from the JWT payload */
  const myUserId = useMemo(() => {
    if (!token) return null;
    try {
      const payload = JSON.parse(
        window.atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
      );
      return payload.userId;
    } catch { return null; }
  }, [token]);

  /** Fetches all files accessible to the user to build the local tree */
  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRootFiles();
      setAllFiles(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  }, []);

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
    handleDelete
  } = useFileActions(myUserId, loadFiles);

  useEffect(() => { loadFiles(); }, [loadFiles]);

  /** Listens for global refresh events from other widgets (e.g., TopBar search) */
  useEffect(() => {
    window.addEventListener("refresh-mydrive", loadFiles);
    return () => window.removeEventListener("refresh-mydrive", loadFiles);
  }, [loadFiles]);

  /** Filters the full file list to show only items within the active directory */
  const currentItems = useMemo(() => {
    return allFiles.filter((f) => {
      if (currentFolderId) {
        return f.parentId === currentFolderId;
      }
      const parentIsAccessible = allFiles.some(other => other.id === f.parentId);
      return f.parentId === null || !parentIsAccessible;
    });
  }, [allFiles, currentFolderId]);

  const allFolders = useMemo(() => allFiles.filter(f => f.type === 'folder'), [allFiles]);

  const currentFolder = useMemo(
    () => allFiles.find((f) => f.id === currentFolderId),
    [allFiles, currentFolderId]
  );

  /** Navigates one level up in the folder hierarchy */
  const handleBack = () => {
    if (!currentFolderId) return;
    const parentId = currentFolder?.parentId ?? null;
    setCurrentFolderId(parentId);
    setFolderPath((prev) => (parentId ? prev.slice(0, -1) : []));
  };

  /** Handles external navigation events (e.g. from Sidebar or Search) */
  useEffect(() => {
    const onOpenFolder = (e) => {
      const folderId = e.detail.folderId;
      setCurrentFolderId(folderId);
      const folder = allFiles.find((f) => f.id === folderId);
      setFolderPath([{ id: folderId, name: folder?.name || "Folder" }]);
    };
    const onResetMyDrive = () => {
      setCurrentFolderId(null);
      setFolderPath([]);
    };
    window.addEventListener("open-folder", onOpenFolder);
    window.addEventListener("reset-mydrive", onResetMyDrive);
    return () => {
      window.removeEventListener("open-folder", onOpenFolder);
      window.removeEventListener("reset-mydrive", onResetMyDrive);
    };
  }, [allFiles]);

  const ownersMap = useOwnersMap(currentItems);

  /** Resolves owner display name using the owners map */
  const getOwnerLabel = useCallback((item) => {
    if (!item?.ownerId) return "Unknown";
    if (item.ownerId === myUserId) return "Me";
    const u = ownersMap[item.ownerId];
    return [u?.firstName, u?.lastName].filter(Boolean).join(" ").trim() || u?.email || "External";
  }, [ownersMap, myUserId]);

  /** Resolves owner avatar image URL */
  const getOwnerAvatar = useCallback((item) => {
    if (!item?.ownerId) return "";
    return ownersMap[item.ownerId]?.image || "";
  }, [ownersMap]);

  /** Opens folder navigation or file preview specifically within MyDrive context */
  const openInsideMyDrive = (it) => {
    handleOpen(it, (folder) => {
      setCurrentFolderId(folder.id);
      setFolderPath((prev) => [...prev, { id: folder.id, name: folder.name }]);
    });
  };

  if (loading && allFiles.length === 0) return <div className="mainarea">Loading My Drive...</div>;

  return (
    <div className="mainarea">
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Bruno+Ace+SC&display=swap');`}
      </style>

      {/* Header section with Breadcrumbs and View Toggle */}
      <div className="page-title-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div className="d-flex align-items-center gap-2">
          <h2 style={{
            fontFamily: "'Bruno Ace SC', sans-serif",
            fontSize: "2.5rem",
            fontWeight: "400",
            margin: 0,
            color: currentFolderId ? "#1a73e8" : "var(--text-primary)",
            letterSpacing: "2px",
            textTransform: "uppercase",
            cursor: "pointer"
          }}
            onClick={() => { setCurrentFolderId(null); setFolderPath([]); }}>
            My Drive
          </h2>
          {currentFolderId && (
            <>
              <span className="text-muted" style={{ fontSize: "1.5rem" }}>/</span>
              <button className="btn btn-sm btn-outline-secondary" onClick={handleBack}>← Back</button>
              <span className="fw-bold" style={{ fontSize: "1.2rem" }}>{currentFolder?.name}</span>
            </>
          )}
        </div>
        <ViewModeToggle />
      </div>

      {/* Conditional rendering for List or Grid view modes */}
      {viewMode === "list" ? (
        <>
          <div className="d-flex align-items-center text-muted px-3 pb-2 border-bottom mb-2" style={{ fontSize: "13px", fontWeight: 600, gap: "10px" }}>
            <div style={{ flex: 1 }}>Name</div>
            <div style={{ width: "150px" }}>Owner</div>
            <div style={{ width: "150px" }}>Date created</div>
            <div style={{ width: "100px" }}>Size</div>
            <div style={{ width: "100px" }} />
          </div>
          <div className="files-container">
            {currentItems.map((item) => (
              <FileListItem
                key={item.id}
                item={item}
                ownerLabel={getOwnerLabel(item)}
                ownerAvatar={getOwnerAvatar(item)}
                dateLabel={item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                sizeLabel={item.type === "folder" ? "—" : formatBytes(item.sizeBytes ?? 0)}
                onOpen={openInsideMyDrive}
                onShare={setSharingItem}
                onToggleStar={handleToggleStar}
                onToggleImportant={handleToggleImportant}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="files-grid">
          {currentItems.map((item) => (
            <FileGridItem
              key={item.id} item={item}
              ownerLabel={getOwnerLabel(item)}
              ownerAvatar={getOwnerAvatar(item)}
              dateLabel={item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
              showSize={true}
              onOpen={openInsideMyDrive}
            />
          ))}
        </div>
      )}

      {/* Action triggers and Modals */}
      <CreateItem onItemCreated={loadFiles} currentFolderId={currentFolderId} />

      <FileViewerModal
        file={openedFile}
        role={openedRole}
        onClose={() => setOpenedFile(null)}
        onShare={setSharingItem}
        onToggleStar={handleToggleStar}
        onToggleImportant={handleToggleImportant}
        onEdit={handleEdit}
        onDelete={async () => {
          if (!openedFile) return;
          await handleDelete(openedFile);
          setOpenedFile(null);
        }}
      />

      {editingFile && (
        <div className="modal-overlay" onClick={() => setEditingFile(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ minWidth: "600px" }}>
            <div className="p-4">
              <h4 className="mb-4">Edit File</h4>
              <FileEditorView
                file={editingFile}
                initialData={editingFile}
                folders={allFolders}
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

export default MyDrive;