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

export default function DriveListItem({ item, onPress, onDelete }) {
  const isFolder = item.type === "folder";
  const { icon, color } = getFileIconMeta(item.name, item.mimeType, isFolder);

  const { token, user } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const driveStyles = useMemo(() => getDriveStyles(colors), [colors]);
  const styles = useMemo(() => getDriveListItemStyles(colors), [colors]);

  const swipeableRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [editOpen, setEditOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const dotsRef = useRef(null);
  const isStarred = !!item.starred;
  const isImportant = !!item.important;

  const isOwner = useMemo(() => {
    const ownerId = item?.ownerId || item?.owner;
    const myId = user?.id || user?._id;
    return String(ownerId) === String(myId);
  }, [item, user]);

  const closeMenu = () => setMenuOpen(false);

  const renderLeftActions = (progress, dragX) => {
    const scale = dragX.interpolate({ inputRange: [0, 80], outputRange: [0.8, 1], extrapolate: 'clamp' });
    const opacity = dragX.interpolate({ inputRange: [0, 50], outputRange: [0, 1], extrapolate: 'clamp' });

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

  const handleDownload = async () => {
    closeMenu();
    if (!token) return;
    try {
      const full = await getFileById(token, item.id);
      if (!full || !full.content) return;

      await downloadFile({
        content: full.content,
        mimeType: full.mimeType || "application/octet-stream",
        fileName: full.name || item.name || "file",
        isBase64: !String(full.mimeType).startsWith('text/')
      });
    } catch (e) {
      Alert.alert("Error", "Download failed.");
    }
  };

  const menuOptions = useMemo(() => {
    const options = [
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
    ];

    if (isOwner) {
      options.push({
        key: "delete",
        icon: "trash-outline",
        label: "MOVE TO TRASH",
        onPress: () => { closeMenu(); if (onDelete) onDelete(item); }
      });
    }

    return options;
  }, [token, item.id, item.name, isStarred, isImportant, onDelete, isOwner]);

  const openMenu = () => {
    if (!dotsRef.current) return setMenuOpen(true);
    dotsRef.current.measureInWindow((x, y, w, h) => {
      const { width: screenW, height: screenH } = Dimensions.get("window");
      const MENU_W = 260;
      const anchorX = x + w / 2;
      const anchorY = y + h / 2;
      setMenuPos({ top: anchorY - 100, left: anchorX - MENU_W - 12 });
      setMenuOpen(true);
    });
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={(onDelete && isOwner) ? renderLeftActions : undefined}
      overshootLeft={false}
      friction={2}
    >
      <Pressable style={driveStyles.fileCard} onPress={() => onPress && onPress(item)}>
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
        <Pressable ref={dotsRef} onPress={() => (menuOpen ? closeMenu() : openMenu())} hitSlop={14} style={{ padding: 6 }}>
          <Ionicons name="ellipsis-vertical" size={18} color={colors.textSecondary} />
        </Pressable>
      </Pressable>

      <Modal visible={menuOpen} transparent animationType="none">
        <Pressable style={styles.backdrop} onPress={closeMenu}>
          <BlurView intensity={22} tint={isDarkMode ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          <Pressable style={[styles.stackMenu, { top: menuPos.top, left: menuPos.left }]} onPress={(e) => e.stopPropagation()}>
            {menuOptions.map((opt) => (
              <TouchableOpacity key={opt.key} onPress={opt.onPress} activeOpacity={0.9} style={styles.stackBtn}>
                <Ionicons name={opt.icon} size={22} color={colors.textPrimary} style={styles.iconMargin} />
                <Text style={styles.stackLabel}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <EditItemModal visible={editOpen} item={item} onClose={() => setEditOpen(false)} />
      <ShareModal visible={shareOpen} item={item} onClose={() => setShareOpen(false)} />
    </Swipeable>
  );
}