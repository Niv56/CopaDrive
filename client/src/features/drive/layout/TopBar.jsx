import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "app/providers/AuthContext";
import appLogo from "assets/photos/logo.svg";

import UserMenu from "../widgets/UserMenu";
import { getCurrentUser, searchItems } from "../api/filesApi";

import FileViewerModal from "../widgets/FileViewerModal";
import EditUserModal from "../widgets/EditUserModal";
import ThemeToggle from "../widgets/ThemeToggle";
import ShareModal from "../modals/ShareModal/ShareModal";
import FileEditorView from "components/Dashboard/widgets/FileEditorView";

// ✅ ייבוא האייקונים וה-Hook המרכזי
import { getFileIcon } from "../widgets/FileListItem";
import { useFileActions } from "../hooks/useFileActions";

import { FiSearch, FiMusic, FiPause } from "react-icons/fi";
import "styles/layout/TopBar.css";
import songFile from "assets/videos/Song.mp3";

export default function TopBar() {
  const { token, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const [userData, setUserData] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // ✅ חילוץ מזהה המשתמש מה-Token
  const myUserId = useMemo(() => {
    if (!token) return null;
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(window.atob(base64)).userId;
    } catch { return null; }
  }, [token]);

  // ✅ חיבור ל-Hook שבודק הרשאות ופותח את המודאל הנכון
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
  } = useFileActions(myUserId, () => {
    setSearchQuery("");
    setSearchResults([]);
  });

  // ✅ החזרת הפונקציה handleLogout שהייתה חסרה
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // --- 🎵 לוגיקת נגינה ---
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const toggleSong = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(songFile);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.log("Play error:", e));
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // טעינת נתוני משתמש
  useEffect(() => {
    if (isAuthenticated && token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(window.atob(base64));
        if (payload.userId) {
          getCurrentUser(payload.userId)
            .then((data) => setUserData(data))
            .catch((err) => console.error(err));
        }
      } catch (e) { console.error("Error decoding token", e); }
    }
  }, [isAuthenticated, token]);

  // לוגיקת חיפוש
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const results = await searchItems(q);
        setSearchResults(results);
      } catch (err) { setSearchResults([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchOpen = (item) => {
    setSearchQuery("");
    setSearchResults([]);
    if (item.type === "folder") {
      window.dispatchEvent(new CustomEvent("open-folder", { detail: { folderId: item.id } }));
      return;
    }
    // ✅ שימוש ב-handleOpen שמזהה אוטומטית שאתה ה-Owner
    handleOpen(item);
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

  const userFullName = userData ? `${userData.firstName || ""} ${userData.lastName || ""}`.trim() : "Guest";

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bruno+Ace+SC&display=swap');`}</style>
      <header className="dashboard-top">
        <div className="dashboard-top-left" style={{ gap: '15px', alignItems: 'center' }}>
          <img src={appLogo} alt="CopaDrive" className="app-logo" style={{ width: "48px", height: "48px" }} />
          <h2 className="app-title" style={{ fontFamily: "'Bruno Ace SC', sans-serif", fontSize: "1.8rem", fontWeight: "400", margin: 0, letterSpacing: "1px", textTransform: "uppercase", paddingTop: "4px" }}>CopaDrive</h2>
        </div>

        <div ref={searchRef} className="dashboard-top-center">
          <div className="search-wrapper">
            <FiSearch className="search-icon" />
            <input type="text" placeholder="Search in CopaDrive" className="dashboard-search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          {searchQuery.trim() && (
            <div className="search-dropdown-results">
              <div className="search-header">
                <div style={{ fontWeight: 600 }}>Results</div>
                <button className="btn btn-light btn-sm" onClick={() => { setSearchQuery(""); setSearchResults([]); }}>✕</button>
              </div>
              <div className="d-flex flex-column gap-2">
                {searchResults.length === 0 ? (
                  <div className="no-results">No results</div>
                ) : (
                  searchResults.map((item) => (
                    <div key={item.id} className="search-result-item" onClick={() => handleSearchOpen(item)}>
                      {/* ✅ אייקונים מערכתיים במקום איימוג'י */}
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        {getFileIcon(item.name, item.mimeType, item.type === "folder", 20)}
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
          <button className="btn-sparkle-sm" onClick={toggleSong}>
            {isPlaying ? <><FiPause style={{ color: 'white' }} /><span className="sparkle-text">PauseSong</span></> : <><FiMusic style={{ color: 'white' }} /><span className="sparkle-text">PlaySong</span></>}
            <div className="sparkle-stars"><div className="s-star s-1"></div><div className="s-star s-2"></div></div>
          </button>
          <ThemeToggle />
          <UserMenu isOpen={isUserMenuOpen} onToggle={() => setIsUserMenuOpen((v) => !v)} userEmail={userData?.email || "guest@copadrive.com"} userName={userFullName} userImage={userData?.image} isAuthenticated={isAuthenticated} onEditUser={() => { setIsUserMenuOpen(false); setIsEditUserOpen(true); }} onCloseMenu={() => setIsUserMenuOpen(false)} onLogout={handleLogout} />
        </div>
      </header>

      <EditUserModal show={isEditUserOpen} onClose={() => setIsEditUserOpen(false)} userId={userData?.id} userEmail={userData?.email || ""} initialFirstName={userData?.firstName || ""} initialLastName={userData?.lastName || ""} initialPhoneNumber={userData?.phoneNumber || ""} initialImage={userData?.image || ""} onSaved={(updatedUser) => setUserData(updatedUser)} />

      {/* ✅ מודאל צפייה - יציג את ה-Role הנכון (Owner) בזכות useFileActions */}
      {openedFile && (
        <FileViewerModal
          file={openedFile}
          role={openedRole}
          onClose={() => setOpenedFile(null)}
          onEdit={handleEdit}
          onShare={setSharingItem}
          onToggleStar={handleToggleStar}
          onToggleImportant={handleToggleImportant}
          onDelete={async () => { await handleDelete(openedFile); setOpenedFile(null); }}
        />
      )}

      {/* ✅ מודאל עריכה (הכרטיסייה עם כפתורי השמירה) */}
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

      {sharingItem && <ShareModal item={sharingItem} onClose={() => setSharingItem(null)} />}
    </>
  );
}