import React from "react";
import { formatBytes } from "shared/utils/formatBytes";

// שימוש בלוגיקת האייקונים (אותם אייקונים כמו ברשימה)
import { 
  BsFolderFill, BsFileEarmarkWordFill, BsFileEarmarkExcelFill, BsFileEarmarkPptFill, 
  BsFileEarmarkPdfFill, BsFileEarmarkImageFill, BsFileEarmarkPlayFill, 
  BsFileEarmarkMusicFill, BsFileEarmarkZipFill, BsFileEarmarkCodeFill, 
  BsFileEarmarkTextFill, BsFileEarmarkFill 
} from "react-icons/bs";

const getFileIcon = (name, mimeType, isFolder, size = 24) => {
  if (isFolder) return <BsFolderFill size={size} color="#5f6368" />; 
  const ext = name ? name.split('.').pop().toLowerCase() : "";
  const mime = mimeType || "";

  if (['doc', 'docx', 'odt'].includes(ext) || mime.includes('word')) return <BsFileEarmarkWordFill size={size} color="#4285f4" />;
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext) || mime.includes('spreadsheet') || mime.includes('excel')) return <BsFileEarmarkExcelFill size={size} color="#34a853" />;
  if (['ppt', 'pptx', 'odp'].includes(ext) || mime.includes('presentation') || mime.includes('powerpoint')) return <BsFileEarmarkPptFill size={size} color="#f4b400" />;
  if (ext === 'pdf' || mime === 'application/pdf') return <BsFileEarmarkPdfFill size={size} color="#ea4335" />;
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext) || mime.startsWith('image/')) return <BsFileEarmarkImageFill size={size} color="#ea4335" />;
  if (['mp4', 'mkv', 'avi', 'mov'].includes(ext) || mime.startsWith('video/')) return <BsFileEarmarkPlayFill size={size} color="#ea4335" />;
  if (['mp3', 'wav', 'ogg'].includes(ext) || mime.startsWith('audio/')) return <BsFileEarmarkMusicFill size={size} color="#a142f4" />;
  if (['zip', 'rar', '7z', 'tar'].includes(ext) || mime.includes('zip') || mime.includes('compressed')) return <BsFileEarmarkZipFill size={size} color="#fbbc04" />;
  if (['js', 'jsx', 'html', 'css', 'json', 'py', 'java', 'c', 'cpp'].includes(ext)) return <BsFileEarmarkCodeFill size={size} color="#4285f4" />;
  if (ext === 'txt' || mime === 'text/plain') return <BsFileEarmarkTextFill size={size} color="#4285f4" />;
  return <BsFileEarmarkFill size={size} color="#9aa0a6" />;
};

const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

export default function FileGridItem({ item, ownerLabel, ownerAvatar, dateLabel, showSize = true, onOpen }) {
  const isFolder = item?.type === "folder";
  const sizeLabel = isFolder ? "—" : formatBytes(item?.sizeBytes ?? 0);
  
  // תצוגה מקדימה רק אם זו תמונה שיש לה תוכן
  const hasPreview = !isFolder && item.mimeType?.startsWith("image/") && item.content;
  const imageSrc = hasPreview ? (item.content.startsWith('data:') ? item.content : `data:${item.mimeType};base64,${item.content}`) : null;

  return (
    <div className="file-card" onClick={() => onOpen?.(item)} role="button" tabIndex={0}>
      {/* Top Area: Preview OR Big Icon */}
      <div className="file-card-top" style={{ height: "140px", backgroundColor: "#f1f3f4", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid rgba(0,0,0,0.05)", overflow: "hidden" }}>
        {hasPreview ? (
          <img src={imageSrc} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ opacity: 1, transform: "scale(1)" }}>
            {getFileIcon(item.name, item.mimeType, isFolder, 64)} {/* ✅ אייקון ענק במרכז */}
          </div>
        )}
      </div>

      {/* Bottom Area: Small Icon + Info */}
      <div className="file-card-body" style={{ padding: "12px" }}>
        <div className="d-flex align-items-center gap-2 mb-2">
           <div style={{ flexShrink: 0 }}>
             {getFileIcon(item.name, item.mimeType, isFolder, 20)} {/* ✅ אייקון קטן ליד השם */}
           </div>
           <div className="file-card-name" title={item?.name} style={{ fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: "14px" }}>
             {item?.name}
           </div>
        </div>

        <div className="file-card-meta">
          <div className="file-card-owner" title={ownerLabel}>
            <img className="file-card-avatar" src={ownerAvatar || defaultAvatar} alt="Owner" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = defaultAvatar; }} />
            <span>{ownerLabel || "Me"}</span>
          </div>
          <div title={dateLabel}>{dateLabel || "—"}</div>
        </div>

        {showSize && (
          <div className="file-card-meta" style={{ justifyContent: "flex-end", marginTop: "4px" }}>
            <div>{sizeLabel}</div>
          </div>
        )}
      </div>
    </div>
  );
}