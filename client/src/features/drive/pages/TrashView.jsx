import { useEffect, useState, useMemo, useCallback } from "react";
import "styles/pages/MyDrive.css";
import {
  getTrashFiles,
  restoreFromTrash,
  deleteForever,
  emptyTrash,
  getCurrentUser
} from "features/drive/api/filesApi";
import { useAuth } from "app/providers/AuthContext";
import { useOwnersMap } from "features/drive/hooks/useOwnersMap";
import { useViewMode } from "features/drive/providers/ViewModeContext";

import FileListItem from "features/drive/widgets/FileListItem";
import FileGridItem from "features/drive/widgets/FileGridItem";
import ViewModeToggle from "features/drive/widgets/ViewModeToggle";

import { FiTrash2, FiInfo } from "react-icons/fi";

/**
 * Calculates remaining days until permanent deletion based on a 30-day policy.
 * @param {string} trashedAt - ISO timestamp of when the item was deleted.
 * @returns {string} Human-readable countdown string.
 */
function getDaysLeft(trashedAt) {
  if (!trashedAt) return "";
  const trashDate = new Date(trashedAt);
  const deleteDate = new Date(trashDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diffTime = deleteDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? `${diffDays} days left` : "Deleting soon";
}

/**
 * View component for managing deleted items.
 * Allows users to restore files, delete them permanently, or empty the entire trash.
 */
function TrashView() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const { token } = useAuth();
  const { viewMode } = useViewMode();

  /** Extracts userId from JWT token payload */
  const myUserId = useMemo(() => {
    if (!token) return null;
    try {
      return JSON.parse(
        window.atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
      ).userId;
    } catch {
      return null;
    }
  }, [token]);

  /** Fetches current user profile for owner resolution */
  useEffect(() => {
    if (myUserId) {
      getCurrentUser(myUserId).then(setCurrentUser).catch(() => { });
    }
  }, [myUserId]);

  /** Fetches all items currently in the trash */
  const refresh = useCallback(async () => {
    setErr("");
    if (items.length === 0) setLoading(true);
    try {
      const data = await getTrashFiles();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Failed to load trash");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [items.length]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const hasItems = items.length > 0;

  /** Sorts items so the most recently deleted appear first */
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => new Date(b.trashedAt || 0) - new Date(a.trashedAt || 0)),
    [items]
  );

  const ownersMap = useOwnersMap(sortedItems);

  /** Resolves display name for the item owner */
  const getOwnerLabel = useCallback((item) => {
    if (!item?.ownerId) return "Unknown";
    if (item.ownerId === myUserId) return "Me";
    const u = ownersMap[item.ownerId];
    const fullName = [u?.firstName, u?.lastName].filter(Boolean).join(" ").trim();
    return fullName || u?.email || "External";
  }, [ownersMap, myUserId]);

  /** Resolves avatar image for the item owner */
  const getOwnerAvatar = useCallback((item) => {
    if (!item?.ownerId) return "";
    if (item.ownerId === myUserId) {
      return currentUser?.image || "";
    }
    const u = ownersMap[item.ownerId];
    return u?.image || "";
  }, [ownersMap, myUserId, currentUser]);

  /** Moves item back to original location */
  async function onRestore(item) {
    await restoreFromTrash(item.id);
    await refresh();
  }

  /** Permanently deletes a single item */
  async function onDeleteForever(item) {
    await deleteForever(item.id);
    await refresh();
  }

  /** Wipes all items from the trash */
  async function onEmptyTrash() {
    await emptyTrash();
    await refresh();
  }

  return (
    <div className="mainarea" style={{ height: "100%", overflowY: "auto", padding: "24px" }}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Bruno+Ace+SC&display=swap');`}
      </style>

      {/* Header section with view toggle and destructive actions */}
      <div className="page-title-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{
          fontFamily: "'Bruno Ace SC', sans-serif",
          fontSize: "2.5rem",
          fontWeight: "400",
          margin: 0,
          color: "var(--text-primary)",
          letterSpacing: "2px",
          textTransform: "uppercase"
        }}>
          Trash
        </h2>
        <div className="d-flex align-items-center gap-2">
          <ViewModeToggle />
          {hasItems && (
            <button
              className="btn btn-danger d-flex align-items-center gap-2 px-3 rounded-pill"
              disabled={loading}
              onClick={onEmptyTrash}
            >
              <FiTrash2 /> Empty trash
            </button>
          )}
        </div>
      </div>

      {/* Policy information banner */}
      <div className="d-inline-flex align-items-center gap-2 mb-4 px-3 py-2 rounded-pill"
        style={{
          background: "rgba(255, 255, 255, 0.25)",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--border-color)",
          boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
          width: "fit-content"
        }}>
        <FiInfo size={16} style={{ color: "var(--text-primary)" }} />
        <span style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text-primary)",
          textShadow: "var(--text-shadow-global)"
        }}>
          Items in trash will be deleted forever after <b>30 days</b>.
        </span>
      </div>

      {err && <div className="alert alert-danger py-2">{err}</div>}

      {!hasItems ? (
        <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "50vh", textAlign: "center" }}>
          <div className="d-flex align-items-center justify-content-center"
            style={{
              width: "100px", height: "100px", borderRadius: "50%",
              background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)",
              border: "1px solid var(--border-color)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
            }}>
            <FiTrash2 size={42} style={{ color: "var(--text-primary)", opacity: 0.9 }} />
          </div>
        </div>
      ) : (
        <div className="mt-2">
          {viewMode !== "grid" && (
            <div
              className="d-flex align-items-center px-3 pb-2 border-bottom mb-2"
              style={{
                fontSize: "13px", fontWeight: 600,
                color: "var(--text-secondary)",
                textShadow: "var(--text-shadow-global)",
                textTransform: "uppercase", letterSpacing: "0.5px", gap: "10px"
              }}
            >
              <div style={{ flex: 1 }}>Name</div>
              <div style={{ width: "150px" }}>Owner</div>
              <div style={{ width: "150px" }}>Date Deleted</div>
              <div style={{ width: "120px" }}>Days left</div>
              <div style={{ width: "100px" }}>Size</div>
              <div style={{ width: "80px" }} />
            </div>
          )}

          {viewMode === "grid" ? (
            <div className="d-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              {sortedItems.map((item) => (
                <FileGridItem key={item.id} item={item} mode="trash"
                  ownerLabel={getOwnerLabel(item)} ownerAvatar={getOwnerAvatar(item)}
                  dateLabel={item.trashedAt ? new Date(item.trashedAt).toLocaleDateString() : "—"}
                  daysLeftLabel={getDaysLeft(item.trashedAt)}
                  onOpen={() => { }} onRestore={onRestore} onDeleteForever={onDeleteForever}
                />
              ))}
            </div>
          ) : (
            sortedItems.map((item) => (
              <FileListItem key={item.id} item={item} mode="trash"
                ownerLabel={getOwnerLabel(item)}
                ownerAvatar={getOwnerAvatar(item)}
                dateLabel={item.trashedAt ? new Date(item.trashedAt).toLocaleDateString() : "—"}
                daysLeftLabel={getDaysLeft(item.trashedAt)}
                showSize={true}
                onOpen={() => { }} onRestore={onRestore} onDeleteForever={onDeleteForever}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default TrashView;