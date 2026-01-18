import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
// תיקון נתיב: יוצאים מתיקיית Register ונכנסים ל-services
import { registerUser } from "../../services/authService";
export default function RegisterScreen() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordsMatch = password.length > 0 && verifyPassword.length > 0 && password === verifyPassword;

  const canSubmit = useMemo(() => {
    return (
      firstName.trim().length >= 2 &&
      email.trim().length > 0 &&
      password.length >= 8 &&
      password === verifyPassword &&
      !loading
    );
  }, [firstName, email, password, verifyPassword, loading]);

  const onSubmit = async () => {
    if (!canSubmit) return;

    setLoading(true);
    const res = await registerUser({
      firstName: firstName.trim(),
      lastName: lastName.trim() || undefined,
      phoneNumber: phoneNumber.trim() || undefined,
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);

    if (!res.success) {
      Alert.alert("Register failed", res.error);
      return;
    }

    Alert.alert("Success", "Account created!");
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Create account</Text>
      <Text style={styles.sub}>Join CopaDrive</Text>

      <Text style={styles.label}>First name</Text>
      <TextInput value={firstName} onChangeText={setFirstName} placeholder="Amit" style={styles.input} />

      <Text style={styles.label}>Last name (optional)</Text>
      <TextInput value={lastName} onChangeText={setLastName} placeholder="Lev" style={styles.input} />

      <Text style={styles.label}>Phone (optional)</Text>
      <TextInput value={phoneNumber} onChangeText={setPhoneNumber} placeholder="054-123-4567" keyboardType="phone-pad" style={styles.input} />

      <Text style={styles.label}>Email</Text>
      <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="username@copa.com" style={styles.input} />

      <Text style={styles.label}>Password</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="min 8 chars" style={styles.input} />

      <Text style={styles.label}>Verify password</Text>
      <TextInput value={verifyPassword} onChangeText={setVerifyPassword} secureTextEntry placeholder="repeat password" style={styles.input} />

      {!passwordsMatch && verifyPassword.length > 0 ? <Text style={styles.warn}>Passwords don't match</Text> : null}

      <Pressable disabled={!canSubmit} onPress={onSubmit} style={[styles.btn, !canSubmit && styles.btnDisabled]}>
        {loading ? <ActivityIndicator /> : <Text style={styles.btnText}>Register</Text>}
      </Pressable>

      <Pressable onPress={() => router.replace("/(auth)/login")} style={styles.linkBtn}>
        <Text style={styles.linkText}>Back to login</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  brand: { fontSize: 28, fontWeight: "800", textAlign: "center" },
  sub: { fontSize: 16, opacity: 0.7, textAlign: "center", marginTop: 8, marginBottom: 22 },

  label: { fontSize: 13, fontWeight: "600", marginTop: 10, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },

  warn: { marginTop: 8, color: "crimson", fontWeight: "600" },

  btn: { marginTop: 18, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: "#111", alignItems: "center" },
  btnDisabled: { opacity: 0.45 },
  btnText: { fontSize: 16, fontWeight: "700" },

  linkBtn: { marginTop: 14, alignItems: "center" },
  linkText: { fontSize: 14, fontWeight: "700", textDecorationLine: "underline" },
});