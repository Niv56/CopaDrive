import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Pressable,
  Keyboard,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { BlurView } from "expo-blur";

import { useAuth } from "../app/providers/AuthContext";
import { createItem } from "../features/drive/services/fileService";
import { emitDriveRefresh } from "../features/drive/services/driveEvents";

const NEWLINE = "_@NL@_";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Fab({ onRefresh }) {
  const { token } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // "createfolder" | "createfile"
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
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

  const closeMenu = () => {
    setIsOpen(false);
  };

  const closeCreate = () => {
    setModalType(null);
    setName("");
    setContent("");
    Keyboard.dismiss();
  };

  const processAndUpload = async (uri, fileName, mimeType) => {
    if (!token) {
      Alert.alert("Not logged in", "No token found.");
      return;
    }

    try {
      setLoading(true);

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });

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
    }
  };

  const handlePickDocument = async () => {
    if (!lockPicker()) return;

    try {
      closeMenu();
      await wait(200);

      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: "*/*",
        multiple: false,
      });

      if (result?.canceled) return;

      const asset = result?.assets?.[0];
      if (!asset?.uri) return;

      const fileName = asset.name || `file_${Date.now()}`;
      await processAndUpload(asset.uri, fileName, asset.mimeType);
    } catch (err) {
      Alert.alert("Error", "Picker failed: " + (err?.message || "Unknown error"));
    } finally {
      unlockPicker();
    }
  };

  const handlePickImage = async (useCamera = false) => {
    if (!lockPicker()) return;

    try {
      closeMenu();

      const permission = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permission Denied", "Please allow access in settings.");
        return;
      }

      await wait(200);

      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: false,
      };

      const result = useCamera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (result?.canceled) return;

      const asset = result?.assets?.[0];
      if (!asset?.uri) return;

      let fileName = asset.fileName;
      if (!fileName) {
        const uriParts = String(asset.uri).split("/");
        fileName = uriParts[uriParts.length - 1] || `photo_${Date.now()}.jpg`;
      }
      if (fileName && !fileName.includes(".")) fileName += ".jpg";

      await processAndUpload(asset.uri, fileName, asset.mimeType || "image/jpeg");
    } catch (err) {
      Alert.alert("Error", "Action failed: " + (err?.message || "Unknown error"));
    } finally {
      unlockPicker();
    }
  };

  const handleCreateSubmit = async () => {
    if (!name.trim()) return;

    if (!token) {
      Alert.alert("Not logged in", "No token found.");
      return;
    }

    setLoading(true);
    try {
      const isFolder = modalType === "createfolder";
      const trimmed = name.trim();
      const finalName = isFolder
        ? trimmed
        : trimmed.endsWith(".txt")
        ? trimmed
        : `${trimmed}.txt`;

      await createItem(token, {
        name: finalName,
        type: isFolder ? "folder" : "file",
        content: isFolder ? "" : String(content || "").replaceAll("\n", NEWLINE),
        mimeType: isFolder ? "" : "text/plain",
      });

      closeCreate();

      emitDriveRefresh({ reason: "create", name: finalName, type: isFolder ? "folder" : "file" });
      onRefresh?.();
    } catch (err) {
      Alert.alert("Error", err?.message || "Unknown error");
    } finally {
      setLoading(false);
      unlockPicker();
    }
  };

  const disableActions = loading;

  return (
    <>
      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#0d6efd" />
          <Text style={styles.loaderText}>WORKING...</Text>
        </View>
      )}

      {/* OPEN MENU */}
      <Modal visible={isOpen} transparent animationType="none">
        <View style={styles.backdrop}>
          <BlurView intensity={22} tint="light" style={StyleSheet.absoluteFill} />
          <Pressable style={StyleSheet.absoluteFill} onPress={() => { closeMenu(); unlockPicker(); }} />

          <View style={styles.menuContainer}>
            <MenuOption
              icon="folder-outline"
              label="New Folder"
              disabled={disableActions}
              onPress={() => {
                closeMenu();
                setModalType("createfolder");
              }}
            />
            <MenuOption
              icon="document-text-outline"
              label="New File"
              disabled={disableActions}
              onPress={() => {
                closeMenu();
                setModalType("createfile");
              }}
            />
            <MenuOption icon="image-outline" label="Upload Pic" disabled={disableActions} onPress={() => handlePickImage(false)} />
            <MenuOption icon="camera-outline" label="Take Photo" disabled={disableActions} onPress={() => handlePickImage(true)} />
            <MenuOption icon="cloud-upload-outline" label="Import File" disabled={disableActions} onPress={handlePickDocument} />
          </View>
        </View>
      </Modal>

      {/* MAIN BUTTON */}
      {!isOpen && (
        <View style={styles.fabPosition}>
          <TouchableOpacity
            style={[styles.fabMain, disableActions && { opacity: 0.7 }]}
            onPress={() => {
              if (loading) return;
              if (pickerInProgressRef.current) return;
              setIsOpen(true);
            }}
            activeOpacity={0.9}
            disabled={disableActions}
          >
            <Ionicons name="add" size={35} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* CREATE MODAL */}
      <Modal visible={!!modalType} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeCreate} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {modalType === "createfolder" ? "CREATE NEW FOLDER" : "CREATE NEW FILE"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder={modalType === "createfolder" ? "Folder Name" : "File Name"}
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />

            {modalType === "createfile" && (
              <ScrollView style={{ width: "100%" }} keyboardShouldPersistTaps="handled">
                <TextInput
                  style={[styles.input, { height: 120, textAlignVertical: "top" }]}
                  placeholder="Content..."
                  value={content}
                  onChangeText={setContent}
                  multiline
                />
              </ScrollView>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={closeCreate} disabled={loading}>
                <Text style={styles.cancelText}>CANCEL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.createBtn, loading && { opacity: 0.7 }]}
                onPress={handleCreateSubmit}
                disabled={loading}
              >
                <Text style={styles.confirmText}>CREATE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function MenuOption({ icon, label, onPress, disabled }) {
  return (
    <TouchableOpacity
      style={[styles.singleContainer, disabled && { opacity: 0.6 }]}
      onPress={disabled ? undefined : onPress}
      activeOpacity={0.9}
    >
      <Ionicons name={icon} size={22} color="#444" style={{ marginRight: 12 }} />
      <Text style={styles.labelText} numberOfLines={1} ellipsizeMode="clip">
        {label.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fabPosition: { position: "absolute", bottom: 90, right: 25, zIndex: 9999 },
  fabMain: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0d6efd",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  backdrop: { flex: 1, backgroundColor: "transparent" },

  menuContainer: {
    position: "absolute",
    bottom: 165,
    right: 25,
    alignItems: "flex-end",
    gap: 15,
  },

  singleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "rgba(255,255,255,0.98)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 4,
    minWidth: 200,
  },

  labelText: { flex: 1, fontSize: 13, color: "#333", letterSpacing: 1, textAlign: "left" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 30,
  },
  modalCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    elevation: 5,
  },
  modalTitle: { fontSize: 18, marginBottom: 20, color: "#333", textAlign: "center" },

  input: {
    width: "100%",
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
    marginTop: 4,
  },
  cancelText: { color: "#6c757d", fontSize: 14, padding: 10 },
  createBtn: {
    backgroundColor: "#0d6efd",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  confirmText: { color: "white", fontSize: 14 },

  loaderOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10000,
  },
  loaderText: { marginTop: 15, color: "white", fontSize: 16, letterSpacing: 2 },
});
