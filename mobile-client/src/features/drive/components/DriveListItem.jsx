import React, { useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
  StyleSheet
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { getDriveStyles } from "../styles/myDrive.styles";
import { getDriveListItemStyles } from "../styles/driveListItem.styles";
import { useTheme } from "../../../app/providers/ThemeContext";

import { getFileIconMeta } from "../utils/fileIcon";
import { BlurView } from "expo-blur";
import { Swipeable } from "react-native-gesture-handler";

import { useAuth } from "../../../app/providers/AuthContext";
import { emitDriveRefresh } from "../services/driveEvents";
import {
  setStarred,
  setImportant,
  getFileById,
} from "../services/fileService";

import { downloadFile } from "../utils/downloadFile";
import ShareModal from "../modals/ShareModal";
import EditItemModal from "../modals/EditItemModal";

export default function DriveListItem({ item, onPress, onDelete, onRestore, trashMode = false }) {
  const isFolder = item.type === "folder";
  const { icon, color } = getFileIconMeta(item.name, item.mimeType, isFolder);

  const { token } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const driveStyles = useMemo(() => getDriveStyles(colors), [colors]);
  const styles = useMemo(() => getDriveListItemStyles(colors), [colors]);

  const swipeableRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [editOpen, setEditOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const isStarred = !!item.starred;
  const isImportant = !!item.important;
  const dotsRef = useRef(null);

  const closeMenu = () => setMenuOpen(false);

  const renderLeftActions = (progress, dragX) => {
    const scale = dragX.interpolate({ inputRange: [0, 80], outputRange: [0.8, 1], extrapolate: 'clamp' });
    const opacity = dragX.interpolate({ inputRange: [0, 50], outputRange: [0, 1], extrapolate: 'clamp' });

    // Trash mode: swipe to restore
    if (trashMode) {
      return (
        <View style={[styles.leftActionContainer, { backgroundColor: '#22c55e' }]}>
          <Animated.View style={[styles.deleteActionAnim, { opacity, transform: [{ scale }] }]}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.deleteButtonInner, { backgroundColor: '#22c55e' }]}
              onPress={() => {
                swipeableRef.current?.close();
                setTimeout(() => { if (onRestore) onRestore(item); }, 200);
              }}
            >
              <Ionicons name="refresh-outline" size={24} color="white" />
              <Text style={styles.deleteText}>Restore</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      );
    }

    // Normal mode: swipe to delete
    return (
      <View style={styles.leftActionContainer}>
        <Animated.View style={[styles.deleteActionAnim, { opacity, transform: [{ scale }] }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.deleteButtonInner}
            onPress={() => {
              swipeableRef.current?.close();
              setTimeout(() => { if (onDelete) onDelete(item); }, 200);
            }}
          >
            <Ionicons name="trash-outline" size={24} color="white" />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const comingSoon = (label) => { closeMenu(); Alert.alert("CopaDrive", `${label} (Coming soon)`); };

  const handleDownload = async () => {
    closeMenu();
    if (!token) return Alert.alert("Not logged in", "No token found.");
    if (item.type === "folder") return Alert.alert("CopaDrive", "Folders cannot be downloaded.");

    try {
      const full = await getFileById(token, item.id);

      if (!full || (!full.content && !full.url)) {
        return Alert.alert("CopaDrive", "No content available to download.");
      }

      const mime = full.mimeType || "";
      const isTextFile = mime.startsWith('text/') ||
        mime.includes('json') ||
        mime.includes('xml') ||
        mime.includes('javascript') ||
        mime.includes('html');

      await downloadFile({
        content: full.content,
        mimeType: mime || "application/octet-stream",
        fileName: full.name || item.name || "file",
        isBase64: !isTextFile
      });

    } catch (e) {
      console.error("Download failed inside DriveListItem:", e);
      Alert.alert("Download Failed", "Could not save the file.");
    }
  };

  const menuOptions = useMemo(() => {
    // Trash mode: only restore and delete forever
    if (trashMode) {
      return [
        {
          key: "restore", icon: "refresh-outline", label: "RESTORE",
          onPress: () => { closeMenu(); if (onRestore) onRestore(item); }
        },
        {
          key: "deleteForever", icon: "trash-outline", label: "DELETE FOREVER",
          onPress: () => { closeMenu(); if (onDelete) onDelete(item); }
        }
      ];
    }

    // Normal mode: full options
    return [
      { key: "share", icon: "share-social-outline", label: "SHARE", onPress: () => { closeMenu(); setShareOpen(true); } },
      {
        key: "star", icon: isStarred ? "star" : "star-outline", label: isStarred ? "REMOVE STAR" : "ADD TO STAR",
        onPress: async () => { if (!token) return; closeMenu(); try { await setStarred(token, item.id, !isStarred); emitDriveRefresh(); } catch (e) { } },
      },
      {
        key: "important", icon: isImportant ? "alert-circle" : "alert-circle-outline", label: isImportant ? "REMOVE IMPORTANT" : "ADD TO IMPORTANT",
        onPress: async () => { if (!token) return; closeMenu(); try { await setImportant(token, item.id, !isImportant); emitDriveRefresh(); } catch (e) { } },
      },
      { key: "download", icon: "download-outline", label: "DOWNLOAD", onPress: handleDownload },
      {
        key: "edit", icon: "pencil-outline", label: "EDIT",
        onPress: () => { closeMenu(); setEditOpen(true); },
      },
      {
        key: "delete", icon: "trash-outline", label: "MOVE TO TRASH",
        onPress: () => { closeMenu(); if (onDelete) onDelete(item); }
      }
    ];
  }, [token, item.id, item.name, isStarred, isImportant, onDelete, onRestore, trashMode]);

  const openMenu = () => {
    if (!dotsRef.current) return setMenuOpen(true);
    dotsRef.current.measureInWindow((x, y, w, h) => {
      const { width: screenW, height: screenH } = Dimensions.get("window");
      const MENU_W = 260;
      const BTN_H = 54;
      const GAP = 12;
      const MENU_H = menuOptions.length * BTN_H + (menuOptions.length - 1) * GAP;
      const anchorX = x + w / 2;
      const anchorY = y + h / 2;
      let left = anchorX - MENU_W - 12;
      let top = anchorY - MENU_H / 2;
      const PADDING = 10;
      left = Math.max(PADDING, Math.min(left, screenW - MENU_W - PADDING));
      top = Math.max(PADDING + 50, Math.min(top, screenH - MENU_H - PADDING));
      setMenuPos({ top, left });
      setMenuOpen(true);
    });
  };

  const StackOption = ({ icon, label, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={styles.stackBtn}
    >
      <Ionicons name={icon} size={22} color={colors.textPrimary} style={styles.iconMargin} />
      <Text style={styles.stackLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={(trashMode ? onRestore : onDelete) ? renderLeftActions : undefined}
      overshootLeft={false}
      friction={2}
    >
      <Pressable
        style={driveStyles.fileCard}
        onPress={() => onPress && onPress(item)}
      >
        <View style={driveStyles.iconContainer}>
          <Ionicons name={icon} size={28} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[driveStyles.fileName, { color: colors.textPrimary }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[driveStyles.fileInfo, { color: colors.textSecondary }]}>
            {isFolder ? "Folder" : "File"} • {item.displayDate || new Date(item.updatedAt).toLocaleDateString()}
          </Text>
        </View>
        <Pressable
          ref={dotsRef}
          onPress={() => (menuOpen ? closeMenu() : openMenu())}
          hitSlop={14}
          style={{ padding: 6 }}
        >
          <Ionicons name="ellipsis-vertical" size={18} color={colors.textSecondary} />
        </Pressable>
      </Pressable>

      <Modal visible={menuOpen} transparent animationType="none">
        <Pressable style={styles.backdrop} onPress={closeMenu}>
          <BlurView intensity={22} tint={isDarkMode ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          <Pressable
            style={[styles.stackMenu, { top: menuPos.top, left: menuPos.left }]}
            onPress={(e) => e.stopPropagation()}
          >
            {menuOptions.map((opt) => (
              <StackOption key={opt.key} icon={opt.icon} label={opt.label} onPress={opt.onPress} />
            ))}
          </Pressable>
        </Pressable>
      </Modal>
      <EditItemModal
        visible={editOpen}
        item={item}
        onClose={() => setEditOpen(false)}
      />

      <ShareModal
        visible={shareOpen}
        item={item}
        onClose={() => setShareOpen(false)}
      />
    </Swipeable>
  );
}