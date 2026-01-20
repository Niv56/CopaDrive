import React, { useMemo, useCallback, useState } from "react";
import { FlatList, Alert, Text, ActivityIndicator } from "react-native";

import { useMyDrive } from "../hooks/useMyDrive";
import DriveListItem from "../components/DriveListItem";
import { driveStyles } from "../styles/myDrive.styles";

import FilePreviewModal from "../components/FilePreviewModal";

export default function StarredPage() {
  const { items, loading, refreshing, onRefresh } = useMyDrive();

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

  if (loading && starredItems.length === 0) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
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
          <DriveListItem item={item} onPress={openItem} />
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
