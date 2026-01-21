import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../providers/AuthContext";
import {
  getRecentFiles,
  formatLastAccessed,
  moveToTrash
} from "../../features/drive/services/fileService";
import DriveListItem from "../../features/drive/components/DriveListItem";

// ✅ Theme Imports
import { getDriveStyles } from "../../features/drive/styles/myDrive.styles";
import { useTheme } from "../providers/ThemeContext";

import { subscribeDriveRefresh, emitDriveRefresh } from "../../features/drive/services/driveEvents";
import FilePreviewModal from "../../features/drive/components/FilePreviewModal";

export default function RecentPage() {
  const router = useRouter();
  const { token } = useAuth();
  
  // ✅ Theme Hooks
  const { colors, isDarkMode } = useTheme();
  const driveStyles = useMemo(() => getDriveStyles(colors), [colors]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const loadRecent = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getRecentFiles(token);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load recent files:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadRecent(); }, [loadRecent]);

  useEffect(() => {
    const unsubscribe = subscribeDriveRefresh(() => loadRecent());
    return unsubscribe;
  }, [loadRecent]);

  const closeScreen = useCallback(() => {
    try {
      if (typeof router.canGoBack === "function" && router.canGoBack()) {
        router.back();
      } else { router.replace("/home"); }
    } catch { router.replace("/home"); }
  }, [router]);

  const openItem = useCallback((i) => {
    if (!i) return;
    if (i.type === "folder") return;
    setSelectedId(i.id);
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

  return (
    // ✅ רקע דינמי
    <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.modalHeader}>
          <View style={styles.headerLeftSpace} />
          <TouchableOpacity 
            onPress={closeScreen} 
            style={[styles.closeButton, { backgroundColor: colors.surface }]}
          >
            <Ionicons name="close-outline" size={32} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.textHeader}>
            <Text style={[driveStyles.homeTitle, { marginLeft: 0, paddingLeft: 0 }]}>
              RECENT
            </Text>
            <Text style={[styles.subTitle, { color: colors.textSecondary }]}>Last accessed items</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <DriveListItem
                  item={{ ...item, displayDate: formatLastAccessed(item.lastAccessed) }}
                  onPress={openItem}
                  onDelete={handleDeleteItem}
                />
              )}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="time-outline" size={80} color={colors.textTertiary} />
                  <Text style={[driveStyles.emptyText, { color: colors.textTertiary }]}>No recent files</Text>
                </View>
              }
              onRefresh={loadRecent}
              refreshing={loading}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </SafeAreaView>

      <FilePreviewModal
        open={previewOpen}
        fileId={selectedId}
        onClose={() => setPreviewOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 15, height: 60,
  },
  headerLeftSpace: { width: 40 },
  closeButton: {
    width: 44, height: 44, justifyContent: "center", alignItems: "center", borderRadius: 22,
  },
  content: { flex: 1 },
  textHeader: { paddingHorizontal: 20, marginBottom: 15, alignItems: "flex-start" },
  subTitle: { fontSize: 13, marginTop: -8, marginLeft: 0 },
  emptyContainer: { alignItems: "center", marginTop: 100 },
});