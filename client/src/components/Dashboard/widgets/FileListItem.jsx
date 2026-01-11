import { formatBytes } from "../../../utils/formatBytes";

function FileListItem({
  item,
  onOpen,
  onEdit,
  onShare,
  onDelete,
  onToggleStar,
  onToggleImportant,
  extraInfo, // 🎯 פרופ חדש להצגת מידע נוסף (כמו זמן פתיחה)
}) {
  if (!item) return null;

  const isFolder = item.type === "folder";
  const isStarred = !!item.starred;
  const isImportant = !!item.important;

  const sizeLabel = isFolder ? "—" : formatBytes(item.sizeBytes ?? 0);

  function stop(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function pillStyle(active, kind) {
    if (!active) return {};
    if (kind === "star") {
      return { backgroundColor: "#FFD54F", borderColor: "#FFD54F", color: "#111" };
    }
    return { backgroundColor: "#EF5350", borderColor: "#EF5350", color: "#fff" };
  }

  return (
    <div
      className="list-group-item d-flex justify-content-between align-items-center rounded-4 shadow-sm py-3 px-3 mb-2"
      style={{ cursor: "pointer", border: "none", background: "#fff" }}
      onClick={() => onOpen?.(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen?.(item);
      }}
    >
      {/* Left side: Icon & Name */}
      <div className="d-flex align-items-center gap-3">
        <span style={{ fontSize: 22 }}>{isFolder ? "📁" : "📄"}</span>
        <div className="d-flex flex-column">
          <div className="fw-semibold text-truncate" style={{ maxWidth: "250px" }}>{item.name}</div>
          <div className="text-muted small">{isFolder ? "Folder" : "File"}</div>
        </div>
      </div>

      {/* Right side: Info & Actions */}
      <div className="d-flex align-items-center gap-3" onClick={stop}>

        {/* 🎯 המידע הנוסף (כמו "Opened Just now") מוצג כאן כחלק מה-Flex */}
        {extraInfo && (
          <div style={{ fontSize: "12px", color: "#5f6368", whiteSpace: "nowrap" }}>
            {extraInfo}
          </div>
        )}

        {/* Size */}
        <div className="text-muted small" style={{ minWidth: 70, textAlign: "right" }}>
          {sizeLabel}
        </div>

        {/* STAR */}
        <button
          type="button"
          className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
          title={isStarred ? "Remove from starred" : "Add to starred"}
          style={{ width: 36, height: 36, ...pillStyle(isStarred, "star"), border: "1px solid #eee" }}
          onClick={(e) => {
            stop(e);
            onToggleStar?.(item, !isStarred);
          }}
        >
          {isStarred ? "★" : "☆"}
        </button>

        {/* IMPORTANT */}
        <button
          type="button"
          className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
          title={isImportant ? "Remove from important" : "Add to important"}
          style={{ width: 36, height: 36, ...pillStyle(isImportant, "important"), border: "1px solid #eee" }}
          onClick={(e) => {
            stop(e);
            onToggleImportant?.(item, !isImportant);
          }}
        >
          !
        </button>

        {/* MENU */}
        <div className="dropdown" onClick={stop}>
          <button
            className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{ width: 36, height: 36, border: "1px solid #eee" }}
          >
            ⋮
          </button>

          <ul className="dropdown-menu dropdown-menu-end shadow-sm">
            <li>
              <button className="dropdown-item" onClick={(e) => { stop(e); onEdit?.(item); }}>
                Edit
              </button>
            </li>
            <li>
              <button className="dropdown-item" onClick={(e) => { stop(e); onShare?.(item); }}>
                Share
              </button>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button className="dropdown-item text-danger" onClick={(e) => { stop(e); onDelete?.(item); }}>
                Delete
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default FileListItem;