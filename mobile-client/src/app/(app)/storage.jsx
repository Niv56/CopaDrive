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
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../providers/AuthContext";
import { getFiles } from "../../features/drive/services/fileService";
import { formatBytes } from "../../shared_code/utils/formatBytes";
import { driveStyles } from "../../features/drive/styles/myDrive.styles";

// ✅ auto-refresh bus
import { subscribeDriveRefresh } from "../../features/drive/services/driveEvents";

export default function StoragePage() {
  const router = useRouter();
  const { token } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFiles = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getFiles(token);
      setFiles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load files for storage view", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // ✅ listen for global refresh events
  useEffect(() => {
    const unsubscribe = subscribeDriveRefresh(() => {
      loadFiles();
    });
    return unsubscribe;
  }, [loadFiles]);

  const sortedFiles = useMemo(() => {
    return [...files]
      .filter((f) => f.type === "file")
      .sort((a, b) => (b.sizeBytes ?? 0) - (a.sizeBytes ?? 0));
  }, [files]);

  const renderItem = ({ item }) => {
    const isImage = item.mimeType?.startsWith("image");
    const iconName = isImage ? "image" : "document-text";
    const iconColor = isImage ? "#d93025" : "#4285F4";

    return (
      <View style={styles.fileRow}>
        <View style={styles.iconWrapper}>
          <Ionicons name={iconName} size={24} color={iconColor} />
        </View>
        <View style={styles.fileInfo}>
          <Text style={styles.fileName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.fileSize}>{formatBytes(item.sizeBytes)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.modalContainer}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.modalHeader}>
          <View style={styles.headerLeftSpace} />
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close-outline" size={32} color="#6c757d" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.textHeader}>
            <Text style={[driveStyles.homeTitle, { marginLeft: 0 }]}>STORAGE</Text>
            <Text style={styles.subTitle}>Files using storage (descending)</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#0d6efd" style={{ marginTop: 50 }} />
          ) : (
            <FlatList
              data={sortedFiles}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="cloud-done-outline" size={80} color="#f0f0f0" />
                  <Text style={driveStyles.emptyText}>No files taking up storage.</Text>
                </View>
              }
              onRefresh={loadFiles}
              refreshing={loading}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: "#ffffff" },
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
    backgroundColor: "#f8f9fa",
  },
  content: { flex: 1 },
  textHeader: { paddingHorizontal: 20, marginBottom: 15 },
  subTitle: { fontSize: 13, color: "#6c757d", marginTop: -8, marginLeft: 0 },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f8f9fa",
  },
  iconWrapper: { width: 45, alignItems: "flex-start" },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 16, color: "#212529", fontWeight: "500", marginBottom: 2 },
  fileSize: { fontSize: 13, color: "#6c757d", fontWeight: "600" },
  emptyContainer: { alignItems: "center", marginTop: 100 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
