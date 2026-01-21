import React, { useMemo, useCallback, useState } from "react";
import { FlatList, Alert, Text, ActivityIndicator } from "react-native";

import { useMyDrive } from "../hooks/useMyDrive";
import DriveListItem from "../components/DriveListItem";

// ✅ ייבוא Theme ופונקציית סטיילים
import { getDriveStyles } from "../styles/myDrive.styles";
import { useTheme } from "../../../app/providers/ThemeContext";

import FilePreviewModal from "../components/FilePreviewModal";
import { useAuth } from "../../../app/providers/AuthContext";
import { moveToTrash } from "../services/fileService";
import { emitDriveRefresh } from "../services/driveEvents";

export default function StarredPage() {
  const { token } = useAuth();
  const { items, loading, refreshing, onRefresh } = useMyDrive();

  // ✅ שימוש ב-Theme
  const { colors } = useTheme();
  const driveStyles = useMemo(() => getDriveStyles(colors), [colors]);

  const starredItems = useMemo(
    () => (items || []).filter((i) => !!i?.starred),
    [items]
  );

  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const openItem = useCallback((item) => {
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

  if (loading && starredItems.length === 0) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />;
  }

  return (
    <>
      <FlatList
        data={starredItems}
        contentContainerStyle={{ paddingBottom: 150 }}
        keyExtractor={(item) => item.id}
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
          <Text style={driveStyles.emptyText}>No starred items yet</Text>
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