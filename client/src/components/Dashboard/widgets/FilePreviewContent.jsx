import React, { useMemo } from "react";
import TextViewer from "./viewers/TextViewer";
import ImageViewer from "./viewers/ImageViewer";
import BinaryViewer from "./viewers/BinaryViewer";

function FilePreviewContent({ file, onDownload }) {
  const mime = file.mimeType || "";

  const isTextFile = (mimeType) => {
    return (
      mimeType === "text/plain" ||
      mimeType.startsWith("text/") || 
      mimeType === "application/json" ||
      mimeType === "application/javascript" ||
      mimeType === "application/xml"
    );
  };

  const processedContent = useMemo(() => {
    if (!file.content) return null;

    if (isTextFile(mime)) {
      return file.content;
    }

   
    return file.content;
  }, [file.content, mime]);

  if (mime.startsWith("image/")) {
    const imgSrc = `data:${mime};base64,${file.content}`;
    return <ImageViewer file={{ ...file, content: imgSrc }} />;
  }

  if (isTextFile(mime)) {
    return (
      <TextViewer 
        file={{ ...file, content: processedContent }} 
        onDownload={onDownload} 
      />
    );
  }

  return <BinaryViewer file={file} onDownload={onDownload} />;
}

export default FilePreviewContent;