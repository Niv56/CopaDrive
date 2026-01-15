import React, { useEffect, useMemo, useState } from "react";
import { getRootFiles, getCurrentUser } from "features/drive/api/filesApi";
import { useAuth } from "app/providers/AuthContext";
import { useFileActions } from "features/drive/hooks/useFileActions";
import FileListItem from "features/drive/widgets/FileListItem";
import FileViewerModal from "features/drive/widgets/FileViewerModal";
import FileEditorView from "components/Dashboard/widgets/FileEditorView";
import ShareModal from "features/drive/modals/ShareModal/ShareModal";

import ViewModeToggle from "features/drive/widgets/ViewModeToggle";
import { useViewMode } from "features/drive/providers/ViewModeContext";
import FileGridItem from "features/drive/widgets/FileGridItem";
import { FiUsers } from "react-icons/fi";

/**
 * View for displaying items shared with the current user by others.
 * Groups items by owner and supports hierarchical navigation within shared folders.
 */
function SharedView() {
  const [allFiles, setAllFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ownersData, setOwnersData] = useState({});
  const [selectedOwnerId, setSelectedOwnerId] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const { token } = useAuth();
  const { viewMode } = useViewMode();

  /** Extracts current userId from JWT payload */
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

  /** * Fetches root files, filters shared items, 
   * and populates owner profiles for the grouping UI.
   */
  const loadFiles = async () => {
    if (allFiles.length === 0) {
      setLoading(true);
    }

    try {
      const data = await getRootFiles();
      const files = Array.isArray(data) ? data : [];
      setAllFiles(files);

      const uniqueOwnerIds = [
        ...new Set(files.filter((f) => f.ownerId && f.ownerId !== myUserId).map((f) => f.ownerId)),
      ];

      uniqueOwnerIds.forEach(async (id) => {
        try {
          const userData = await getCurrentUser(id);
          setOwnersData((prev) => ({ ...prev, [id]: userData }));
        } catch {
          // Fallback handled by UI checks
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const {
    sharingItem, setSharingItem,
    openedFile, setOpenedFile,
    editingFile, setEditingFile,
    openedRole,
    handleOpen,
    handleDelete,
    handleToggleStar,
    handleToggleImportant,
    handleEdit,
    handleSaveEdit
  } = useFileActions(myUserId, loadFiles);

  useEffect(() => {
    loadFiles();
  }, []);

  /** Filters files based on selected owner and current directory level */
  const displayItems = useMemo(() => {
    if (!selectedOwnerId) return [];

    return allFiles.filter((f) => {
      if (f.ownerId !== selectedOwnerId) return false;
      if (currentFolderId) {
        return f.parentId === currentFolderId;
      }
      // If at root of shared view, only show items whose parents aren't also shared
      const parentIsAlsoShared = allFiles.some(other => other.id === f.parentId);
      return !parentIsAlsoShared;
    });
  }, [allFiles, selectedOwnerId, currentFolderId]);

  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  return (
    <div className="mainarea">
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Bruno+Ace+SC&display=swap');`}
      </style>

      <div className="page-title-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div className="d-flex align-items-center gap-2">
          <h2 style={{
            fontFamily: "'Bruno Ace SC', sans-serif",
            fontSize: "2.5rem",
            fontWeight: "400",
            margin: 0,
            color: !selectedOwnerId ? "var(--text-primary)" : "#1a73e8",
            letterSpacing: "2px",
            textTransform: "uppercase",
            cursor: "pointer"
          }}
            onClick={() => {
              setSelectedOwnerId(null);
              setCurrentFolderId(null);
              setFolderPath([]);
            }}
          >
            Shared with me
          </h2>

          {selectedOwnerId && (
            <>
              <span className="text-muted" style={{ fontSize: "1.5rem" }}>/</span>
              <span className="fw-bold" style={{ fontSize: "1.2rem", color: "var(--text-primary)" }}>
                {ownersData[selectedOwnerId]?.email}
              </span>
            </>
          )}
        </div>

        {selectedOwnerId && <ViewModeToggle />}
      </div>

      {!selectedOwnerId && Object.keys(ownersData).length === 0 ? (
        <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "50vh", textAlign: "center" }}>
          <div className="d-flex align-items-center justify-content-center"
            style={{
              width: "100px", height: "100px", borderRadius: "50%",
              background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)",
              border: "1px solid var(--border-color)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
            }}>
            <FiUsers size={42} style={{ color: "var(--text-primary)", opacity: 0.8 }} />
          </div>
        </div>
      ) : (
        <>
          {selectedOwnerId && viewMode !== "grid" && (
            <div
              className="d-flex align-items-center text-muted px-3 pb-2 border-bottom mb-2"
              style={{ fontSize: "13px", fontWeight: 600, gap: "10px", color: "var(--text-secondary)", textShadow: "var(--text-shadow-global)" }}
            >
              <div style={{ flex: 1 }}>Name</div>
              <div style={{ width: "150px" }}>Shared by</div>
              <div style={{ width: "150px" }}>Date shared</div>
              <div style={{ width: "100px" }} />
            </div>
          )}

          <div className="files-container">
            {!selectedOwnerId ? (
              Object.keys(ownersData).map((ownerId) => (
                <div
                  key={ownerId}
                  className="shared-owner-card"
                  onClick={() => setSelectedOwnerId(ownerId)}
                >
                  <img
                    src={ownersData[ownerId]?.image || defaultAvatar}
                    alt="Owner"
                    style={{ width: 36, height: 36, borderRadius: 999, objectFit: "cover", border: "1px solid #eef1f4" }}
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = defaultAvatar; }}
                  />
                  <div className="fw-bold" style={{ color: "var(--text-primary)", fontSize: "1.1rem" }}>
                    Items shared by {ownersData[ownerId]?.email || "Unknown"}
                  </div>
                </div>
              ))
            ) : viewMode === "grid" ? (
              <div className="d-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                {displayItems.map((item) => (
                  <FileGridItem key={item.id} item={item}
                    ownerLabel={ownersData[item.ownerId]?.email || "Unknown"}
                    ownerAvatar={ownersData[item.ownerId]?.image || ""}
                    dateLabel={item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                    showSize={false} onShare={setSharingItem}
                    onOpen={(it) => handleOpen(it, (folder) => {
                      setCurrentFolderId(folder.id);
                      setFolderPath((prev) => [...prev, { id: folder.id, name: folder.name }]);
                    })}
                  />
                ))}
              </div>
            ) : (
              displayItems.map((item) => (
                <FileListItem key={item.id} item={item}
                  ownerLabel={ownersData[item.ownerId]?.email || "Unknown"}
                  ownerAvatar={ownersData[item.ownerId]?.image || ""}
                  dateLabel={item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                  showSize={false} onShare={setSharingItem}
                  onOpen={(it) => handleOpen(it, (folder) => {
                    setCurrentFolderId(folder.id);
                    setFolderPath((prev) => [...prev, { id: folder.id, name: folder.name }]);
                  })}
                  onEdit={handleEdit}
                  onToggleStar={handleToggleStar}
                  onToggleImportant={handleToggleImportant}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </>
      )}

      <FileViewerModal
        file={openedFile}
        role={openedRole}
        onClose={() => setOpenedFile(null)}
        onShare={setSharingItem}
        onToggleStar={handleToggleStar}
        onToggleImportant={handleToggleImportant}
        onEdit={handleEdit}
        onDelete={async () => { if (!openedFile) return; await handleDelete(openedFile); setOpenedFile(null); }}
      />

      {editingFile && (
        <div className="modal-overlay" onClick={() => setEditingFile(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ minWidth: "600px" }}>
            <div className="p-4">
              <h4 className="mb-4">Edit File</h4>
              <FileEditorView
                file={editingFile}
                initialData={editingFile}
                folders={[]}
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

export default SharedView;