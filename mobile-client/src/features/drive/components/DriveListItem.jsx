import React, { useRef, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TouchableOpacity,
  Alert,
  Animated,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Swipeable } from "react-native-gesture-handler";

import { getDriveStyles } from "../styles/myDrive.styles";
import { getDriveListItemStyles } from "../styles/driveListItem.styles";
import { useTheme } from "../../../app/providers/ThemeContext";
import { getFileIconMeta } from "../utils/fileIcon";
import { useAuth } from "../../../app/providers/AuthContext";
import { getFileById, setStarred, setImportant } from "../services/fileService";
import { downloadFile } from "../utils/downloadFile";
import { getPermissions } from "../services/permissionService";

import ShareModal from "../modals/ShareModal";
import EditItemModal from "../modals/EditItemModal";

/* ---------------- Helpers ---------------- */

/** Standardizes permission strings to a known set of roles */
function normalizeRole(r) {
  const x = String(r || "").toLowerCase();
  if (x === "owner") return "owner";
  if (x === "editor") return "editor";
  return "viewer";
}

/** Determines the user's role on the item from various metadata fields */
function extractRole(item, myId) {
  if (item?.role) return normalizeRole(item.role);
  if (item?.myRole) return normalizeRole(item.myRole);
  if (item?.permissionRole) return normalizeRole(item.permissionRole);

  if (Array.isArray(item?.permissions) && myId) {
    const p = item.permissions.find(
      (pp) => String(pp?.userId || pp?._id || pp?.id) === String(myId)
    );
    if (p?.role) return normalizeRole(p.role);
  }

  return "viewer";
}

/** Safely extracts a user ID from a permission object */
function pickUserIdFromPerm(p) {
  return p?.userId || p?.user?._id || p?.user?.id || p?.sharedWithId || p?._id;
}

/* ---------------- Component ---------------- */

