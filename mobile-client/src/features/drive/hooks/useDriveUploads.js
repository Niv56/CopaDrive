import { useState, useRef } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { createItem } from "../services/fileService";
import { emitDriveRefresh } from "../services/driveEvents";

/**
 * Custom hook to manage the file upload lifecycle.
 * Handles picking (Camera, Gallery, Documents), file preview staging, 
 * and Base64 conversion for server submission.
 */
export function useDriveUploads(token, onRefresh, closeCallback) {
  const [loading, setLoading] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const pickerInProgressRef = useRef(false);

  /** Prevents multiple pickers from opening simultaneously */
  const lockPicker = () => {
    if (pickerInProgressRef.current) return false;
    pickerInProgressRef.current = true;
    return true;
  };

  const unlockPicker = () => {
    pickerInProgressRef.current = false;
  };

  /** * Reads the selected file from the local URI as Base64 
   * and sends it to the CopaDrive backend.
   */
  const confirmUpload = async (fileName, parentId = null) => {
    if (!pendingFile || !token) {
      Alert.alert("Error", "No file selected or user session expired.");
      return;
    }

    try {
      setLoading(true);

      // Convert local file to Base64 for database storage
      const base64 = await FileSystem.readAsStringAsync(pendingFile.uri, {
        encoding: "base64"
      });

      await createItem(token, {
        name: fileName,
        type: "file",
        content: base64,
        mimeType: pendingFile.mimeType || "application/octet-stream",
        parentId,
      });

      // Notify global listeners to refresh the file list
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

  const discardPending = () => {
    setPendingFile(null);
    unlockPicker();
    closeCallback?.();
  };

  /** Opens the native OS document picker */
  const pickDocument = async () => {
    if (!lockPicker()) return;
    try {
      // Small delay prevents UI flicker on some Android versions
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
        unlockPicker();
        setPendingFile({
          uri: asset.uri,
          fileName: asset.name || `file_${Date.now()}`,
          mimeType: asset.mimeType,
        });
      } else {
        unlockPicker();
      }
    } catch (err) {
      Alert.alert("Error", "Document picker failed");
      unlockPicker();
    }
  };

  /** Opens the native camera or photo library */
  const pickImage = async (useCamera) => {
    if (!lockPicker()) return;
    try {
      const permission = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permission Denied", "Camera/Library access is required.");
        unlockPicker();
        return;
      }

      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.All,
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
        // Fallback filename logic if asset name is missing
        let fileName = asset.fileName;
        if (!fileName) {
          const uriParts = String(asset.uri).split("/");
          const defaultExt = asset.type === 'video' ? '.mp4' : '.jpg';
          fileName = uriParts[uriParts.length - 1] || `media_${Date.now()}${defaultExt}`;
        }

        const mime = asset.mimeType || (asset.type === 'video' ? "video/mp4" : "image/jpeg");

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
      Alert.alert("Error", "Media action failed");
      unlockPicker();
    }
  };

  return {
    loading,
    pickDocument,
    pickImage,
    pendingFile,
    confirmUpload,
    discardPending,
  };
}