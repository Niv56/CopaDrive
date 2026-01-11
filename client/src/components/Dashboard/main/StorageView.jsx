import React, { useEffect, useMemo, useState } from "react";
import { getRootFiles, getCurrentUser } from "../../../api/filesApi";
import { useAuth } from "../../../contexts/AuthContext";
import { useFileActions } from "../../../hooks/useFileActions";
import FileListItem from "../widgets/FileListItem";
import FileViewerModal from "../widgets/FileViewerModal";
import ShareModal from "../widgets/ShareModal";

function SharedView() {
  const [allFiles, setAllFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ownersData, setOwnersData] = useState({});
  const [selectedOwnerId, setSelectedOwnerId] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const { token } = useAuth();

  const myUserId = useMemo(() => {
    if (!token) return null;
    return JSON.parse(window.atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).userId;
  }, [token]);

  const loadFiles = async () => {
    setLoading(true);
    const data = await getRootFiles();
    const files = Array.isArray(data) ? data : [];
    setAllFiles(files);

    // טעינת שמות המשתמשים ששיתפו איתי
    const uniqueOwnerIds = [...new Set(files.filter(f => f.ownerId !== myUserId).map(f => f.ownerId))];
    uniqueOwnerIds.forEach(async (id) => {
      const userData = await getCurrentUser(id);
      setOwnersData(prev => ({ ...prev, [id]: userData }));
    });
    setLoading(false);
  };

  const { sharingItem, setSharingItem, openedFile, setOpenedFile, openedRole, handleOpen } = useFileActions(myUserId, loadFiles);

  useEffect(() => { loadFiles(); }, []);

  const displayItems = useMemo(() => {
    if (!selectedOwnerId) return [];
    return allFiles.filter(f => f.ownerId === selectedOwnerId && f.parentId === currentFolderId);
  }, [allFiles, selectedOwnerId, currentFolderId]);

  if (loading) return <div className="mainarea">Loading shared items...</div>;

  return (
    <div className="mainarea">
      <div className="d-flex align-items-center gap-2 mb-4">
        <h2 style={{ cursor: "pointer", color: !selectedOwnerId ? "#202124" : "#1a73e8" }}
          onClick={() => { setSelectedOwnerId(null); setCurrentFolderId(null); setFolderPath([]); }}>Shared with me</h2>
        {selectedOwnerId && (
          <><span className="text-muted">/</span><span className="fw-bold">{ownersData[selectedOwnerId]?.email}</span></>
        )}
      </div>

      <div className="files-container">
        {!selectedOwnerId ? (
          Object.keys(ownersData).map(ownerId => (
            <div key={ownerId} className="list-group-item d-flex align-items-center gap-3 rounded-4 shadow-sm p-3 mb-2"
              style={{ cursor: "pointer", background: "#fff" }} onClick={() => setSelectedOwnerId(ownerId)}>
              <div className="bg-light rounded-circle p-2">👤</div>
              <div className="fw-semibold">Items shared by {ownersData[ownerId]?.email}</div>
            </div>
          ))
        ) : (
          displayItems.map(item => (
            <FileListItem key={item.id} item={item} onShare={setSharingItem}
              onOpen={(it) => handleOpen(it, (folder) => {
                setCurrentFolderId(folder.id);
                setFolderPath(prev => [...prev, { id: folder.id, name: folder.name }]);
              })} />
          ))
        )}
      </div>
      <FileViewerModal file={openedFile} role={openedRole} onClose={() => setOpenedFile(null)} onShare={setSharingItem} />
      {sharingItem && <ShareModal item={sharingItem} onClose={() => setSharingItem(null)} />}
    </div>
  );
}
export default SharedView;