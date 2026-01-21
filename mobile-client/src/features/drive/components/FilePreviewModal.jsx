import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, Text, TextInput,
  TouchableOpacity, View, KeyboardAvoidingView, Platform, StyleSheet, Keyboard,
  InputAccessoryView, Button, Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Video, ResizeMode, Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";

import { useAuth } from "../../../app/providers/AuthContext";
import { getFileById, updateItem, setStarred, setImportant } from "../services/fileService";
import { emitDriveRefresh } from "../services/driveEvents";
import { downloadFile } from "../utils/downloadFile";
import { getPermissions } from "../services/permissionService";
import { useTheme } from "../../../app/providers/ThemeContext";

const { width, height } = Dimensions.get("window");
const NEWLINE = "_@NL@_";
const ACCESSORY_ID = "unique_keyboard_accessory_id";

/* ---------------- Helper Functions ---------------- */

const isText = (m = "", n = "") =>
  m.startsWith("text/") || m === "application/json" || /\.(txt|md|csv|log|js)$/i.test(n || "");

const isImage = (m = "", n = "") =>
  m.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp)$/i.test(n || "");

const isVideo = (m = "", n = "") =>
  m.startsWith("video/") || /\.(mp4|mov|mkv)$/i.test(n || "");

const isAudio = (m = "", n = "") =>
  m.startsWith("audio/") || /\.(mp3|wav|m4a)$/i.test(n || "");

function getIcon(m = "", n = "") {
  if (isImage(m, n)) return "image-outline";
  if (isVideo(m, n)) return "videocam-outline";
  if (isAudio(m, n)) return "musical-notes-outline";
  if (isText(m, n)) return "document-text-outline";
  if (m.includes("pdf") || /\.pdf$/i.test(n || "")) return "document-outline";
  return "document-attach-outline";
}

function normalizeRole(r) {
  const x = String(r || "").toLowerCase();
  return (x === "owner" || x === "editor") ? x : "viewer";
}

/** * Decodes the JWT locally to verify user identity without 
 * making extra network calls.
 */
function decodeJwtSafe(token) {
  try {
    if (!token) return {};
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "===".slice((base64.length + 3) % 4);
    const { Buffer } = require("buffer");
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
  } catch { return {}; }
}

/* ---------------- Component ---------------- */

