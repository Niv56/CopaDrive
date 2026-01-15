import React, { useMemo } from "react";
import TextViewer from "./viewers/TextViewer";
import ImageViewer from "./viewers/ImageViewer";
import BinaryViewer from "./viewers/BinaryViewer";

/** Renders appropriate viewer based on file type */
function FilePreviewContent({ file, onDownload }) {
  const mime = file.mimeType || "";

  /** Checks if mime type is text-based */
  const isTextFile = (mimeType) => {
    return (
      mimeType === "text/plain" ||
      mimeType.startsWith("text/") ||
      mimeType === "application/json" ||
      mimeType === "application/javascript" ||
      mimeType === "application/xml"
    );
  };

  /** Returns raw or processed file content */
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