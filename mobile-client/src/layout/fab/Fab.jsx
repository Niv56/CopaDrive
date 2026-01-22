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

export default function Fab({ onRefresh }) {
  const { token } = useAuth();

  const { isDarkMode, colors } = useTheme();

  const [activeView, setActiveView] = useState("closed");
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  const closeAll = () => {
    setActiveView("closed");
    setTimeout(() => { setName(""); setContent(""); setSelectedFolderId(null); }, 300);
    Keyboard.dismiss();
  };

  const {
    loading: uploadLoading,
    pickDocument,
    pickImage,
    pendingFile,
    confirmUpload,
    discardPending,
  } = useDriveUploads(token, onRefresh, closeAll);

  // Fetch folders for destination selection
  useEffect(() => {
    const fetchFolders = async () => {
      if (!token) return;
      try {
        const files = await getFiles(token);
        const foldersList = (files || []).filter(f => f.type === "folder");
        setFolders(foldersList);
      } catch (err) {
        // Silently fail - folders will just be empty
      }
    };
    fetchFolders();
  }, [token]);

  const switchTo = (view) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveView(view);
  };

  const handleMenuAction = (action) => {
    switch (action) {
      case "create_folder": switchTo("create_folder"); break;
      case "create_file": switchTo("create_file"); break;
      case "upload_image": pickImage(false); break;
      case "take_photo": pickImage(true); break;
      case "upload_file": pickDocument(); break;
    }
  };

  const handleSubmitCreate = async () => {
    if (!name.trim()) return;
    if (!token) return Alert.alert("Error", "Not logged in");

    setCreateLoading(true);
    try {
      const isFolder = activeView === "create_folder";
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

  // Modal is open if menu/create view is active OR if there's a pending file to preview
  const isOpen = activeView !== "closed" || isPreview;

  return (
    <>
      {loading && (
        <View style={[
          styles.loaderOverlay,
          { backgroundColor: isDarkMode ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.4)" }
        ]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loaderText, { color: colors.textPrimary }]}>WORKING...</Text>
        </View>
      )}

      <Modal visible={isOpen} transparent animationType="fade">
        <View style={styles.container}>
          <BlurView intensity={30} tint={isDarkMode ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          <Pressable style={StyleSheet.absoluteFill} onPress={isPreview ? discardPending : closeAll} />

          {isMenu && !isPreview && (
            <ActionMenu onAction={handleMenuAction} disabled={loading} />
          )}

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

          {isPreview && (
            <UploadPreviewContent
              fileData={pendingFile}
              folders={folders}
              uploading={uploadLoading}
              onConfirm={(fileName, folderId) => confirmUpload(fileName, folderId)}
              onDiscard={discardPending}
              onChangeFile={() => {
                discardPending();
                // Reopen the menu so user can pick another file
                switchTo("menu");
              }}
            />
          )}
        </View>
      </Modal>

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
    justifyContent: "center", alignItems: "center", zIndex: 10000,
  },
  loaderText: { marginTop: 15, fontSize: 16, letterSpacing: 2, fontWeight: "bold" },
});