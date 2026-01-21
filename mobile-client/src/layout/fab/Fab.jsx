import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
  ActivityIndicator, Pressable, Keyboard, LayoutAnimation, Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

// ✅ תיקון נתיבים: הוספנו ../ כי נכנסנו לתוך תיקיית fab
import { useAuth } from "../../app/providers/AuthContext";
import { createItem } from "../../features/drive/services/fileService";
import { emitDriveRefresh } from "../../features/drive/services/driveEvents";

// ✅ תיקון נתיב ל-Hook
import { useDriveUploads } from "../../features/drive/hooks/useDriveUploads";

// ✅ תיקון קריטי: הקבצים האלו נמצאים עכשיו ממש ליד Fab.jsx
import ActionMenu from "./ActionMenu";
import CreateForm from "./CreateForm";

const NEWLINE = "_@NL@_";

export default function Fab({ onRefresh }) {
  const { token } = useAuth();
  
  // ניהול המצבים: 'closed' | 'menu' | 'create_file' | 'create_folder'
  const [activeView, setActiveView] = useState("closed");
  
  // State לטופס יצירה
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // סגירת הכל
  const closeAll = () => {
    setActiveView("closed");
    setTimeout(() => { setName(""); setContent(""); }, 300);
    Keyboard.dismiss();
  };

  // שימוש ב-Hook להעלאות
  const { loading: uploadLoading, pickDocument, pickImage } = useDriveUploads(token, onRefresh, closeAll);

  // מעבר חלק בין מסכים
  const switchTo = (view) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveView(view);
  };

  // ניתוב פעולות מהתפריט
  const handleMenuAction = (action) => {
    switch(action) {
      case "create_folder": switchTo("create_folder"); break;
      case "create_file":   switchTo("create_file"); break;
      case "upload_image":  pickImage(false); break;
      case "take_photo":    pickImage(true); break;
      case "upload_file":   pickDocument(); break;
    }
  };

  // לוגיקה ליצירת קובץ/תיקייה
  const handleSubmitCreate = async () => {
    if (!name.trim()) return;
    if (!token) return Alert.alert("Error", "Not logged in");

    setCreateLoading(true);
    try {
      const isFolder = activeView === "create_folder";
      const finalName = isFolder ? name.trim() : (name.trim().endsWith(".txt") ? name.trim() : `${name.trim()}.txt`);

      await createItem(token, {
        name: finalName,
        type: isFolder ? "folder" : "file",
        content: isFolder ? "" : String(content || "").replaceAll("\n", NEWLINE),
        mimeType: isFolder ? "" : "text/plain",
      });

      emitDriveRefresh({ reason: "create", name: finalName });
      onRefresh?.();
      closeAll();
    } catch (err) {
      Alert.alert("Error", err?.message || "Unknown error");
    } finally {
      setCreateLoading(false);
    }
  };

  const loading = uploadLoading || createLoading;
  const isOpen = activeView !== "closed";
  const isMenu = activeView === "menu";
  const isCreate = activeView === "create_file" || activeView === "create_folder";

  return (
    <>
      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#0d6efd" />
          <Text style={styles.loaderText}>WORKING...</Text>
        </View>
      )}

      {/* מודל ראשי אחד */}
      <Modal visible={isOpen} transparent animationType="fade">
        <View style={styles.container}>
          <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
          <Pressable style={StyleSheet.absoluteFill} onPress={closeAll} />

          {/* תפריט */}
          {isMenu && (
            <ActionMenu onAction={handleMenuAction} disabled={loading} />
          )}

          {/* טופס יצירה */}
          {isCreate && (
            <CreateForm 
              mode={activeView}
              name={name} setName={setName}
              content={content} setContent={setContent}
              loading={loading}
              onBack={() => switchTo("menu")}
              onSubmit={handleSubmitCreate}
            />
          )}
        </View>
      </Modal>

      {/* כפתור הפלוס הראשי */}
      {!isOpen && (
        <View style={styles.fabPosition}>
          <TouchableOpacity
            style={[styles.fabMain, loading && { opacity: 0.7 }]}
            onPress={() => !loading && switchTo("menu")}
            activeOpacity={0.9}
            disabled={loading}
          >
            <Ionicons name="add" size={35} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fabPosition: { position: "absolute", bottom: 90, right: 25, zIndex: 9999 },
  fabMain: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: "#0d6efd",
    justifyContent: "center", alignItems: "center", elevation: 5,
  },
  container: { flex: 1 },
  loaderOverlay: {
    position: "absolute", top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", zIndex: 10000,
  },
  loaderText: { marginTop: 15, color: "white", fontSize: 16, letterSpacing: 2, fontWeight: 'bold' },
});