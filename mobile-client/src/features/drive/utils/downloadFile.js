// ✅ שינוי קריטי: מייבאים את הכל מ-legacy כדי לקבל גם את הפונקציות וגם את ה-cacheDirectory
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

// פונקציית עזר למציאת סיומת לפי סוג הקובץ
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
    // ניתן להוסיף עוד לפי הצורך
  };
  return mappings[mimeType] || "";
}

export async function downloadAndShareBase64({ base64, mimeType, fileName }) {
  if (!base64) throw new Error("No content to download");

  // 1. ניקוי שם הקובץ מתווים בעייתיים
  let cleanName = (fileName || "downloaded_file").replace(/[\/\\?%*:|"<>]/g, "_");

  // 2. וידוא שיש לקובץ סיומת
  if (!cleanName.includes(".")) {
    const ext = getExtensionFromMimeType(mimeType);
    cleanName += ext;
  }

  // ✅ תיקון באג ה-undefined: שימוש ב-FileSystem (Legacy) כדי לקבל את הנתיב
  if (!FileSystem.cacheDirectory) {
      throw new Error("FileSystem.cacheDirectory is undefined. Check Expo version.");
  }
  
  const uri = FileSystem.cacheDirectory + cleanName;

  try {
    // 3. כתיבת ה-Base64 לקובץ
    // משתמשים במחרוזת 'base64' כדי להיות בטוחים (במקום Enum שאולי השתנה)
    await FileSystem.writeAsStringAsync(uri, base64, {
      encoding: 'base64', 
    });

    // 4. שיתוף הקובץ
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
    console.error("Download error:", error);
    throw error;
  }
}