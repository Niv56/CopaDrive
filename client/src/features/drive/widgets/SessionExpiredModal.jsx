import { useEffect } from "react";
import "styles/modals/SessionExpiredModal.css";

// Modal displayed when the user's session has timed out
function SessionExpiredModal({ isOpen, onLogout }) {
  // Prevents background scrolling when the modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="session-expired-backdrop">
      <div
        className="session-expired-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-expired-title"
      >
        <h2 id="session-expired-title">Session expired</h2>

        <p>
          Looks like you’ve been away for a while.
          <br />
          We were waiting for you.
        </p>

        <button
          className="session-expired-logout-btn"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default SessionExpiredModal;