// mobile-client/src/features/drive/components/DriveListItem.jsx

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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { driveStyles } from "../styles/myDrive.styles";
import { listItemStyles } from "../styles/driveListItem.styles";
import { getFileIconMeta } from "../utils/fileIcon";

import { BlurView } from "expo-blur";

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

export default function DriveListItem({ item, onPress }) {
  const isFolder = item.type === "folder";
  const { icon, color } = getFileIconMeta(item.name, item.mimeType, isFolder);

  const { token } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(item.name || "");
  const [shareOpen, setShareOpen] = useState(false);

  const isStarred = !!item.starred;
  const isImportant = !!item.important;

  const dotsRef = useRef(null);

  const closeMenu = () => setMenuOpen(false);

  const comingSoon = (label) => {
    closeMenu();
    Alert.alert("CopaDrive", `${label} (Coming soon)`);
  };

  const handleDownload = async () => {
    closeMenu();

    if (!token) return Alert.alert("Not logged in", "No token found.");
    if (item.type === "folder") return Alert.alert("CopaDrive", "Folders cannot be downloaded.");

    try {
      const full = await getFileById(token, item.id);

      if (!full?.content) {
        return Alert.alert("CopaDrive", "No content available for this file.");
      }

      await downloadAndShareBase64({
        base64: full.content,
        mimeType: full.mimeType || "application/octet-stream",
        fileName: full.name || item.name || "file",
      });
    } catch (e) {
      Alert.alert("Download Failed", e?.message || "Could not download file");
    }
  };

  const menuOptions = useMemo(() => {
    return [
      { 
        key: "share", 
        icon: "share-social-outline", 
        label: "SHARE", 
        onPress: () => {
          closeMenu();
          setShareOpen(true);
        }
      },
      { 
        key: "manage", 
        icon: "key-outline", 
        label: "MANAGE ACCESS", 
        onPress: () => {
          closeMenu();
          setShareOpen(true);
        }
      },

      {
        key: "star",
        icon: isStarred ? "star" : "star-outline",
        label: isStarred ? "REMOVE STAR" : "ADD TO STAR",
        onPress: async () => {
          if (!token) return Alert.alert("Not logged in", "No token found.");
          closeMenu();
          try {
            await setStarred(token, item.id, !isStarred);
            emitDriveRefresh();
          } catch (e) {
            Alert.alert("Failed", e?.message || "Could not update Starred");
          }
        },
      },
      {
        key: "important",
        icon: isImportant ? "alert-circle" : "alert-circle-outline",
        label: isImportant ? "REMOVE IMPORTANT" : "ADD TO IMPORTANT",
        onPress: async () => {
          if (!token) return Alert.alert("Not logged in", "No token found.");
          closeMenu();
          try {
            await setImportant(token, item.id, !isImportant);
            emitDriveRefresh();
          } catch (e) {
            Alert.alert("Failed", e?.message || "Could not update Important");
          }
        },
      },

      { key: "download", icon: "download-outline", label: "DOWNLOAD", onPress: handleDownload },

      {
        key: "rename",
        icon: "pencil-outline",
        label: "RENAME",
        onPress: () => {
          closeMenu();
          setRenameValue(item.name || "");
          setRenameOpen(true);
        },
      },
    ];
  }, [token, item.id, item.name, isStarred, isImportant]);

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
    if (!token) return Alert.alert("Not logged in", "No token found.");

    try {
      await renameItem(token, item.id, next);
      setRenameOpen(false);
      emitDriveRefresh();
    } catch (e) {
      Alert.alert("Rename Failed", e?.message || "Could not rename item");
    }
  };

  return (
    <>
      <Pressable
        style={driveStyles.fileCard}
        onPress={() => {
          if (typeof onPress === "function") onPress(item);
        }}
      >
        <View style={driveStyles.iconContainer}>
          <Ionicons name={icon} size={28} color={color} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={driveStyles.fileName} numberOfLines={1}>
            {item.name}
          </Text>

          <Text style={driveStyles.fileInfo}>
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
          <Ionicons name="ellipsis-vertical" size={18} color="#5f6368" />
        </Pressable>
      </Pressable>

      {/* Floating menu with blurred backdrop */}
      <Modal visible={menuOpen} transparent animationType="none">
        <Pressable style={listItemStyles.backdrop} onPress={closeMenu}>
          <BlurView intensity={22} tint="light" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, listItemStyles.dim]} />

          <Pressable
            style={[listItemStyles.stackMenu, { top: menuPos.top, left: menuPos.left }]}
            onPress={() => {}}
          >
            {menuOptions.map((opt) => (
              <StackOption key={opt.key} icon={opt.icon} label={opt.label} onPress={opt.onPress} />
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Rename modal */}
      <Modal visible={renameOpen} transparent animationType="fade">
        <Pressable style={listItemStyles.renameBackdrop} onPress={() => setRenameOpen(false)}>
          <Pressable style={listItemStyles.renameCard} onPress={() => {}}>
            <Text style={listItemStyles.renameTitle}>RENAME</Text>

            <TextInput
              value={renameValue}
              onChangeText={setRenameValue}
              style={listItemStyles.renameInput}
              placeholder="New name"
              autoFocus
            />

            <View style={listItemStyles.renameActions}>
              <TouchableOpacity onPress={() => setRenameOpen(false)} style={listItemStyles.renameBtnGhost}>
                <Text style={listItemStyles.renameGhostText}>CANCEL</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={doRenameSubmit} style={listItemStyles.renameBtnPrimary}>
                <Text style={listItemStyles.renamePrimaryText}>SAVE</Text>
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
    </>
  );
}

function StackOption({ icon, label, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={listItemStyles.stackBtn}>
      <Ionicons name={icon} size={22} color="#444" style={{ marginRight: 12 }} />
      <Text
        style={listItemStyles.stackLabel}
        numberOfLines={1}
        ellipsizeMode="clip"
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
