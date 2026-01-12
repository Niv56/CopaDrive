// client/src/components/Dashboard/widgets/FileListItem.jsx
import { formatBytes } from "../../../utils/formatBytes";

function FileListItem({
  item,
  onOpen,
  onShare,
  onToggleStar,
  onToggleImportant,
  onDelete,
  myUserId,
  resolvedRole, // ✅ new: role from cache
}) {
  if (!item) return null;

  const isOwner = item.ownerId === myUserId;

  // prefer resolvedRole -> item.role -> default viewer
  const rawRole = isOwner ? "owner" : (resolvedRole || item.role || "viewer");
  const myRole = isOwner ? "OWNER" : String(rawRole).toUpperCase();

  const badgeStyle = {
    fontSize: "10px",
    padding: "2px 6px",
    borderRadius: "4px",
    marginLeft: "8px",
    fontWeight: "bold",
    verticalAlign: "middle",
    backgroundColor: isOwner ? "#e6f4ea" : (myRole === "EDITOR" ? "#e8f0fe" : "#f1f3f4"),
    color: isOwner ? "#137333" : (myRole === "EDITOR" ? "#1a73e8" : "#5f6368"),
    border: `1px solid ${isOwner ? "#ceead6" : (myRole === "EDITOR" ? "#d2e3fc" : "#dadce0")}`,
  };

  return (
    <div
      className="list-group-item d-flex justify-content-between align-items-center rounded-4 shadow-sm py-3 px-3 mb-2 bg-white border-0"
      onClick={() => onOpen?.(item)}
      style={{ cursor: "pointer" }}
    >
      <div className="d-flex align-items-center gap-3">
        <span style={{ fontSize: 22 }}>{item.type === "folder" ? "📁" : "📄"}</span>

        <div className="d-flex flex-column">
          <div className="fw-semibold text-truncate" style={{ maxWidth: "250px" }}>
            {item.name}
            <span style={badgeStyle}>{myRole}</span>
          </div>
          <div className="text-muted small">{item.type === "folder" ? "Folder" : "File"}</div>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3" onClick={(e) => e.stopPropagation()}>
        <div className="text-muted small">
          {item.type === "folder" ? "—" : formatBytes(item.sizeBytes)}
        </div>

        <button className="btn btn-light rounded-circle" onClick={() => onToggleStar?.(item, !item.starred)}>
          {item.starred ? "★" : "☆"}
        </button>

        <button className="btn btn-light rounded-circle" onClick={() => onToggleImportant?.(item, !item.important)}>
          !
        </button>

        <div className="dropdown">
          <button className="btn btn-light rounded-circle" data-bs-toggle="dropdown">
            ⋮
          </button>

          <ul className="dropdown-menu dropdown-menu-end shadow border-0">
            <li>
              <button className="dropdown-item" onClick={() => onShare?.(item)}>
                Share
              </button>
            </li>

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
