import React, { useMemo, useCallback, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Pressable, Alert, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useMyDrive } from "../hooks/useMyDrive";
import DriveListItem from "../components/DriveListItem";
import FilePreviewModal from "../components/FilePreviewModal";
import { useAuth } from "../../../app/providers/AuthContext";
import { moveToTrash } from "../services/fileService";
import { emitDriveRefresh } from "../services/driveEvents";
import { useTheme } from "../../../app/providers/ThemeContext";

export default function MainHomePage() {
    const [currentFolderId, setCurrentFolderId] = useState(null);
    const [folderPath, setFolderPath] = useState([]);

    const { items, loading, refreshing, onRefresh } = useMyDrive();
    const { token } = useAuth();
    const { colors, isDarkMode } = useTheme();

    // סינון פריטים לפי התיקייה הנוכחית
    const currentItems = useMemo(() => {
        if (!items) return [];
        return items.filter(item => {
            if (currentFolderId === null) return !item.parentId;
            return item.parentId === currentFolderId;
        });
    }, [items, currentFolderId]);

    const folders = useMemo(() => currentItems.filter((i) => i?.type === "folder"), [currentItems]);
    const files = useMemo(() => currentItems.filter((i) => i?.type === "file"), [currentItems]);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    // --- לוגיקת ניווט (הפונקציות שהיו חסרות) ---

    const openItem = useCallback((item) => {
        if (!item) return;
        if (item.type === "folder") {
            setCurrentFolderId(item.id);
            setFolderPath((prev) => [...prev, { id: item.id, name: item.name }]);
            return;
        }
        setSelectedId(item.id);
        setPreviewOpen(true);
    }, []);

    const handleBack = useCallback(() => {
        if (folderPath.length === 0) return;

        const newPath = [...folderPath];
        newPath.pop(); // הסרת התיקייה האחרונה
        setFolderPath(newPath);

        // אם חזרנו לשורש, ה-ID הוא null, אחרת הוא ה-ID של התיקייה האחרונה שנשארה בנתיב
        const parentFolder = newPath[newPath.length - 1];
        setCurrentFolderId(parentFolder ? parentFolder.id : null);
    }, [folderPath]);

    const navigateToBreadcrumb = useCallback((index) => {
        if (index === -1) {
            // חזרה ל-Home
            setCurrentFolderId(null);
            setFolderPath([]);
        } else {
            // חזרה לתיקייה ספציפית בנתיב
            const newPath = folderPath.slice(0, index + 1);
            setFolderPath(newPath);
            setCurrentFolderId(newPath[index].id);
        }
    }, [folderPath]);

    const handleDeleteItem = useCallback(async (item) => {
        Alert.alert("Move to Trash?", `Delete "${item.name}"?`, [
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
                },
            },
        ]);
    }, [token]);

    // מסך טעינה
    if (loading && (!items || items.length === 0)) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    // רכיב כותרת פנימי
    const SectionHeader = ({ icon, title }) => (
        <View style={[
            styles.sectionTitleCard,
            {
                backgroundColor: isDarkMode ? 'rgba(20, 20, 30, 0.6)' : 'rgba(255, 255, 255, 0.65)',
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.4)'
            }
        ]}>
            <Ionicons name={icon} size={14} color={isDarkMode ? '#FFFFFF' : '#1A2A3A'} />
            <Text style={[
                styles.sectionTitle,
                {
                    color: isDarkMode ? '#FFFFFF' : '#1A2A3A',
                    textShadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
                }
            ]}>
                {title.toUpperCase()}
            </Text>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <FlatList
                data={[]} // השארתי ריק כי כל התוכן ב-Header, אך שים לב שברשימות גדולות עדיף להעביר את הקבצים ל-data
                ListHeaderComponent={
                    <View style={{ paddingHorizontal: 15, paddingTop: 10 }}>

                        {/* Breadcrumbs */}
                        {(folderPath.length > 0 || currentFolderId !== null) && (
                            <View style={styles.breadcrumbContainer}>
                                <Pressable onPress={handleBack} style={[styles.backButton, { backgroundColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }]}>
                                    <Ionicons name="arrow-back" size={18} color={colors.textPrimary} />
                                </Pressable>
                                <Pressable onPress={() => navigateToBreadcrumb(-1)}>
                                    <Text style={[styles.breadcrumbText, { color: colors.textSecondary }]}>Home</Text>
                                </Pressable>
                                {folderPath.map((folder, index) => (
                                    <View key={folder.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Ionicons name="chevron-forward" size={14} color={colors.textTertiary} />
                                        <Pressable onPress={() => navigateToBreadcrumb(index)}>
                                            <Text
                                                style={[
                                                    styles.breadcrumbText,
                                                    {
                                                        color: index === folderPath.length - 1 ? colors.primary : colors.textSecondary,
                                                        fontWeight: index === folderPath.length - 1 ? '700' : '400'
                                                    }
                                                ]}
                                                numberOfLines={1}
                                            >
                                                {folder.name}
                                            </Text>
                                        </Pressable>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Folders Section */}
                        {folders.length > 0 && (
                            <View style={styles.sectionWrapper}>
                                <SectionHeader icon="folder-open-outline" title="Suggested folders" />
                                {folders.map((item) => (
                                    <DriveListItem key={item.id} item={item} onPress={openItem} onDelete={handleDeleteItem} />
                                ))}
                            </View>
                        )}

                        {/* Files Section */}
                        {files.length > 0 && (
                            <View style={styles.sectionWrapper}>
                                <SectionHeader icon="document-text-outline" title="Suggested files" />
                                {files.map((item) => (
                                    <DriveListItem key={item.id} item={item} onPress={openItem} onDelete={handleDeleteItem} />
                                ))}
                            </View>
                        )}

                        {/* Empty State */}
                        {folders.length === 0 && files.length === 0 && (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="cloud-offline-outline" size={60} color={colors.textTertiary} />
                                <Text style={{ marginTop: 10, color: colors.textSecondary, fontSize: 16 }}>
                                    Empty Folder
                                </Text>
                            </View>
                        )}
                    </View>
                }
                refreshing={refreshing}
                onRefresh={onRefresh}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            />

            <FilePreviewModal
                open={previewOpen}
                fileId={selectedId}
                onClose={() => setPreviewOpen(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    breadcrumbContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 15,
        gap: 5
    },
    backButton: {
        padding: 6,
        borderRadius: 8,
        marginRight: 5
    },
    breadcrumbText: {
        fontSize: 15,
        marginHorizontal: 2
    },
    sectionWrapper: {
        marginBottom: 25
    },
    sectionTitleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingVertical: 3,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: 12,
        marginLeft: 2,
        gap: 6,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.2,
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 80,
        opacity: 0.7
    }
});