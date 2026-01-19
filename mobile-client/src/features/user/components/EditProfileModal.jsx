import React, { useEffect, useMemo, useState } from "react";
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
} from "react-native";
import { BlurView } from "expo-blur";

import { useAuth } from "../../../app/providers/AuthContext";
import { updateUserProfile, changeUserPassword } from "../services/userService";

// --- helpers ---
const formatIsraeliPhone = (raw) => {
  let v = String(raw || "").replace(/\D/g, "");
  if (v.length > 10) v = v.slice(0, 10);
  if (v.length <= 3) return v;
  if (v.length <= 6) return `${v.slice(0, 3)}-${v.slice(3)}`;
  return `${v.slice(0, 3)}-${v.slice(3, 6)}-${v.slice(6)}`;
};

const validatePhone = (value) => {
  const clean = String(value || "").replace(/\D/g, "");
  if (!clean) return "Phone number is required";
  if (clean.length !== 10) return "Number must be exactly 10 digits";
  if (!clean.startsWith("05")) return "Must start with 05";
  return "";
};


const passwordStrength = (pwd) => ({
  hasLength: (pwd || "").length >= 8,
  hasUpper: /[A-Z]/.test(pwd || ""),
  hasLower: /[a-z]/.test(pwd || ""),
  hasNumber: /[0-9]/.test(pwd || ""),
});