export default function DriveListItem({
  item,
  onPress,
  onDelete,
  onRestore,
  trashMode = false,
}) {
  const { token, user } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const driveStyles = useMemo(() => getDriveStyles(colors), [colors]);
  const styles = useMemo(() => getDriveListItemStyles(colors), [colors]);

  const isFolder = item.type === "folder";
  const { icon, color } = getFileIconMeta(item.name, item.mimeType, isFolder);
  const myId = user?.id || user?._id;

  const isOwner = useMemo(() => {
    const ownerId = item?.ownerId || item?.owner;
    return String(ownerId) === String(myId);
  }, [item, myId]);

  const effectiveRole = useMemo(() => {
    if (isOwner) return "owner";
    return extractRole(item, myId);
  }, [item, myId, isOwner]);

  const [resolvedRole, setResolvedRole] = useState(null);
  const effectiveRoleResolved = resolvedRole || effectiveRole;
  const canUserEditResolved = effectiveRoleResolved === "owner" || effectiveRoleResolved === "editor";

  const swipeableRef = useRef(null);
  const dotsRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [editOpen, setEditOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const isStarred = !!item.starred;
  const isImportant = !!item.important;

  const closeMenu = () => setMenuOpen(false);

  /** Downloads the full file content and saves it locally */
  const handleDownload = useCallback(async () => {
    closeMenu();
    if (!token) return;
    try {
      const full = await getFileById(token, item.id || item._id);
      if (!full || !full.content) return;

      await downloadFile({
        content: full.content,
        mimeType: full.mimeType || "application/octet-stream",
        fileName: full.name || item.name || "file",
        isBase64: !String(full.mimeType).startsWith("text/"),
      });
    } catch (e) {
      Alert.alert("Error", "Download failed.");
    }
  }, [token, item]);

  /** Fetches specific permissions if they aren't provided in the initial item load */
  const ensureRole = useCallback(async () => {
    if (!token || isOwner || resolvedRole) return;

    const alreadyHasRole = item?.role || item?.myRole || item?.permissionRole || Array.isArray(item?.permissions);
    if (alreadyHasRole) return;

    try {
      const perms = await getPermissions(token, item.id || item._id);
      const myPerm = Array.isArray(perms)
        ? perms.find((p) => String(pickUserIdFromPerm(p)) === String(myId))
        : null;
      setResolvedRole(normalizeRole(myPerm?.role));
    } catch (e) {
      setResolvedRole("viewer");
    }
  }, [token, item, myId, isOwner, resolvedRole]);

  /** Renders the background buttons during a swipe gesture */
  const renderLeftActions = (progress, dragX) => {
    const scale = dragX.interpolate({ inputRange: [0, 80], outputRange: [0.8, 1], extrapolate: "clamp" });
    const opacity = dragX.interpolate({ inputRange: [0, 50], outputRange: [0, 1], extrapolate: "clamp" });

    return (
      <View style={[styles.leftActionContainer, trashMode && { backgroundColor: "#22c55e" }]}>
        <Animated.View style={[styles.deleteActionAnim, { opacity, transform: [{ scale }] }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.deleteButtonInner, trashMode && { backgroundColor: "#22c55e" }]}
            onPress={() => {
              swipeableRef.current?.close();
              setTimeout(() => (trashMode ? onRestore?.(item) : onDelete?.(item)), 200);
            }}
          >
            <Ionicons name={trashMode ? "refresh-outline" : "trash-outline"} size={24} color="white" />
            <Text style={styles.deleteText}>{trashMode ? "Restore" : "Delete"}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  /** Dynamically generates context menu options based on user role and trash state */
  const menuOptions = useMemo(() => {
    if (trashMode) {
      return [
        { key: "restore", icon: "refresh-outline", label: "RESTORE", onPress: () => { closeMenu(); onRestore?.(item); } },
        { key: "deleteForever", icon: "trash-outline", label: "DELETE FOREVER", onPress: () => { closeMenu(); onDelete?.(item); } },
      ];
    }

    const options = [
      { key: "share", icon: "share-social-outline", label: "SHARE", onPress: () => { closeMenu(); setShareOpen(true); } },
      {
        key: "star",
        icon: isStarred ? "star" : "star-outline",
        label: isStarred ? "REMOVE STAR" : "ADD TO STAR",
        onPress: async () => { closeMenu(); try { await setStarred(token, item.id || item._id, !isStarred); } catch { } },
      },
      {
        key: "important",
        icon: isImportant ? "alert-circle" : "alert-circle-outline",
        label: isImportant ? "REMOVE IMPORTANT" : "ADD TO IMPORTANT",
        onPress: async () => { closeMenu(); try { await setImportant(token, item.id || item._id, !isImportant); } catch { } },
      },
      { key: "download", icon: "download-outline", label: "DOWNLOAD", onPress: handleDownload },
    ];

    if (canUserEditResolved) {
      options.push({ key: "edit", icon: "pencil-outline", label: "EDIT", onPress: () => { closeMenu(); setEditOpen(true); } });
    }

    if (isOwner) {
      options.push({ key: "delete", icon: "trash-outline", label: "MOVE TO TRASH", onPress: () => { closeMenu(); onDelete?.(item); } });
    }

    return options;
  }, [trashMode, isStarred, isImportant, token, item, handleDownload, canUserEditResolved, isOwner, onDelete, onRestore]);

  /** Calculates the anchor position for the context menu relative to the button pressed */
  const openMenu = async () => {
    await ensureRole();
    if (!dotsRef.current) return setMenuOpen(true);

    dotsRef.current.measureInWindow((x, y, w, h) => {
      const MENU_W = 260;
      const screenHeight = Dimensions.get('window').height;
      const screenWidth = Dimensions.get('window').width;
      const menuItemHeight = 54 + 12; // button height + gap (marginBottom)
      const menuPadding = 8; // padding inside scrollMenuContent
      const estimatedMenuHeight = Math.min(
        menuOptions.length * menuItemHeight + menuPadding * 2,
        screenHeight * 0.7
      );
      const padding = 20; // padding from screen edges

      // Calculate top position, ensuring menu doesn't go off screen
      let topPos = (y + h / 2) - 100;
      const maxTop = screenHeight - estimatedMenuHeight - padding;
      const minTop = padding;

      // Adjust if menu would go off bottom
      if (topPos + estimatedMenuHeight > screenHeight - padding) {
        topPos = Math.max(minTop, screenHeight - estimatedMenuHeight - padding);
      }
      // Ensure it doesn't go off top
      if (topPos < padding) {
        topPos = padding;
      }

      // Calculate left position, ensuring menu doesn't go off screen
      let leftPos = (x + w / 2) - MENU_W - 12;
      // If menu would go off right edge, position it to the left of the button
      if (leftPos + MENU_W > screenWidth - padding) {
        leftPos = x - MENU_W - 12;
      }
      // Ensure it doesn't go off left
      if (leftPos < padding) {
        leftPos = padding;
      }

      setMenuPos({ top: topPos, left: leftPos });
      setMenuOpen(true);
    });
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={((onDelete && isOwner) || (trashMode && onRestore)) ? renderLeftActions : undefined}
      overshootLeft={false}
      friction={2}
    >
      <Pressable style={driveStyles.fileCard} onPress={() => onPress?.(item)}>
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

        <Pressable ref={dotsRef} onPress={openMenu} hitSlop={14} style={{ padding: 6 }}>
          <Ionicons name="ellipsis-vertical" size={18} color={colors.textSecondary} />
        </Pressable>
      </Pressable>

      {/* Context Menu Modal */}
      <Modal visible={menuOpen} transparent animationType="none">
        <Pressable style={styles.backdrop} onPress={closeMenu}>
          <BlurView intensity={22} tint={isDarkMode ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          <Pressable style={[styles.stackMenu, { top: menuPos.top, left: menuPos.left }]} onPress={(e) => e.stopPropagation()}>
            <ScrollView
              style={styles.scrollMenu}
              contentContainerStyle={styles.scrollMenuContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
              nestedScrollEnabled={true}
            >
              {menuOptions.map((opt, index) => (
                <TouchableOpacity
                  key={opt.key}
                  onPress={opt.onPress}
                  activeOpacity={0.9}
                  style={[
                    styles.stackBtn,
                    index === menuOptions.length - 1 && { marginBottom: 0 }
                  ]}
                >
                  <Ionicons name={opt.icon} size={22} color={colors.textPrimary} style={styles.iconMargin} />
                  <Text style={styles.stackLabel}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <EditItemModal visible={editOpen} item={item} onClose={() => setEditOpen(false)} />
      <ShareModal visible={shareOpen} item={item} onClose={() => setShareOpen(false)} />
    </Swipeable>
  );
}