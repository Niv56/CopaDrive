import { formatBytes } from "../../../utils/formatBytes";

function FileListItem({
  item,
  onOpen,
  onEdit,
  onShare,
  onDelete,
  onToggleStar,
  onToggleImportant,
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
      className="list-group-item d-flex justify-content-between align-items-center rounded-4 shadow-sm py-3 px-3"
      style={{ cursor: "pointer" }}
      onClick={() => onOpen?.(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen?.(item);
      }}
    >
      <div className="d-flex align-items-center gap-3">
        <span style={{ fontSize: 22 }}>{isFolder ? "📁" : "📄"}</span>
        <div className="d-flex flex-column">
          <div className="fw-semibold">{item.name}</div>
          <div className="text-muted small">{isFolder ? "Folder" : "File"}</div>
        </div>
      </div>

      {/* Right side */}
      <div className="d-flex align-items-center gap-3" onClick={stop}>
        {/* Size */}
        <div className="text-muted small" style={{ minWidth: 80, textAlign: "right" }}>
          {sizeLabel}
        </div>

        {/* STAR */}
        <button
          type="button"
          className="btn btn-light rounded-circle"
          title={isStarred ? "Remove from starred" : "Add to starred"}
          style={{ width: 40, height: 40, ...pillStyle(isStarred, "star") }}
          onClick={(e) => {
            stop(e);
            onToggleStar?.(item, !isStarred);
          }}
        >
          ☆
        </button>

        {/* IMPORTANT */}
        <button
          type="button"
          className="btn btn-light rounded-circle"
          title={isImportant ? "Remove from important" : "Add to important"}
          style={{ width: 40, height: 40, ...pillStyle(isImportant, "important") }}
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
            className="btn btn-light rounded-circle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{ width: 40, height: 40 }}
          >
            ⋮
          </button>

          <ul className="dropdown-menu dropdown-menu-end">
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
