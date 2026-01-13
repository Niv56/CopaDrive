// FileListItem.jsx
import "./FileListItem.css";
import { formatBytes } from "../../../utils/formatBytes";

function FileIcon({ isFolder }) {
  if (isFolder) {
    return (
      <svg className="fli-svg" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10 4l2 2h8a2 2 0 012 2v1H2V6a2 2 0 012-2h6z" />
        <path d="M2 9h20v9a2 2 0 01-2 2H4a2 2 0 01-2-2V9z" />
      </svg>
    );
  }
  return (
    <svg className="fli-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V8l-5-6z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function FileListItem({
  item,
  onOpen,
  onEdit,
  onShare,
  onDelete, // Move to trash
  onToggleStar,
  onToggleImportant,
  mode = "default", // "default" | "trash"
  onRestore,
  onDeleteForever,
  extraInfo,
}) {
  if (!item) return null;

  const isTrash = mode === "trash";
  const isFolder = item.type === "folder";

  const isStarred = !!item.starred;
  const isImportant = !!item.important;

  const sizeLabel = isFolder ? "—" : formatBytes(item.sizeBytes ?? 0);

  const daysLeft =
    typeof item.trashDaysLeft === "number" ? `${item.trashDaysLeft} days left` : "";

  const trashInfo = [daysLeft, sizeLabel].filter(Boolean).join(" · ");

  function stop(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function pillStyle(active, kind) {
    if (!active) return { borderColor: "#eee" }; // צבע ברירת מחדל כשהכפתור כבוי

    if (kind === "star") {
      return { backgroundColor: "#FFD54F", borderColor: "#FFD54F", color: "#111" };
    }
    return { backgroundColor: "#EF5350", borderColor: "#EF5350", color: "#fff" };
  }

  return (
    <div
      className={`fli-row ${isTrash ? "is-trash" : ""}`}
      onClick={() => onOpen?.(item)}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : -1}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && onOpen) onOpen?.(item);
      }}
    >
      {/* LEFT */}
      <div className="fli-left">
        <div className={`fli-icon ${isFolder ? "is-folder" : "is-file"}`}>
          <FileIcon isFolder={isFolder} />
        </div>

        <div className="fli-meta">
          <div className="fli-name" dir="auto" title={item.name}>
            {item.name}
          </div>
          <div className="fli-sub">{isFolder ? "Folder" : "File"}</div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="fli-right" onClick={stop}>
        {(extraInfo || (isTrash && trashInfo)) && (
          <div className="fli-extra">{extraInfo || trashInfo}</div>
        )}

        {!isTrash && <div className="fli-size">{sizeLabel}</div>}

        {!isTrash && (
          <div className="fli-actions">
            <button
              type="button"
              className={`fli-iconbtn ${isStarred ? "is-on" : ""}`}
              title={isStarred ? "Remove from starred" : "Add to starred"}
              aria-label={isStarred ? "Remove from starred" : "Add to starred"}
              onClick={(e) => {
                stop(e);
                onToggleStar?.(item, !isStarred);
              }}
            >
              {isStarred ? "★" : "☆"}
            </button>

            <button
              type="button"
              className={`fli-iconbtn ${isImportant ? "is-danger" : ""}`}
              title={isImportant ? "Remove from important" : "Add to important"}
              aria-label={isImportant ? "Remove from important" : "Add to important"}
              onClick={(e) => {
                stop(e);
                onToggleImportant?.(item, !isImportant);
              }}
            >
              !
            </button>
          </div>
        )}

        {/* MENU */}
        <div className="dropdown" onClick={stop}>
          <button
            className="fli-menubtn"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            title="More options"
            aria-label="More options"
            type="button"
          >
            ⋮
          </button>

          <ul className="dropdown-menu dropdown-menu-end shadow-sm">
            {isTrash ? (
              <>
                <li>
                  <button className="dropdown-item" onClick={(e) => { stop(e); onRestore?.(item); }}>
                    Restore
                  </button>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item text-danger" onClick={(e) => { stop(e); onDeleteForever?.(item); }}>
                    Delete forever
                  </button>
                </li>
              </>
            ) : (
              <>
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
                    Move to trash
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default FileListItem;
