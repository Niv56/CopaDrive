// mobile-client/src/features/drive/pages/MyDrivePage.jsx

import React, { useMemo, useCallback, useState } from "react";
import { FlatList, Text, ActivityIndicator, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useMyDrive } from "../hooks/useMyDrive";
import DriveListItem from "../components/DriveListItem";
import { driveStyles } from "../styles/myDrive.styles";
import { useAuth } from "../../../app/providers/AuthContext";

import { moveToTrash } from "../services/fileService";
import { emitDriveRefresh } from "../services/driveEvents";

import FilePreviewModal from "../components/FilePreviewModal";

export default function MyDrivePage() {
  const { token } = useAuth();
  const { items, loading, refreshing, onRefresh } = useMyDrive();

  // Folder navigation state
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderPath, setFolderPath] = useState([]); // breadcrumb trail

  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Filter items based on current folder
  const currentItems = useMemo(() => {
    return (items || []).filter((item) => {
      if (currentFolderId) {
        // Inside a folder - compare as strings to handle ObjectId differences
        return String(item.parentId) === String(currentFolderId);
      }
      // Root level - show items with no parent OR parent not in our list
      const parentIsAccessible = items.some(other => String(other.id) === String(item.parentId));
      return !item.parentId || !parentIsAccessible;
    });
  }, [items, currentFolderId]);

  // Handle item press - folders navigate, files preview
  const handlePressItem = useCallback((item) => {
    if (!item) return;

    // Use item.id or item._id to handle both formats
    const itemId = item.id || item._id;

    if (item.type === "folder") {
      // Navigate into folder
      setCurrentFolderId(itemId);
      setFolderPath((prev) => [...prev, { id: itemId, name: item.name }]);
      return;
    }

    // Open file preview
    setSelectedId(itemId);
    setPreviewOpen(true);
  }, []);

  // Go back to parent folder
  const handleBack = useCallback(() => {
    if (folderPath.length === 0) return;

    const newPath = folderPath.slice(0, -1);
    setFolderPath(newPath);
    setCurrentFolderId(newPath.length > 0 ? newPath[newPath.length - 1].id : null);
  }, [folderPath]);

  // Navigate to specific breadcrumb
  const navigateToBreadcrumb = useCallback((index) => {
    if (index < 0) {
      // Go to root
      setFolderPath([]);
      setCurrentFolderId(null);
    } else {
      const newPath = folderPath.slice(0, index + 1);
      setFolderPath(newPath);
      setCurrentFolderId(newPath[newPath.length - 1].id);
    }
  }, [folderPath]);

  if (loading && items.length === 0) {
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

    if (loading && onlyFiles.length === 0) {
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
              <Text style={driveStyles.breadcrumbText}>My Drive</Text>
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
          data={currentItems}
          contentContainerStyle={{ paddingBottom: 150 }}
          keyExtractor={(item) => item.id || item._id}
          renderItem={({ item }) => (
            <DriveListItem
              item={item}
              onPress={handlePressItem}
              onDelete={handleDeleteItem}
            />
          )}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <Text style={driveStyles.emptyText}>
              {currentFolderId ? "This folder is empty." : "No files found in your drive."}
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
}