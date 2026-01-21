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
import { getImportantFiles, moveToTrash } from "../../features/drive/services/fileService";
import DriveListItem from "../../features/drive/components/DriveListItem";

// ✅ ייבוא Theme וסטיילים דינמיים
import { getDriveStyles } from "../../features/drive/styles/myDrive.styles";
import { useTheme } from "../providers/ThemeContext";

import { subscribeDriveRefresh, emitDriveRefresh } from "../../features/drive/services/driveEvents";
import FilePreviewModal from "../../features/drive/components/FilePreviewModal";

export default function ImportantPage() {
  const router = useRouter();
  const { token } = useAuth();
  
  // ✅ שימוש ב-Theme
  const { colors, isDarkMode } = useTheme();
  const driveStyles = useMemo(() => getDriveStyles(colors), [colors]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const loadImportant = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getImportantFiles(token);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load important files:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadImportant();
  }, [loadImportant]);

  useEffect(() => {
    const unsubscribe = subscribeDriveRefresh(() => {
      loadImportant();
    });
    return unsubscribe;
  }, [loadImportant]);

  const closeScreen = useCallback(() => {
    try {
      if (typeof router.canGoBack === "function" && router.canGoBack()) {
        router.back();
      } else {
        router.replace("/home");
      }
    } catch {
      router.replace("/home");
    }
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
            activeOpacity={0.7}
          >
            <Ionicons name="close-outline" size={32} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.textHeader}>
            {/* שימוש ב-driveStyles הדינמי לכותרת */}
            <Text style={[driveStyles.homeTitle, { marginLeft: 0 }]}>IMPORTANT</Text>
            <Text style={[styles.subTitle, { color: colors.textSecondary }]}>Items marked with high priority</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <DriveListItem 
                    item={item} 
                    onPress={openItem} 
                    onDelete={handleDeleteItem}
                />
              )}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="alert-circle-outline" size={80} color={colors.textTertiary} />
                  <Text style={driveStyles.emptyText}>No important items yet</Text>
                </View>
              }
              onRefresh={loadImportant}
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

// סטיילים מקומיים (Layout בלבד)
const styles = StyleSheet.create({
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    height: 60,
  },
  headerLeftSpace: { width: 40 },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
  },
  content: { flex: 1 },
  textHeader: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  subTitle: {
    fontSize: 13,
    marginTop: -8,
    marginLeft: 0,
  },
  emptyContainer: { alignItems: "center", marginTop: 100 },
});