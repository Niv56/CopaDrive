import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

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

function cleanBase64(content) {
  if (typeof content === 'string' && content.includes(';base64,')) {
    return content.split(';base64,')[1];
  }
  return content;
}

export async function downloadFile({ content, mimeType, fileName, isBase64 = true }) {
  if (!content) throw new Error("No content to download");

  let cleanName = (fileName || "downloaded_file").replace(/[\/\\?%*:|"<>]/g, "_");

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
      
        const textData = typeof content === 'object' ? JSON.stringify(content, null, 2) : String(content);
        await FileSystem.writeAsStringAsync(uri, textData);
    }

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
    console.error("DownloadFile Error:", error);
    throw error;
  }
}