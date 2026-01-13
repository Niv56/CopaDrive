import React, { useMemo } from "react";
import TextViewer from "./viewers/TextViewer";
import ImageViewer from "./viewers/ImageViewer";
import BinaryViewer from "./viewers/BinaryViewer";

function FilePreviewContent({ file, onDownload }) {
  const mime = file.mimeType || "";

  // פונקציה לבדיקה אם מדובר בקובץ טקסט
  const isTextFile = (mimeType) => {
    return (
      mimeType === "text/plain" ||
      mimeType.startsWith("text/") || 
      mimeType === "application/json" ||
      mimeType === "application/javascript" ||
      mimeType === "application/xml"
    );
  };

  /**
   * 🛠️ התיקון הקריטי:
   * עבור קבצי טקסט, אנחנו לא מבצעים שום Decode.
   * השרת מחזיר לנו Raw String, ואנחנו מעבירים אותו כפי שהוא ל-TextViewer.
   */
  const processedContent = useMemo(() => {
    if (!file.content) return null;

    if (isTextFile(mime)) {
      // אם זה טקסט - החזר את התוכן נקי ללא פענוח Base64
      return file.content;
    }

    // עבור קבצים אחרים (כמו תמונות), התוכן נשאר כ-Base64
    return file.content;
  }, [file.content, mime]);

  // 1. טיפול בתמונות (נשאר כ-Base64)
  if (mime.startsWith("image/")) {
    const imgSrc = `data:${mime};base64,${file.content}`;
    return <ImageViewer file={{ ...file, content: imgSrc }} />;
  }

  // 2. טיפול בטקסט
  if (isTextFile(mime)) {
    return (
      <TextViewer 
        file={{ ...file, content: processedContent }} 
        onDownload={onDownload} 
      />
    );
  }

  // 3. קבצים אחרים (בינאריים)
  return <BinaryViewer file={file} onDownload={onDownload} />;
}

export default FilePreviewContent;