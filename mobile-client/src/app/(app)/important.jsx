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
  Pressable
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../providers/AuthContext";
import { getImportantFiles, moveToTrash } from "../../features/drive/services/fileService";
import DriveListItem from "../../features/drive/components/DriveListItem";

// ✅ ייבוא Theme
import { getDriveStyles } from "../../features/drive/styles/myDrive.styles";
import { useTheme } from "../providers/ThemeContext";

import { subscribeDriveRefresh, emitDriveRefresh } from "../../features/drive/services/driveEvents";
import FilePreviewModal from "../../features/drive/components/FilePreviewModal";

export default function ImportantPage() {
  const router = useRouter();
  const { token } = useAuth();
  
  // ✅ Theme
  const { colors, isDarkMode } = useTheme();
  const driveStyles = useMemo(() => getDriveStyles(colors), [colors]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ משתני ניווט תיקיות
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderPath, setFolderPath] = useState([]);

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

  useEffect(() => { loadImportant(); }, [loadImportant]);

  useEffect(() => {
    const unsubscribe = subscribeDriveRefresh(() => loadImportant());
    return unsubscribe;
  }, [loadImportant]);

  // ✅ סינון התצוגה: אם אנחנו בתיקייה, מציגים את התוכן שלה. אחרת, מציגים את רשימת החשובים.
  const displayItems = useMemo(() => {
    if (currentFolderId) {
       // בתוך תיקייה - מציגים רק מה שבתוכה (מתוך רשימת החשובים)
       // הערה: אם רוצים לראות את *כל* התוכן של התיקייה (גם לא חשובים), זה דורש קריאת API אחרת.
       // כאן אני מניח שמציגים רק פריטים חשובים שנמצאים בתוך התיקייה הזו.
       return items.filter(item => item.parentId === currentFolderId);
    }
    // ברשימה הראשית - מציגים הכל
    return items;
  }, [items, currentFolderId]);

  const closeScreen = useCallback(() => {
    try {
      if (typeof router.canGoBack === "function" && router.canGoBack()) {
        router.back();
      } else { router.replace("/home"); }
    } catch { router.replace("/home"); }
  }, [router]);

  const openItem = useCallback((item) => {
    if (!item) return;
    if (item.type === "folder") {
      // ✅ כניסה לתיקייה
      setCurrentFolderId(item.id);
      setFolderPath((prev) => [...prev, { id: item.id, name: item.name }]);
      return;
    }
    setSelectedId(item.id);
    setPreviewOpen(true);
  }, []);

  const handleDeleteItem = useCallback(async (item) => {
    Alert.alert("Move to Trash?", `Remove "${item.name}"?`, [
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

  // ✅ חזרה אחורה בתיקיות
  const handleBack = useCallback(() => {
    if (folderPath.length === 0) return;
    const newPath = folderPath.slice(0, -1);
    setFolderPath(newPath);
    setCurrentFolderId(newPath.length > 0 ? newPath[newPath.length - 1].id : null);
  }, [folderPath]);

  // ✅ ניווט בפירורים
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
            <Text style={[driveStyles.homeTitle, { marginLeft: 0 }]}>IMPORTANT</Text>
            <Text style={[styles.subTitle, { color: colors.textSecondary }]}>Items marked with high priority</Text>
          </View>

          {/* ✅ Breadcrumb Navigation */}
          {folderPath.length > 0 && (
            <View style={driveStyles.breadcrumbContainer}>
            <Pressable onPress={handleBack} style={driveStyles.backButton}>
                <Ionicons name="arrow-back" size={20} color={colors.primary} />
            </Pressable>

            <Pressable onPress={() => navigateToBreadcrumb(-1)}>
                <Text style={driveStyles.breadcrumbText}>Important</Text>
            </Pressable>

            {folderPath.map((folder, index) => (
                <View key={folder.id} style={driveStyles.breadcrumbItem}>
                <Text style={driveStyles.breadcrumbSeparator}>/</Text>
                <Pressable onPress={() => navigateToBreadcrumb(index)}>
                    <Text style={[
                    driveStyles.breadcrumbText,
                    index === folderPath.length - 1 && driveStyles.breadcrumbActive
                    ]} numberOfLines={1}>
                    {folder.name}
                    </Text>
                </Pressable>
                </View>
            ))}
            </View>
          )}

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
          ) : (
            <FlatList
              data={displayItems}
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
                  <Text style={[driveStyles.emptyText, { color: colors.textTertiary }]}>
                      {currentFolderId ? "No important items in this folder" : "No important items yet"}
                  </Text>
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
  textHeader: { paddingHorizontal: 20, marginBottom: 15 },
  subTitle: { fontSize: 13, marginTop: -8, marginLeft: 0 },
  emptyContainer: { alignItems: "center", marginTop: 100 },
});