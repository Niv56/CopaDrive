import React, { useMemo, useCallback, useState, useEffect } from "react";
import { FlatList, Text, ActivityIndicator, View, Pressable, Alert, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useMyDrive } from "../hooks/useMyDrive";
import DriveListItem from "../components/DriveListItem";

import { useTheme } from "../../../app/providers/ThemeContext";
import { useAuth } from "../../../app/providers/AuthContext";
import { moveToTrash } from "../services/fileService"; 
import { emitDriveRefresh, subscribeNavigateToFolder } from "../services/driveEvents";

import FilePreviewModal from "../components/FilePreviewModal";
export default function MyDrivePage() {
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderPath, setFolderPath] = useState([]);

  const { token } = useAuth();
  const { items, loading, refreshing, onRefresh } = useMyDrive();
  const { colors } = useTheme(); 

  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeNavigateToFolder(({ folderId, folderName }) => {
      if (folderId) {
        setCurrentFolderId(folderId);
        setFolderPath([{ id: folderId, name: folderName }]);
      }
    });
    return unsubscribe;
  }, []);

  const currentItems = useMemo(() => {
    if (!items) return [];
    return items.filter(item => {
        if (currentFolderId === null) return !item.parentId;
        return item.parentId === currentFolderId;
    });
  }, [items, currentFolderId]);

  const handlePressItem = useCallback((item) => {
    if (!item) return;
    if (item.type === "folder") {
      setCurrentFolderId(item.id);
      setFolderPath((prev) => [...prev, { id: item.id, name: item.name }]);
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

  if (loading && (!currentItems || currentItems.length === 0)) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );
  }

  return (
    <View style={{ flex: 1 }}> 
      {/* Breadcrumbs */}
      {folderPath.length > 0 && (
        <View style={styles.breadcrumbContainer}>
          <Pressable onPress={handleBack} style={[styles.backButton, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </Pressable>
          <Pressable onPress={() => navigateToBreadcrumb(-1)}>
            <Text style={[styles.breadcrumbText, { color: colors.textSecondary }]}>My Drive</Text>
          </Pressable>
          {folderPath.map((folder, index) => (
            <View key={folder.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="chevron-forward" size={14} color={colors.textTertiary} />
                <Pressable onPress={() => navigateToBreadcrumb(index)}>
                    <Text style={[
                        styles.breadcrumbText,
                        { color: index === folderPath.length - 1 ? colors.primary : colors.textSecondary, fontWeight: index === folderPath.length - 1 ? '700' : '400' }
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
        contentContainerStyle={{ paddingBottom: 150, paddingHorizontal: 15 }}
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
          <View style={{ alignItems: 'center', marginTop: 100, opacity: 0.6 }}>
             <Ionicons name="folder-open-outline" size={60} color={colors.textTertiary} />
             <Text style={{ marginTop: 10, color: colors.textSecondary, fontSize: 16 }}>
                {currentFolderId ? "This folder is empty." : "No files found in your drive."}
             </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      <FilePreviewModal
        open={previewOpen}
        fileId={selectedId}
        onClose={() => setPreviewOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    breadcrumbContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 15,
        paddingHorizontal: 15,
        marginTop: 10, 
        gap: 5
    },
    backButton: {
        padding: 6,
        borderRadius: 8,
        marginRight: 5
    },
    breadcrumbText: {
        fontSize: 15,
        marginHorizontal: 2
    }
});