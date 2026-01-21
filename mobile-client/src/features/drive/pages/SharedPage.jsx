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
import { driveStyles } from "../styles/myDrive.styles";

// ✅ ייבוא שירותי מחיקה ורענון
import { moveToTrash } from "../services/fileService";
import { emitDriveRefresh } from "../services/driveEvents";

import FilePreviewModal from "../components/FilePreviewModal";

export default function SharedPage() {
  const { items, loading, refreshing, onRefresh } = useMyDrive();
  // ✅ הוספנו את token
  const { userId, token } = useAuth();

  const [selectedOwnerId, setSelectedOwnerId] = useState(null);

  // ✅ Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // פריטים ששותפו איתי (כלומר: לא אני הבעלים)
  const sharedItems = useMemo(
    () => (items || []).filter((i) => i?.ownerId && i.ownerId !== userId),
    [items, userId]
  );

  // רשימת בעלים ייחודיים
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

  // ✅ פונקציית המחיקה החדשה
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
              emitDriveRefresh(); // רענון הרשימה
            } catch (err) {
              Alert.alert("Error", "Could not delete item.");
            }
          }
        }
      ]
    );
  }, [token]);

  if (loading && (items || []).length === 0) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  // מצב: בחרתי בעלים -> מציג את הקבצים שלו
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
            <Ionicons name="arrow-back" size={20} color="#1a73e8" />
            <Text style={{ color: "#1a73e8", fontWeight: "bold", marginLeft: 5 }}>
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
                onDelete={handleDeleteItem} // ✅ חיבור למחיקה
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

  // מצב: רשימת משתמשים (בעלים) - כאן אין מחיקה כי אלו משתמשים
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
              color="#5f6368"
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