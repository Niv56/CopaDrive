import React, { useState, useEffect } from "react";

function TextViewer({ file }) {
  const [decodedContent, setDecodedContent] = useState(null); // null מייצג מצב טעינה

  useEffect(() => {
    if (!file) return;

    // 🛡️ בדיקה: האם הקובץ ריק (0 בייטים או תוכן ריק)
    if (file.sizeBytes === 0 || !file.content || file.content.trim() === "") {
      setDecodedContent(""); // מסמנים שהתוכן הוא מחרוזת ריקה
      return;
    }

    try {
      // ניסיון פענוח ה-Base64 מהשרת
      const text = window.atob(file.content);
      setDecodedContent(text);
    } catch (e) {
      console.error("Decoding failed, displaying raw content:", e);
      setDecodedContent(file.content); // גיבוי למקרה של תקלה
    }
  }, [file]);

  // 1. מצב טעינה: יוצג רק אם התוכן עדיין null (כלומר הפענוח עוד לא הסתיים)
  if (decodedContent === null) {
    return <div className="p-3 text-center">Decoding...</div>;
  }

  // 2. תצוגה מקדימה:
  return (
    <div className="text-viewer-container p-3">
      {decodedContent === "" ? (
        /* 🎯 התיקון שביקשת: במקום Decoding יוצג "No content" */
        <div className="no-content-message p-5 text-center text-muted border rounded bg-light">
           No content
        </div>
      ) : (
        <textarea
          className="form-control"
          rows="10"
          value={decodedContent}
          readOnly
          style={{ 
            backgroundColor: "#fff", 
            fontFamily: "monospace", 
            resize: "none",
            border: "1px solid #ddd" 
          }}
        />
      )}
    </div>
  );
}

export default TextViewer;