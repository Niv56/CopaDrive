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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { getDriveStyles } from "../styles/myDrive.styles";
import { getDriveListItemStyles } from "../styles/driveListItem.styles";
import { useTheme } from "../../../app/providers/ThemeContext";

import { getFileIconMeta } from "../utils/fileIcon";
import { BlurView } from "expo-blur";
import { Swipeable } from "react-native-gesture-handler";

import { useAuth } from "../../../app/providers/AuthContext";
import { getFileById, setStarred, setImportant } from "../services/fileService";
import { downloadFile } from "../utils/downloadFile";

import ShareModal from "../modals/ShareModal";
import EditItemModal from "../modals/EditItemModal";

import { getPermissions } from "../services/permissionService";

/* ---------------- Helpers ---------------- */

function normalizeRole(r) {
  const x = String(r || "").toLowerCase();
  if (x === "owner") return "owner";
  if (x === "editor") return "editor";
  return "viewer";
}

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

// חשוב: בהרבה שרתים userId יכול להגיע בצורות שונות
function pickUserIdFromPerm(p) {
  return (
    p?.userId ||
    p?.user?._id ||
    p?.user?.id ||
    p?.sharedWithId ||
    p?.sharedWith?._id ||
    p?.sharedWith?.id ||
    p?._id
  );
}

/* ---------------- Component ---------------- */

