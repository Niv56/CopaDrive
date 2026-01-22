import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Pressable,
  Alert,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../providers/AuthContext";
import { getFiles, moveToTrash } from "../../features/drive/services/fileService";
import { formatBytes } from "../../shared_code/utils/formatBytes";

import { getDriveStyles } from "../../features/drive/styles/myDrive.styles";
import { useTheme } from "../providers/ThemeContext";

import { Swipeable } from "react-native-gesture-handler";
import { subscribeDriveRefresh, emitDriveRefresh } from "../../features/drive/services/driveEvents";
import FilePreviewModal from "../../features/drive/components/FilePreviewModal";

import { getFileIconMeta } from "../../features/drive/utils/fileIcon";

/**
 * Displays a list of all files, sorted by size in descending order.
 * This view helps users manage their storage by identifying large files.
 */
export default function StoragePage() {
  const router = useRouter();
  const { token } = useAuth();

  const { colors, isDarkMode } = useTheme();
  const driveStyles = useMemo(() => getDriveStyles(colors), [colors]);

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  /** Fetches all user files to calculate storage usage */
  const loadFiles = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getFiles(token);
      setFiles(Array.isArray(data) ? data : []);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    const unsubscribe = subscribeDriveRefresh(() => loadFiles());
    return unsubscribe;
  }, [loadFiles]);

  /** * Filters out folders and sorts files by sizeBytes (largest first).
   */
  const sortedFiles = useMemo(() => {
    return [...(files || [])]
      .filter((f) => f?.type === "file")
      .sort((a, b) => (b.sizeBytes ?? 0) - (a.sizeBytes ?? 0));
  }, [files]);

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

  const openItem = useCallback((item) => {
    if (!item) return;
    if (item.type === "folder") return; // Folders don't occupy storage directly in this list

    setSelectedId(item.id || item._id);
    setPreviewOpen(true);
  }, []);

  const handleDeleteItem = useCallback(
    async (item) => {
      Alert.alert("Move to Trash?", `Remove "${item.name}"?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await moveToTrash(token, item.id);
              emitDriveRefresh(); // Notify other components of the deletion
            } catch (err) {
              Alert.alert("Error", "Could not delete item.");
            }
          },
        },
      ]);
    },
    [token]
  );

  return (
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
            <Text style={[driveStyles.homeTitle, { marginLeft: 0 }]}>STORAGE</Text>
            <Text style={[styles.subTitle, { color: colors.textSecondary }]}>
              Files using storage (descending)
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
          ) : (
            <FlatList
              data={sortedFiles}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <StorageListItem item={item} onPress={openItem} onDelete={handleDeleteItem} />
              )}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="cloud-done-outline" size={80} color={colors.textTertiary} />
                  <Text style={[driveStyles.emptyText, { color: colors.textTertiary }]}>
                    No files taking up storage.
                  </Text>
                </View>
              }
              onRefresh={loadFiles}
              refreshing={loading}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </SafeAreaView>

      <FilePreviewModal open={previewOpen} fileId={selectedId} onClose={() => setPreviewOpen(false)} />
    </View>
  );
}

/**
 * Individual list item with Swipeable "Delete" action.
 */
function StorageListItem({ item, onPress, onDelete }) {
  const swipeableRef = useRef(null);
  const { colors } = useTheme();

  const iconMeta = useMemo(() => {
    const meta = getFileIconMeta(
      item.name,
      item.mimeType,
      item.type === "folder"
    );

    // Ensure outline icons are used for consistency in this view
    let iconName = meta.icon;
    if (iconName !== "folder" && !iconName.endsWith("-outline")) {
      iconName = `${iconName}-outline`;
    }

    return { ...meta, icon: iconName };
  }, [item]);

  /** Renders the red "Delete" background button when swiping left */
  const renderLeftActions = (progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0.8, 1],
      extrapolate: "clamp",
    });
    const opacity = dragX.interpolate({
      inputRange: [0, 50],
      outputRange: [0, 1],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.leftActionContainer}>
        <Animated.View
          style={[
            styles.deleteActionAnim,
            { backgroundColor: colors.danger, opacity, transform: [{ scale }] },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.deleteButtonInner}
            onPress={() => {
              swipeableRef.current?.close();
              setTimeout(() => {
                if (onDelete) onDelete(item);
              }, 200);
            }}
          >
            <Ionicons name="trash-outline" size={24} color="white" />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      overshootLeft={false}
      friction={2}
      containerStyle={{ marginHorizontal: 20 }}
    >
      <Pressable
        onPress={() => onPress(item)}
        style={[
          styles.fileCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.fileRow}>
          <View style={styles.iconWrapper}>
            <Ionicons name={iconMeta.icon} size={24} color={iconMeta.color} />
          </View>

          <View style={styles.fileInfo}>
            <Text style={[styles.fileName, { color: colors.textPrimary }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.fileSize, { color: colors.textSecondary }]}>
              {formatBytes(item.sizeBytes)}
            </Text>
          </View>
        </View>
      </Pressable>
    </Swipeable>
  );
}

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
  textHeader: { paddingHorizontal: 20, marginBottom: 15 },
  subTitle: { fontSize: 13, marginTop: -8, marginLeft: 0 },
  listContent: { paddingBottom: 20 },
  fileCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  iconWrapper: { width: 42, alignItems: "flex-start" },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 16, fontWeight: "600", marginBottom: 2 },
  fileSize: { fontSize: 13, fontWeight: "600" },
  emptyContainer: { alignItems: "center", marginTop: 100 },
  leftActionContainer: { width: 100, justifyContent: "center", alignItems: "center" },
  deleteActionAnim: {
    width: 70,
    height: 60,
    borderRadius: 18,
    elevation: 2,
    marginRight: 10,
  },
  deleteButtonInner: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteText: { color: "white", fontWeight: "700", fontSize: 11, marginTop: 2 },
});