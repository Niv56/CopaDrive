import React, { useState, useEffect } from "react";
import { getCurrentUser } from "../../../api/filesApi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import appLogo from "../../../photos/logo.svg";
import UserMenu from "../UserMenu";

export default function TopBar() {
  const [userData, setUserData] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const { token, logout, isAuthenticated } = useAuth();
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

  return (
    <header className="dashboard-top">
      <div className="dashboard-top-left">
        <img src={appLogo} alt="CopaDrive logo" className="app-logo" />
        <h2 className="app-title">CopaDrive</h2>
      </div>

      <div className="dashboard-top-center">
        <input
          type="text"
          placeholder="Search in CopaDrive"
          className="dashboard-search"
        />
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
    </header>
  );
}