import React, { useState, useEffect, useRef } from "react";
import "styles/widgets/FileListItem.css";
import { formatBytes } from "shared/utils/formatBytes";

// 🎨 ייבוא האייקונים מהספרייה
import { 
  BsFolderFill, 
  BsFileEarmarkWordFill, 
  BsFileEarmarkExcelFill, 
  BsFileEarmarkPptFill, 
  BsFileEarmarkPdfFill, 
  BsFileEarmarkImageFill, 
  BsFileEarmarkPlayFill, 
  BsFileEarmarkMusicFill, 
  BsFileEarmarkZipFill, 
  BsFileEarmarkCodeFill, 
  BsFileEarmarkTextFill, 
  BsFileEarmarkFill 
} from "react-icons/bs";

// 🛠️ פונקציית עזר לשימוש גם בקבצים אחרים (אפשר להעתיק אותה או לייצא אותה)
export const getFileIcon = (name, mimeType, isFolder, size = 24) => {
  if (isFolder) return <BsFolderFill size={size} color="#5f6368" />; 

  const ext = name ? name.split('.').pop().toLowerCase() : "";
  const mime = mimeType || "";

  if (['doc', 'docx', 'odt'].includes(ext) || mime.includes('word')) 
    return <BsFileEarmarkWordFill size={size} color="#4285f4" />;
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext) || mime.includes('spreadsheet') || mime.includes('excel')) 
    return <BsFileEarmarkExcelFill size={size} color="#34a853" />;
  if (['ppt', 'pptx', 'odp'].includes(ext) || mime.includes('presentation') || mime.includes('powerpoint')) 
    return <BsFileEarmarkPptFill size={size} color="#f4b400" />;
  if (ext === 'pdf' || mime === 'application/pdf') 
    return <BsFileEarmarkPdfFill size={size} color="#ea4335" />;
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext) || mime.startsWith('image/')) 
    return <BsFileEarmarkImageFill size={size} color="#ea4335" />;
  if (['mp4', 'mkv', 'avi', 'mov'].includes(ext) || mime.startsWith('video/')) 
    return <BsFileEarmarkPlayFill size={size} color="#ea4335" />;
  if (['mp3', 'wav', 'ogg'].includes(ext) || mime.startsWith('audio/')) 
    return <BsFileEarmarkMusicFill size={size} color="#a142f4" />;
  if (['zip', 'rar', '7z', 'tar'].includes(ext) || mime.includes('zip') || mime.includes('compressed')) 
    return <BsFileEarmarkZipFill size={size} color="#fbbc04" />;
  if (['js', 'jsx', 'html', 'css', 'json', 'py', 'java', 'c', 'cpp'].includes(ext)) 
    return <BsFileEarmarkCodeFill size={size} color="#4285f4" />;
  if (ext === 'txt' || mime === 'text/plain') 
    return <BsFileEarmarkTextFill size={size} color="#4285f4" />;

  return <BsFileEarmarkFill size={size} color="#9aa0a6" />;
};

function FileListItem({
  item,
  onOpen,
  onEdit,
  onShare,
  onDelete,
  onToggleStar,
  onToggleImportant,
  mode = "default", 
  onRestore,
  onDeleteForever,
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

  const colStyle = {
    fontSize: '13px',
    color: 'var(--text-secondary)', 
    textShadow: 'var(--text-shadow-global)', 
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500
  };

  const daysLeftStyle = { ...colStyle, color: '#d93025', fontWeight: 600 };

  function stop(e) { e.preventDefault(); e.stopPropagation(); }

  return (
    <div className={`fli-row ${isTrash ? "is-trash" : ""}`} onClick={() => onOpen?.(item)}
      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px', position: 'relative', zIndex: isMenuOpen ? 1000 : 1 }}>
      
      {/* 1. Name & Icon */}
      <div className="fli-left" style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="fli-icon" style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
          {getFileIcon(item.name, item.mimeType, isFolder, 24)}
        </div>
        <div className="fli-name" dir="auto" title={item.name}
          style={{ fontWeight: 600, color: 'var(--text-primary)', textShadow: 'var(--text-shadow-global)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.name}
        </div>
      </div>

      {/* 2. Owner */}
      <div className="fli-owner" style={{ width: '150px', ...colStyle }} title={ownerLabel}>
        <img src={ownerAvatar || defaultAvatar} alt="User" className="fli-owner-avatar" style={{ border: "1px solid var(--border-color)" }} onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }} />
        <span className="fli-owner-text" style={{ color: 'var(--text-secondary)' }}>{ownerLabel || "Me"}</span>
      </div>

      {/* 3. Date */}
      <div style={{ width: '150px', ...colStyle }}>{dateLabel || "—"}</div>

      {/* 4. Days Left */}
      {isTrash && daysLeftLabel && <div style={{ width: '120px', ...daysLeftStyle }}>{daysLeftLabel}</div>}

      {/* 5. Size */}
      {showSize && <div style={{ width: '100px', ...colStyle }}>{displaySize}</div>}

      {/* 6. Actions */}
      <div className="fli-right" onClick={stop} style={{ width: '80px', display: 'flex', justifyContent: 'flex-end' }}>
        {!isTrash && (
          <div className="fli-actions">
            <button className={`fli-iconbtn ${isStarred ? "is-on" : ""}`} onClick={(e) => { stop(e); onToggleStar?.(item, !isStarred); }} style={{ color: isStarred ? '#fbbc04' : 'var(--text-secondary)' }}>{isStarred ? "★" : "☆"}</button>
            <button className={`fli-iconbtn ${isImportant ? "is-danger" : ""}`} onClick={(e) => { stop(e); onToggleImportant?.(item, !isImportant); }} style={{ color: isImportant ? '#ff5252' : 'var(--text-secondary)' }}>!</button>
          </div>
        )}
        <div className="dropdown" onClick={stop} ref={menuRef}>
          <button className={`fli-menubtn ${isMenuOpen ? "show" : ""}`} onClick={(e) => { stop(e); setIsMenuOpen(!isMenuOpen); }} style={{ color: 'var(--text-secondary)' }}>⋮</button>
          <ul className={`dropdown-menu dropdown-menu-end shadow-sm ${isMenuOpen ? "show" : ""}`} style={{ display: isMenuOpen ? "block" : "none", position: "absolute", inset: "0px 0px auto auto", transform: "translate3d(0px, 30px, 0px)" }}>
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