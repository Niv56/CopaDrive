import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export async function downloadAndShareBase64({ base64, mimeType, fileName }) {
  if (!base64) throw new Error("No content to download");

  const safeName = (fileName || "file").replace(/[\/\\?%*:|"<>]/g, "_");
  const uri = FileSystem.cacheDirectory + safeName;

  await FileSystem.writeAsStringAsync(uri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: mimeType || "application/octet-stream",
      dialogTitle: "Download / Open file",
    });
  }

  return uri;
}