export default function FilePreviewModal({ open, fileId, onClose }) {
  const { token } = useAuth();
  const { colors, isDarkMode } = useTheme();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [localMediaUri, setLocalMediaUri] = useState(null);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [textDraft, setTextDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const videoRef = useRef(null);

  const myUserId = useMemo(() => {
    const payload = decodeJwtSafe(token);
    return payload?.userId || payload?.id || payload?._id || null;
  }, [token]);

  /** Resolves current user's role based on ownership and shared permissions */
  const effectiveRole = useMemo(() => {
    const ownerId = item?.ownerId || item?.owner?.id || item?.owner;
    if (myUserId && ownerId && String(myUserId) === String(ownerId)) return "owner";
    return normalizeRole(item?.role);
  }, [item, myUserId]);

  const canEdit = effectiveRole === "owner" || effectiveRole === "editor";
  const mime = item?.mimeType || "";
  const fname = item?.name || "";

  const isTxt = useMemo(() => isText(mime, fname), [mime, fname]);
  const isImg = useMemo(() => isImage(mime, fname), [mime, fname]);
  const isVid = useMemo(() => isVideo(mime, fname), [mime, fname]);
  const isAud = useMemo(() => isAudio(mime, fname), [mime, fname]);

  /** * Prepares media for playback by writing Base64 content to a local temp file.
   * Required because Expo AV cannot stream raw Base64 strings directly.
   */
  const prepareMedia = useCallback(async (content, mimeType, fileName) => {
    if (!content) return;
    try {
      setMediaLoading(true);
      const tempName = `${(fileName || "temp").replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}`;
      const ext = mimeType.split("/")[1] || "mp4";
      const uri = `${FileSystem.cacheDirectory}${tempName}.${ext}`;

      await FileSystem.writeAsStringAsync(uri, content, { encoding: "base64" });
      setLocalMediaUri(uri);
    } catch (e) {
      Alert.alert("Error", "Could not load media for playback");
    } finally { setMediaLoading(false); }
  }, []);



  const reload = useCallback(async () => {
    if (!open || !token || !fileId) return;
    try {
      setLoading(true);
      setLocalMediaUri(null);
      const data = await getFileById(token, fileId);

      // Fetch detailed permissions to ensure role accuracy
      const perms = await getPermissions(token, fileId).catch(() => []);
      data.permissions = perms;

      setItem(data);
      setNameDraft(data?.name || "");
      if (isText(data.mimeType, data.name)) {
        setTextDraft(String(data?.content || "").replaceAll(NEWLINE, "\n"));
      }

      if (isVideo(data.mimeType, data.name) || isAudio(data.mimeType, data.name)) {
        await prepareMedia(data.content, data.mimeType, data.name);
      }
    } catch (e) {
      Alert.alert("Error", "Failed to open file");
      onClose?.();
    } finally { setLoading(false); }
  }, [open, token, fileId, prepareMedia]);

  useEffect(() => {
    if (open) reload();
  }, [open, reload]);

  const onSave = async () => {
    if (!token || !item || !canEdit) return;
    try {
      setSaving(true);
      const patch = { name: nameDraft.trim() };
      if (isTxt) {
        patch.content = String(textDraft || "").replaceAll("\n", NEWLINE);
      }
      await updateItem(token, item.id, patch);
      emitDriveRefresh({ reason: "save", id: item.id });
      onClose?.();
    } catch (e) {
      Alert.alert("Save Failed", "Could not save changes");
      setSaving(false);
    }
  };

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.backdrop}>
        <BlurView intensity={20} tint={isDarkMode ? "dark" : "light"} style={StyleSheet.absoluteFill} />
        <Pressable style={StyleSheet.absoluteFill} onPress={() => { Keyboard.dismiss(); onClose?.(); }} />

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.centerWrap}>
          <Pressable style={[s.card, { backgroundColor: isDarkMode ? "#1e1e1e" : "#fff" }]}>

            {/* Header: Name Editing & Metadata */}
            <View style={[s.header, { borderBottomColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                {canEdit ? (
                  <TextInput
                    value={nameDraft}
                    onChangeText={setNameDraft}
                    style={[s.titleInput, { color: colors.textPrimary, backgroundColor: isDarkMode ? "#333" : "#f0f0f0" }]}
                    placeholder="Untitled"
                  />
                ) : (
                  <Text style={[s.title, { color: colors.textPrimary }]} numberOfLines={1}>{item?.name}</Text>
                )}
                <Text style={[s.role, { color: colors.textSecondary }]}>Permission: {effectiveRole}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Main Content Viewer */}
            <View style={s.body}>
              {loading ? (
                <ActivityIndicator color={colors.primary} style={{ padding: 40 }} />
              ) : isImg ? (
                <Image source={{ uri: `data:${item.mimeType};base64,${item.content}` }} style={s.image} />
              ) : isVid ? (
                <View style={s.mediaContainer}>
                  {localMediaUri && (
                    <Video
                      ref={videoRef}
                      style={s.video}
                      source={{ uri: localMediaUri }}
                      useNativeControls
                      resizeMode={ResizeMode.CONTAIN}
                      shouldPlay
                    />
                  )}
                </View>
              ) : isTxt ? (
                <View style={[s.textBox, { backgroundColor: isDarkMode ? "#222" : "#f9f9f9" }]}>
                  <TextInput
                    value={textDraft}
                    onChangeText={setTextDraft}
                    multiline
                    editable={canEdit}
                    style={[s.textInput, { color: colors.textPrimary }]}
                  />
                </View>
              ) : (
                <View style={s.noPreview}>
                  <Ionicons name={getIcon(mime, fname)} size={60} color={colors.textSecondary} />
                  <Text style={{ color: colors.textSecondary }}>No preview available</Text>
                </View>
              )}
            </View>

            {/* Footer Actions */}
            <View style={[s.footer, { borderTopColor: colors.border }]}>
              <TouchableOpacity onPress={onClose} style={s.backBtn}>
                <Text style={{ color: colors.textPrimary, fontWeight: "bold" }}>Close</Text>
              </TouchableOpacity>
              {canEdit && (
                <TouchableOpacity onPress={onSave} disabled={saving} style={s.saveBtn}>
                  <Text style={s.saveText}>{saving ? "Saving..." : "Save Changes"}</Text>
                </TouchableOpacity>
              )}
            </View>

          </Pressable>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "center" },
  centerWrap: { flex: 1, justifyContent: "center", padding: 20 },
  card: { borderRadius: 20, overflow: "hidden", elevation: 5 },
  header: { padding: 16, borderBottomWidth: 1, flexDirection: "row", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "bold" },
  titleInput: { padding: 8, borderRadius: 8, fontSize: 16, fontWeight: "bold" },
  role: { fontSize: 12, marginTop: 4 },
  closeBtn: { marginLeft: 10 },
  body: { padding: 10, minHeight: 200, justifyContent: "center" },
  image: { width: "100%", height: 300, resizeMode: "contain" },
  mediaContainer: { width: "100%", height: 300, backgroundColor: "#000", borderRadius: 10 },
  video: { width: "100%", height: "100%" },
  textBox: { borderRadius: 10, padding: 10, maxHeight: 300 },
  textInput: { fontSize: 14, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  noPreview: { alignItems: "center", padding: 40 },
  footer: { padding: 16, borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between" },
  backBtn: { padding: 12 },
  saveBtn: { backgroundColor: "#007bff", padding: 12, borderRadius: 10 },
  saveText: { color: "#fff", fontWeight: "bold" },
});