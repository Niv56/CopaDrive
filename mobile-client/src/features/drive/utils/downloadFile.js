import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

/**
 * Maps common MIME types to file extensions for proper file identification.
 */
function getExtensionFromMimeType(mimeType) {
  if (!mimeType) return "";
  const mappings = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "application/pdf": ".pdf",
    "video/mp4": ".mp4",
    "audio/mpeg": ".mp3",
    "audio/wav": ".wav",
    "text/plain": ".txt",
    "application/json": ".json",
    "text/javascript": ".js",
    "text/html": ".html",
    "text/css": ".css"
  };
  return mappings[mimeType] || "";
}

/**
 * Strips Data URI prefixes from Base64 strings (e.g., "data:image/png;base64,...").
 */
function cleanBase64(content) {
  if (typeof content === 'string' && content.includes(';base64,')) {
    return content.split(';base64,')[1];
  }
  return content;
}

/**
 * Main utility to save a file to local cache and trigger the native sharing dialog.
 * 
 */
export async function downloadFile({ content, mimeType, fileName, isBase64 = true }) {
  if (!content) throw new Error("No content to download");

  // Sanitize filename for local storage
  let cleanName = (fileName || "downloaded_file").replace(/[\/\\?%*:|"<>]/g, "_");

  // Append extension if missing from the filename
  if (!cleanName.includes(".")) {
    const ext = getExtensionFromMimeType(mimeType);
    cleanName += ext;
  }

  if (!FileSystem.cacheDirectory) {
    throw new Error("FileSystem.cacheDirectory is undefined.");
  }

  const uri = FileSystem.cacheDirectory + cleanName;

  try {
    if (isBase64) {
      const rawData = cleanBase64(content);
      await FileSystem.writeAsStringAsync(uri, rawData, {
        encoding: 'base64',
      });
    } else {
      // Handle text or JSON objects
      const textData = typeof content === 'object' ? JSON.stringify(content, null, 2) : String(content);
      await FileSystem.writeAsStringAsync(uri, textData);
    }

    // Launch native sharing dialog to allow user to save or send the file
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: mimeType || "application/octet-stream",
        dialogTitle: `Download ${cleanName}`,
        UTI: mimeType
      });
    } else {
      throw new Error("Sharing is not available on this device");
    }

    return uri;

  } catch (error) {
    throw error;
  }
}