import React, { useEffect, useRef } from "react";
import { FiEdit2, FiLogOut } from "react-icons/fi";

/**
 * UserMenu Component
 * Displays user profile summary and a toggleable dropdown for account actions.
 * Features:
 * - Click-outside detection to close the menu.
 * - Avatar fallback to user initials.
 * - Profile editing and logout triggers.
 */
function UserMenu({
  isOpen,
  onToggle,
  onCloseMenu,
  userEmail,
  userName,
  userImage,
  onEditUser,
  onLogout,
  isAuthenticated,
}) {
  const menuRef = useRef(null);

  /**
   * Listens for clicks on the document to close the dropdown if the 
   * user clicks outside the component boundaries.
   */
  useEffect(() => {
    function onDocClick(e) {
      if (!isOpen) return;
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onCloseMenu?.();
      }
    }

    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [isOpen, onCloseMenu]);

  return (
    <div
      className="user-menu"
      ref={menuRef}
      onClick={(e) => {
        // Prevent trigger from closing immediately due to document listener
        e.stopPropagation();
        onToggle?.();
      }}
    >
      {/* Identity Summary */}
      <div className="user-meta" style={{ textAlign: "right", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: "14px", fontWeight: "600", lineHeight: "1.2" }}>
          {isAuthenticated ? userName : "Guest"}
        </div>
        <div style={{ fontSize: "11px", opacity: 0.7, lineHeight: "1.2" }}>
          {isAuthenticated ? "Signed in" : "Offline"}
        </div>
      </div>

      {/* Avatar Circle */}
      <div
        className="user-avatar-btn"
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid rgba(255,255,255,0.5)",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          background: "#eee"
        }}
      >
        {userImage ? (
          <img
            src={userImage}
            alt="Profile"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: "16px", fontWeight: "600", color: "#555" }}>
            {userName ? userName.charAt(0).toUpperCase() : "U"}
          </span>
        )}
      </div>

      {/* Action Dropdown */}
      {isOpen && (
        <div className="user-dropdown" onClick={(e) => e.stopPropagation()}>
          <div className="user-dropdown-email">
            {userEmail}
          </div>

          <button type="button" className="user-dropdown-item" onClick={onEditUser}>
            <FiEdit2 size={18} />
            <span>Edit profile</span>
          </button>

          <div className="user-dropdown-divider" />

          <button type="button" className="user-dropdown-item danger" onClick={onLogout}>
            <FiLogOut size={18} />
            <span>Log out</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;