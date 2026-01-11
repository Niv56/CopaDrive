import React, { useEffect, useMemo, useState } from "react";
import { getRootFiles, openItem, getCurrentUser } from "../../../api/filesApi";
import { useAuth } from "../../../contexts/AuthContext";
import FileListItem from "../widgets/FileListItem";
import FileViewerModal from "../widgets/FileViewerModal";

function SharedView() {
  const [allFiles, setAllFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ownersData, setOwnersData] = useState({});
  const [selectedOwnerId, setSelectedOwnerId] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const [openedFile, setOpenedFile] = useState(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const { token } = useAuth();

  const myUserId = useMemo(() => {
    if (!token) return null;
    const payload = JSON.parse(window.atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.userId;
  }, [token]);

  // 🎯 מנגנון הריסט - מאפס את התצוגה כשלוחצים על ה-Sidebar
  useEffect(() => {
    const handleReset = () => {
      setSelectedOwnerId(null);
      setCurrentFolderId(null);
      setFolderPath([]);
    };

    window.addEventListener("reset-shared", handleReset);
    return () => window.removeEventListener("reset-shared", handleReset);
  }, []);

  useEffect(() => {
    loadFiles();
  }, []);

  async function loadFiles() {
    try {
      setLoading(true);
      const data = await getRootFiles();
      const files = Array.isArray(data) ? data : [];
      setAllFiles(files);

      const shared = files.filter(f => f.ownerId !== myUserId);
      const uniqueOwnerIds = [...new Set(shared.map(f => f.ownerId))];

      uniqueOwnerIds.forEach(async (id) => {
        try {
          const userData = await getCurrentUser(id);
          setOwnersData(prev => ({ ...prev, [id]: userData }));
        } catch (e) { console.error("Error loading user data", e); }
      });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  const ownersList = useMemo(() => Object.keys(ownersData), [ownersData]);

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

  if (loading) return <div className="mainarea">Loading shared items...</div>;

  return (
    <div className="mainarea">
      <div className="d-flex align-items-center gap-2 mb-4">
        <h2 style={{ cursor: "pointer", fontSize: "24px", color: !selectedOwnerId ? "#202124" : "#1a73e8" }}
          onClick={() => { setSelectedOwnerId(null); setCurrentFolderId(null); setFolderPath([]); }}>
          Shared with me
        </h2>
        {selectedOwnerId && ownersData[selectedOwnerId] && (
          <>
            <span style={{ fontSize: "24px", color: "#5f6368" }}>/</span>
            <span style={{ fontSize: "20px", fontWeight: "500" }}>{ownersData[selectedOwnerId].email}</span>
            {folderPath.map((node) => (
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
          ownersList.length === 0 ? <p className="text-center p-5">No shared items found.</p> :
            ownersList.map(ownerId => {
              const owner = ownersData[ownerId];
              return (
                <div key={ownerId} className="list-group-item d-flex align-items-center gap-3 rounded-4 shadow-sm p-3 mb-2"
                  style={{ cursor: "pointer", background: "#fff" }} onClick={() => setSelectedOwnerId(ownerId)}>

                  <div className="user-avatar" style={{
                    width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                    background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {owner?.image ? (
                      <img src={owner.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 24 }}>👤</span>
                    )}
                  </div>
                  <div className="fw-semibold">Items shared by {owner?.email || "Loading..."}</div>
                </div>
              );
            })
        ) : (
          displayItems.map(item => <FileListItem key={item.id} item={item} onOpen={onOpen} />)
        )}
      </div>
      <FileViewerModal file={openedFile} role="viewer" onClose={() => setOpenedFile(null)} />
    </div>
  );
}

export default SharedView;