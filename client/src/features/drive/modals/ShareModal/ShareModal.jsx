import React, { useState } from "react";
import { findUserByEmail, addFilePermission } from "../../api/filesApi";
import "styles/modals/ShareModal.css";

function ShareModal({ item, onClose }) {
  const [email, setEmail] = useState("");
  const [foundUser, setFoundUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [status, setStatus] = useState("");

  // Search a user by email and update modal state.
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setIsShared(false);
    setStatus("");

    const user = await findUserByEmail(email.trim());
    setFoundUser(user);
    if (!user) setStatus("User not found");

    setLoading(false);
  };

  // Share the item with the found user, treating "already exists" as success.
  const handleShare = async () => {
    if (!foundUser) return;

    try {
      await addFilePermission(item.id, foundUser.id);
      setIsShared(true);
    } catch (err) {
      if (err.message.includes("already exists")) {
        setIsShared(true);
      } else {
        alert(err.message);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">Share "{item.name}"</div>

        <form onSubmit={handleSearch} className="d-flex gap-2 mb-3">
          <input
            className="modal-input"
            placeholder="Enter user email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="btn primary" disabled={loading}>
            Search
          </button>
        </form>

        {foundUser && (
          <div className="list-group-item d-flex align-items-center justify-content-between p-2 border rounded-3 mb-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="user-avatar"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  overflow: "hidden",
                  flexShrink: 0,
                  background: "#eee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {foundUser.image ? (
                  <img
                    src={foundUser.image}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  "👤"
                )}
              </div>

              <div>
                <div className="fw-bold">
                  {foundUser.firstName} {foundUser.lastName}
                </div>
                <div className="small text-muted">{email}</div>
              </div>
            </div>

            <button
              className="btn btn-sm"
              onClick={handleShare}
              disabled={isShared}
              style={{
                backgroundColor: isShared ? "#e0e0e0" : "#1a73e8",
                color: isShared ? "#757575" : "#fff",
                border: "none",
                cursor: isShared ? "not-allowed" : "pointer",
                padding: "6px 12px",
                borderRadius: "8px",
              }}
            >
              {isShared ? "Shared" : "Share"}
            </button>
          </div>
        )}

        {status && <div className="text-danger small mb-3">{status}</div>}

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
