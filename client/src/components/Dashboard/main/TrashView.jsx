// client/src/components/Dashboard/main/TrashView.jsx
import { useEffect, useMemo, useState } from "react";
import FileListItem from "../widgets/FileListItem";
import {
  getTrashFiles,
  restoreFromTrash,
  deleteForever,
  emptyTrash,
} from "../../../api/filesApi";

function TrashView() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function refresh() {
    setErr("");
    setLoading(true);
    try {
      const data = await getTrashFiles();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Failed to load trash");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const hasItems = items.length > 0;

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const ta = new Date(a.trashedAt || 0).getTime();
      const tb = new Date(b.trashedAt || 0).getTime();
      return tb - ta;
    });
  }, [items]);

  async function onRestore(item) {


    try {
      await restoreFromTrash(item.id);
      await refresh();
    } catch (e) {
      alert(e?.message || "Restore failed");
    }
  }

  async function onDeleteForever(item) {


    try {
      await deleteForever(item.id);
      await refresh();
    } catch (e) {
      alert(e?.message || "Delete forever failed");
    }
  }

  async function onEmptyTrash() {


    try {
      await emptyTrash();
      await refresh();
    } catch (e) {
      alert(e?.message || "Empty trash failed");
    }
  }

  return (
    <div className="p-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="m-0">Trash</h2>

        <button
          className="btn btn-outline-danger"
          disabled={!hasItems || loading}
          onClick={onEmptyTrash}
        >
          Empty trash
        </button>
      </div>

      <div
        className="d-flex align-items-center justify-content-between rounded-4 px-3 py-2 mb-3"
        style={{ background: "#f1f3f4", color: "#3c4043" }}
      >
        <div style={{ fontSize: 13 }}>
          Items in trash will be deleted forever after <b>30 days</b>
        </div>
      </div>

      {err && <div className="alert alert-danger py-2">{err}</div>}

      {!loading && !hasItems && (
        <div
          className="d-flex flex-column align-items-center justify-content-center"
          style={{ marginTop: 60 }}
        >
          <div style={{ fontSize: 64 }}>🗑️</div>
          <div className="mt-3" style={{ fontSize: 28, fontWeight: 700 }}>
            Trash is empty
          </div>
          <div className="text-muted mt-1" style={{ fontSize: 14 }}>
            Items moved to the trash will be deleted forever after 30 days
          </div>
        </div>
      )}

      {hasItems && (
        <div className="mt-2">
          {sortedItems.map((item) => (
            <FileListItem
              key={item.id}
              item={item}
              mode="trash"
              onOpen={null}
              onRestore={onRestore}
              onDeleteForever={onDeleteForever}
            />
          ))}
        </div>
      )}

      {loading && <div className="text-muted">Loading…</div>}
    </div>
  );
}

export default TrashView;
