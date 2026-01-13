import React, { useMemo } from "react";


function FileImporter({ name, content, mimeType, triggerUpload }) {
  // 🔍 זיהוי האם מדובר בקובץ טקסט
  const isText = mimeType?.startsWith("text/") || name?.toLowerCase().endsWith(".txt");
  const isImage = mimeType?.startsWith("image/");

  // 🔓 פענוח התוכן רק אם מדובר בטקסט
  const textPreview = useMemo(() => {
    if (!isText || !content) return "";
    try {
      return window.atob(content);
    } catch (e) {
      return content;
    }
  }, [content, isText]);

  return (
    <div className="file-importer">
      <div className="preview-box">
        {content ? (
          <>
            {/* תצוגת תמונה */}
            {isImage && (
              <img src={`data:${mimeType};base64,${content}`} alt="preview" className="img-preview" />
            )}

            {/* 🟢 תצוגת טקסט מקדימה מעוצבת */}
            {isText && (
              <div className="text-preview-wrapper">
                <textarea 
                  className="text-preview-content" 
                  value={textPreview} 
                  readOnly 
                  spellCheck="false"
                />
              </div>
            )}

            {/* הודעת Fallback */}
            {!isImage && !isText && (
              <div className="no-preview">
                <div className="icon-slash mb-2">🚫</div>
                <p>No preview available for this file type</p>
                <strong>{name}</strong>
              </div>
            )}
            
            <button type="button" className="btn-change mt-3" onClick={triggerUpload}>
              🔄 Change file
            </button>
          </>
        ) : (
          <div className="upload-placeholder" onClick={triggerUpload}>
            <div className="upload-icon">☁️</div>
            <p className="upload-text">Click to browse files from computer</p>
            <span className="upload-subtext">Any file type is supported</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileImporter;