import { useEffect, useMemo, useState, useCallback } from "react";
import { getRootFiles } from "features/drive/api/filesApi";
import { useAuth } from "app/providers/AuthContext";
import { useFileActions } from "features/drive/hooks/useFileActions";
import FileListItem from "features/drive/widgets/FileListItem";
import CreateItem from "features/drive/widgets/CreateItem";
import FileViewerModal from "features/drive/widgets/FileViewerModal";
import ShareModal from "features/drive/modals/ShareModal/ShareModal";
import "styles/pages/MyDrive.css";
import { useOwnersMap } from "features/drive/hooks/useOwnersMap";

import ViewModeToggle from "features/drive/widgets/ViewModeToggle";
import { useViewMode } from "features/drive/providers/ViewModeContext";
import FileGridItem from "features/drive/widgets/FileGridItem";

function MyDrive() {
  const [allFiles, setAllFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const { token } = useAuth();
  const { viewMode } = useViewMode();

  const myUserId = useMemo(() => {
    if (!token) return null;
    try {
      const payload = JSON.parse(
        window.atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
      );
      return payload.userId;
    } catch { return null; }
  }, [token]);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRootFiles();
      setAllFiles(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  }, []);

  // ה-loadingFile הוסר מה-Destructuring כאן לבקשתך
  const {
    sharingItem, setSharingItem, openedFile, setOpenedFile, openedRole,
    handleOpen, handleToggleStar, handleToggleImportant, handleDelete
  } = useFileActions(myUserId, loadFiles);

  useEffect(() => { loadFiles(); }, [loadFiles]);

  // האזנה לאירוע רענון גלובלי (נשאר כחלק מהלוגיקה שלך)
  useEffect(() => {
    window.addEventListener("refresh-mydrive", loadFiles);
    return () => window.removeEventListener("refresh-mydrive", loadFiles);
  }, [loadFiles]);

  const currentItems = useMemo(
    () => allFiles.filter((f) => f.parentId === currentFolderId),
    [allFiles, currentFolderId]
  );

  const currentFolder = useMemo(
    () => allFiles.find((f) => f.id === currentFolderId),
    [allFiles, currentFolderId]
  );

  const handleBack = () => {
    if (!currentFolderId) return;
    const parentId = currentFolder?.parentId ?? null;
    setCurrentFolderId(parentId);
    setFolderPath((prev) => (parentId ? prev.slice(0, -1) : []));
  };

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

  const openInsideMyDrive = (it) => {
    handleOpen(it, (folder) => {
      setCurrentFolderId(folder.id);
      setFolderPath((prev) => [...prev, { id: folder.id, name: folder.name }]);
    });
  };

  if (loading && allFiles.length === 0) return <div className="mainarea">Loading My Drive...</div>;

  return (
    <div className="mainarea">
      {/* הספינר הוסר מכאן בהתאם לבקשתך */}

      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center gap-2">
          <h2 className="mb-0" style={{ cursor: "pointer", color: currentFolderId ? "#1a73e8" : "#202124" }}
            onClick={() => { setCurrentFolderId(null); setFolderPath([]); }}>
            My Drive
          </h2>
          {currentFolderId && (
            <>
              <span className="text-muted">/</span>
              <button className="btn btn-sm btn-outline-secondary" onClick={handleBack}>← Back</button>
              <span className="fw-bold">{currentFolder?.name}</span>
            </>
          )}
        </div>
        <ViewModeToggle />
      </div>

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
                key={item.id} item={item}
                ownerLabel={getOwnerLabel(item)}
                ownerAvatar={getOwnerAvatar(item)}
                dateLabel={item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                onOpen={openInsideMyDrive}
                onShare={setSharingItem}
                onToggleStar={handleToggleStar}
                onToggleImportant={handleToggleImportant}
                onDelete={handleDelete}
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

      <CreateItem onItemCreated={loadFiles} currentFolderId={currentFolderId} />

      <FileViewerModal
        file={openedFile} role={openedRole}
        onClose={() => setOpenedFile(null)}
        onShare={setSharingItem}
        onDelete={async () => {
          if (!openedFile) return;
          await handleDelete(openedFile);
          setOpenedFile(null);
        }}
      />

      {sharingItem && <ShareModal item={sharingItem} onClose={() => setSharingItem(null)} />}
    </div>
  );
}

export default MyDrive;