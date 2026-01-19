import React, { useMemo, useCallback, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useMyDrive } from "../hooks/useMyDrive";
import DriveListItem from "../components/DriveListItem";
import { driveStyles } from "../styles/myDrive.styles";

import FilePreviewModal from "../components/FilePreviewModal";

export default function MainHomePage() {
  const { items, loading, refreshing, onRefresh } = useMyDrive();

  const folders = useMemo(
    () => (items || []).filter((i) => i?.type === "folder"),
    [items]
  );
  const files = useMemo(
    () => (items || []).filter((i) => i?.type === "file"),
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

  if (loading && (items || []).length === 0) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <>
      <FlatList
        data={[]}
        ListHeaderComponent={
          <View>
            <SectionHeader icon="folder-outline" title="Suggested folders" />
            {folders.map((item) => (
              <DriveListItem key={item.id} item={item} onPress={openItem} />
            ))}

            <SectionHeader
              icon="document-text-outline"
              title="Suggested files"
              style={{ marginTop: 20 }}
            />
            {files.map((item) => (
              <DriveListItem key={item.id} item={item} onPress={openItem} />
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

const SectionHeader = ({ icon, title, style }) => (
  <View style={[driveStyles.sectionHeader, style]}>
    <Ionicons name={icon} size={18} color="#333" />
    <Text style={driveStyles.sectionText}>{title}</Text>
  </View>
);
