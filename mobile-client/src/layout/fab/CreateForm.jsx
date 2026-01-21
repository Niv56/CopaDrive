import React from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Platform, InputAccessoryView, Button, Keyboard
} from "react-native";

const ACCESSORY_ID = "fab_create_content_done";

export default function CreateForm({ 
  mode, // 'create_folder' or 'create_file'
  name, setName, 
  content, setContent, 
  onSubmit, onBack, loading 
}) {
  const isFolder = mode === "create_folder";

  return (
    <View style={styles.centerContainer}>
      <View style={styles.modalCard}>
        <Text style={styles.modalTitle}>
          {isFolder ? "CREATE NEW FOLDER" : "CREATE NEW FILE"}
        </Text>

        <TextInput
          style={styles.input}
          placeholder={isFolder ? "Folder Name" : "File Name"}
          value={name}
          onChangeText={setName}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={() => {
            if (isFolder) onSubmit();
            else Keyboard.dismiss();
          }}
        />

        {!isFolder && (
          <ScrollView style={{ width: "100%" }} keyboardShouldPersistTaps="handled">
            <TextInput
              style={[styles.input, { height: 120, textAlignVertical: "top" }]}
              placeholder="Content..."
              value={content}
              onChangeText={setContent}
              multiline
              inputAccessoryViewID={ACCESSORY_ID}
            />
          </ScrollView>
        )}

        {Platform.OS === "ios" && (
          <InputAccessoryView nativeID={ACCESSORY_ID}>
            <View style={styles.accessory}>
              <Button onPress={() => Keyboard.dismiss()} title="Done" />
            </View>
          </InputAccessoryView>
        )}

        <View style={styles.modalButtons}>
          <TouchableOpacity onPress={onBack} disabled={loading}>
            <Text style={styles.cancelText}>BACK</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.createBtn, loading && { opacity: 0.7 }]}
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
    padding: 30
  },
  modalCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  modalTitle: { fontSize: 18, marginBottom: 20, color: "#333", textAlign: "center", fontWeight: '700' },
  input: {
    width: "100%",
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
    marginTop: 4,
  },
  cancelText: { color: "#6c757d", fontSize: 14, padding: 10, fontWeight: '600' },
  createBtn: {
    backgroundColor: "#0d6efd",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  confirmText: { color: "white", fontSize: 14, fontWeight: '700' },

  // ✅ התיקון כאן: הקטנתי את ה-padding
  accessory: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 2,   // היה 10, הורדנו ל-2 כדי שיהיה דק
    paddingHorizontal: 10,
    backgroundColor: "#f0f0f0",
    borderTopWidth: 1,
    borderTopColor: "#dcdcdc"
  }
});