export default function EditProfileModal({
  visible,
  onClose,
  userId,
  initialFirstName = "",
  initialLastName = "",
  initialPhoneNumber = "",
  initialDateOfBirth = "",
  initialImage = "", // not used yet (you can add image later)
}) {
  const { token } = useAuth();

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [phoneNumber, setPhoneNumber] = useState(formatIsraeliPhone(initialPhoneNumber));
  const [dateOfBirth, setDateOfBirth] = useState(initialDateOfBirth);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({
    firstName: "",
    phoneNumber: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  useEffect(() => {
    if (!visible) return;
    setFirstName(initialFirstName || "");
    setLastName(initialLastName || "");
    setPhoneNumber(formatIsraeliPhone(initialPhoneNumber || ""));
    setDateOfBirth(initialDateOfBirth || "");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setErrors({
      firstName: "",
      phoneNumber: "",
      dateOfBirth: "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
  }, [visible, initialFirstName, initialLastName, initialPhoneNumber, initialDateOfBirth]);

  const pwdFlags = useMemo(() => passwordStrength(newPassword), [newPassword]);
  const pwdStrongEnough = pwdFlags.hasLength && pwdFlags.hasUpper && pwdFlags.hasLower && pwdFlags.hasNumber;

  const validateBeforeSave = () => {
    const next = {
      firstName: "",
      phoneNumber: "",
      dateOfBirth: "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    };

    if (!firstName.trim()) next.firstName = "First name is required";
    next.phoneNumber = validatePhone(phoneNumber);
    next.dateOfBirth = validateDOB(dateOfBirth);

    const wantsPwd = !!(currentPassword || newPassword || confirmNewPassword);
    if (wantsPwd) {
      if (!currentPassword) next.currentPassword = "Current password is required";
      if (!newPassword) next.newPassword = "New password is required";
      if (!confirmNewPassword) next.confirmNewPassword = "Please confirm the new password";
      if (currentPassword && newPassword && currentPassword === newPassword) {
        next.newPassword = "New password cannot be the same as current password";
      }
      if (newPassword && confirmNewPassword && newPassword !== confirmNewPassword) {
        next.confirmNewPassword = "Passwords don't match";
      }
      if (newPassword && !pwdStrongEnough) {
        next.newPassword = "Password is too weak";
      }
    }

    setErrors(next);
    return Object.values(next).some(Boolean);
  };

  const handleSave = async () => {
    if (!token) {
      Alert.alert("Not logged in", "No token found.");
      return;
    }
    if (!userId) {
      Alert.alert("Missing userId", "Cannot update profile without userId.");
      return;
    }
    if (validateBeforeSave()) return;

    setSaving(true);
    try {
      const patch = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        dateOfBirth: dateOfBirth.trim(),
        image: initialImage || "", // (keep as-is for now)
      };

      await updateUserProfile(token, userId, patch);

      const wantsPwd = !!(currentPassword || newPassword || confirmNewPassword);
      if (wantsPwd) {
        await changeUserPassword(token, userId, currentPassword, newPassword);
      }

      Alert.alert("Saved", "Profile updated successfully.");
      onClose?.();
    } catch (e) {
      const msg = e?.message || "Failed to update profile";
      // If backend returns "current password" errors
      if (String(msg).toLowerCase().includes("current password")) {
        setErrors((p) => ({ ...p, currentPassword: msg }));
      } else {
        Alert.alert("Error", msg);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={saving ? undefined : onClose}>
        <BlurView intensity={22} tint="light" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, styles.dim]} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.centerWrap}
        >
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.title}>Edit profile</Text>

            <ScrollView contentContainerStyle={{ paddingBottom: 10 }} showsVerticalScrollIndicator={false}>
              <Field
                label="First name"
                value={firstName}
                onChangeText={(t) => { setFirstName(t); if (errors.firstName) setErrors((p) => ({ ...p, firstName: "" })); }}
                error={errors.firstName}
              />
              <Field
                label="Last name"
                value={lastName}
                onChangeText={setLastName}
              />
              <Field
                label="Phone number"
                value={phoneNumber}
                keyboardType="phone-pad"
                onChangeText={(t) => {
                  setPhoneNumber(formatIsraeliPhone(t));
                  if (errors.phoneNumber) setErrors((p) => ({ ...p, phoneNumber: "" }));
                }}
                placeholder="05X-XXX-XXXX"
                error={errors.phoneNumber}
              />

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>Change password (optional)</Text>

              <Field
                label="Current password"
                value={currentPassword}
                secureTextEntry
                onChangeText={(t) => { setCurrentPassword(t); if (errors.currentPassword) setErrors((p) => ({ ...p, currentPassword: "" })); }}
                error={errors.currentPassword}
              />
              <Field
                label="New password"
                value={newPassword}
                secureTextEntry
                onChangeText={(t) => { setNewPassword(t); if (errors.newPassword) setErrors((p) => ({ ...p, newPassword: "" })); }}
                error={errors.newPassword}
              />
              <Field
                label="Confirm new password"
                value={confirmNewPassword}
                secureTextEntry
                onChangeText={(t) => { setConfirmNewPassword(t); if (errors.confirmNewPassword) setErrors((p) => ({ ...p, confirmNewPassword: "" })); }}
                error={errors.confirmNewPassword}
              />

              {!!newPassword && (
                <View style={styles.pwdBox}>
                  <PwdRow ok={pwdFlags.hasLength} text="At least 8 characters" />
                  <PwdRow ok={pwdFlags.hasUpper} text="One uppercase letter" />
                  <PwdRow ok={pwdFlags.hasLower} text="One lowercase letter" />
                  <PwdRow ok={pwdFlags.hasNumber} text="One number" />
                </View>
              )}
            </ScrollView>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.btn, styles.btnGhost]}
                onPress={onClose}
                disabled={saving}
              >
                <Text style={[styles.btnText, styles.btnGhostText]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary, saving && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={[styles.btnText]}>Save</Text>}
              </TouchableOpacity>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

function Field({ label, error, ...props }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={[styles.input, error && styles.inputError]} {...props} />
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

function PwdRow({ ok, text }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
      <Text style={{ width: 18, textAlign: "center", color: ok ? "#198754" : "#dc3545" }}>
        {ok ? "✓" : "•"}
      </Text>
      <Text style={{ fontSize: 13, color: ok ? "#198754" : "#dc3545" }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "transparent" },
  dim: { backgroundColor: "rgba(0,0,0,0.10)" },

  centerWrap: { flex: 1, justifyContent: "center", paddingHorizontal: 16 },

  card: {
    backgroundColor: "rgba(255,255,255,0.98)",
    borderRadius: 22,
    padding: 16,
    maxHeight: "85%",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },

  title: { fontSize: 18, fontWeight: "700", color: "#222", marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#333", marginBottom: 8 },

  label: { fontSize: 12, fontWeight: "600", color: "#555", marginBottom: 6 },
  input: {
    backgroundColor: "#f1f3f4",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#222",
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputError: { borderColor: "#dc3545" },
  errorText: { color: "#dc3545", fontSize: 12, marginTop: 6 },

  divider: { height: 1, backgroundColor: "rgba(0,0,0,0.08)", marginVertical: 12 },

  pwdBox: {
    marginTop: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },

  actions: { flexDirection: "row", gap: 10, marginTop: 12 },
  btn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimary: { backgroundColor: "#0d6efd" },
  btnGhost: { backgroundColor: "rgba(0,0,0,0.04)" },
  btnText: { color: "#fff", fontWeight: "700" },
  btnGhostText: { color: "#333" },
});
