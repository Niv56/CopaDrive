import React, { useEffect, useState, useMemo } from "react";
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
import { useTheme } from "../../../app/providers/ThemeContext";
import { updateUserProfile, changeUserPassword } from "../services/userService";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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
  const { colors, isDarkMode } = useTheme();

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [phoneNumber, setPhoneNumber] = useState(formatIsraeliPhone(initialPhoneNumber));
  const [image, setImage] = useState(initialImage);
  const [saving, setSaving] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Dynamic styles based on theme
  const dynamicStyles = useMemo(() => ({
    card: {
      backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
    },
    title: {
      color: colors.textPrimary,
    },
    avatar: {
      backgroundColor: isDarkMode ? "#2c2c2e" : "#f8f9fa",
    },
    avatarPlaceholder: {
      borderColor: isDarkMode ? "#3c3c3e" : "#eee",
    },
    cameraIconBadge: {
      backgroundColor: colors.primary,
      borderColor: isDarkMode ? "#1e1e1e" : "#fff",
    },
    changePhotoText: {
      color: colors.primary,
    },
    label: {
      color: colors.textSecondary,
    },
    input: {
      backgroundColor: isDarkMode ? "rgba(255,255,255,0.08)" : "#f1f3f4",
      color: colors.textPrimary,
      borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : "transparent",
    },
    divider: {
      backgroundColor: isDarkMode ? "#3c3c3e" : "#f0f0f0",
    },
    sectionTitle: {
      color: colors.textPrimary,
    },
    actions: {
      borderTopColor: isDarkMode ? "#3c3c3e" : "#f5f5f5",
    },
    btnPrimary: {
      backgroundColor: colors.primary,
    },
    btnGhost: {
      backgroundColor: isDarkMode ? "#333" : "#f1f3f4",
    },
    btnTextSecondary: {
      color: colors.textSecondary,
    },
    iconPlaceholder: {
      color: isDarkMode ? "#666" : "#ccc",
    },
  }), [colors, isDarkMode]);

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

  const handleSave = async () => {
    if (!firstName.trim()) {
      Alert.alert("Validation Error", "First name is a required field.");
      return;
    }

    setSaving(true);
    try {
      const patch = { firstName: firstName.trim(), lastName: lastName.trim(), phoneNumber: phoneNumber.trim(), image };
      console.log("[EditProfileModal] saving profile", { userId, patch });
      const updatedUser = await updateUserProfile(token, userId, patch);
      console.log("[EditProfileModal] update response", updatedUser);

      if (currentPassword && newPassword) {
        await changeUserPassword(token, userId, currentPassword, newPassword);
      }

      // Update user data in context so UI updates immediately
      await updateUserData?.(updatedUser);

      onClose?.();
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, ...props }) => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, dynamicStyles.label]}>{label}</Text>
      <TextInput
        style={[styles.input, dynamicStyles.input]}
        placeholderTextColor={colors.textTertiary}
        {...props}
      />
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <BlurView intensity={30} tint={isDarkMode ? "dark" : "light"} style={StyleSheet.absoluteFill} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardWrapper}
        >
          <Pressable style={[styles.card, dynamicStyles.card]} onPress={(e) => e.stopPropagation()}>
            <Text style={[styles.title, dynamicStyles.title]}>Edit profile</Text>

            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Profile Image Section */}
              <View style={styles.imageSection}>
                <Pressable onPress={handlePickImage} style={styles.avatarWrapper}>
                  {image ? (
                    <Image source={{ uri: image }} style={[styles.avatar, dynamicStyles.avatar]} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder, dynamicStyles.avatar, dynamicStyles.avatarPlaceholder]}>
                      <Ionicons name="person" size={50} color={dynamicStyles.iconPlaceholder.color} />
                    </View>
                  )}
                  <View style={[styles.cameraIconBadge, dynamicStyles.cameraIconBadge]}>
                    <Ionicons name="camera" size={20} color="#fff" />
                  </View>
                </Pressable>
                <Text style={[styles.changePhotoText, dynamicStyles.changePhotoText]}>Tap to change photo</Text>
              </View>

              <Field label="FIRST NAME" value={firstName} onChangeText={setFirstName} />
              <Field label="LAST NAME" value={lastName} onChangeText={setLastName} />
              <Field
                label="PHONE NUMBER"
                value={phoneNumber}
                onChangeText={(t) => setPhoneNumber(formatIsraeliPhone(t))}
                keyboardType="phone-pad"
              />

              <View style={[styles.divider, dynamicStyles.divider]} />

              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Security Settings</Text>
              <Field label="CURRENT PASSWORD" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
              <Field label="NEW PASSWORD" value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="" />
              <Field label="CONFIRM NEW PASSWORD" value={confirmNewPassword} onChangeText={setConfirmNewPassword} secureTextEntry />

            </ScrollView>

            <View style={[styles.actions, dynamicStyles.actions]}>
              <TouchableOpacity style={[styles.btn, styles.btnGhost, dynamicStyles.btnGhost]} onPress={onClose}>
                <Text style={[styles.btnTextSecondary, dynamicStyles.btnTextSecondary]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnPrimary, dynamicStyles.btnPrimary]} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  keyboardWrapper: { width: '90%', maxHeight: SCREEN_HEIGHT * 0.8 },
  card: {
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
  },

  scrollArea: { maxHeight: SCREEN_HEIGHT * 0.5 },
  scrollContent: { paddingHorizontal: 4 },

  imageSection: { alignItems: "center", marginBottom: 25 },
  avatarWrapper: { position: "relative" },
  avatar: { width: 110, height: 110, borderRadius: 55 },
  avatarPlaceholder: { justifyContent: "center", alignItems: "center", borderWidth: 1 },
  cameraIconBadge: {
    position: "absolute", bottom: 5, right: 5,
    width: 34, height: 34,
    borderRadius: 17, justifyContent: "center", alignItems: "center",
    borderWidth: 3,
  },
  changePhotoText: { marginTop: 10, fontSize: 13, fontWeight: "700" },

  fieldContainer: { marginBottom: 18 },
  label: { fontSize: 11, fontWeight: "800", marginBottom: 8, marginLeft: 15, letterSpacing: 0.5 },
  input: {
    borderRadius: 30,
    paddingHorizontal: 22,
    height: 58,
    fontSize: 16,
    borderWidth: 1,
  },

  divider: { height: 1, marginVertical: 25 },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 15 },

  actions: { flexDirection: "row", gap: 12, marginTop: 15, paddingTop: 15, borderTopWidth: 1 },
  btn: { flex: 1, height: 55, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  btnPrimary: {},
  btnGhost: {},
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  btnTextSecondary: { fontWeight: "700", fontSize: 16 }
});