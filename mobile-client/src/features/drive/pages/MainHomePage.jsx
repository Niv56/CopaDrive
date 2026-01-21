import React, { useMemo, useCallback, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useMyDrive } from "../hooks/useMyDrive";
import DriveListItem from "../components/DriveListItem";

// ✅ ייבוא Theme
import { getDriveStyles } from "../styles/myDrive.styles";
import { useTheme } from "../../../app/providers/ThemeContext";

import FilePreviewModal from "../components/FilePreviewModal";
import { useAuth } from "../../../app/providers/AuthContext";
import { moveToTrash } from "../services/fileService";
import { emitDriveRefresh } from "../services/driveEvents";

export default function MainHomePage() {
  // ✅ משתני State לניהול תיקיות (היו חסרים בקוד המקורי שלך)
  const [currentFolderId, setCurrentFolderId] = useState(null); 
  const [folderPath, setFolderPath] = useState([]);

  const { items, loading, refreshing, onRefresh } = useMyDrive();
  const { token } = useAuth();
  
  // ✅ שימוש ב-Theme
  const { colors } = useTheme();
  const driveStyles = useMemo(() => getDriveStyles(colors), [colors]);

  // ✅ סינון הפריטים לפי התיקייה הנוכחית (אחרת כל הקבצים מופיעים תמיד)
  const currentItems = useMemo(() => {
      if (!items) return [];
      return items.filter(item => {
          // אם אנחנו בתיקייה הראשית (null), נציג פריטים ללא parentId
          if (currentFolderId === null) return !item.parentId; 
          // אחרת, נציג פריטים שהאבא שלהם הוא התיקייה הנוכחית
          return item.parentId === currentFolderId;
      });
  }, [items, currentFolderId]);

  const folders = useMemo(() => currentItems.filter((i) => i?.type === "folder"), [currentItems]);
  const files = useMemo(() => currentItems.filter((i) => i?.type === "file"), [currentItems]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const openItem = useCallback((item) => {
    if (!item) return;

    if (item.type === "folder") {
      // ✅ כניסה לתיקייה (תיקון: item.id ולא itemId)
      setCurrentFolderId(item.id);
      setFolderPath((prev) => [...prev, { id: item.id, name: item.name }]);
      return;
    }

    // פתיחת קובץ
    setSelectedId(item.id);
    setPreviewOpen(true);
  }, []);

  const handleDeleteItem = useCallback(async (item) => {
    Alert.alert("Move to Trash?", `Delete "${item.name}"?`, [
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

  // ✅ ניווט בפירורי לחם
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

  if (loading && (!items || items.length === 0)) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />;
  }

  const SectionHeader = ({ icon, title, style }) => (
    <View style={[driveStyles.sectionHeader, style]}>
        <Ionicons name={icon} size={18} color={colors.textPrimary} />
        <Text style={driveStyles.sectionText}>{title}</Text>
    </View>
  );

  return (
    <>
      {/* ✅ Breadcrumb Navigation */}
      {folderPath.length > 0 && (
        <View style={driveStyles.breadcrumbContainer}>
          <Pressable onPress={handleBack} style={driveStyles.backButton}>
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
          </Pressable>

          <Pressable onPress={() => navigateToBreadcrumb(-1)}>
            <Text style={driveStyles.breadcrumbText}>Home</Text>
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

      <FlatList
        data={[]}
        ListHeaderComponent={
          <View>
            {/* טיפול במצב של תיקייה ריקה */}
            {folders.length === 0 && files.length === 0 && (
                <Text style={driveStyles.emptyText}>Empty Folder</Text>
            )}

            {folders.length > 0 && (
                <>
                    <SectionHeader icon="folder-outline" title="Folders" />
                    {folders.map((item) => (
                    <DriveListItem key={item.id} item={item} onPress={openItem} onDelete={handleDeleteItem} />
                    ))}
                </>
            )}

            {files.length > 0 && (
                <>
                    <SectionHeader icon="document-text-outline" title="Files" style={{ marginTop: 20 }} />
                    {files.map((item) => (
                    <DriveListItem key={item.id} item={item} onPress={openItem} onDelete={handleDeleteItem} />
                    ))}
                </>
            )}
          </View>
        }
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={{ paddingBottom: 150 }}
        showsVerticalScrollIndicator={false}
      />

      <FilePreviewModal
        open={previewOpen}
        fileId={selectedId}ר
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
}