import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
  ActivityIndicator, Pressable, Keyboard, LayoutAnimation, Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

import { useAuth } from "../../app/providers/AuthContext";
import { createItem, getFiles } from "../../features/drive/services/fileService";
import { emitDriveRefresh } from "../../features/drive/services/driveEvents";
import { useDriveUploads } from "../../features/drive/hooks/useDriveUploads";

import ActionMenu from "./ActionMenu";
import CreateForm from "./CreateForm";
import UploadPreviewContent from "../../features/drive/components/UploadPreviewContent";

import { useTheme } from "../../app/providers/ThemeContext";

const NEWLINE = "_@NL@_";

/**
 * Main Floating Action Button (FAB)
 * Manages the transition between the Action Menu, File/Folder creation forms, 
 * and Media upload previews.
 */
export default function Fab({ onRefresh }) {
  const { token } = useAuth();
  const { isDarkMode, colors } = useTheme();

  // Component State: 'closed', 'menu', 'create_folder', or 'create_file'
  const [activeView, setActiveView] = useState("closed");
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  /** Resets all form states and closes the modal */
  const closeAll = () => {
    setActiveView("closed");
    setTimeout(() => {
      setName("");
      setContent("");
      setSelectedFolderId(null);
    }, 300);
    Keyboard.dismiss();
  };

  // Logic for picking and previewing documents/images
  const {
    loading: uploadLoading,
    pickDocument,
    pickImage,
    pendingFile,
    confirmUpload,
    discardPending,
  } = useDriveUploads(token, onRefresh, closeAll);

  /** Fetches folder hierarchy for destination selection in forms */
  useEffect(() => {
    const fetchFolders = async () => {
      if (!token) return;
      try {
        const files = await getFiles(token);
        const foldersList = (files || []).filter(f => f.type === "folder");
        setFolders(foldersList);
      } catch (err) {
        // Silently fail: picker will remain empty
      }
    };
    fetchFolders();
  }, [token]);

  /** Animates state transitions for smoother UI feel */
  const switchTo = (view) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveView(view);
  };

  /** Handles actions dispatched from the ActionMenu component */
  const handleMenuAction = (action) => {
    switch (action) {
      case "create_folder": switchTo("create_folder"); break;
      case "create_file": switchTo("create_file"); break;
      case "upload_image": pickImage(false); break;
      case "take_photo": pickImage(true); break;
      case "upload_file": pickDocument(); break;
    }
  };

  /** Processes the creation of new text files or empty folders */
  const handleSubmitCreate = async () => {
    if (!name.trim()) return;
    if (!token) return Alert.alert("Error", "Not logged in");

    setCreateLoading(true);
    try {
      const isFolder = activeView === "create_folder";
      // Ensure text files have the correct extension
      const finalName = isFolder ? name.trim() : (name.trim().endsWith(".txt") ? name.trim() : `${name.trim()}.txt`);

      await createItem(token, {
        name: finalName,
        type: isFolder ? "folder" : "file",
        content: isFolder ? "" : String(content || "").replaceAll("\n", NEWLINE),
        mimeType: isFolder ? "" : "text/plain",
        parentId: selectedFolderId,
      });

      emitDriveRefresh({ reason: "create", name: finalName });
      onRefresh?.();
      closeAll();
    } catch (err) {
      Alert.alert("Error", err?.message || "Unknown error");
    } finally {
      setCreateLoading(false);
    }
  };

  const loading = uploadLoading || createLoading;
  const isMenu = activeView === "menu";
  const isCreate = activeView === "create_file" || activeView === "create_folder";
  const isPreview = !!pendingFile;
  const isOpen = activeView !== "closed" || isPreview;

  return (
    <>
      {/* Global Activity Overlay */}
      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>WORKING...</Text>
        </View>
      )}

      <Modal visible={isOpen} transparent animationType="fade">
        <View style={styles.container}>
          <BlurView intensity={30} tint={isDarkMode ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          <Pressable style={StyleSheet.absoluteFill} onPress={isPreview ? discardPending : closeAll} />

          {/* View: Primary Action Selection */}
          {isMenu && !isPreview && (
            <ActionMenu onAction={handleMenuAction} disabled={loading} />
          )}

          {/* View: Text File/Folder Input Form */}
          {isCreate && !isPreview && (
            <CreateForm
              mode={activeView}
              name={name} setName={setName}
              content={content} setContent={setContent}
              folders={folders}
              selectedFolderId={selectedFolderId}
              setSelectedFolderId={setSelectedFolderId}
              loading={loading}
              onBack={() => switchTo("menu")}
              onSubmit={handleSubmitCreate}
            />
          )}

          {/* View: File Upload Preview (Media/Documents) */}
          {isPreview && (
            <UploadPreviewContent
              fileData={pendingFile}
              folders={folders}
              uploading={uploadLoading}
              onConfirm={(fileName, folderId) => confirmUpload(fileName, folderId)}
              onDiscard={discardPending}
              onChangeFile={() => {
                discardPending();
                switchTo("menu");
              }}
            />
          )}
        </View>
      </Modal>

      {/* Main Trigger Button */}
      {!isOpen && (
        <View style={styles.fabPosition}>
          <TouchableOpacity
            style={[
              styles.fabMain,
              { backgroundColor: colors.primary },
              loading && { opacity: 0.7 }
            ]}
            onPress={() => !loading && switchTo("menu")}
            activeOpacity={0.9}
            disabled={loading}
          >
            <Ionicons name="add" size={35} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fabPosition: { position: "absolute", bottom: 90, right: 25, zIndex: 9999 },
  fabMain: {
    width: 60, height: 60, borderRadius: 30,
    justifyContent: "center", alignItems: "center", elevation: 5,
  },
  container: { flex: 1 },
  loaderOverlay: {
    position: "absolute", top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", zIndex: 10000,
  },
  loaderText: { marginTop: 15, color: "white", fontSize: 16, letterSpacing: 2, fontWeight: 'bold' },
});