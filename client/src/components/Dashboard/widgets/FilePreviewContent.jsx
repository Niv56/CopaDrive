import React, { useMemo } from "react";
import { decodeBase64ToText } from "../../../utils/base64Utils";
import TextViewer from "./viewers/TextViewer";
import ImageViewer from "./viewers/ImageViewer";
import BinaryViewer from "./viewers/BinaryViewer";

function FilePreviewContent({ file, onDownload }) {
  const mime = file.mimeType || "";

  const isTextFile = (mimeType) => {
    return (
      mimeType.startsWith("text/") || 
      mimeType === "application/json" ||
      mimeType === "application/javascript" ||
      mimeType === "application/xml"
    );
  };

  const decodedContent = useMemo(() => {
    // 🛡️ הגנה: אם אין תוכן עדיין, אל תנסה לפענח
    if (!file.content || !isTextFile(mime)) return null;
    try {
      return decodeBase64ToText(file.content);
    } catch (err) {
      console.error("Failed to decode base64:", err);
      return "Error decoding content";
    }
  }, [file.content, mime]);

  // 1. תמונות
  if (mime.startsWith("image/")) {
    const imgSrc = `data:${mime};base64,${file.content}`;
    return <ImageViewer file={{ ...file, content: imgSrc }} />;
  }

  // 2. טקסט - 🛠️ התיקון כאן: העברת אובייקט file עקבי
  if (isTextFile(mime)) {
    // אם התוכן עוד לא פוענח, נחכה ל-useMemo
    if (!decodedContent && file.content) return <div>Decoding...</div>;
    
    return (
      <TextViewer 
        file={{ ...file, content: decodedContent }} 
        onDownload={onDownload} 
      />
    );
  }

  // 3. קבצים אחרים
  return <BinaryViewer file={file} onDownload={onDownload} />;
}

export default FilePreviewContent;