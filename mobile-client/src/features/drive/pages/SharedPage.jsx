import React, { useState, useMemo, useCallback } from "react";
import {
  FlatList,
  Pressable,
  View,
  Text,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useMyDrive } from "../hooks/useMyDrive";
import { useAuth } from "../../../app/providers/AuthContext";
import DriveListItem from "../components/DriveListItem";

// ✅ ייבוא Theme ופונקציית סטיילים
import { getDriveStyles } from "../styles/myDrive.styles";
import { useTheme } from "../../../app/providers/ThemeContext";

import { moveToTrash } from "../services/fileService";
import { emitDriveRefresh } from "../services/driveEvents";

import FilePreviewModal from "../components/FilePreviewModal";

export default function SharedPage() {
  const { items, loading, refreshing, onRefresh } = useMyDrive();
  const { userId, token } = useAuth();

  // ✅ שימוש ב-Theme
  const { colors } = useTheme();
  const driveStyles = useMemo(() => getDriveStyles(colors), [colors]);

  const [selectedOwnerId, setSelectedOwnerId] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const sharedItems = useMemo(
    () => (items || []).filter((i) => i?.ownerId && i.ownerId !== userId),
    [items, userId]
  );

  const owners = useMemo(() => {
    const uniqueIds = [...new Set(sharedItems.map((i) => i.ownerId))];
    return uniqueIds.map((id) => ({
      id,
      email:
        sharedItems.find((i) => i.ownerId === id)?.ownerEmail || "Shared User",
    }));
  }, [sharedItems]);

  const filesByOwner = useMemo(
    () => sharedItems.filter((i) => i.ownerId === selectedOwnerId),
    [sharedItems, selectedOwnerId]
  );

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

  if (loading && (items || []).length === 0) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />;
  }

  // מצב: צפייה בקבצים של משתמש ספציפי
  if (selectedOwnerId) {
    return (
      <>
        <View style={{ flex: 1 }}>
          <Pressable
            onPress={() => setSelectedOwnerId(null)}
            style={{
              margin: 15,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: "bold", marginLeft: 5 }}>
              Back to Users
            </Text>
          </Pressable>

          <FlatList
            data={filesByOwner}
            refreshing={refreshing}
            onRefresh={onRefresh}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <DriveListItem 
                item={item} 
                onPress={openItem} 
                onDelete={handleDeleteItem} 
              />
            )}
            ListEmptyComponent={
              <Text style={driveStyles.emptyText}>
                No shared items for this user
              </Text>
            }
            contentContainerStyle={{ paddingBottom: 150 }}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <FilePreviewModal
          open={previewOpen}
          fileId={selectedId}
          onClose={() => setPreviewOpen(false)}
        />
      </>
    );
  }

  // מצב: רשימת המשתמשים ששיתפו איתי
  return (
    <>
      <FlatList
        data={owners}
        refreshing={refreshing}
        onRefresh={onRefresh}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={driveStyles.fileCard}
            onPress={() => setSelectedOwnerId(item.id)}
          >
            <Ionicons
              name="person-circle"
              size={40}
              color={colors.iconColor}
              style={{ marginRight: 15 }}
            />
            <Text style={driveStyles.fileName}>{item.email}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={driveStyles.emptyText}>No shared items yet</Text>
        }
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