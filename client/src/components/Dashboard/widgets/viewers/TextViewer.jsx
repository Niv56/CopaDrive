import React, { useState, useEffect } from "react";

function TextViewer({ file }) {
  const [decodedContent, setDecodedContent] = useState(null);

  useEffect(() => {
    if (!file) return;

    // 🛡️ טיפול בקובץ ריק (מונע את ה-Decoding התקוע)
    if (!file.content || file.content === "") {
      setDecodedContent("");
      return;
    }

    try {
      // ניסיון פענוח Base64
      const text = window.atob(file.content);
      setDecodedContent(text);
    } catch (e) {
      console.error("Decoding failed, displaying raw content:", e);
      setDecodedContent(file.content); // גיבוי: מציג את התוכן כפי שהוא
    }
  }, [file]);

  if (decodedContent === null) {
    return <div className="p-3 text-center">Decoding content...</div>;
  }

  return (
    <div className="text-viewer-container p-3">
      <textarea
        className="form-control"
        rows="12"
        value={decodedContent}
        readOnly
        style={{ 
          backgroundColor: "#fff", 
          fontFamily: "monospace",
          fontSize: "14px",
          resize: "none"
        }}
      />
      {decodedContent === "" && (
        <div className="text-muted small mt-2 text-center italic">
          (This file appears to be empty)
        </div>
      )}
    </div>
  );
}

export default TextViewer;