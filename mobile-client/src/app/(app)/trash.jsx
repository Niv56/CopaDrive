import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../providers/AuthContext";
import {
  getTrashFiles,
  restoreFromTrash,
  deleteForever,
  emptyTrash,
  getDaysLeft,
} from "../../features/drive/services/fileService";
import DriveListItem from "../../features/drive/components/DriveListItem";

// ✅ Theme Imports
import { getDriveStyles } from "../../features/drive/styles/myDrive.styles";
import { useTheme } from "../providers/ThemeContext";

import { subscribeDriveRefresh, emitDriveRefresh } from "../../features/drive/services/driveEvents";

export default function TrashPage() {
  const router = useRouter();
  const { token } = useAuth();

  // ✅ Theme Hooks
  const { colors, isDarkMode } = useTheme();
  const driveStyles = useMemo(() => getDriveStyles(colors), [colors]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTrash = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getTrashFiles(token);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadTrash(); }, [loadTrash]);

  useEffect(() => {
    const unsubscribe = subscribeDriveRefresh(() => loadTrash());
    return unsubscribe;
  }, [loadTrash]);

  const closeScreen = useCallback(() => {
    try {
      if (typeof router.canGoBack === "function" && router.canGoBack()) {
        router.back();
      } else { router.replace("/home"); }
    } catch { router.replace("/home"); }
  }, [router]);

  const handleEmptyTrash = () => {
    Alert.alert(
      "Empty Trash?",
      "All items in the trash will be permanently deleted. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Empty Trash",
          style: "destructive",
          onPress: async () => {
            await emptyTrash(token);
            emitDriveRefresh();
          },
        },
      ]
    );
  };

  const handleDeleteForever = useCallback(async (item) => {
    Alert.alert(
      "Delete Forever?",
      `"${item.name}" will be gone forever.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Forever",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteForever(token, item.id);
              emitDriveRefresh();
            } catch (err) {
              Alert.alert("Error", "Could not delete item.");
            }
          }
        }
      ]
    );
  }, [token]);

  const handleRestore = useCallback(async (item) => {
    if (!item) return;
    try {
      await restoreFromTrash(token, item.id);
      emitDriveRefresh();
    } catch (err) {
      Alert.alert("Error", "Could not restore item.");
    }
  }, [token]);

  return (
    <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={handleEmptyTrash}
            disabled={items.length === 0}
            style={{ paddingLeft: 5 }}
          >
            <Text style={[styles.emptyAction, items.length === 0 && { opacity: 0.3 }]}>
              Empty
            </Text>
          </TouchableOpacity>

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
            <Text style={[driveStyles.homeTitle, { marginLeft: 0 }]}>TRASH</Text>

            <View style={[styles.infoBanner, { backgroundColor: colors.surface }]}>
              <Ionicons name="information-circle" size={16} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.primary }]}>Items are deleted forever after 30 days</Text>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <DriveListItem
                  item={{ ...item, displayDate: getDaysLeft(item.trashedAt) }}
                  onDelete={handleDeleteForever}
                  onRestore={handleRestore}
                  trashMode={true}
                />
              )}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="trash-outline" size={80} color={colors.textTertiary} />
                  <Text style={[driveStyles.emptyText, { color: colors.textTertiary }]}>Trash is empty</Text>
                </View>
              }
              onRefresh={loadTrash}
              refreshing={loading}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 15, height: 60,
  },
  emptyAction: { color: "#dc3545", fontWeight: "600", fontSize: 16 },
  closeButton: {
    width: 44, height: 44, justifyContent: "center", alignItems: "center", borderRadius: 22,
  },
  content: { flex: 1 },
  textHeader: { paddingHorizontal: 20, marginBottom: 15 },
  infoBanner: {
    flexDirection: "row", alignItems: "center",
    padding: 10, borderRadius: 10, marginTop: 10, gap: 8, alignSelf: "flex-start",
  },
  infoText: { fontSize: 12, fontWeight: "500" },
  emptyContainer: { alignItems: "center", marginTop: 100 },
});