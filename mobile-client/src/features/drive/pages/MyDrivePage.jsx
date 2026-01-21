// mobile-client/src/features/drive/pages/MyDrivePage.jsx

import React, { useMemo, useCallback, useState } from "react";
// הוספנו כאן את Alert לייבוא
import { FlatList, Text, ActivityIndicator, View, Pressable, Alert } from "react-native";
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

  // גולת הכותרת: הפונקציה עוברת לטופ-לבל כדי שגם ה-FlatList וגם React יכירו אותה תמיד
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

  // סינון הפריטים לפי תיקייה נוכחית
  const currentItems = useMemo(() => {
    return (items || []).filter((item) => {
      if (currentFolderId) {
        return String(item.parentId) === String(currentFolderId);
      }
      const parentIsAccessible = items.some(other => String(other.id) === String(item.parentId));
      return !item.parentId || !parentIsAccessible;
    });
  }, [items, currentFolderId]);

  // לחיצה על פריט
  const handlePressItem = useCallback((item) => {
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

  // מסך טעינה - מחזירים רק את האינדיקטור, בלי להגדיר פונקציות בפנים
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