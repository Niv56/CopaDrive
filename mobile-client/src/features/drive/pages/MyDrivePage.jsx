// mobile-client/src/features/drive/pages/MyDrivePage.jsx

import React, { useMemo, useCallback, useState } from "react";
import { FlatList, Text, ActivityIndicator, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useMyDrive } from "../hooks/useMyDrive";
import DriveListItem from "../components/DriveListItem";
import { driveStyles } from "../styles/myDrive.styles";
import FilePreviewModal from "../components/FilePreviewModal";

export default function MyDrivePage() {
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
        // Inside a folder - show items with matching parentId
        return item.parentId === currentFolderId;
      }
      // Root level - show items with no parent OR parent not in our list
      const parentIsAccessible = items.some(other => other.id === item.parentId);
      return item.parentId === null || !parentIsAccessible;
    });
  }, [items, currentFolderId]);

  // Handle item press - folders navigate, files preview
  const handlePressItem = useCallback((item) => {
    if (!item) return;

    if (item.type === "folder") {
      // Navigate into folder
      setCurrentFolderId(item.id);
      setFolderPath((prev) => [...prev, { id: item.id, name: item.name }]);
      return;
    }

    // Open file preview
    setSelectedId(item.id);
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
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DriveListItem item={item} onPress={handlePressItem} />
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
