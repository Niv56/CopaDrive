function FileListItem({ item, onOpen, onEdit, onShare, onDelete }) {
   if (!item) return null;
  const isFolder = item.type === "folder";

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

      <div className="dropdown" onClick={(e) => e.stopPropagation()}>
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
            <button className="dropdown-item" onClick={() => onEdit?.(item)}>
              Edit
            </button>
          </li>
          <li>
            <button className="dropdown-item" onClick={() => onShare?.(item)}>
              Share
            </button>
          </li>
          <li><hr className="dropdown-divider" /></li>
          <li>
            <button className="dropdown-item text-danger" onClick={() => onDelete?.(item)}>
              Delete
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default FileListItem;
