import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// Auth and API imports
import { useAuth } from "app/providers/AuthContext";
import appLogo from "assets/photos/logo.svg";
import { getCurrentUser, searchItems, getRootFiles } from "../api/filesApi";

// Component and Modal imports
import UserMenu from "../widgets/UserMenu";
import FileViewerModal from "../widgets/FileViewerModal";
import EditUserModal from "../widgets/EditUserModal";
import ThemeToggle from "../widgets/ThemeToggle";
import ShareModal from "../modals/ShareModal/ShareModal";
import FileEditorView from "components/Dashboard/widgets/FileEditorView";

// Hooks and Utilities
import { getFileIcon } from "../widgets/FileListItem";
import { useFileActions } from "../hooks/useFileActions";

// Icons and Styles
import { FiSearch, FiMusic, FiPause } from "react-icons/fi";
import "styles/layout/TopBar.css";
import songFile from "assets/videos/Song.mp3";

/**
 * TopBar Component
 * * The primary navigation header for the dashboard.
 * Manages global search with authorization filtering, background audio, 
 * and user account access.
 */
export default function TopBar() {
  const { token, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // --- UI State ---
  const [userData, setUserData] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // --- Permission Cache ---
  /** Holds the set of file/folder IDs the user is authorized to view */
  const [accessibleIds, setAccessibleIds] = useState(new Set());

  /** Extracts the userId from the JWT payload stored in the AuthContext */
  const myUserId = useMemo(() => {
    if (!token) return null;
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(window.atob(base64)).userId;
    } catch { return null; }
  }, [token]);

  /** Initializes file manipulation handlers (Open, Edit, Star, Delete) */
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
    // Clear search when a file action triggers a refresh
    setSearchQuery("");
    setSearchResults([]);
  });

  /** * Permission Synchronization
   * Fetches all authorized items once on mount to create a local whitelist.
   * This prevents the search from showing private files belonging to other users.
   */
  useEffect(() => {
    if (isAuthenticated) {
      getRootFiles()
        .then(files => {
          const ids = new Set(files.map(f => f.id));
          setAccessibleIds(ids);
        })
        .catch(err => console.error("Permission sync failed", err));
    }
  }, [isAuthenticated]);

  // --- Audio Management ---
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

  /** Cleanup audio on component unmount */
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  /** Fetches full user profile data once authenticated */
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

  /** * Optimized Search Effect
   * 1. Debounces input to prevent excessive API calls.
   * 2. Calls the search API for partial matches.
   * 3. Filters results against the local 'accessibleIds' whitelist for security.
   */
  useEffect(() => {
    const q = searchQuery.trim();

    if (!q) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await searchItems(q);

        // Security check: Only show files I own or that are in my access list
        const filteredResults = results.filter(item => {
          const isOwner = String(item.ownerId) === String(myUserId);
          const hasPermission = accessibleIds.has(item.id);
          return isOwner || hasPermission;
        });

        setSearchResults(filteredResults);

      } catch (err) {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, accessibleIds, myUserId]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /** Handles navigation to folders or opening file previews from search results */
  const handleSearchOpen = (item) => {
    setSearchQuery("");
    setSearchResults([]);
    if (item.type === "folder") {
      // Trigger a global navigation event for the sidebar/mainarea to catch
      window.dispatchEvent(new CustomEvent("open-folder", { detail: { folderId: item.id } }));
      return;
    }
    handleOpen(item);
  };

  /** Click-outside listener to close the search dropdown */
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
        {/* Logo and Branding */}
        <div className="dashboard-top-left" style={{ gap: '15px', alignItems: 'center' }}>
          <img src={appLogo} alt="CopaDrive" className="app-logo" style={{ width: "48px", height: "48px" }} />
          <h2 className="app-title" style={{ fontFamily: "'Bruno Ace SC', sans-serif", fontSize: "1.8rem", fontWeight: "400", margin: 0, letterSpacing: "1px", textTransform: "uppercase", paddingTop: "4px" }}>CopaDrive</h2>
        </div>

        {/* Global Search Bar */}
        <div ref={searchRef} className="dashboard-top-center">
          <div className="search-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search in CopaDrive"
              className="dashboard-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Search Dropdown Results */}
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
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        {getFileIcon(item.name, item.mimeType, item.type === "folder", 20)}
                      </span>
                      <div className="d-flex flex-column">
                        <span>{item.name}</span>
                        <small style={{ fontSize: '10px', opacity: 0.6 }}>
                          {String(item.ownerId) === String(myUserId) ? "In My Drive" : "Shared with me"}
                        </small>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Audio, Theme, and Profile Actions */}
        <div className="dashboard-top-right">
          <button className="btn-sparkle-sm" onClick={toggleSong}>
            {isPlaying ? (
              <><FiPause style={{ color: 'white' }} /><span className="sparkle-text">PauseSong</span></>
            ) : (
              <><FiMusic style={{ color: 'white' }} /><span className="sparkle-text">PlaySong</span></>
            )}
            <div className="sparkle-stars"><div className="s-star s-1"></div><div className="s-star s-2"></div></div>
          </button>

          <ThemeToggle />

          <UserMenu
            isOpen={isUserMenuOpen}
            onToggle={() => setIsUserMenuOpen((v) => !v)}
            userEmail={userData?.email || "guest@copadrive.com"}
            userName={userFullName}
            userImage={userData?.image}
            isAuthenticated={isAuthenticated}
            onEditUser={() => { setIsUserMenuOpen(false); setIsEditUserOpen(true); }}
            onCloseMenu={() => setIsUserMenuOpen(false)}
            onLogout={handleLogout}
          />
        </div>
      </header>

      {/* Profile Settings Modal */}
      <EditUserModal
        show={isEditUserOpen}
        onClose={() => setIsEditUserOpen(false)}
        userId={userData?.id}
        userEmail={userData?.email || ""}
        initialFirstName={userData?.firstName || ""}
        initialLastName={userData?.lastName || ""}
        initialPhoneNumber={userData?.phoneNumber || ""}
        initialImage={userData?.image || ""}
        onSaved={(updatedUser) => setUserData(updatedUser)}
      />

      {/* Global File Viewer Modal */}
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

      {/* Global File Editor View */}
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

      {/* Global Sharing Modal */}
      {sharingItem && <ShareModal item={sharingItem} onClose={() => setSharingItem(null)} />}
    </>
  );
}