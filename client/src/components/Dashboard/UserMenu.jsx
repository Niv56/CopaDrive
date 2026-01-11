import React, { useEffect, useRef } from "react";

function UserMenu({ isOpen, onToggle, onCloseMenu, userEmail, userName, userImage, onEditUser, onLogout, isAuthenticated }) {
  const menuRef = useRef(null);

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
    <div className="user-menu" ref={menuRef}>
      <button
        type="button"
        className="user-avatar-btn"
        onClick={(e) => {
          e.stopPropagation();
          onToggle?.();
        }}
        style={{ padding: 0, overflow: 'hidden' }}
      >
        {userImage ? (
          <img
            src={userImage}
            alt="Profile"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span className="user-avatar-icon">👤</span>
        )}
      </button>

      <div className="user-meta">
        <div className="user-name">{isAuthenticated ? userName : "Guest"}</div>
        <div className="user-sub">{isAuthenticated ? "Signed in" : "Not signed in"}</div>
      </div>

      {isOpen && (
        <div className="user-dropdown" onClick={(e) => e.stopPropagation()}>
          <div className="user-dropdown-email">{userEmail}</div>
          <div className="user-dropdown-divider" />

          <button
            type="button"
            className="user-dropdown-item"
            onClick={onEditUser}
          >
            Edit user
          </button>

          <button
            type="button"
            className="user-dropdown-item"
            onClick={() => alert("Theme")}
          >
            Day / Night mode
          </button>

          <div className="user-dropdown-divider" />

          <button
            type="button"
            className="user-dropdown-item danger"
            onClick={onLogout}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;