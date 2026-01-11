import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import appLogo from "../../../photos/logo.svg";
import UserMenu from "../UserMenu";
import { getCurrentUser, searchItems } from "../../../api/filesApi";
import FileViewerModal from "../widgets/FileViewerModal";



export default function TopBar() {
  const [userData, setUserData] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const { token, logout, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const searchRef = useRef(null);





  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));

        if (payload.userId) {
          getCurrentUser(payload.userId)
            .then(data => setUserData(data))
            .catch(err => console.error(err));
        }
      } catch (e) {
        console.error("Error decoding token", e);
      }
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
  const q = searchQuery.trim();

  if (!q) {
    setSearchResults([]);
    return;
  }

  const timer = setTimeout(async () => {
    try {
      const results = await searchItems(q);
      setSearchResults(results);
      console.log("search results:", results);
    } catch (err) {
      console.error("search failed:", err);
      setSearchResults([]);
    }
  }, 300);

  return () => clearTimeout(timer);
}, [searchQuery]);

const handleSearchOpen = (item) => {
  setSearchQuery("");
  setSearchResults([]);

  if (item.type === "folder") {
  window.dispatchEvent(
    new CustomEvent("open-folder", { detail: { folderId: item.id } })
  );
  return;
}


  setSelectedFile(item);
};
useEffect(() => {
  function handleClickOutside(e) {
    if (searchRef.current && !searchRef.current.contains(e.target)) {
      setSearchQuery("");
      setSearchResults([]);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);




  return (
    <header className="dashboard-top">
      <div className="dashboard-top-left">
        <img src={appLogo} alt="CopaDrive logo" className="app-logo" />
        <h2 className="app-title">CopaDrive</h2>
      </div>

<div ref={searchRef} className="dashboard-top-center" style={{ position: "relative" }}>
  <input
    type="text"
    placeholder="Search in CopaDrive"
    className="dashboard-search"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    onFocus={() => {
      if (searchQuery.trim()) {
        // פותח שוב כשחוזרים לפוקוס
        // (לא חובה אבל נח)
      }
    }}
  />

  {searchQuery.trim() && (
    <div
      className="search-dropdown"
      style={{
        position: "absolute",
        top: "110%",
        left: 0,
        right: 0,
        background: "white",
        borderRadius: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        padding: 10,
        zIndex: 9999,
        maxHeight: 280,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <div style={{ fontWeight: 600 }}>Results</div>
        <button
          className="btn btn-light"
          style={{ padding: "2px 10px", borderRadius: 10 }}
          onClick={() => {
            setSearchQuery("");
            setSearchResults([]);
          }}
        >
          ✕
        </button>
      </div>

     <div className="d-flex flex-column gap-2">
  {searchResults.length === 0 ? (
    <div
      style={{
        padding: "16px",
        textAlign: "center",
        color: "#888",
        fontSize: 14,
      }}
    >
      No results
    </div>
  ) : (
    searchResults.map((item) => (
      <div
        key={item.id}
        className="list-group-item d-flex align-items-center gap-2 rounded-3"
        style={{ cursor: "pointer", padding: "10px 12px" }}
        onClick={() => handleSearchOpen(item)}
      >
        <span style={{ fontSize: 18 }}>
          {item.type === "folder" ? "📁" : "📄"}
        </span>
        <span>{item.name}</span>
      </div>
    ))
  )}
</div>

    </div>
  )}
</div>


      <div className="dashboard-top-right">
        <UserMenu
          isOpen={isUserMenuOpen}
          onToggle={() => setIsUserMenuOpen((v) => !v)}
          userEmail={userData?.email || "guest@copadrive.com"}
          userName={userData?.firstName || "Guest"}
          userImage={userData?.image}
          isAuthenticated={isAuthenticated}
          onEditUser={() => {
            setIsUserMenuOpen(false);
            setIsEditUserOpen(true);
          }}
          onCloseMenu={() => setIsUserMenuOpen(false)}
          onLogout={handleLogout}
        />

        {isEditUserOpen && (
          <div className="modal-overlay" onClick={() => setIsEditUserOpen(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-title">Edit user</div>

              <label className="modal-label">Full name</label>
              <input className="modal-input" placeholder="Your name" />

              <label className="modal-label">Email</label>
              <input className="modal-input" placeholder="user@email.com" />

              <div className="modal-actions">
                <button className="btn secondary" onClick={() => setIsEditUserOpen(false)}>
                  Cancel
                </button>
                <button className="btn primary" onClick={() => setIsEditUserOpen(false)}>
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {selectedFile && (
  <FileViewerModal
    file={selectedFile}
    role={"viewer"}
    onClose={() => setSelectedFile(null)}
    onEdit={() => alert("יש לממש")}
    onShare={() => alert("יש לממש")}
    onDelete={() => alert("יש לממש")}
  />
)}

    </header>
  );
}