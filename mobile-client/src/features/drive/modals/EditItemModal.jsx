import React, { useState, useMemo, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, Modal,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  Pressable, StyleSheet
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

import { useTheme } from "../../../app/providers/ThemeContext";
import { useAuth } from "../../../app/providers/AuthContext";
import { getFileIconMeta } from "../utils/fileIcon";
import { updateItem, getFiles } from "../services/fileService";
import { emitDriveRefresh } from "../services/driveEvents";
import { getEditItemModalStyles } from "../styles/editItemModal.styles";

export default function EditItemModal({ visible, item, onClose }) {
  const { colors = {}, isDarkMode } = useTheme();
  const { token } = useAuth();
  const styles = useMemo(() => getEditItemModalStyles(colors), [colors]);

  const [name, setName] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [folders, setFolders] = useState([]);
  const [saving, setSaving] = useState(false);

  const isFolder = item?.type === "folder";
  const { icon, color } = getFileIconMeta(item?.name, item?.mimeType, isFolder);

  // Reset form when item changes or modal opens
  useEffect(() => {
    if (visible && item) {
      setName(item.name || "");
      setSelectedFolderId(item.parentId || null);
      setShowFolderPicker(false);
      fetchFolders();
    }
  }, [visible, item?.id]);

  const fetchFolders = async () => {
    if (!token) return;
    try {
      const files = await getFiles(token);
      // Filter out the current item if it's a folder (can't move folder into itself)
      const foldersList = (files || [])
        .filter(f => f.type === "folder" && f.id !== item?.id);
      setFolders(foldersList);
    } catch (err) {
      // Silently fail
    }
  };

  const selectedFolderName = useMemo(() => {
    if (!selectedFolderId) return "My Drive (Root)";
    const folder = folders?.find(f => f.id === selectedFolderId);
    return folder?.name || "Unknown Folder";
  }, [selectedFolderId, folders]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert("Error", "Please enter a name");
      return;
    }
    if (!token || !item?.id) return;

    setSaving(true);
    try {
      await updateItem(token, item.id, {
        name: trimmedName,
        parentId: selectedFolderId,
      });
      emitDriveRefresh({ reason: "edit", name: trimmedName });
      onClose?.();
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.backdrop} onPress={onClose}>
        <BlurView intensity={30} tint={isDarkMode ? "dark" : "light"} style={StyleSheet.absoluteFill} />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={styles.centerWrap}
        >
          <Pressable 
            style={styles.card}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                Edit {isFolder ? "Folder" : "File"}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={colors.textPrimary || "#333"} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* File/Folder Icon Preview */}
              <View style={styles.previewContainer}>
                <View style={styles.iconPreview}>
                  <Ionicons name={icon} size={60} color={color} />
                </View>
              </View>

              {/* Name Input */}
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder={isFolder ? "Folder name..." : "File name..."}
                placeholderTextColor={colors.textSecondary || "#999"}
                autoFocus
              />

              {/* Folder Picker */}
              <Text style={styles.label}>Location</Text>
              <TouchableOpacity 
                style={styles.folderPicker}
                onPress={() => setShowFolderPicker(!showFolderPicker)}
              >
                <Ionicons name="folder-outline" size={20} color={colors.textSecondary || "#666"} />
                <Text style={styles.folderPickerText}>
                  {selectedFolderName}
                </Text>
                <Ionicons 
                  name={showFolderPicker ? "chevron-up" : "chevron-down"} 
                  size={18} 
                  color={colors.textSecondary || "#666"} 
                />
              </TouchableOpacity>

              {/* Folder Selection List */}
              {showFolderPicker && (
                <View style={styles.folderList}>
                  <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
                    <TouchableOpacity
                      style={[
                        styles.folderItem, 
                        !selectedFolderId && styles.folderItemActive
                      ]}
                      onPress={() => { 
                        setSelectedFolderId(null); 
                        setShowFolderPicker(false); 
                      }}
                    >
                      <Ionicons name="home-outline" size={18} color={colors.textSecondary || "#666"} />
                      <Text style={styles.folderItemText}>
                        My Drive (Root)
                      </Text>
                    </TouchableOpacity>
                    
                    {folders?.map(folder => (
                      <TouchableOpacity
                        key={folder.id}
                        style={[
                          styles.folderItem, 
                          selectedFolderId === folder.id && styles.folderItemActive
                        ]}
                        onPress={() => { 
                          setSelectedFolderId(folder.id); 
                          setShowFolderPicker(false); 
                        }}
                      >
                        <Ionicons name="folder" size={18} color="#f59e0b" />
                        <Text style={styles.folderItemText}>
                          {folder.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </ScrollView>

            {/* Footer Actions */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>CANCEL</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]} 
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={18} color="#fff" />
                    <Text style={styles.saveBtnText}>SAVE</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
