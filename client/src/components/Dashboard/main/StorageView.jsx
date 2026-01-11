import { useEffect, useMemo, useState } from "react";
import { getRootFiles, getUsage } from "../../../api/filesApi";
import { formatBytes } from "../../../utils/formatBytes";

export default function StorageView({ onChangeView }) {
  const [usage, setUsage] = useState({
    usedBytes: 0,
    quotaBytes: 15 * 1024 * 1024 * 1024,
  });
  const [files, setFiles] = useState([]);

  async function load() {
    const [u, all] = await Promise.all([getUsage(), getRootFiles()]);

    setUsage({
      usedBytes: u?.usedBytes ?? 0,
      quotaBytes: u?.quotaBytes ?? 15 * 1024 * 1024 * 1024,
    });

    setFiles(Array.isArray(all) ? all : []);
  }

  useEffect(() => {
    let alive = true;

    load().catch(() => {});

    function onStorageChanged() {
      if (!alive) return;
      load().catch(() => {});
    }

    window.addEventListener("storage-changed", onStorageChanged);
    return () => {
      alive = false;
      window.removeEventListener("storage-changed", onStorageChanged);
    };
  }, []);

  const ownedFilesSorted = useMemo(() => {
    const onlyFiles = files.filter((f) => f.type === "file");
    return onlyFiles.sort((a, b) => (b.sizeBytes ?? 0) - (a.sizeBytes ?? 0));
  }, [files]);

  function openFromStorage(item) {
    // 1) מעבירים ל-MyDrive
    onChangeView?.("mydrive");

    // 2) ואז (אחרי שהקומפוננט MyDrive כבר mounted) שולחים event
    setTimeout(() => {
      if (item.type === "folder") {
        window.dispatchEvent(
          new CustomEvent("open-folder", { detail: { folderId: item.id } })
        );
      } else {
        window.dispatchEvent(
          new CustomEvent("open-file", { detail: { fileId: item.id } })
        );
      }
    }, 0);
  }

  return (
    <div className="mainarea">
      <h2 style={{ marginTop: 0 }}>Storage</h2>

      <div style={{ color: "#5f6368", marginBottom: 16 }}>
        {formatBytes(usage.usedBytes)} of {formatBytes(usage.quotaBytes)} used
      </div>

      <div className="list-group">
        {ownedFilesSorted.length === 0 ? (
          <div style={{ color: "#999", padding: 24 }}>No files yet.</div>
        ) : (
          ownedFilesSorted.slice(0, 30).map((f) => (
            <div
              key={f.id}
              className="list-group-item d-flex justify-content-between align-items-center"
              role="button"
              tabIndex={0}
              style={{ cursor: "pointer" }}
              onClick={() => openFromStorage(f)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") openFromStorage(f);
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <span>📄</span>
                <div>{f.name}</div>
              </div>

              <div className="text-muted small">
                {formatBytes(f.sizeBytes ?? 0)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
