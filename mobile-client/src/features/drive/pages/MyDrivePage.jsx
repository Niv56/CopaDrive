import React, { useMemo, useCallback, useState } from "react";
// הוספנו כאן את Alert לייבוא
import { FlatList, Text, ActivityIndicator, View, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useMyDrive } from "../hooks/useMyDrive";
import DriveListItem from "../components/DriveListItem";

// ✅ ייבוא Theme
import { getDriveStyles } from "../styles/myDrive.styles";
import { useTheme } from "../../../app/providers/ThemeContext";

import { useAuth } from "../../../app/providers/AuthContext";
import { moveToTrash } from "../services/fileService"; 
import { emitDriveRefresh } from "../services/driveEvents";

import FilePreviewModal from "../components/FilePreviewModal";

export default function MyDrivePage() {
  const { token } = useAuth();
  const { items, loading, refreshing, onRefresh } = useMyDrive();

  // ✅ שימוש ב-Theme
  const { colors } = useTheme();
  const driveStyles = useMemo(() => getDriveStyles(colors), [colors]);

  const onlyFiles = useMemo(
    () => (items || []).filter((i) => i?.type === "file"),
    [items]
  );

  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const handlePressItem = useCallback((item) => {
    if (!item) return;
    if (item.type === "folder") {
      Alert.alert("CopaDrive", "Folders view is coming soon.");
      return;
    }
    setSelectedId(item.id);
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

  if (loading && onlyFiles.length === 0) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />;
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