import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, Text, TextInput,
  TouchableOpacity, View, KeyboardAvoidingView, Platform, StyleSheet, Keyboard, InputAccessoryView, Button, Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Video, ResizeMode, Audio } from 'expo-av';
import * as FileSystem from "expo-file-system/legacy";

import { useAuth } from "../../../app/providers/AuthContext";
import { getFileById, updateItem, setStarred, setImportant } from "../services/fileService";
import { emitDriveRefresh } from "../services/driveEvents";
import { downloadFile } from "../utils/downloadFile";

const { width, height } = Dimensions.get("window");
const NEWLINE = "_@NL@_";
const ACCESSORY_ID = "unique_keyboard_accessory_id";

const isText = (m = "", n = "") =>
  m.startsWith("text/") || m === "application/json" || m === "application/javascript" || m === "application/xml" || /\.(txt|md|csv|log|xml|js)$/i.test(n || "");

const isImage = (m = "", n = "") =>
  m.startsWith("image/") || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(n || "");

const isVideo = (m = "", n = "") =>
  m.startsWith("video/") || /\.(mp4|mov|mkv|avi|webm|m4v)$/i.test(n || "");

const isAudio = (m = "", n = "") =>
  m.startsWith("audio/") || /\.(mp3|wav|m4a|aac|flac|ogg)$/i.test(n || "");

function getIcon(m = "", n = "") {
  if (isImage(m, n)) return "image-outline";
  if (isVideo(m, n)) return "videocam-outline";
  if (isAudio(m, n)) return "musical-notes-outline";
  if (isText(m, n)) return "document-text-outline";
  if (m.includes("pdf") || /\.pdf$/i.test(n || "")) return "document-outline";
  if (m.includes("zip") || /\.(zip|rar|7z|tar|gz)$/i.test(n || "")) return "archive-outline";
  return "document-attach-outline";
}

function decodeJwtSafe(token) {
  try {
    if (!token) return {};
    const base64Url = token.split(".")[1];
    if (!base64Url) return {};
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "===".slice((base64.length + 3) % 4);
    let jsonStr = "";
    if (typeof globalThis.atob === "function") {
      jsonStr = globalThis.atob(padded);
    } else {
      const { Buffer } = require("buffer");
      jsonStr = Buffer.from(padded, "base64").toString("utf8");
    }
    return JSON.parse(jsonStr);
  } catch {
    return {};
  }
}

function extractOwnerId(item) {
  return item?.ownerId || item?.owner?.id || item?.owner?._id || item?.owner || item?.userId || item?.createdBy || null;
}

