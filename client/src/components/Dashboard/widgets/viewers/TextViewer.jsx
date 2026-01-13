import React, { useState, useEffect } from "react";

// 🛠️ הקפדה על אותו רצף תווים שהגדרנו בשמירה
const NEWLINE_PLACEHOLDER = "_@NL@_";

/**
 * TextViewer - מציג תוכן של קבצי טקסט.
 * מבצע המרה של Placeholders חזרה לירידות שורה לצורך תצוגה.
 */
function TextViewer({ file }) {
  const [content, setContent] = useState(null);

  useEffect(() => {
    if (!file) return;

    // בדיקה אם הקובץ ריק
    if (file.sizeBytes === 0 || !file.content) {
      setContent(""); 
      return;
    }

    /**
     * 🛠️ התיקון:
     * אנחנו לוקחים את התוכן מהשרת ומחליפים את ה-Placeholder
     * בירידת שורה אמיתית (\n) כדי שה-textarea יציג אותה נכון.
     */
    const processed = file.content.replaceAll(NEWLINE_PLACEHOLDER, "\n");
    
    console.log(`[TEXT-VIEWER] Formatting file: ${file.name}`);
    setContent(processed);
  }, [file]);

  if (content === null) {
    return <div className="p-3 text-center text-muted">Loading content...</div>;
  }

  return (
    <div className="text-viewer-container p-3">
      {content.trim() === "" ? (
        <div className="no-content-message p-5 text-center text-muted border rounded bg-light">
           File is empty
        </div>
      ) : (
        <textarea
          className="form-control"
          rows="15"
          value={content}
          readOnly
          style={{ 
            backgroundColor: "#f9f9f9", 
            fontFamily: "'Courier New', Courier, monospace", 
            fontSize: "14px",
            resize: "none",
            border: "1px solid #dee2e6",
            lineHeight: "1.5"
          }}
        />
      )}
    </div>
  );
}

export default TextViewer;