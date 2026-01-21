import React, { useMemo, useCallback, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useMyDrive } from "../hooks/useMyDrive";
import DriveListItem from "../components/DriveListItem";
import { driveStyles } from "../styles/myDrive.styles";

import FilePreviewModal from "../components/FilePreviewModal";

export default function MainHomePage() {
  const { items, loading, refreshing, onRefresh } = useMyDrive();

  // Folder navigation state
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderPath, setFolderPath] = useState([]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Filter items based on current folder
  const currentItems = useMemo(() => {
    return (items || []).filter((item) => {
      if (currentFolderId) {
        return String(item.parentId) === String(currentFolderId);
      }
      const parentIsAccessible = items.some(other => String(other.id) === String(item.parentId));
      return !item.parentId || !parentIsAccessible;
    });
  }, [items, currentFolderId]);

  const folders = useMemo(
    () => currentItems.filter((i) => i?.type === "folder"),
    [currentItems]
  );
  const files = useMemo(
    () => currentItems.filter((i) => i?.type === "file"),
    [currentItems]
  );

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

  if (loading && (items || []).length === 0) {
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
            <Text style={driveStyles.breadcrumbText}>Home</Text>
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
        data={[]}
        ListHeaderComponent={
          <View>
            <SectionHeader icon="folder-outline" title="Suggested folders" />
            {folders.length === 0 ? (
              <Text style={driveStyles.emptyText}>No folders here</Text>
            ) : (
              folders.map((item) => (
                <DriveListItem key={item.id || item._id} item={item} onPress={openItem} />
              ))
            )}

            <SectionHeader
              icon="document-text-outline"
              title="Suggested files"
              style={{ marginTop: 20 }}
            />
            {files.length === 0 ? (
              <Text style={driveStyles.emptyText}>No files here</Text>
            ) : (
              files.map((item) => (
                <DriveListItem key={item.id || item._id} item={item} onPress={openItem} />
              ))
            )}
          </View>
        }
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={{ paddingBottom: 150 }}
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

const SectionHeader = ({ icon, title, style }) => (
  <View style={[driveStyles.sectionHeader, style]}>
    <Ionicons name={icon} size={18} color="#333" />
    <Text style={driveStyles.sectionText}>{title}</Text>
  </View>
);