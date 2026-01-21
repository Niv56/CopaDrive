import { useState, useRef } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { createItem } from "../services/fileService";
import { emitDriveRefresh } from "../services/driveEvents";

export function useDriveUploads(token, onRefresh, closeCallback) {
  const [loading, setLoading] = useState(false);
  const pickerInProgressRef = useRef(false);

  const lockPicker = () => {
    if (pickerInProgressRef.current) return false;
    pickerInProgressRef.current = true;
    return true;
  };

  const unlockPicker = () => {
    pickerInProgressRef.current = false;
  };

  const processAndUpload = async (uri, fileName, mimeType) => {
    if (!token) {
      Alert.alert("Error", "No token found.");
      return;
    }

    try {
      setLoading(true);
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: "base64" });

      await createItem(token, {
        name: fileName,
        type: "file",
        content: base64,
        mimeType: mimeType || "application/octet-stream",
      });

      emitDriveRefresh({ reason: "upload", name: fileName });
      onRefresh?.();
    } catch (err) {
      Alert.alert("Upload Failed", err?.message || "Unknown error");
    } finally {
      setLoading(false);
      unlockPicker();
      closeCallback?.(); // סגירת המודל בסיום
    }
  };

  const pickDocument = async () => {
    if (!lockPicker()) return;
    try {
      // השהייה קטנה למניעת התנגשויות UI
      await new Promise(r => setTimeout(r, 200));
      
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: "*/*",
        multiple: false,
      });

      if (result?.canceled) {
        unlockPicker();
        return;
      }

      const asset = result?.assets?.[0];
      if (asset?.uri) {
        const fileName = asset.name || `file_${Date.now()}`;
        closeCallback?.(); // סוגרים את התפריט לפני ההעלאה
        await processAndUpload(asset.uri, fileName, asset.mimeType);
      }
    } catch (err) {
      Alert.alert("Error", "Picker failed");
      unlockPicker();
    }
  };

  const pickImage = async (useCamera) => {
    if (!lockPicker()) return;
    try {
      const permission = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permission Denied", "Settings required.");
        unlockPicker();
        return;
      }

      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: false,
      };

      const result = useCamera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (result?.canceled) {
        unlockPicker();
        return;
      }

      const asset = result?.assets?.[0];
      if (asset?.uri) {
        let fileName = asset.fileName;
        if (!fileName) {
          const uriParts = String(asset.uri).split("/");
          fileName = uriParts[uriParts.length - 1] || `photo_${Date.now()}.jpg`;
        }
        if (fileName && !fileName.includes(".")) fileName += ".jpg";
        
        closeCallback?.();
        await processAndUpload(asset.uri, fileName, asset.mimeType || "image/jpeg");
      }
    } catch (err) {
      Alert.alert("Error", "Action failed");
      unlockPicker();
    }
  };

  return { loading, pickDocument, pickImage };
}