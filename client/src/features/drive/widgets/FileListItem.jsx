import React, { useState, useEffect, useRef } from "react";
import "styles/widgets/FileListItem.css";
import { formatBytes } from "shared/utils/formatBytes";

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
  onDelete,
  onToggleStar,
  onToggleImportant,
  mode = "default", // "default" | "trash"
  onRestore,
  onDeleteForever,
  // Column Data
  ownerLabel,
  ownerAvatar,
  dateLabel,
  daysLeftLabel,
  sizeLabel,
  showSize = true
}) {
  if (!item) return null;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const isTrash = mode === "trash";
  const isFolder = item.type === "folder";
  const isStarred = !!item.starred;
  const isImportant = !!item.important;

  const displaySize = sizeLabel || (isFolder ? "—" : formatBytes(item.sizeBytes ?? 0));
  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  // ✅ תיקון: שימוש במשתנים במקום צבע קשיח
  const colStyle = {
    fontSize: '13px',
    color: 'var(--text-secondary)', // ישתנה אוטומטית בין אפור (יום) ללבן (לילה)
    textShadow: 'var(--text-shadow-global)', // הצל יופיע רק כצריך
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontWeight: 500
  };

  const daysLeftStyle = {
    ...colStyle,
    color: '#d93025', // אדום נשאר אדום (אזהרה)
    fontWeight: 600
  };

  function stop(e) {
    e.preventDefault();
    e.stopPropagation();
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
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 16px',
        position: 'relative',
        zIndex: isMenuOpen ? 1000 : 1,
        transform: isMenuOpen ? 'none' : undefined,
      }}
    >
      {/* 1. Name Column */}
      <div className="fli-left" style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className={`fli-icon ${isFolder ? "is-folder" : "is-file"}`} style={{ flexShrink: 0 }}>
          <FileIcon isFolder={isFolder} />
        </div>
        <div className="fli-name" dir="auto" title={item.name}
          style={{ 
              fontWeight: 600, 
              color: 'var(--text-primary)', // ✅ שינוי למשתנה
              textShadow: 'var(--text-shadow-global)',
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap' 
          }}>
          {item.name}
        </div>
      </div>

      {/* 2. Owner Column */}
      <div className="fli-owner" style={{ width: '150px', ...colStyle }} title={ownerLabel}>
        <img
          src={ownerAvatar || defaultAvatar}
          alt="User"
          className="fli-owner-avatar"
          style={{ border: "1px solid var(--border-color)" }}
          onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
        />
        <span className="fli-owner-text" style={{ color: 'var(--text-secondary)' }}>
          {ownerLabel || "Me"}
        </span>
      </div>

      {/* 3. Date Column */}
      <div style={{ width: '150px', ...colStyle }}>
        {dateLabel || "—"}
      </div>

      {/* 4. Days Left (Trash Only) */}
      {isTrash && daysLeftLabel && (
        <div style={{ width: '120px', ...daysLeftStyle }}>
           {daysLeftLabel}
        </div>
      )}

      {/* 5. Size Column */}
      {showSize && (
        <div style={{ width: '100px', ...colStyle }}>
          {displaySize}
        </div>
      )}

      {/* 6. Actions Column */}
      <div className="fli-right" onClick={stop} style={{ width: '80px', display: 'flex', justifyContent: 'flex-end' }}>
        {!isTrash && (
          <div className="fli-actions">
            <button
              type="button"
              className={`fli-iconbtn ${isStarred ? "is-on" : ""}`}
              onClick={(e) => { stop(e); onToggleStar?.(item, !isStarred); }}
              style={{ color: isStarred ? '#fbbc04' : 'var(--text-secondary)' }}
            >
              {isStarred ? "★" : "☆"}
            </button>

            <button
              type="button"
              className={`fli-iconbtn ${isImportant ? "is-danger" : ""}`}
              onClick={(e) => { stop(e); onToggleImportant?.(item, !isImportant); }}
              style={{ color: isImportant ? '#ff5252' : 'var(--text-secondary)' }}
            >
              !
            </button>
          </div>
        )}

        <div className="dropdown" onClick={stop} ref={menuRef}>
          <button
            className={`fli-menubtn ${isMenuOpen ? "show" : ""}`}
            type="button"
            onClick={(e) => {
              stop(e);
              setIsMenuOpen(!isMenuOpen);
            }}
            style={{ color: 'var(--text-secondary)' }}
          >
            ⋮
          </button>
          
          <ul 
            className={`dropdown-menu dropdown-menu-end shadow-sm ${isMenuOpen ? "show" : ""}`}
            style={{ 
              display: isMenuOpen ? "block" : "none",
              position: "absolute",
              inset: "0px 0px auto auto",
              transform: "translate3d(0px, 30px, 0px)"
            }}
          >
            {isTrash ? (
              <>
                <li><button className="dropdown-item" onClick={(e) => { stop(e); onRestore?.(item); setIsMenuOpen(false); }}>Restore</button></li>
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item text-danger" onClick={(e) => { stop(e); onDeleteForever?.(item); setIsMenuOpen(false); }}>Delete forever</button></li>
              </>
            ) : (
              <>
                <li><button className="dropdown-item" onClick={(e) => { stop(e); onEdit?.(item); setIsMenuOpen(false); }}>Edit</button></li>
                <li><button className="dropdown-item" onClick={(e) => { stop(e); onShare?.(item); setIsMenuOpen(false); }}>Share</button></li>
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item text-danger" onClick={(e) => { stop(e); onDelete?.(item); setIsMenuOpen(false); }}>Move to trash</button></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default FileListItem;