export default function DriveListItem({
  item,
  onPress,
  onDelete,
  onRestore,
  trashMode = false,
}) {
  const isFolder = item.type === "folder";
  const { icon, color } = getFileIconMeta(item.name, item.mimeType, isFolder);

  const { token, user } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const driveStyles = useMemo(() => getDriveStyles(colors), [colors]);
  const styles = useMemo(() => getDriveListItemStyles(colors), [colors]);

  const myId = user?.id || user?._id;

  const isOwner = useMemo(() => {
    const ownerId = item?.ownerId || item?.owner;
    return String(ownerId) === String(myId);
  }, [item, myId]);

  // role בסיסי שמגיע מהשרת (לפעמים חסר)
  const effectiveRole = useMemo(() => {
    if (isOwner) return "owner";
    return extractRole(item, myId);
  }, [item, myId, isOwner]);

  // role שנפתר על ידי GET /permissions (כשאין מידע ברשימה)
  const [resolvedRole, setResolvedRole] = useState(null);

  const effectiveRoleResolved = resolvedRole || effectiveRole;
  const canUserEditResolved =
    effectiveRoleResolved === "owner" || effectiveRoleResolved === "editor";

  const swipeableRef = useRef(null);
  const dotsRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [editOpen, setEditOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const isStarred = !!item.starred;
  const isImportant = !!item.important;

  const closeMenu = () => setMenuOpen(false);

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

  /**
   * מביא role אמיתי מהשרת רק אם:
   * - אני לא owner
   * - ואין לי role/permissions על האובייקט מהרשימה
   */
  const ensureRole = useCallback(async () => {
    if (!token) return;

    if (isOwner) {
      setResolvedRole("owner");
      return;
    }

    const alreadyHasRole =
      item?.role ||
      item?.myRole ||
      item?.permissionRole ||
      Array.isArray(item?.permissions);

    if (alreadyHasRole) return;

    try {
      const perms = await getPermissions(token, item.id || item._id);
      const myPerm = Array.isArray(perms)
        ? perms.find((p) => String(pickUserIdFromPerm(p)) === String(myId))
        : null;

      setResolvedRole(normalizeRole(myPerm?.role));
    } catch (e) {
      // אם נכשל, עדיף לא לשבור UI
      setResolvedRole("viewer");
    }
  }, [token, item, myId, isOwner]);

  const renderLeftActions = (progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0.8, 1],
      extrapolate: "clamp",
    });
    const opacity = dragX.interpolate({
      inputRange: [0, 50],
      outputRange: [0, 1],
      extrapolate: "clamp",
    });

    if (trashMode) {
      return (
        <View
          style={[styles.leftActionContainer, { backgroundColor: "#22c55e" }]}
        >
          <Animated.View
            style={[
              styles.deleteActionAnim,
              { opacity, transform: [{ scale }] },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.deleteButtonInner,
                { backgroundColor: "#22c55e" },
              ]}
              onPress={() => {
                swipeableRef.current?.close();
                setTimeout(() => onRestore?.(item), 200);
              }}
            >
              <Ionicons name="refresh-outline" size={24} color="white" />
              <Text style={styles.deleteText}>Restore</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      );
    }

    return (
      <View style={styles.leftActionContainer}>
        <Animated.View
          style={[styles.deleteActionAnim, { opacity, transform: [{ scale }] }]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.deleteButtonInner}
            onPress={() => {
              swipeableRef.current?.close();
              setTimeout(() => onDelete?.(item), 200);
            }}
          >
            <Ionicons name="trash-outline" size={24} color="white" />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const menuOptions = useMemo(() => {
    if (trashMode) {
      return [
        {
          key: "restore",
          icon: "refresh-outline",
          label: "RESTORE",
          onPress: () => {
            closeMenu();
            onRestore?.(item);
          },
        },
        {
          key: "deleteForever",
          icon: "trash-outline",
          label: "DELETE FOREVER",
          onPress: () => {
            closeMenu();
            onDelete?.(item);
          },
        },
      ];
    }

    const options = [
      {
        key: "share",
        icon: "share-social-outline",
        label: "SHARE",
        onPress: () => {
          closeMenu();
          setShareOpen(true);
        },
      },
      {
        key: "star",
        icon: isStarred ? "star" : "star-outline",
        label: isStarred ? "REMOVE STAR" : "ADD TO STAR",
        onPress: async () => {
          closeMenu();
          try {
            await setStarred(token, item.id || item._id, !isStarred);
          } catch { }
        },
      },
      {
        key: "important",
        icon: isImportant ? "alert-circle" : "alert-circle-outline",
        label: isImportant ? "REMOVE IMPORTANT" : "ADD TO IMPORTANT",
        onPress: async () => {
          closeMenu();
          try {
            await setImportant(token, item.id || item._id, !isImportant);
          } catch { }
        },
      },
      {
        key: "download",
        icon: "download-outline",
        label: "DOWNLOAD",
        onPress: handleDownload,
      },
    ];

    // ✅ כאן השינוי הקריטי: להשתמש ב-canUserEditResolved
    if (canUserEditResolved) {
      options.push({
        key: "edit",
        icon: "pencil-outline",
        label: "EDIT",
        onPress: () => {
          closeMenu();
          setEditOpen(true);
        },
      });
    }

    if (isOwner) {
      options.push({
        key: "delete",
        icon: "trash-outline",
        label: "MOVE TO TRASH",
        onPress: () => {
          closeMenu();
          onDelete?.(item);
        },
      });
    }

    return options;
  }, [
    trashMode,
    isStarred,
    isImportant,
    token,
    item,
    handleDownload,
    canUserEditResolved,
    isOwner,
    onDelete,
    onRestore,
  ]);

  // ✅ כאן השינוי הקריטי: openMenu הופך async וקורא ensureRole לפני פתיחה
  const openMenu = async () => {
    await ensureRole();

    if (!dotsRef.current) {
      setMenuOpen(true);
      return;
    }

    dotsRef.current.measureInWindow((x, y, w, h) => {
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
      renderLeftActions={
        ((onDelete && isOwner) || (trashMode && onRestore))
          ? renderLeftActions
          : undefined
      }
      overshootLeft={false}
      friction={2}
    >
      <Pressable style={driveStyles.fileCard} onPress={() => onPress?.(item)}>
        <View style={driveStyles.iconContainer}>
          <Ionicons name={icon} size={28} color={color} />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={[driveStyles.fileName, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text style={[driveStyles.fileInfo, { color: colors.textSecondary }]}>
            {isFolder ? "Folder" : "File"} •{" "}
            {item.displayDate || new Date(item.updatedAt).toLocaleDateString()}
          </Text>
        </View>

        <Pressable
          ref={dotsRef}
          onPress={() => (menuOpen ? closeMenu() : openMenu())}
          hitSlop={14}
          style={{ padding: 6 }}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={18}
            color={colors.textSecondary}
          />
        </Pressable>
      </Pressable>

      <Modal visible={menuOpen} transparent animationType="none">
        <Pressable style={styles.backdrop} onPress={closeMenu}>
          <BlurView
            intensity={22}
            tint={isDarkMode ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />
          <Pressable
            style={[styles.stackMenu, { top: menuPos.top, left: menuPos.left }]}
            onPress={(e) => e.stopPropagation()}
          >
            {menuOptions.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                onPress={opt.onPress}
                activeOpacity={0.9}
                style={styles.stackBtn}
              >
                <Ionicons
                  name={opt.icon}
                  size={22}
                  color={colors.textPrimary}
                  style={styles.iconMargin}
                />
                <Text style={styles.stackLabel}>{opt.label}</Text>
              </TouchableOpacity>
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
