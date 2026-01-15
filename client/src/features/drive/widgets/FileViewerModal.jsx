import React from "react";
import ImageViewer from "../../../components/Dashboard/widgets/viewers/ImageViewer";
import TextViewer from "../../../components/Dashboard/widgets/viewers/TextViewer";
import BinaryViewer from "../../../components/Dashboard/widgets/viewers/BinaryViewer";

import {
  BsStar,
  BsStarFill,
  BsExclamationCircle,
  BsExclamationCircleFill,
  BsDownload,
  BsPencil,
  BsLink45Deg,
  BsTrash,
  BsX
} from "react-icons/bs";

function FileViewerModal({
  file,
  role,
  onClose,
  onEdit,
  onShare,
  onDelete,
  onToggleStar,
  onToggleImportant
}) {
  if (!file) return null;

  const canEdit = role === "owner" || role === "editor";
  const isStarred = !!file.starred;
  const isImportant = !!file.important;

  const isActualTextFile = (mimeType, fileName) => {
    const mime = mimeType || "";
    return (
      mime === "text/plain" ||
      mime.startsWith("text/") ||
      mime === "application/json" ||
      mime === "application/javascript" ||
      fileName?.toLowerCase().endsWith('.txt')
    );
  };

  const stop = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    let processedContent = file.content || "";
    if (!file.mimeType || file.mimeType === "text/plain") {
      processedContent = processedContent.replaceAll("_@NL@_", "\n");
    }
    if (file.mimeType && file.mimeType !== "text/plain") {
      link.href = `data:${file.mimeType};base64,${processedContent}`;
    } else {
      const blob = new Blob([processedContent], { type: "text/plain" });
      link.href = URL.createObjectURL(blob);
    }
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderViewer = () => {
    const mime = file.mimeType || "";
    if (mime.startsWith("image/")) return <ImageViewer file={file} />;
    if (isActualTextFile(mime, file.name)) {
      const displayFile = {
        ...file,
        content: file.content ? file.content.replaceAll("_@NL@_", "\n") : ""
      };
      return <TextViewer file={displayFile} />;
    }
    return <BinaryViewer file={file} onDownload={handleDownload} />;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card viewer-modal" onClick={(e) => e.stopPropagation()}>

        {/* --- Header Row המעודכן עם Inline Styles --- */}
        <div className="modal-title-row" style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'nowrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          width: '100%',
          padding: '16px 24px',
          borderBottom: '1px solid #f1f3f4'
        }}>

          {/* חלק הטקסט - יתכווץ ויוסיף שלוש נקודות */}
          <div className="modal-title-text" style={{ flex: '1 1 auto', minWidth: 0, overflow: 'hidden' }}>
            <h2 className="fw-bold m-0" title={file.name} style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: '1.4rem',
              color: '#202124'
            }}>
              {file.name}
            </h2>
            <div className="role-info-text" style={{ fontSize: '12px', color: '#5f6368' }}>Role: {role}</div>
          </div>

          {/* חלק הכפתורים - קשיח, לא נשבר ולא זז */}
          <div className="modal-action-buttons" style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0
          }}>
            <button className="btn secondary" onClick={(e) => { stop(e); onToggleStar(file, !isStarred); }} style={isStarred ? { color: "#FFD54F" } : {}} title="Star">
              {isStarred ? <BsStarFill /> : <BsStar />}
            </button>

            <button className="btn secondary" onClick={(e) => { stop(e); onToggleImportant(file, !isImportant); }} style={isImportant ? { color: "#EF5350" } : {}} title="Important">
              {isImportant ? <BsExclamationCircleFill /> : <BsExclamationCircle />}
            </button>

            <button className="btn secondary" onClick={(e) => { stop(e); handleDownload(); }} title="Download">
              <BsDownload />
            </button>

            {canEdit && (
              <button className="btn secondary" onClick={(e) => { stop(e); onEdit(file); }} title="Edit">
                <BsPencil />
              </button>
            )}

            <button className="btn secondary" onClick={(e) => { stop(e); onShare(file); }} title="Share">
              <BsLink45Deg />
            </button>

            <button className="btn secondary text-danger" onClick={(e) => { stop(e); onDelete(file); }} title="Delete">
              <BsTrash />
            </button>

            {/* קו מפריד */}
            <div className="header-divider-v" style={{ width: '1px', height: '24px', background: '#dadce0', margin: '0 4px', flexShrink: 0 }}></div>

            <button className="btn secondary close-btn-final" onClick={onClose} title="Close" style={{ flexShrink: 0 }}>
              <BsX size={24} />
            </button>
          </div>
        </div>
        {/* --- סוף Header --- */}

        <div className="modal-body-container-viewer">
          {renderViewer()}
        </div>

        <div className="modal-footer-actions">
          <button type="button" className="btn btn-secondary px-4" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn btn-primary px-4" onClick={handleDownload}>
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

export default FileViewerModal;