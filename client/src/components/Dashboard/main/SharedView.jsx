import React, { useEffect, useMemo, useState } from "react";
import { getRootFiles, openItem, getCurrentUser } from "../../../api/filesApi";
import { useAuth } from "../../../contexts/AuthContext";
import FileListItem from "../widgets/FileListItem";
import FileViewerModal from "../widgets/FileViewerModal";

function SharedView() {
  const [allFiles, setAllFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOwnerId, setSelectedOwnerId] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const [openedFile, setOpenedFile] = useState(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const { token } = useAuth();

  // חילוץ ה-ID שלי כדי לדעת מה שייך לאחרים
  const myUserId = useMemo(() => {
    if (!token) return null;
    const payload = JSON.parse(window.atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.userId;
  }, [token]);

  useEffect(() => {
    loadFiles();
  }, []);

  async function loadFiles() {
    try {
      setLoading(true);
      const data = await getRootFiles();
      setAllFiles(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  // 1. רשימת המשתמשים ששיתפו איתי (רק מי שאינו אני)
  const ownersList = useMemo(() => {
    const shared = allFiles.filter(f => f.ownerId !== myUserId);
    const uniqueOwnerIds = [...new Set(shared.map(f => f.ownerId))];
    return uniqueOwnerIds;
  }, [allFiles, myUserId]);

  // 2. הפריטים להצגה (או רשימת בעלים, או קבצים בתוך תיקייה/בעלים)
  const displayItems = useMemo(() => {
    if (!selectedOwnerId) return [];
    return allFiles.filter(f => f.ownerId === selectedOwnerId && f.parentId === currentFolderId);
  }, [allFiles, selectedOwnerId, currentFolderId]);

  async function onOpen(item) {
    setLoadingFile(true);
    try {
      const fullFile = await openItem(item, (folder) => {
        setCurrentFolderId(folder.id);
        setFolderPath(prev => [...prev, { id: folder.id, name: folder.name }]);
      });
      if (fullFile) setOpenedFile(fullFile);
    } catch (e) { alert(e.message); } finally { setLoadingFile(false); }
  }

  const resetView = () => {
    setSelectedOwnerId(null);
    setCurrentFolderId(null);
    setFolderPath([]);
  };

  if (loading) return <div className="mainarea">Loading shared items...</div>;

  return (
    <div className="mainarea">
      {/* Breadcrumbs */}
      <div className="d-flex align-items-center gap-2 mb-4">
        <h2 style={{ cursor: "pointer", fontSize: "24px", color: !selectedOwnerId ? "#202124" : "#1a73e8" }} onClick={resetView}>
          Shared with me
        </h2>
        {selectedOwnerId && (
          <>
            <span style={{ fontSize: "24px", color: "#5f6368" }}>/</span>
            <span style={{ fontSize: "20px" }}>{selectedOwnerId}</span>
            {folderPath.map((node, idx) => (
              <React.Fragment key={node.id}>
                <span style={{ fontSize: "24px", color: "#5f6368" }}>/</span>
                <span style={{ fontSize: "20px" }}>{node.name}</span>
              </React.Fragment>
            ))}
          </>
        )}
      </div>

      <div className="files-container">
        {!selectedOwnerId ? (
          // תצוגת רשימת אנשים
          ownersList.length === 0 ? <p className="text-center p-5">No one shared files with you yet.</p> :
            ownersList.map(ownerId => (
              <div key={ownerId} className="list-group-item d-flex align-items-center gap-3 rounded-4 shadow-sm p-3 mb-2"
                style={{ cursor: "pointer", background: "#fff" }} onClick={() => setSelectedOwnerId(ownerId)}>
                <span style={{ fontSize: 24 }}>👤</span>
                <div className="fw-semibold">Items shared by {ownerId}</div>
              </div>
            ))
        ) : (
          // תצוגת קבצים של אדם ספציפי
          displayItems.map(item => (
            <FileListItem key={item.id} item={item} onOpen={onOpen} />
          ))
        )}
      </div>

      <FileViewerModal file={openedFile} role="viewer" onClose={() => setOpenedFile(null)} />
    </div>
  );
}

export default SharedView;