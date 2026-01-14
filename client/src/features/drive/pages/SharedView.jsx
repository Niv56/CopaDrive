import React, { useEffect, useMemo, useState } from "react";
import { getRootFiles, getCurrentUser } from "features/drive/api/filesApi";
import { useAuth } from "app/providers/AuthContext";
import { useFileActions } from "features/drive/hooks/useFileActions";
import FileListItem from "features/drive/widgets/FileListItem";
import FileViewerModal from "features/drive/widgets/FileViewerModal";
import FileEditorView from "components/Dashboard/widgets/FileEditorView"; // ✅
import ShareModal from "features/drive/modals/ShareModal/ShareModal";

import ViewModeToggle from "features/drive/widgets/ViewModeToggle";
import { useViewMode } from "features/drive/providers/ViewModeContext";
import FileGridItem from "features/drive/widgets/FileGridItem";
import { FiUsers } from "react-icons/fi";

function SharedView() {
  const [allFiles, setAllFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ownersData, setOwnersData] = useState({});
  const [selectedOwnerId, setSelectedOwnerId] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
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
          // Ignore
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Destructuring כולל עריכה
  const {
    sharingItem, setSharingItem,
    openedFile, setOpenedFile,
    editingFile, setEditingFile,
    openedRole,
    handleOpen,
    handleDelete,
    handleToggleStar,        // כוכב
    handleToggleImportant,   // חשיבות
    handleEdit,              // עריכה
    handleSaveEdit           // שמירה
  } = useFileActions(myUserId, loadFiles);

  useEffect(() => {
    loadFiles();
  }, []);

  const displayItems = useMemo(() => {
    if (!selectedOwnerId) return [];
    return allFiles.filter((f) => {
      if (f.ownerId !== selectedOwnerId) return false;
      if (currentFolderId) {
        return f.parentId === currentFolderId;
      }
      const parentIsAlsoShared = allFiles.some(other => other.id === f.parentId);
      return !parentIsAlsoShared;
    });
  }, [allFiles, selectedOwnerId, currentFolderId]);

  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  return (
    <div className="mainarea">
      <div className="page-title-container">
        <div className="d-flex align-items-center gap-2">
          <h2 style={{ cursor: "pointer", color: !selectedOwnerId ? "inherit" : "#1a73e8" }}
            onClick={() => {
              setSelectedOwnerId(null);
              setCurrentFolderId(null);
              setFolderPath([]);
            }}>
            Shared with me
          </h2>
          {selectedOwnerId && (
            <>
              <span className="text-muted">/</span>
              <span className="fw-bold">{ownersData[selectedOwnerId]?.email}</span>
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
                  className="list-group-item d-flex align-items-center gap-3 rounded-4 shadow-sm p-3 mb-2"
                  style={{ cursor: "pointer", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(5px)", border: "1px solid var(--border-color)" }}
                  onClick={() => setSelectedOwnerId(ownerId)}
                >
                  <img
                    src={ownersData[ownerId]?.image || defaultAvatar}
                    alt="Owner"
                    style={{ width: 32, height: 32, borderRadius: 999, objectFit: "cover", border: "1px solid #eef1f4" }}
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = defaultAvatar; }}
                  />
                  <div className="fw-semibold" style={{ color: "#333" }}>
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
                  // ✅ העברת עריכה (הלוגיקה הפנימית ב-Viewer תחסום אם אין הרשאה)
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
                folders={[]} // משותפים לא ניתן להזיז לתיקיות האישיות דרך עורך זה
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