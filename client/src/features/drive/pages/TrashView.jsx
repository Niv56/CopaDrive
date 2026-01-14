import { useEffect, useMemo, useState, useCallback } from "react";
import FileListItem from "features/drive/widgets/FileListItem";
import FileGridItem from "features/drive/widgets/FileGridItem";
import {
  getTrashFiles,
  restoreFromTrash,
  deleteForever,
  emptyTrash,
  getCurrentUser
} from "features/drive/api/filesApi";
import { useAuth } from "app/providers/AuthContext";
import { useOwnersMap } from "features/drive/hooks/useOwnersMap";

import ViewModeToggle from "features/drive/widgets/ViewModeToggle";
import { useViewMode } from "features/drive/providers/ViewModeContext";

import { FiTrash2, FiInfo } from "react-icons/fi";

function getDaysLeft(trashedAt) {
  if (!trashedAt) return "";
  const trashDate = new Date(trashedAt);
  const deleteDate = new Date(trashDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diffTime = deleteDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? `${diffDays} days left` : "Deleting soon";
}

function TrashView() {
  const [items, setItems] = useState([]);
  // Loading state exists for internal logic but won't block UI
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const { token } = useAuth();
  const { viewMode } = useViewMode();

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

  useEffect(() => {
    if (myUserId) {
      getCurrentUser(myUserId).then(setCurrentUser).catch(() => { });
    }
  }, [myUserId]);

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
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => new Date(b.trashedAt || 0) - new Date(a.trashedAt || 0)),
    [items]
  );
  const ownersMap = useOwnersMap(sortedItems);

  const getOwnerLabel = useCallback((item) => {
    if (!item?.ownerId) return "Unknown";
    if (item.ownerId === myUserId) return "Me";
    const u = ownersMap[item.ownerId];
    const fullName = [u?.firstName, u?.lastName].filter(Boolean).join(" ").trim();
    return fullName || u?.email || "External";
  }, [ownersMap, myUserId]);

  const getOwnerAvatar = useCallback((item) => {
    if (!item?.ownerId) return "";
    if (item.ownerId === myUserId) {
      return currentUser?.image || "";
    }
    const u = ownersMap[item.ownerId];
    return u?.image || "";
  }, [ownersMap, myUserId, currentUser]);

  async function onRestore(item) { await restoreFromTrash(item.id); await refresh(); }
  // שינוי בפונקציות בתוך TrashView.jsx
  async function onDeleteForever(item) {
    // הסרנו את ה-if(window.confirm)
    await deleteForever(item.id);
    await refresh();
  }

  async function onEmptyTrash() {
    // הסרנו את ה-if(window.confirm)
    await emptyTrash();
    await refresh();
  }

  return (
    <div className="p-4" style={{ height: "100%", overflowY: "auto" }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center gap-2">
          <h2 className="m-0 fw-bold" style={{ color: "var(--text-primary)", textShadow: "var(--text-shadow-global)" }}>Trash</h2>
        </div>
        <div className="d-flex align-items-center gap-2">
          <ViewModeToggle />
          {hasItems && (
            <button
              className="btn btn-danger d-flex align-items-center gap-2 px-3 rounded-pill"
              disabled={loading}
              onClick={onEmptyTrash}
              style={{ backdropFilter: "blur(5px)", opacity: 0.9 }}
            >
              <FiTrash2 /> Empty trash
            </button>
          )}
        </div>
      </div>

      {/* הודעה עדינה על מחיקה אחרי 30 יום */}
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
        /* ✅ Empty State - Glass Icon Only (No Text) */
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