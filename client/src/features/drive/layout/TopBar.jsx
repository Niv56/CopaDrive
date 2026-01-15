import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "app/providers/AuthContext";
import appLogo from "assets/photos/logo.svg";

import UserMenu from "../widgets/UserMenu";
import { getCurrentUser, searchItems } from "../api/filesApi";

import FileViewerModal from "../widgets/FileViewerModal";
import EditUserModal from "../widgets/EditUserModal";
import ThemeToggle from "../widgets/ThemeToggle";

import { FiSearch, FiMusic } from "react-icons/fi";

import "styles/layout/TopBar.css";

import songFile from "assets/videos/Song.mp3";

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

  const playSong = () => {
    const audio = new Audio(songFile);
    audio.play().catch(e => console.log("Play error:", e));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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

  const userFullName = userData
    ? `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || "Guest"
    : "Guest";

  return (
    <>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Bruno+Ace+SC&display=swap');`}
      </style>

      <header className="dashboard-top">
        <div className="dashboard-top-left" style={{ gap: '15px', alignItems: 'center' }}>
          <img 
            src={appLogo} 
            alt="CopaDrive logo" 
            className="app-logo" 
            style={{ width: "48px", height: "48px" }} 
          />
          
          <h2 className="app-title" style={{ 
              fontFamily: "'Bruno Ace SC', sans-serif",
              fontSize: "1.8rem", 
              fontWeight: "400",
              margin: 0,
              letterSpacing: "1px",
              textTransform: "uppercase",
              paddingTop: "4px" 
          }}>
            CopaDrive
          </h2>
        </div>

        {/* Center: Search Bar - Wide & Clean */}
        <div
          ref={searchRef}
          className="dashboard-top-center"
        >
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

          {searchQuery.trim() && (
            <div className="search-dropdown-results">
              <div className="search-header">
                <div style={{ fontWeight: 600 }}>Results</div>
                <button
                  className="btn btn-light btn-sm"
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
                  <div className="no-results">No results</div>
                ) : (
                  searchResults.map((item) => (
                    <div
                      key={item.id}
                      className="search-result-item"
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

        {/* Right: Actions & Profile */}
        <div className="dashboard-top-right">
          
          <button className="btn-sparkle-sm" onClick={playSong}>
            <FiMusic style={{ color: 'white' }} />
            <span className="sparkle-text">PlaySong</span>
            <div className="sparkle-stars">
                <div className="s-star s-1"></div>
                <div className="s-star s-2"></div>
            </div>
          </button>

          <ThemeToggle />

          <UserMenu
            isOpen={isUserMenuOpen}
            onToggle={() => setIsUserMenuOpen((v) => !v)}
            userEmail={userData?.email || "guest@copadrive.com"}
            userName={userFullName}
            userImage={userData?.image}
            isAuthenticated={isAuthenticated}
            onEditUser={() => {
              setIsUserMenuOpen(false);
              setIsEditUserOpen(true);
            }}
            onCloseMenu={() => setIsUserMenuOpen(false)}
            onLogout={handleLogout}
          />
        </div>
      </header>

      <EditUserModal
        show={isEditUserOpen}
        onClose={() => setIsEditUserOpen(false)}
        userId={userData?.id}
        userEmail={userData?.email || ""}
        initialFirstName={userData?.firstName || ""}
        initialLastName={userData?.lastName || ""}
        initialPhoneNumber={userData?.phoneNumber || ""}
        initialImage={userData?.image || ""}
        onSaved={(updatedUser) => {
          setUserData(updatedUser);
        }}
      />

      {selectedFile && (
        <FileViewerModal
          file={selectedFile}
          role={"viewer"}
          onClose={() => setSelectedFile(null)}
          onEdit={() => alert("Feature to be implemented")}
          onShare={() => alert("Feature to be implemented")}
          onDelete={() => alert("Feature to be implemented")}
        />
      )}
    </>
  );
}