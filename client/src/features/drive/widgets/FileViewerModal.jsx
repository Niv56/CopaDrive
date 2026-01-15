import React from "react";
import ImageViewer from "../../../components/Dashboard/widgets/viewers/ImageViewer";
import TextViewer from "../../../components/Dashboard/widgets/viewers/TextViewer";
import BinaryViewer from "../../../components/Dashboard/widgets/viewers/BinaryViewer";
import "../../../styles/modals/FileViewerModal.css";

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

/**
 * A comprehensive modal for viewing file content.
 * It dynamically selects a viewer (Image, Text, or Binary) based on MIME type
 * and provides a suite of actions (Edit, Share, Delete, Download).
 */
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

  /**
   * Determines if a file should be treated as plain text or code.
   */
  const isActualTextFile = (mimeType, fileName) => {
    const mime = mimeType || "";
    return (
      mime === "text/plain" ||
      mime.startsWith("text/") ||
      mime === "application/json" ||
      mime === "application/javascript" ||
      fileName?.toLowerCase().endsWith(".txt")
    );
  };

  const stop = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  /**
   * Triggers a browser download. 
   * Handles newline restoration for text files and Base64 decoding for binary data.
   */
  const handleDownload = () => {
    const link = document.createElement("a");
    let processedContent = file.content || "";

    // Restore newlines from the database placeholder
    if (!file.mimeType || file.mimeType === "text/plain") {
      processedContent = processedContent.replaceAll("_@NL@_", "\n");
    }

    if (file.mimeType && file.mimeType !== "text/plain") {
      // Binary files use the Base64 string directly
      link.href = `data:${file.mimeType};base64,${processedContent}`;
    } else {
      // Text files are converted to a Blob URL
      const blob = new Blob([processedContent], { type: "text/plain" });
      link.href = URL.createObjectURL(blob);
    }

    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Routing logic for selecting the appropriate sub-viewer.
   */
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
      <div className="modal-card viewer-modal viewer-modal-glass" onClick={(e) => e.stopPropagation()}>

        {/* Header Section: Glassmorphism style with Title and Actions */}
        <div className="viewer-glass-header">
          <div className="viewer-glass-title-row">
            <div className="viewer-title-col">
              <h2 className="viewer-file-name" title={file.name}>
                {file.name}
              </h2>
              <div className="viewer-role">Role: {role}</div>
            </div>

            <button
              type="button"
              className="viewer-icon-btn viewer-close-btn"
              onClick={onClose}
              title="Close"
            >
              <BsX size={22} />
            </button>
          </div>

          <div className="viewer-actions viewer-actions-under-title">
            <button
              type="button"
              className={`viewer-icon-btn ${isStarred ? "is-starred" : ""}`}
              onClick={(e) => {
                stop(e);
                onToggleStar(file, !isStarred);
              }}
              title="Star"
            >
              {isStarred ? <BsStarFill /> : <BsStar />}
            </button>

            <button
              type="button"
              className={`viewer-icon-btn ${isImportant ? "is-important" : ""}`}
              onClick={(e) => {
                stop(e);
                onToggleImportant(file, !isImportant);
              }}
              title="Important"
            >
              {isImportant ? <BsExclamationCircleFill /> : <BsExclamationCircle />}
            </button>

            <button
              type="button"
              className="viewer-icon-btn"
              onClick={(e) => {
                stop(e);
                handleDownload();
              }}
              title="Download"
            >
              <BsDownload />
            </button>

            {canEdit && (
              <button
                type="button"
                className="viewer-icon-btn"
                onClick={(e) => {
                  stop(e);
                  onEdit(file);
                }}
                title="Edit"
              >
                <BsPencil />
              </button>
            )}

            <button
              type="button"
              className="viewer-icon-btn"
              onClick={(e) => {
                stop(e);
                onShare(file);
              }}
              title="Share"
            >
              <BsLink45Deg />
            </button>

            <button
              type="button"
              className="viewer-icon-btn danger"
              onClick={(e) => {
                stop(e);
                onDelete(file);
              }}
              title="Delete"
            >
              <BsTrash />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="modal-body-container-viewer">{renderViewer()}</div>

        {/* Footer Section */}
        <div className="modal-footer-actions">
          <button type="button" className="btn btn-secondary px-4" onClick={onClose}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default FileViewerModal;