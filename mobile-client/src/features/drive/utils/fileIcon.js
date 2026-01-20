// mobile-client/src/features/drive/utils/fileIcon.js

/**
 * Returns icon meta (Ionicons name + color) by file name/mime + folder flag
 */
export function getFileIconMeta(name, mimeType, isFolder) {
  if (isFolder) return { icon: "folder", color: "#f8d775" };

  const safeName = String(name || "");
  const ext = safeName.includes(".") ? safeName.split(".").pop().toLowerCase() : "";
  const mime = String(mimeType || "").toLowerCase();

  // Documents
  if (["doc", "docx", "odt"].includes(ext) || mime.includes("word"))
    return { icon: "document-text", color: "#4285f4" };

  // Spreadsheets
  if (["xls", "xlsx", "csv", "ods"].includes(ext) || mime.includes("spreadsheet") || mime.includes("excel"))
    return { icon: "grid", color: "#34a853" };

  // Presentations
  if (["ppt", "pptx", "odp"].includes(ext) || mime.includes("presentation") || mime.includes("powerpoint"))
    return { icon: "easel", color: "#f4b400" };

  // PDF
  if (ext === "pdf" || mime === "application/pdf")
    return { icon: "document", color: "#ea4335" };

  // Images
  if (["jpg", "jpeg", "png", "gif", "svg", "webp", "heic"].includes(ext) || mime.startsWith("image/"))
    return { icon: "image", color: "#ea4335" };

  // Video
  if (["mp4", "mkv", "avi", "mov"].includes(ext) || mime.startsWith("video/"))
    return { icon: "play-circle", color: "#ea4335" };

  // Audio
  if (["mp3", "wav", "ogg", "m4a"].includes(ext) || mime.startsWith("audio/"))
    return { icon: "musical-notes", color: "#a142f4" };

  // Archives
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext) || mime.includes("zip") || mime.includes("compressed"))
    return { icon: "archive", color: "#fbbc04" };

  // Code
  if (["js", "jsx", "ts", "tsx", "html", "css", "json", "py", "java", "c", "cpp"].includes(ext))
    return { icon: "code-slash", color: "#4285f4" };

  // Text
  if (ext === "txt" || mime === "text/plain" || mime.startsWith("text/"))
    return { icon: "document-text", color: "#4285f4" };

  return { icon: "document-outline", color: "#9aa0a6" };
}
