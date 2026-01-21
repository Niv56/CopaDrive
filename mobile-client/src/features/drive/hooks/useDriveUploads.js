import { useState, useRef } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { createItem } from "../services/fileService";
import { emitDriveRefresh } from "../services/driveEvents";

export function useDriveUploads(token, onRefresh, closeCallback) {
  const [loading, setLoading] = useState(false);
  const [pendingFile, setPendingFile] = useState(null); // { uri, fileName, mimeType }
  const pickerInProgressRef = useRef(false);

  const lockPicker = () => {
    if (pickerInProgressRef.current) return false;
    pickerInProgressRef.current = true;
    return true;
  };

  const unlockPicker = () => {
    pickerInProgressRef.current = false;
  };

  // Called after user confirms from preview screen
  const confirmUpload = async (fileName, parentId = null) => {
    if (!pendingFile || !token) {
      Alert.alert("Error", "No file selected or not logged in.");
      return;
    }

    try {
      setLoading(true);
      // קריאת הקובץ כ-Base64 (עובד לקבצים בגודל סביר)
      const base64 = await FileSystem.readAsStringAsync(pendingFile.uri, { encoding: "base64" });

      await createItem(token, {
        name: fileName,
        type: "file",
        content: base64,
        mimeType: pendingFile.mimeType || "application/octet-stream",
        parentId, // destination folder
      });

      emitDriveRefresh({ reason: "upload", name: fileName });
      onRefresh?.();
      setPendingFile(null);
    } catch (err) {
      Alert.alert("Upload Failed", err?.message || "Unknown error");
    } finally {
      setLoading(false);
      unlockPicker();
      closeCallback?.();
    }
  };

  // Discard the pending file without uploading
  const discardPending = () => {
    setPendingFile(null);
    unlockPicker();
    closeCallback?.();
  };

  const pickDocument = async () => {
    if (!lockPicker()) return;
    try {
      await new Promise(r => setTimeout(r, 200));
      
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: "*/*", // מאפשר את כל סוגי הקבצים
        multiple: false,
      });
      if (result?.canceled) {
        unlockPicker();
        return;
      }

      const asset = result?.assets?.[0];
      if (asset?.uri) {
        const fileName = asset.name || `file_${Date.now()}`;
        // Set pending file - same modal will show preview content
        unlockPicker();
        setPendingFile({
          uri: asset.uri,
          fileName,
          mimeType: asset.mimeType,
        });
      } else {
        unlockPicker();
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
        // ✅ שינוי קריטי: מאפשר גם תמונות וגם וידאו
        mediaTypes: ImagePicker.MediaTypeOptions.All, 
        quality: 0.7,
        allowsEditing: false, // עריכה בוידאו לפעמים בעייתית באנדרואיד, עדיף לכבות
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
          const defaultExt = asset.type === 'video' ? '.mp4' : '.jpg';
          fileName = uriParts[uriParts.length - 1] || `media_${Date.now()}${defaultExt}`;
        }
        
        // וידוא סיומת
        if (fileName && !fileName.includes(".")) {
            fileName += asset.type === 'video' ? ".mp4" : ".jpg";
        }
        
        // קביעת MimeType ברירת מחדל אם אין
        const mime = asset.mimeType || (asset.type === 'video' ? "video/mp4" : "image/jpeg");

        // Set pending file - same modal will show preview content
        unlockPicker();
        setPendingFile({
          uri: asset.uri,
          fileName,
          mimeType: mime,
        });
      } else {
        unlockPicker();
      }
    } catch (err) {
      Alert.alert("Error", "Action failed");
      unlockPicker();
    }
  };

  return { 
    loading, 
    pickDocument, 
    pickImage,
    pendingFile,      // The file awaiting review
    confirmUpload,    // Call to confirm and upload
    discardPending,   // Call to discard without uploading
  };
}