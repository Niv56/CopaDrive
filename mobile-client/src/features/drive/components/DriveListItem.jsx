import React, { useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Dimensions,
  Animated
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ✅ Theme Imports
import { getDriveStyles } from "../styles/myDrive.styles";
import { useTheme } from "../../../app/providers/ThemeContext";

import { getFileIconMeta } from "../utils/fileIcon";
import { BlurView } from "expo-blur";
import { Swipeable } from "react-native-gesture-handler";

import { useAuth } from "../../../app/providers/AuthContext";
import { emitDriveRefresh } from "../services/driveEvents";
import {
  setStarred,
  setImportant,
  renameItem,
  getFileById,
} from "../services/fileService";

import { downloadAndShareBase64 } from "../utils/downloadFile";
import ShareModal from "../modals/ShareModal";

export default function DriveListItem({ item, onPress, onDelete }) {
  const isFolder = item.type === "folder";
  const { icon, color } = getFileIconMeta(item.name, item.mimeType, isFolder);

  const { token } = useAuth();

  // ✅ Theme Hooks
  const { colors, isDarkMode } = useTheme();
  const driveStyles = useMemo(() => getDriveStyles(colors), [colors]);

  const swipeableRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(item.name || "");
  const [shareOpen, setShareOpen] = useState(false);

  const isStarred = !!item.starred;
  const isImportant = !!item.important;
  const dotsRef = useRef(null);

  const closeMenu = () => setMenuOpen(false);

  const renderLeftActions = (progress, dragX) => {
    const scale = dragX.interpolate({ inputRange: [0, 80], outputRange: [0.8, 1], extrapolate: 'clamp' });
    const opacity = dragX.interpolate({ inputRange: [0, 50], outputRange: [0, 1], extrapolate: 'clamp' });

    return (
      <View style={localStyles.leftActionContainer}>
        <Animated.View style={[localStyles.deleteActionAnim, { backgroundColor: colors.danger, opacity, transform: [{ scale }] }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={localStyles.deleteButtonInner}
            onPress={() => {
              swipeableRef.current?.close();
              setTimeout(() => { if (onDelete) onDelete(item); }, 200);
            }}
          >
            <Ionicons name="trash-outline" size={24} color="white" />
            <Text style={localStyles.deleteText}>Delete</Text>
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
      if (!full?.content) return Alert.alert("CopaDrive", "No content available.");

      await downloadAndShareBase64({
        base64: full.content,
        mimeType: full.mimeType || "application/octet-stream",
        fileName: full.name || item.name || "file",
      });
    } catch (e) { Alert.alert("Download Failed", e?.message || "Could not download file"); }
  };

  const menuOptions = useMemo(() => {
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
        key: "rename", icon: "pencil-outline", label: "RENAME",
        onPress: () => { closeMenu(); setRenameValue(item.name || ""); setRenameOpen(true); },
      },
      {
        key: "delete", icon: "trash-outline", label: "DELETE",
        onPress: () => { closeMenu(); if (onDelete) onDelete(item); }
      }
    ];
  }, [token, item.id, item.name, isStarred, isImportant, onDelete]);

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

  const doRenameSubmit = async () => {
    const next = renameValue.trim();
    if (!next) return;
    try { await renameItem(token, item.id, next); setRenameOpen(false); emitDriveRefresh(); }
    catch (e) { Alert.alert("Rename Failed", e?.message); }
  };

  // רכיב פנימי לתפריט (כדי להשתמש בצבעים)
  const StackOption = ({ icon, label, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[localStyles.stackBtn, { backgroundColor: colors.card }]} // ✅ רקע דינמי
    >
      <Ionicons name={icon} size={22} color={colors.textPrimary} style={{ marginRight: 12 }} />
      <Text style={[localStyles.stackLabel, { color: colors.textPrimary }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={onDelete ? renderLeftActions : undefined}
      overshootLeft={false}
      friction={2}
    >
      <Pressable
        style={driveStyles.fileCard} // ✅ שימוש בסטיילים הדינמיים
        onPress={() => onPress && onPress(item)}
      >
        <View style={driveStyles.iconContainer}>
          <Ionicons name={icon} size={28} color={color} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={driveStyles.fileName} numberOfLines={1}>{item.name}</Text>
          <Text style={driveStyles.fileInfo}>
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

      {/* תפריט פעולות */}
      <Modal visible={menuOpen} transparent animationType="none">
        <Pressable style={localStyles.backdrop} onPress={closeMenu}>
          <BlurView intensity={22} tint={isDarkMode ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          <Pressable style={[localStyles.stackMenu, { top: menuPos.top, left: menuPos.left }]}>
            {menuOptions.map((opt) => (
              <StackOption key={opt.key} {...opt} />
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* מודל שינוי שם */}
      <Modal visible={renameOpen} transparent animationType="fade">
        <Pressable style={localStyles.renameBackdrop} onPress={() => setRenameOpen(false)}>
          <Pressable style={[localStyles.renameCard, { backgroundColor: colors.card }]}>
            <Text style={[localStyles.renameTitle, { color: colors.textPrimary }]}>RENAME</Text>
            <TextInput
              value={renameValue}
              onChangeText={setRenameValue}
              style={[localStyles.renameInput, {
                backgroundColor: colors.surface,
                color: colors.textPrimary,
                borderColor: colors.border
              }]}
              placeholderTextColor={colors.textTertiary}
              autoFocus
            />
            <View style={localStyles.renameActions}>
              <TouchableOpacity onPress={() => setRenameOpen(false)} style={localStyles.renameBtnGhost}>
                <Text style={localStyles.renameGhostText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={doRenameSubmit} style={[localStyles.renameBtnPrimary, { backgroundColor: colors.primary }]}>
                <Text style={localStyles.renamePrimaryText}>SAVE</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Share modal */}
      <ShareModal
        visible={shareOpen}
        item={item}
        onClose={() => setShareOpen(false)}
      />
    </Swipeable>
  );
}

const localStyles = StyleSheet.create({
  backdrop: { flex: 1 },
  stackMenu: { position: "absolute", width: 260, gap: 12 },
  stackBtn: {
    height: 54, flexDirection: "row", alignItems: "center", justifyContent: "flex-start",
    paddingVertical: 12, paddingHorizontal: 18, borderRadius: 30,
    elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18, shadowRadius: 5, minWidth: 260,
  },
  stackLabel: { flex: 1, textAlign: "left", fontSize: 12, letterSpacing: 1.2 },

  renameBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", padding: 24 },
  renameCard: { borderRadius: 18, padding: 18 },
  renameTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12, letterSpacing: 1.5 },
  renameInput: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 16 },
  renameActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 14 },
  renameBtnGhost: { paddingVertical: 10, paddingHorizontal: 14 },
  renameGhostText: { color: "#6c757d", fontWeight: "700", letterSpacing: 1.5 },
  renameBtnPrimary: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
  renamePrimaryText: { color: "white", fontWeight: "700", letterSpacing: 1.5 },

  leftActionContainer: { width: 100, justifyContent: 'center', alignItems: 'center' },
  deleteActionAnim: {
    width: 70, height: 60, borderRadius: 18, elevation: 2,
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 3, marginRight: 10
  },
  deleteButtonInner: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  deleteText: { color: "white", fontWeight: "700", fontSize: 11, marginTop: 2 }
});