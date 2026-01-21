import React, { useMemo, useCallback, useState } from "react";
import { FlatList, Text, ActivityIndicator, View, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useMyDrive } from "../hooks/useMyDrive";
import DriveListItem from "../components/DriveListItem";
import { driveStyles } from "../styles/myDrive.styles";

import FilePreviewModal from "../components/FilePreviewModal";

// ✅ ייבואים חדשים שנצרכים למחיקה
import { useAuth } from "../../../app/providers/AuthContext";
import { moveToTrash } from "../services/fileService";
import { emitDriveRefresh } from "../services/driveEvents";

export default function StarredPage() {
  // ✅ שליפת הטוקן
  const { token } = useAuth();
  const { items, loading, refreshing, onRefresh } = useMyDrive();

  // Folder navigation state
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderPath, setFolderPath] = useState([]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Get starred items OR items inside the current folder
  const displayItems = useMemo(() => {
    if (currentFolderId) {
      // Inside a folder - show all items in that folder
      return (items || []).filter(
        (item) => String(item.parentId) === String(currentFolderId)
      );
    }
    // At root - show only starred items
    return (items || []).filter((i) => !!i?.starred);
  }, [items, currentFolderId]);

  const openItem = useCallback((item) => {
    if (!item) return;

    const itemId = item.id || item._id;

    if (item.type === "folder") {
      setCurrentFolderId(itemId);
      setFolderPath((prev) => [...prev, { id: itemId, name: item.name }]);
      return;
    }

    setSelectedId(itemId);
    setPreviewOpen(true);
  }, []);

  const handleDeleteItem = useCallback(async (item) => {
    Alert.alert(
      "Move to Trash?",
      `Are you sure you want to remove "${item.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await moveToTrash(token, item.id);
              emitDriveRefresh();
            } catch (err) {
              Alert.alert("Error", "Could not delete item.");
            }
          }
        }
      ]
    );
  }, [token]);

  const handleBack = useCallback(() => {
    if (folderPath.length === 0) return;
    const newPath = folderPath.slice(0, -1);
    setFolderPath(newPath);
    setCurrentFolderId(newPath.length > 0 ? newPath[newPath.length - 1].id : null);
  }, [folderPath]);

  const navigateToBreadcrumb = useCallback((index) => {
    if (index < 0) {
      setFolderPath([]);
      setCurrentFolderId(null);
    } else {
      const newPath = folderPath.slice(0, index + 1);
      setFolderPath(newPath);
      setCurrentFolderId(newPath[newPath.length - 1].id);
    }
  }, [folderPath]);

  if (loading && displayItems.length === 0) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <>
      {/* Breadcrumb Navigation */}
      {folderPath.length > 0 && (
        <View style={driveStyles.breadcrumbContainer}>
          <Pressable onPress={handleBack} style={driveStyles.backButton}>
            <Ionicons name="arrow-back" size={20} color="#0d6efd" />
          </Pressable>

          <Pressable onPress={() => navigateToBreadcrumb(-1)}>
            <Text style={driveStyles.breadcrumbText}>Starred</Text>
          </Pressable>

          {folderPath.map((folder, index) => (
            <View key={folder.id} style={driveStyles.breadcrumbItem}>
              <Text style={driveStyles.breadcrumbSeparator}>/</Text>
              <Pressable onPress={() => navigateToBreadcrumb(index)}>
                <Text style={[
                  driveStyles.breadcrumbText,
                  index === folderPath.length - 1 && driveStyles.breadcrumbActive
                ]} numberOfLines={1}>
                  {folder.name}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <FlatList
        data={displayItems}
        contentContainerStyle={{ paddingBottom: 150 }}
        keyExtractor={(item) => item.id || item._id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => (
          <DriveListItem
            item={item}
            onPress={openItem}
            onDelete={handleDeleteItem}
          />
        )}
        ListEmptyComponent={
          <Text style={driveStyles.emptyText}>
            {currentFolderId ? "This folder is empty" : "No starred items yet"}
          </Text>
        }
        showsVerticalScrollIndicator={false}
      />

      <FilePreviewModal
        open={previewOpen}
        fileId={selectedId}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
}