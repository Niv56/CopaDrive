/**
 * File Type Detectors
 * Utilities to identify file categories based on MIME types and extensions.
 */

export const isTextFile = (mime = "", name = "") => {
  const n = (name || "").toLowerCase();
  return (
    mime === "text/plain" ||
    mime.startsWith("text/") ||
    mime === "application/json" ||
    mime === "application/javascript" ||
    mime === "application/xml" ||
    n.endsWith(".txt")
  );
};

export const isImageFile = (mime = "", name = "") => {
  const n = (name || "").toLowerCase();
  return (
    (mime || "").startsWith("image/") ||
    /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(n)
  );
};

export const isPdfFile = (mime = "", name = "") => {
  const n = (name || "").toLowerCase();
  return mime === "application/pdf" || n.endsWith(".pdf");
};

export const isVideoFile = (mime = "", name = "") => {
  const n = (name || "").toLowerCase();
  return (mime || "").startsWith("video/") || /\.(mp4|mov|mkv|webm)$/i.test(n);
};

/**
 * Business Rule: Only text-based files can be edited within the app's code/text editor.
 */
export const canEditContent = (item) => {
  if (!item || item.type !== "file") return false;
  return isTextFile(item.mimeType, item.name);
};