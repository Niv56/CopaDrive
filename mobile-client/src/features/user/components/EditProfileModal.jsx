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
import { useTheme } from "../../../app/providers/ThemeContext"; // ✅ Theme

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
  const { token } = useAuth();
  const { colors, isDarkMode } = useTheme(); // ✅

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [phoneNumber, setPhoneNumber] = useState(formatIsraeliPhone(initialPhoneNumber));
  const [image, setImage] = useState(initialImage);
  const [saving, setSaving] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

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
    // ✅ ולידציה לשם
    if (!firstName.trim()) {
      Alert.alert("Validation Error", "First name is a required field.");
      return;
    }

    // ✅ ולידציה לטלפון (בדיוק כמו בהרשמה)
    const rawPhone = phoneNumber.replace(/\D/g, "");
    if (phoneNumber.length > 0 && rawPhone.length < 10) {
        Alert.alert("Validation Error", "Phone number must be 10 digits.");
        return;
    }

    // ✅ ולידציה לסיסמה
    if (currentPassword || newPassword || confirmNewPassword) {
        if (!currentPassword) {
            Alert.alert("Validation Error", "Please enter your current password.");
            return;
        }
        if (!newPassword) {
            Alert.alert("Validation Error", "Please enter a new password.");
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert("Validation Error", "New password must be at least 6 characters.");
            return;
        }
        if (newPassword === currentPassword) {
            Alert.alert("Validation Error", "New password cannot be the same as the old one.");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            Alert.alert("Validation Error", "New passwords do not match.");
            return;
        }
    }

    setSaving(true);
    try {
      const patch = { 
          firstName: firstName.trim(), 
          lastName: lastName.trim(), 
          phoneNumber: phoneNumber.trim(), 
          image 
      };
      await updateUserProfile(token, userId, patch);

      if (currentPassword && newPassword) {
        await changeUserPassword(token, userId, currentPassword, newPassword);
      }
      onClose?.();
    } catch (e) {
      Alert.alert("Error", e.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        {/* רקע מטושטש */}
        <BlurView intensity={Platform.OS === 'ios' ? 40 : 80} tint="dark" style={StyleSheet.absoluteFill} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardWrapper}
        >
          <Pressable 
            style={[
                styles.card, 
                { backgroundColor: isDarkMode ? "#1e1e1e" : "#fff" } // ✅ רקע דינמי
            ]} 
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.title, { color: colors.textPrimary }]}>Edit profile</Text>

            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* תמונת פרופיל */}
              <View style={styles.imageSection}>
                <Pressable onPress={handlePickImage} style={styles.avatarWrapper}>
                  {image ? (
                    <Image source={{ uri: image }} style={[styles.avatar, { borderColor: colors.border }]} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <Ionicons name="person" size={50} color={colors.textTertiary} />
                    </View>
                  )}
                  <View style={[styles.cameraIconBadge, { borderColor: isDarkMode ? "#1e1e1e" : "#fff" }]}>
                    <Ionicons name="camera" size={20} color="#fff" />
                  </View>
                </Pressable>
                <Text style={styles.changePhotoText}>Tap to change photo</Text>
              </View>

              {/* שדות טקסט */}
              <Field 
                label="FIRST NAME" 
                value={firstName} 
                onChangeText={setFirstName} 
                colors={colors} 
                isDarkMode={isDarkMode} 
              />
              <Field 
                label="LAST NAME" 
                value={lastName} 
                onChangeText={setLastName} 
                colors={colors} 
                isDarkMode={isDarkMode} 
              />
              <Field
                label="PHONE NUMBER"
                value={phoneNumber}
                onChangeText={(t) => setPhoneNumber(formatIsraeliPhone(t))}
                keyboardType="phone-pad"
                colors={colors} 
                isDarkMode={isDarkMode} 
              />

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Security Settings</Text>
              
              <Field 
                label="CURRENT PASSWORD" 
                value={currentPassword} 
                onChangeText={setCurrentPassword} 
                secureTextEntry 
                colors={colors} 
                isDarkMode={isDarkMode} 
              />
              <Field 
                label="NEW PASSWORD" 
                value={newPassword} 
                onChangeText={setNewPassword} 
                secureTextEntry 
                placeholder="" 
                colors={colors} 
                isDarkMode={isDarkMode} 
              />
              <Field 
                label="CONFIRM NEW PASSWORD" 
                value={confirmNewPassword} 
                onChangeText={setConfirmNewPassword} 
                secureTextEntry 
                colors={colors} 
                isDarkMode={isDarkMode} 
              />

            </ScrollView>

            {/* כפתורים */}
            <View style={[styles.actions, { borderTopColor: colors.border }]}>
              <TouchableOpacity 
                style={[styles.btn, { backgroundColor: isDarkMode ? "#333" : "#f1f3f4" }]} 
                onPress={onClose}
              >
                <Text style={[styles.btnTextSecondary, { color: colors.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.btn, styles.btnPrimary]} 
                onPress={handleSave} 
                disabled={saving}
              >
                {saving ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.btnText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function Field({ label, colors, isDarkMode, ...props }) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
            styles.input, 
            { 
                backgroundColor: isDarkMode ? "rgba(255,255,255,0.08)" : "#f1f3f4", // רקע כהה בלילה
                color: colors.textPrimary // טקסט לבן בלילה
            }
        ]}
        placeholderTextColor={colors.textTertiary}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  keyboardWrapper: { width: '90%', maxHeight: SCREEN_HEIGHT * 0.85 },
  card: {
    borderRadius: 35,
    padding: 24,
    width: '100%',
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  title: {
    fontFamily: "BrunoAceSC_400Regular",
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  scrollArea: { maxHeight: SCREEN_HEIGHT * 0.55 },
  scrollContent: { paddingHorizontal: 4, paddingBottom: 20 },
  imageSection: { alignItems: "center", marginBottom: 25 },
  avatarWrapper: { position: "relative" },
  avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 1 },
  avatarPlaceholder: { justifyContent: "center", alignItems: "center" },
  cameraIconBadge: {
    position: "absolute", bottom: 5, right: 5,
    backgroundColor: "#007bff", width: 34, height: 34,
    borderRadius: 17, justifyContent: "center", alignItems: "center",
    borderWidth: 3
  },
  changePhotoText: { marginTop: 10, fontSize: 13, color: "#007bff", fontWeight: "700" },
  fieldContainer: { marginBottom: 18 },
  label: { fontSize: 11, fontWeight: "800", color: "#999", marginBottom: 8, marginLeft: 15, letterSpacing: 0.5 },
  input: {
    borderRadius: 30,
    paddingHorizontal: 22,
    height: 50,
    fontSize: 16,
    borderWidth: 0
  },
  divider: { height: 1, marginVertical: 25 },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 15 },
  actions: { flexDirection: "row", gap: 12, marginTop: 15, paddingTop: 15, borderTopWidth: 1 },
  btn: { flex: 1, height: 55, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  btnPrimary: { backgroundColor: "#007bff" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  btnTextSecondary: { fontWeight: "700", fontSize: 16 }
});