export default function FilePreviewModal({ open, fileId, onClose }) {
  const { token } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [localMediaUri, setLocalMediaUri] = useState(null);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false); // ✅ שולט בניגון דרך Props

  const [nameDraft, setNameDraft] = useState("");
  const [textDraft, setTextDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const videoRef = useRef(null);

  const myUserId = useMemo(() => {
    const payload = decodeJwtSafe(token);
    return payload?.userId || payload?.id || payload?._id || null;
  }, [token]);

  const ownerId = useMemo(() => extractOwnerId(item), [item]);
  const effectiveRole = useMemo(() => {
    if (item?.role) return item.role;
    if (myUserId && ownerId && String(myUserId) === String(ownerId)) return "owner";
    return "viewer";
  }, [item, myUserId, ownerId]);

  const canEdit = effectiveRole === "owner" || effectiveRole === "editor";
  
  const mime = item?.mimeType || "";
  const fname = item?.name || "";
  
  const isTxt = useMemo(() => isText(mime, fname), [mime, fname]);
  const isImg = useMemo(() => isImage(mime, fname), [mime, fname]);
  const isVid = useMemo(() => isVideo(mime, fname), [mime, fname]);
  const isAud = useMemo(() => isAudio(mime, fname), [mime, fname]);

  const displayTxt = useMemo(() => String(item?.content || "").replaceAll(NEWLINE, "\n"), [item]);
  const safeTitle = useMemo(() => {
    const t = (nameDraft || item?.name || "Untitled").trim();
    return t.length ? t : "Untitled";
  }, [nameDraft, item]);

  // ✅ הגדרות סאונד קריטיות
  useEffect(() => {
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true, // חובה לאייפון
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false, // חובה לאנדרואיד (רמקול ראשי)
        });
      } catch (e) {
        console.warn("Failed to configure audio mode", e);
      }
    };
    if (open) configureAudio();
  }, [open]);

  const prepareMedia = useCallback(async (content, mimeType, fileName) => {
    if (!content) return;
    try {
        setMediaLoading(true);
        const tempName = (fileName || "temp").replace(/[^a-zA-Z0-9]/g, "_") + "_" + Date.now();
        const ext = mimeType.split("/")[1] || "mp4";
        const uri = FileSystem.cacheDirectory + `${tempName}.${ext}`;

        await FileSystem.writeAsStringAsync(uri, content, {
            encoding: 'base64'
        });

        setLocalMediaUri(uri);
    } catch (e) {
        console.error("Failed to prepare media:", e);
        Alert.alert("Error", "Could not load media for playback");
    } finally {
        setMediaLoading(false);
    }
  }, []);

  const reload = useCallback(async () => {
    if (!open || !token || !fileId) return;
    try {
      setLoading(true);
      setLocalMediaUri(null);
      setIsPlaying(false);
      const data = await getFileById(token, fileId);
      setItem(data);
      setNameDraft(data?.name || "");
      setTextDraft(isText(data?.mimeType || "", data?.name || "") ? String(data?.content || "").replaceAll(NEWLINE, "\n") : "");

      if (isVideo(data.mimeType, data.name) || isAudio(data.mimeType, data.name)) {
          await prepareMedia(data.content, data.mimeType, data.name);
      }

    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to open file");
      onClose?.(); 
    } finally {
      setLoading(false);
    }
  }, [open, token, fileId, prepareMedia]);

  useEffect(() => {
    if (open) reload();
    if (!open) { 
        setItem(null); 
        setSaving(false); 
        setNameDraft(""); 
        setTextDraft(""); 
        setLocalMediaUri(null);
        setIsPlaying(false);
    }
  }, [open, reload]);

  // ✅ שינוי: רק מעדכנים את ה-State, הנגן יגיב ל-shouldPlay
  const togglePlayback = () => {
      setIsPlaying(prev => !prev);
  };

  const onPlaybackStatusUpdate = (status) => {
      // דיבוג במידת הצורך
      // console.log(status); 
      
      if (status.didJustFinish) {
          setIsPlaying(false);
          videoRef.current?.setPositionAsync(0);
      }
  };

  const hasNameChange = useMemo(() => !!item && safeTitle !== (item?.name || ""), [safeTitle, item]);
  const hasTextChange = useMemo(() => !!item && isTxt && (textDraft || "") !== (displayTxt || ""), [item, isTxt, textDraft, displayTxt]);
  const hasChanges = hasNameChange || hasTextChange;

  const onSave = async () => {
    if (!token || !item || !canEdit || !hasChanges) return;
    try {
      setSaving(true);
      const patch = {};
      if (hasNameChange) patch.name = safeTitle;
      if (isTxt && hasTextChange) {
        patch.content = String(textDraft || "").replaceAll("\n", NEWLINE);
        patch.mimeType = item.mimeType || "text/plain";
      }
      await updateItem(token, item.id, patch);
      emitDriveRefresh({ reason: "save", id: item.id });
      Keyboard.dismiss();
      setTimeout(() => { onClose?.(); }, 100);
    } catch (e) {
      Alert.alert("Save Failed", e?.message || "Could not save changes");
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    try {
      if (!item?.content && !item?.url) return;
      const mime = item.mimeType || "";
      const isTextFile = mime.startsWith('text/') || mime.includes('json') || mime.includes('xml') || mime.includes('javascript') || mime.includes('html');

      await downloadFile({
        content: item.content,
        mimeType: mime,
        fileName: item.name || safeTitle,
        isBase64: !isTextFile 
      });
    } catch (e) {
      Alert.alert("Download failed", e?.message || "Could not download file");
    }
  };

  const toggleStar = async () => {
    if (!token || !item) return;
    const next = !item.starred;
    setItem((p) => ({ ...p, starred: next }));
    try {
      await setStarred(token, item.id, next);
      emitDriveRefresh({ reason: "star", id: item.id, value: next });
    } catch (e) { setItem((p) => ({ ...p, starred: !next })); }
  };

  const toggleImportant = async () => {
    if (!token || !item) return;
    const next = !item.important;
    setItem((p) => ({ ...p, important: next }));
    try {
      await setImportant(token, item.id, next);
      emitDriveRefresh({ reason: "important", id: item.id, value: next });
    } catch (e) { setItem((p) => ({ ...p, important: !next })); }
  };

  function IconBtn({ icon, onPress, disabled = false }) {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.8} style={[s.iconBtn, disabled && { opacity: 0.45 }]}>
        <Ionicons name={icon} size={20} color="#111" />
      </TouchableOpacity>
    );
  }

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.backdrop}>
        <BlurView intensity={18} tint="light" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, s.dim]} />
        <Pressable style={StyleSheet.absoluteFill} onPress={() => { Keyboard.dismiss(); onClose?.(); }} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.centerWrap}>
          <Pressable style={s.card} onPress={() => {}}>
            
            {/* Header */}
            <View style={s.header}>
              <View style={{ flex: 1 }}>
                {canEdit ? (
                  <View style={s.titleRow}>
                    <TextInput value={nameDraft} onChangeText={setNameDraft} style={s.titleInput} placeholder="Untitled" returnKeyType="done" onSubmitEditing={Keyboard.dismiss} />
                    {hasNameChange && <View style={s.checkBadge}><Ionicons name="checkmark" size={16} color="#111" /></View>}
                  </View>
                ) : (
                  <Text style={s.title} numberOfLines={1}>{item?.name || ""}</Text>
                )}
                <Text style={s.role}>Role: {effectiveRole}</Text>
              </View>
              <TouchableOpacity style={s.closeBtn} onPress={() => { Keyboard.dismiss(); onClose?.(); }} activeOpacity={0.85}>
                <Ionicons name="close" size={20} color="#111" />
              </TouchableOpacity>
            </View>

            {/* Actions */}
            <View style={s.actionsRow}>
              <IconBtn icon={item?.starred ? "star" : "star-outline"} onPress={toggleStar} />
              <IconBtn icon={item?.important ? "alert" : "alert-circle-outline"} onPress={toggleImportant} />
              <IconBtn icon="download-outline" onPress={handleDownload} />
            </View>

            {/* Body */}
            <View style={s.body}>
              {loading ? (
                <View style={{ paddingVertical: 40, alignItems: "center" }}><ActivityIndicator /></View>
              ) : !item ? null : isImg ? (
                <Image source={{ uri: `data:${item.mimeType};base64,${item.content}` }} style={s.image} />
              ) : isVid ? (
                <View style={s.mediaContainer}>
                    {mediaLoading ? (
                        <ActivityIndicator color="#fff" size="large" />
                    ) : localMediaUri ? (
                        <Video
                            ref={videoRef}
                            style={s.video}
                            source={{ uri: localMediaUri }}
                            useNativeControls={true}
                            resizeMode={ResizeMode.CONTAIN}
                            isLooping={false}
                            shouldPlay={true} // וידאו מתחיל אוטומטית או ע"י הפקדים המובנים
                            volume={1.0}
                            isMuted={false}
                        />
                    ) : (
                        <Text style={{color: '#fff'}}>Error loading video</Text>
                    )}
                </View>
              ) : isAud ? (
                <View style={[s.mediaContainer, s.audioContainer]}>
                    {mediaLoading ? (
                        <ActivityIndicator color="#111" size="large" />
                    ) : localMediaUri ? (
                        <>
                            <View style={s.audioIconWrap}>
                                <Ionicons name="musical-notes" size={60} color="#555" />
                            </View>
                            
                            <TouchableOpacity onPress={togglePlayback} style={s.playPauseBtn}>
                                <Ionicons 
                                    name={isPlaying ? "pause-circle" : "play-circle"} 
                                    size={80} 
                                    color="#0d6efd" 
                                />
                            </TouchableOpacity>

                            <Text style={s.audioText}>{isPlaying ? "Playing..." : "Paused"}</Text>

                            {/* ✅ נגן נסתר אבל פעיל */}
                            <Video
                                ref={videoRef}
                                source={{ uri: localMediaUri }}
                                style={{ width: 1, height: 1, opacity: 0 }} 
                                resizeMode={ResizeMode.CONTAIN}
                                shouldPlay={isPlaying} // ✅ תגובה ל-State
                                isLooping={false}
                                volume={1.0} // ✅ ווליום מלא
                                isMuted={false} // ✅ ביטול השתקה
                                onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                                onError={(e) => console.log("Video Error:", e)}
                            />
                        </>
                    ) : (
                        <Text style={{color: '#111'}}>Error loading audio</Text>
                    )}
                </View>
              ) : isTxt ? (
                <View style={s.textBox}>
                  {canEdit ? (
                    <>
                      <TextInput value={textDraft} onChangeText={setTextDraft} multiline textAlignVertical="top" style={s.textInput} placeholder="Type here..." scrollEnabled inputAccessoryViewID={ACCESSORY_ID} />
                      {Platform.OS === "ios" && (
                        <InputAccessoryView nativeID={ACCESSORY_ID}>
                          <View style={s.accessory}><Button onPress={() => Keyboard.dismiss()} title="Done" /></View>
                        </InputAccessoryView>
                      )}
                    </>
                  ) : (
                    <ScrollView keyboardShouldPersistTaps="handled"><Text style={s.textRead}>{displayTxt}</Text></ScrollView>
                  )}
                </View>
              ) : (
                <View style={s.noPreview}>
                  <View style={s.bigIconWrap}><Ionicons name={getIcon(item.mimeType || "", item.name || "")} size={58} color="#6b7280" /></View>
                  <Text style={s.fileName}>{item?.name || safeTitle}</Text>
                  <Text style={s.noPreviewText}>No preview available</Text>
                  <TouchableOpacity onPress={handleDownload} style={s.downloadBtn} activeOpacity={0.85}>
                    <Text style={s.downloadBtnText}>Download / Open</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Footer */}
            <View style={s.footer}>
              <TouchableOpacity onPress={() => { Keyboard.dismiss(); onClose?.(); }} style={s.backBtn} activeOpacity={0.9}>
                <Ionicons name="arrow-back" size={18} color="#111" />
                <Text style={s.backText}>Back</Text>
              </TouchableOpacity>
              {canEdit ? (
                <TouchableOpacity onPress={onSave} disabled={!hasChanges || saving} style={[s.saveBtn, (!hasChanges || saving) && { opacity: 0.5 }]} activeOpacity={0.9}>
                  <Text style={s.saveText}>{saving ? "Saving..." : "Save"}</Text>
                </TouchableOpacity>
              ) : <View style={{ width: 1 }} />}
            </View>

          </Pressable>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "center" },
  dim: { backgroundColor: "rgba(0,0,0,0.10)" },
  centerWrap: { flex: 1, justifyContent: "center", padding: 18 },
  card: { backgroundColor: "rgba(255,255,255,0.94)", borderRadius: 22, overflow: "hidden" },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.06)" },
  title: { fontSize: 20, fontWeight: "900" },
  role: { marginTop: 6, opacity: 0.6 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  titleInput: { flex: 1, fontSize: 20, fontWeight: "900", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.05)" },
  checkBadge: { width: 34, height: 34, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.07)", alignItems: "center", justifyContent: "center" },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,0,0,0.07)", alignItems: "center", justifyContent: "center" },
  actionsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  iconBtn: { width: 46, height: 42, borderRadius: 14, backgroundColor: "rgba(0,0,0,0.07)", alignItems: "center", justifyContent: "center" },
  body: { padding: 16 },
  image: { width: "100%", height: 360, borderRadius: 14, resizeMode: "contain", backgroundColor: "rgba(0,0,0,0.03)" },
  
  mediaContainer: { width: "100%", height: 360, borderRadius: 14, backgroundColor: "#000", justifyContent: 'center', alignItems: 'center' },
  video: { width: "100%", height: "100%" },

  audioContainer: { backgroundColor: "rgba(0,0,0,0.04)", justifyContent: "center", alignItems: "center" },
  audioIconWrap: { marginBottom: 20, opacity: 0.5 },
  playPauseBtn: { marginBottom: 10 },
  audioText: { marginTop: 5, fontWeight: "600", color: "#555" },

  textBox: { borderRadius: 14, backgroundColor: "rgba(0,0,0,0.04)", padding: 12, maxHeight: 380 },
  textInput: { minHeight: 260, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", lineHeight: 20, fontSize: 14, padding: 0 },
  textRead: { fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", lineHeight: 20, fontSize: 14 },
  noPreview: { alignItems: "center", gap: 12, paddingVertical: 18 },
  bigIconWrap: { width: 110, height: 110, borderRadius: 26, backgroundColor: "rgba(0,0,0,0.05)", alignItems: "center", justifyContent: "center" },
  fileName: { fontSize: 18, fontWeight: "900" },
  noPreviewText: { opacity: 0.6 },
  downloadBtn: { marginTop: 10, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14, backgroundColor: "rgba(0,0,0,0.07)", minWidth: 180, alignItems: "center" },
  downloadBtnText: { fontWeight: "800" },
  footer: { flexDirection: "row", justifyContent: "space-between", gap: 12, padding: 16, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)" },
  backBtn: { flex: 1, flexDirection: "row", gap: 8, alignItems: "center", paddingVertical: 14, borderRadius: 16, backgroundColor: "rgba(0,0,0,0.10)", justifyContent: "center" },
  backText: { fontWeight: "900", color: "#111" },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 16, backgroundColor: "rgba(59,130,246,0.95)", alignItems: "center", justifyContent: "center" },
  saveText: { fontWeight: "900", color: "#fff" },
  accessory: { backgroundColor: "#f0f0f0", borderTopWidth: 1, borderTopColor: "#dcdcdc", flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 10, paddingVertical: 5 }
});