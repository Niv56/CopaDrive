import React, { useMemo, useCallback, useState } from "react";
import { FlatList, Text, ActivityIndicator, Alert } from "react-native";

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
      <FlatList
        data={onlyFiles}
        contentContainerStyle={{ paddingBottom: 150 }}
        keyExtractor={(item) => item.id}
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
          <Text style={driveStyles.emptyText}>No files found in your drive.</Text>
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