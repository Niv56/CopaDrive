import React, { useState, useMemo, useEffect } from "react";
import {
  View, Text, TextInput, Image, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";

import { useTheme } from "../../../app/providers/ThemeContext";
import { getUploadPreviewStyles } from "../styles/uploadPreview.styles";

const isImage = (mimeType = "") => mimeType.startsWith("image/");
const isVideo = (mimeType = "") => mimeType.startsWith("video/");

/**
 * Upload Preview Controller
 * Allows the user to rename a file and select a destination folder before 
 * committing the upload to the server.
 */
export default function UploadPreviewContent({
  fileData,        // { uri, fileName, mimeType }
  folders,         // Array of folder items for destination selection
  onConfirm,       // Triggered on successful validation
  onDiscard,       // Cancels the current selection
  onChangeFile,    // Returns to the system file picker
  uploading,       // Loading state for the confirm button
}) {
  const { colors = {} } = useTheme();
  const styles = useMemo(() => getUploadPreviewStyles(colors), [colors]);

  const [title, setTitle] = useState(fileData?.fileName || "");
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [showFolderPicker, setShowFolderPicker] = useState(false);

  // Sync internal title state if the parent updates the file data
  useEffect(() => {
    if (fileData?.fileName) {
      setTitle(fileData.fileName);
    }
  }, [fileData?.fileName]);

  const selectedFolderName = useMemo(() => {
    if (!selectedFolderId) return "My Drive (Root)";
    const folder = folders?.find(f => f.id === selectedFolderId);
    return folder?.name || "Unknown Folder";
  }, [selectedFolderId, folders]);

  const handleConfirm = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a file name");
      return;
    }
    onConfirm?.(title.trim(), selectedFolderId);
  };

  if (!fileData) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.centerWrap}
    >
      <View style={styles.card}>
        {/* Modal Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Review Upload</Text>
          <TouchableOpacity onPress={onDiscard} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={colors.textPrimary || "#333"} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          {/* Dynamic Media Preview Section */}
          <View style={styles.previewContainer}>
            {isImage(fileData.mimeType) ? (
              <Image source={{ uri: fileData.uri }} style={styles.previewImage} resizeMode="contain" />
            ) : isVideo(fileData.mimeType) ? (
              <Video
                source={{ uri: fileData.uri }}
                style={styles.previewVideo}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
              />
            ) : (
              <View style={styles.previewFallback}>
                <Ionicons name="document-outline" size={60} color={colors.textSecondary || "#666"} />
                <Text style={styles.previewFallbackText}>
                  {fileData.mimeType || "File"}
                </Text>
              </View>
            )}
          </View>

          {/* Meta Data Inputs */}
          <Text style={styles.label}>File Name</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter file name..."
            placeholderTextColor={colors.textSecondary || "#999"}
          />

          <Text style={styles.label}>Save to</Text>
          <TouchableOpacity
            style={styles.folderPicker}
            onPress={() => setShowFolderPicker(!showFolderPicker)}
          >
            <Ionicons name="folder-outline" size={20} color={colors.textSecondary || "#666"} />
            <Text style={styles.folderPickerText}>{selectedFolderName}</Text>
            <Ionicons
              name={showFolderPicker ? "chevron-up" : "chevron-down"}
              size={18}
              color={colors.textSecondary || "#666"}
            />
          </TouchableOpacity>

          {/* Collapsible Destination Folder List */}
          {showFolderPicker && (
            <View style={styles.folderList}>
              <TouchableOpacity
                style={[styles.folderItem, !selectedFolderId && styles.folderItemActive]}
                onPress={() => {
                  setSelectedFolderId(null);
                  setShowFolderPicker(false);
                }}
              >
                <Ionicons name="home-outline" size={18} color={colors.textSecondary || "#666"} />
                <Text style={styles.folderItemText}>My Drive (Root)</Text>
              </TouchableOpacity>

              {folders?.filter(f => f.type === "folder").map(folder => (
                <TouchableOpacity
                  key={folder.id}
                  style={[styles.folderItem, selectedFolderId === folder.id && styles.folderItemActive]}
                  onPress={() => {
                    setSelectedFolderId(folder.id);
                    setShowFolderPicker(false);
                  }}
                >
                  <Ionicons name="folder" size={18} color="#f59e0b" />
                  <Text style={styles.folderItemText}>{folder.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Action Bar */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={onChangeFile}>
            <Ionicons name="refresh-outline" size={18} color={colors.textPrimary || "#333"} />
            <Text style={styles.secondaryBtnText}>Change</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.discardBtn} onPress={onDiscard}>
            <Ionicons name="trash-outline" size={18} color="#dc2626" />
            <Text style={styles.discardBtnText}>Discard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.confirmBtn, uploading && styles.confirmBtnDisabled]}
            onPress={handleConfirm}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
                <Text style={styles.confirmBtnText}>Upload</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}