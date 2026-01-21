// mobile-client/src/features/drive/pages/MyDrivePage.jsx

import React, { useMemo, useCallback, useState } from "react";
import { FlatList, Text, ActivityIndicator, Alert } from "react-native";

import { useMyDrive } from "../hooks/useMyDrive";
import DriveListItem from "../components/DriveListItem";
import { driveStyles } from "../styles/myDrive.styles";
import { useAuth } from "../../../app/providers/AuthContext";

// ✅ ייבוא פונקציית המחיקה ורענון
import { moveToTrash } from "../services/fileService"; 
import { emitDriveRefresh } from "../services/driveEvents";

import FilePreviewModal from "../components/FilePreviewModal";

export default function MyDrivePage() {
  const { token } = useAuth(); // הוספנו את הטוקן
  const { items, loading, refreshing, onRefresh } = useMyDrive();

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

  // ✅ הפונקציה החדשה למחיקה
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
              // נניח שיש פונקציה כזו ב-fileService. 
              // אם קוראים לה בשם אחר (למשל updateItem עם trashed: true), עדכן כאן.
              await moveToTrash(token, item.id);
              emitDriveRefresh(); // רענון הרשימה
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
      <FlatList
        data={onlyFiles}
        contentContainerStyle={{ paddingBottom: 150 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DriveListItem 
            item={item} 
            onPress={handlePressItem}
            onDelete={handleDeleteItem} // ✅ העברת פונקציית המחיקה
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