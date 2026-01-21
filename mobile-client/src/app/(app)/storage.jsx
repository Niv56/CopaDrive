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
  Animated // ✅ הוספנו לאנימציה
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../providers/AuthContext";
// ✅ ייבוא מחיקה
import { getFiles, moveToTrash } from "../../features/drive/services/fileService";
import { formatBytes } from "../../shared_code/utils/formatBytes";
import { driveStyles } from "../../features/drive/styles/myDrive.styles";

// ✅ Swipeable
import { Swipeable } from "react-native-gesture-handler";

// ✅ auto-refresh bus
import { subscribeDriveRefresh, emitDriveRefresh } from "../../features/drive/services/driveEvents";

// ✅ Preview modal
import FilePreviewModal from "../../features/drive/components/FilePreviewModal";

export default function StoragePage() {
  const router = useRouter();
  const { token } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

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

  useEffect(() => {
    const unsubscribe = subscribeDriveRefresh(() => {
      loadFiles();
    });
    return unsubscribe;
  }, [loadFiles]);

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
    if (item.type === "folder") {
      Alert.alert("CopaDrive", "Folders view is coming soon.");
      return;
    }
    setSelectedId(item.id);
    setPreviewOpen(true);
  }, []);

  // ✅ פונקציית המחיקה
  const handleDeleteItem = useCallback(async (item) => {
    Alert.alert(
      "Move to Trash?",
      `Remove "${item.name}"?`,
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
    <View style={styles.modalContainer}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.modalHeader}>
          <View style={styles.headerLeftSpace} />
          <TouchableOpacity onPress={closeScreen} style={styles.closeButton} activeOpacity={0.7}>
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
              // ✅ שימוש ברכיב החדש שתומך בהחלקה
              renderItem={({ item }) => (
                <StorageListItem 
                  item={item} 
                  onPress={openItem} 
                  onDelete={handleDeleteItem} 
                />
              )}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="cloud-done-outline" size={80} color="#f0f0f0" />
                  <Text style={driveStyles.emptyText}>No files taking up storage.</Text>
                </View>
              }
              onRefresh={loadFiles}
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

// ✅ רכיב פנימי חדש שמטפל בהחלקה (בדיוק כמו ב-DriveListItem)
function StorageListItem({ item, onPress, onDelete }) {
  const swipeableRef = useRef(null);
  
  const isImage = item.mimeType?.startsWith("image");
  const iconName = isImage ? "image" : "document-text";
  const iconColor = isImage ? "#d93025" : "#4285F4";

  // לוגיקת החלקה (גרירה ימינה)
  const renderLeftActions = (progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0.8, 1],
      extrapolate: 'clamp',
    });

    const opacity = dragX.interpolate({
        inputRange: [0, 50],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    return (
      <View style={styles.leftActionContainer}>
        <Animated.View style={[styles.deleteActionAnim, { opacity, transform: [{ scale }] }]}>
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
    >
      <Pressable onPress={() => onPress(item)} style={styles.fileRow}>
        <View style={styles.iconWrapper}>
          <Ionicons name={iconName} size={24} color={iconColor} />
        </View>
        <View style={styles.fileInfo}>
          <Text style={styles.fileName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.fileSize}>{formatBytes(item.sizeBytes)}</Text>
        </View>
      </Pressable>
    </Swipeable>
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
    backgroundColor: 'white' // חובה בשביל ה-Swipeable
  },
  iconWrapper: { width: 45, alignItems: "flex-start" },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 16, color: "#212529", fontWeight: "500", marginBottom: 2 },
  fileSize: { fontSize: 13, color: "#6c757d", fontWeight: "600" },

  emptyContainer: { alignItems: "center", marginTop: 100 },

  // ✅ סגנונות להחלקה (מועתקים מ-DriveListItem לטובת עקביות)
  leftActionContainer: {
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteActionAnim: {
    width: 70, 
    height: 60, 
    borderRadius: 18,
    backgroundColor: "#ff3b30",
    elevation: 2,
    shadowColor: "#000", 
    shadowOpacity: 0.1, 
    shadowRadius: 3,
    marginRight: 10 
  },
  deleteButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  deleteText: {
    color: "white",
    fontWeight: "700",
    fontSize: 11,
    marginTop: 2
  }
});