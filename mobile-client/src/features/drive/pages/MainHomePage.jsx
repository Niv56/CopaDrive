import React, { useMemo, useCallback, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useMyDrive } from "../hooks/useMyDrive";
import DriveListItem from "../components/DriveListItem";

// ✅ ייבוא Theme
import { getDriveStyles } from "../styles/myDrive.styles";
import { useTheme } from "../../../app/providers/ThemeContext";

import FilePreviewModal from "../components/FilePreviewModal";
import { useAuth } from "../../../app/providers/AuthContext";
import { moveToTrash } from "../services/fileService";
import { emitDriveRefresh } from "../services/driveEvents";

export default function MainHomePage() {
  const { items, loading, refreshing, onRefresh } = useMyDrive();
  const { token } = useAuth();
  
  // ✅ שימוש ב-Theme כדי למנוע קריסה
  const { colors } = useTheme();
  const driveStyles = useMemo(() => getDriveStyles(colors), [colors]);

  const folders = useMemo(() => (items || []).filter((i) => i?.type === "folder"), [items]);
  const files = useMemo(() => (items || []).filter((i) => i?.type === "file"), [items]);

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
    Alert.alert("Move to Trash?", `Delete "${item.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try { await moveToTrash(token, item.id); emitDriveRefresh(); } 
          catch (err) { Alert.alert("Error", "Could not delete item."); }
        }
      }
    ]);
  }, [token]);

  if (loading && (items || []).length === 0) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />;
  }

  // ✅ SectionHeader שמשתמש בסטיילים החדשים
  const SectionHeader = ({ icon, title, style }) => (
    <View style={[driveStyles.sectionHeader, style]}>
        <Ionicons name={icon} size={18} color={colors.textPrimary} />
        <Text style={driveStyles.sectionText}>{title}</Text>
    </View>
  );

  return (
    <>
      <FlatList
        data={[]}
        ListHeaderComponent={
          <View>
            <SectionHeader icon="folder-outline" title="Suggested folders" />
            {folders.map((item) => (
              <DriveListItem key={item.id} item={item} onPress={openItem} onDelete={handleDeleteItem} />
            ))}

            <SectionHeader icon="document-text-outline" title="Suggested files" style={{ marginTop: 20 }} />
            {files.map((item) => (
              <DriveListItem key={item.id} item={item} onPress={openItem} onDelete={handleDeleteItem} />
            ))}
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