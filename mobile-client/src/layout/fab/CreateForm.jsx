import React, { useState, useMemo } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Platform, InputAccessoryView, Button, Keyboard, Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../app/providers/ThemeContext"; // ✅ נתיב מתוקן (שתי דרגות למעלה)

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const ACCESSORY_ID = "fab_create_content_done";

export default function CreateForm({ 
  mode, // 'create_folder' or 'create_file'
  name, setName, 
  content, setContent, 
  folders = [],
  selectedFolderId, setSelectedFolderId,
  onSubmit, onBack, loading 
}) {
  const { colors, isDarkMode } = useTheme(); // ✅ שימוש ב-Theme
  const isFolder = mode === "create_folder";
  const [showFolderPicker, setShowFolderPicker] = useState(false);

  const selectedFolderName = useMemo(() => {
    if (!selectedFolderId) return "My Drive (Root)";
    const folder = folders?.find(f => f.id === selectedFolderId);
    return folder?.name || "Unknown Folder";
  }, [selectedFolderId, folders]);

  return (
    <View style={styles.centerContainer}>
      <View style={[
        styles.modalCard, 
        { backgroundColor: isDarkMode ? "#1e1e1e" : "#fff" } // ✅ התאמה ל-EditProfile
      ]}>
        <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
          {isFolder ? "CREATE NEW FOLDER" : "CREATE NEW FILE"}
        </Text>

        <TextInput
          style={[
            styles.input,
            { 
              backgroundColor: isDarkMode ? "rgba(255,255,255,0.08)" : "#f1f3f4", 
              color: colors.textPrimary,
              borderColor: isDarkMode ? "transparent" : "#e9ecef",
              borderWidth: isDarkMode ? 0 : 1
            }
          ]}
          placeholder={isFolder ? "Folder Name" : "File Name"}
          placeholderTextColor={colors.textTertiary}
          value={name}
          onChangeText={setName}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
        />

        {!isFolder && (
          <ScrollView style={{ width: "100%", maxHeight: 150 }} keyboardShouldPersistTaps="handled">
            <TextInput
              style={[
                styles.input, 
                { 
                  height: 120, 
                  textAlignVertical: "top",
                  backgroundColor: isDarkMode ? "rgba(255,255,255,0.08)" : "#f1f3f4",
                  color: colors.textPrimary,
                  borderRadius: 20,
                  borderWidth: isDarkMode ? 0 : 1
                }
              ]}
              placeholder="Content..."
              placeholderTextColor={colors.textTertiary}
              value={content}
              onChangeText={setContent}
              multiline
              inputAccessoryViewID={ACCESSORY_ID}
            />
          </ScrollView>
        )}

        {/* Folder Picker */}
        <Text style={[styles.label, { color: isDarkMode ? "#999" : "#666" }]}>SAVE TO</Text>
        <TouchableOpacity 
          style={[
            styles.folderPicker, 
            { 
              backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8f9fa", 
              borderColor: colors.border 
            }
          ]} 
          onPress={() => setShowFolderPicker(!showFolderPicker)}
        >
          <Ionicons name="folder-outline" size={20} color={colors.primary} />
          <Text style={[styles.folderPickerText, { color: colors.textPrimary }]}>{selectedFolderName}</Text>
          <Ionicons 
            name={showFolderPicker ? "chevron-up" : "chevron-down"} 
            size={18} 
            color={colors.textTertiary} 
          />
        </TouchableOpacity>

        {showFolderPicker && (
          <View style={[
            styles.folderList, 
            { backgroundColor: isDarkMode ? "#252525" : "#f8f9fa", borderColor: colors.border }
          ]}>
            <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
              <TouchableOpacity
                style={[
                  styles.folderItem, 
                  !selectedFolderId && { backgroundColor: isDarkMode ? "rgba(0,123,255,0.2)" : "#e0f2fe" }
                ]}
                onPress={() => { 
                  setSelectedFolderId(null); 
                  setShowFolderPicker(false); 
                }}
              >
                <Ionicons name="home-outline" size={18} color={colors.textSecondary} />
                <Text style={[styles.folderItemText, { color: colors.textPrimary }]}>My Drive (Root)</Text>
              </TouchableOpacity>
              
              {folders?.filter(f => f.type === "folder").map(folder => (
                <TouchableOpacity
                  key={folder.id}
                  style={[
                    styles.folderItem, 
                    selectedFolderId === folder.id && { backgroundColor: isDarkMode ? "rgba(0,123,255,0.2)" : "#e0f2fe" }
                  ]}
                  onPress={() => { 
                    setSelectedFolderId(folder.id); 
                    setShowFolderPicker(false); 
                  }}
                >
                  <Ionicons name="folder" size={18} color="#f59e0b" />
                  <Text style={[styles.folderItemText, { color: colors.textPrimary }]}>{folder.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {Platform.OS === "ios" && (
          <InputAccessoryView nativeID={ACCESSORY_ID}>
            <View style={[styles.accessory, { backgroundColor: isDarkMode ? "#2c2c2e" : "#f0f0f0" }]}>
              <Button onPress={() => Keyboard.dismiss()} title="Done" />
            </View>
          </InputAccessoryView>
        )}

        <View style={styles.modalButtons}>
          <TouchableOpacity 
            style={[styles.btnAction, { backgroundColor: isDarkMode ? "#333" : "#f1f3f4" }]} 
            onPress={onBack} 
            disabled={loading}
          >
            <Text style={[styles.cancelText, { color: colors.textPrimary }]}>BACK</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.createBtn, { backgroundColor: colors.primary }, loading && { opacity: 0.7 }]}
            onPress={onSubmit}
            disabled={loading}
          >
            <Text style={styles.confirmText}>CREATE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalCard: {
    borderRadius: 35,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: "center",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalTitle: { fontSize: 18, marginBottom: 20, textAlign: "center", fontWeight: '700' },
  input: {
    width: "100%",
    borderRadius: 30,
    paddingHorizontal: 22,
    height: 50,
    fontSize: 16,
    marginBottom: 15,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 8,
    marginLeft: 15,
    letterSpacing: 0.5,
  },
  folderPicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
    borderWidth: 1,
    borderRadius: 30,
    padding: 15,
    marginBottom: 8,
  },
  folderPickerText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  folderList: {
    width: "100%",
    borderRadius: 20,
    marginBottom: 15,
    maxHeight: 120,
    overflow: "hidden",
    borderWidth: 1,
  },
  folderItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
  },
  folderItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  btnAction: {
    flex: 1,
    height: 55,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { fontSize: 14, fontWeight: '700' },
  createBtn: {
    flex: 1,
    height: 55,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: { color: "white", fontSize: 14, fontWeight: '800' },

  accessory: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 2,   
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: "#dcdcdc"
  }
});