import { useEffect } from "react";
import "styles/modals/SessionExpiredModal.css";

/**
 * Modal displayed when the user's authentication token has expired.
 * Forces the user to log out to clear invalid credentials and redirect to login.
 * * @param {boolean} isOpen - Controls visibility of the modal.
 * @param {Function} onLogout - Callback to clear local storage and redirect.
 */
function SessionExpiredModal({ isOpen, onLogout }) {

  /** * Management of body scroll state.
   * Prevents the user from scrolling the background while the session error is active.
   */
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