import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Dimensions
} from "react-native";
import { BlurView } from "expo-blur";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../../../app/providers/AuthContext";
import { updateUserProfile, changeUserPassword } from "../services/userService";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Formats string into Israeli phone format (05X-XXX-XXXX)
const formatIsraeliPhone = (raw) => {
  let v = String(raw || "").replace(/\D/g, "");
  if (v.length > 10) v = v.slice(0, 10);
  if (v.length <= 3) return v;
  if (v.length <= 6) return `${v.slice(0, 3)}-${v.slice(3)}`;
  return `${v.slice(0, 3)}-${v.slice(3, 6)}-${v.slice(6)}`;
};

export default function EditProfileModal({
  visible,
  onClose,
  userId,
  initialFirstName = "",
  initialLastName = "",
  initialPhoneNumber = "",
  initialImage = "",
}) {
  const { token, updateUserData } = useAuth();
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [phoneNumber, setPhoneNumber] = useState(formatIsraeliPhone(initialPhoneNumber));
  const [image, setImage] = useState(initialImage);
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Sync internal state with props when modal opens
  useEffect(() => {
    if (!visible) return;
    setFirstName(initialFirstName);
    setLastName(initialLastName);
    setPhoneNumber(formatIsraeliPhone(initialPhoneNumber));
    setImage(initialImage);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  }, [visible, initialFirstName, initialLastName, initialPhoneNumber, initialImage]);

  // Handle profile image selection
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Required", "Please allow access to photos.");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  // Submit profile updates and password changes
  const handleSave = async () => {
    if (!firstName.trim()) {
      Alert.alert("Validation Error", "First name is a required field.");
      return;
    }

    setSaving(true);
    try {
      const patch = { firstName: firstName.trim(), lastName: lastName.trim(), phoneNumber: phoneNumber.trim(), image };
      const updatedUser = await updateUserProfile(token, userId, patch);

      if (currentPassword && newPassword) {
        await changeUserPassword(token, userId, currentPassword, newPassword);
      }

      await updateUserData?.(updatedUser);
      onClose?.();
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardWrapper}
        >
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.title}>Edit profile</Text>

            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.imageSection}>
                <Pressable onPress={handlePickImage} style={styles.avatarWrapper}>
                  {image ? (
                    <Image source={{ uri: image }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                      <Ionicons name="person" size={50} color="#ccc" />
                    </View>
                  )}
                  <View style={styles.cameraIconBadge}>
                    <Ionicons name="camera" size={20} color="#fff" />
                  </View>
                </Pressable>
                <Text style={styles.changePhotoText}>Tap to change photo</Text>
              </View>

              <Field label="FIRST NAME" value={firstName} onChangeText={setFirstName} />
              <Field label="LAST NAME" value={lastName} onChangeText={setLastName} />
              <Field
                label="PHONE NUMBER"
                value={phoneNumber}
                onChangeText={(t) => setPhoneNumber(formatIsraeliPhone(t))}
                keyboardType="phone-pad"
              />

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>Security Settings</Text>
              <Field label="CURRENT PASSWORD" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
              <Field label="NEW PASSWORD" value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="" />
              <Field label="CONFIRM NEW PASSWORD" value={confirmNewPassword} onChangeText={setConfirmNewPassword} secureTextEntry />

            </ScrollView>

            <View style={styles.actions}>
              <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={onClose}>
                <Text style={styles.btnTextSecondary}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// Reusable input field component
function Field({ label, ...props }) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor="#ccc" {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  keyboardWrapper: { width: '90%', maxHeight: SCREEN_HEIGHT * 0.8 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 35,
    padding: 24,
    width: '100%',
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  title: {
    fontFamily: "BrunoAceSC_400Regular",
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    color: '#1a1a1a'
  },
  scrollArea: { maxHeight: SCREEN_HEIGHT * 0.5 },
  scrollContent: { paddingHorizontal: 4 },
  imageSection: { alignItems: "center", marginBottom: 25 },
  avatarWrapper: { position: "relative" },
  avatar: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#f8f9fa' },
  avatarPlaceholder: { justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: '#eee' },
  cameraIconBadge: {
    position: "absolute", bottom: 5, right: 5,
    backgroundColor: "#007bff", width: 34, height: 34,
    borderRadius: 17, justifyContent: "center", alignItems: "center",
    borderWidth: 3, borderColor: "#fff"
  },
  changePhotoText: { marginTop: 10, fontSize: 13, color: "#007bff", fontWeight: "700" },
  fieldContainer: { marginBottom: 18 },
  label: { fontSize: 11, fontWeight: "800", color: "#999", marginBottom: 8, marginLeft: 15, letterSpacing: 0.5 },
  input: {
    backgroundColor: "#f1f3f4",
    borderRadius: 30,
    paddingHorizontal: 22,
    height: 58,
    fontSize: 16,
    color: '#202124',
    borderWidth: 1,
    borderColor: 'transparent'
  },
  divider: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 25 },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 15, color: '#1a1a1a' },
  actions: { flexDirection: "row", gap: 12, marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  btn: { flex: 1, height: 55, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  btnPrimary: { backgroundColor: "#007bff" },
  btnGhost: { backgroundColor: "#f1f3f4" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  btnTextSecondary: { color: "#666", fontWeight: "700", fontSize: 16 }
});