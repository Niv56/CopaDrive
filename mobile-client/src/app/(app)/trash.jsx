import React, { useState, useEffect, useCallback } from "react";
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
import { driveStyles } from "../../features/drive/styles/myDrive.styles";

// ✅ auto-refresh bus
import {
  subscribeDriveRefresh,
  emitDriveRefresh,
} from "../../features/drive/services/driveEvents";

// ✅ Preview modal
import FilePreviewModal from "../../features/drive/components/FilePreviewModal";

export default function TrashPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const loadTrash = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getTrashFiles(token);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load trash:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadTrash();
  }, [loadTrash]);

  useEffect(() => {
    const unsubscribe = subscribeDriveRefresh(() => {
      loadTrash();
    });
    return unsubscribe;
  }, [loadTrash]);

  // ✅ X always closes reliably
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

  const openOrActions = (item) => {
    if (!item) return;

    Alert.alert("Trash Item", item.name, [
      {
        text: "Preview",
        onPress: () => {
          setSelectedId(item.id);
          setPreviewOpen(true);
        },
      },
      {
        text: "Restore",
        onPress: async () => {
          await restoreFromTrash(token, item.id);
          emitDriveRefresh();
        },
      },
      {
        text: "Delete Forever",
        style: "destructive",
        onPress: async () => {
          await deleteForever(token, item.id);
          emitDriveRefresh();
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View style={styles.modalContainer}>
      <StatusBar barStyle="dark-content" />
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

          <TouchableOpacity onPress={closeScreen} style={styles.closeButton} activeOpacity={0.7}>
            <Ionicons name="close-outline" size={32} color="#6c757d" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.textHeader}>
            <Text style={[driveStyles.homeTitle, { marginLeft: 0 }]}>TRASH</Text>

            <View style={styles.infoBanner}>
              <Ionicons name="information-circle" size={16} color="#0d6efd" />
              <Text style={styles.infoText}>Items are deleted forever after 30 days</Text>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#0d6efd" style={{ marginTop: 50 }} />
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <DriveListItem
                  item={{ ...item, displayDate: getDaysLeft(item.trashedAt) }}
                  onPress={openOrActions}
                />
              )}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="trash-outline" size={80} color="#f0f0f0" />
                  <Text style={driveStyles.emptyText}>Trash is empty</Text>
                </View>
              }
              onRefresh={loadTrash}
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
  modalContainer: { flex: 1, backgroundColor: "#ffffff" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    height: 60,
  },
  emptyAction: { color: "#dc3545", fontWeight: "600", fontSize: 16 },
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
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e7f1ff",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    gap: 8,
    alignSelf: "flex-start",
  },
  infoText: { fontSize: 12, color: "#0d6efd", fontWeight: "500" },
  emptyContainer: { alignItems: "center", marginTop: 100 },
});
