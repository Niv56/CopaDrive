// client/src/components/Dashboard/widgets/FileListItem.jsx
import { formatBytes } from "../../../utils/formatBytes";

function FileListItem({
  item,
  onOpen,
  onEdit,
  onShare,
  onDelete,
  onToggleStar,
  onToggleImportant,
  extraInfo, // optional (e.g. "Opened Just now")
  myUserId,
  resolvedRole, // role from cache (viewer/editor/owner)
}) {
  if (!item) return null;

  const isFolder = item.type === "folder";
  const isStarred = !!item.starred;
  const isImportant = !!item.important;

  const isOwner = myUserId && item.ownerId === myUserId;

  // Prefer resolvedRole if provided; fallback:
  const myRole = resolvedRole || (isOwner ? "owner" : "viewer");

  const sizeLabel = isFolder ? "—" : formatBytes(item.sizeBytes);

  const badgeStyle = {
    marginLeft: 10,
    padding: "2px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    background:
      myRole === "owner"
        ? "#fef3c7"
        : myRole === "editor"
          ? "#dbeafe"
          : "#f3f4f6",
    color: "#111827",
    border: "1px solid #e5e7eb",
    textTransform: "capitalize",
  };

  return (
    <div
      className="list-group-item d-flex justify-content-between align-items-center p-3 rounded-4 shadow-sm"
      style={{ cursor: "pointer", background: "#fff" }}
      onClick={() => onOpen?.(item)}
    >
      <div className="d-flex align-items-center gap-3">
        <div style={{ fontSize: 22 }}>{isFolder ? "📁" : "📄"}</div>

        <div className="d-flex flex-column">
          <div className="fw-semibold text-truncate" style={{ maxWidth: 250 }}>
            {item.name}
            {/* role badge */}
            {myUserId && <span style={badgeStyle}>{myRole}</span>}
          </div>

          <div className="text-muted small">
            {isFolder ? "Folder" : "File"}
            {extraInfo ? <span className="ms-2">· {extraInfo}</span> : null}
          </div>
        </div>
      </div>

      <div
        className="d-flex align-items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Size */}
        <div className="text-muted small" style={{ minWidth: 70, textAlign: "right" }}>
          {sizeLabel}
        </div>

        {/* STAR */}
        <button
          className="btn btn-light rounded-circle"
          title={isStarred ? "Unstar" : "Star"}
          onClick={() => onToggleStar?.(item, !isStarred)}
        >
          {isStarred ? "⭐" : "☆"}
        </button>

        {/* IMPORTANT */}
        <button
          className="btn btn-light rounded-circle"
          title={isImportant ? "Unmark important" : "Mark important"}
          onClick={() => onToggleImportant?.(item, !isImportant)}
        >
          !
        </button>

        {/* MENU */}
        <div className="dropdown">
          <button className="btn btn-light rounded-circle" data-bs-toggle="dropdown" title="More">
            ⋮
          </button>

          <ul className="dropdown-menu dropdown-menu-end shadow border-0">
            <li>
              <button className="dropdown-item" onClick={() => onShare?.(item)}>
                Share
              </button>
            </li>

            {onEdit && (
              <li>
                <button className="dropdown-item" onClick={() => onEdit(item)}>
                  Edit
                </button>
              </li>
            )}

            {isOwner && (
              <li>
                <button className="dropdown-item text-danger" onClick={() => onDelete?.(item)}>
                  Delete
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default FileListItem;
