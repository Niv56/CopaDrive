import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../../../app/providers/AuthContext";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.length > 0 && !loading,
    [email, password, loading]
  );

  const onLogin = async () => {
    if (!canSubmit) return;

    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);

    if (!res.ok) {
      Alert.alert("Login Failed", res.error);
      return;
    }

    router.replace("/(app)/home");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>CopaDrive</Text>
      <Text style={styles.sub}>Sign in to continue</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder="username@copa.com"
        style={styles.input}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••••"
        style={styles.input}
      />

      <Pressable disabled={!canSubmit} onPress={onLogin} style={[styles.btn, !canSubmit && styles.btnDisabled]}>
        {loading ? <ActivityIndicator /> : <Text style={styles.btnText}>Login</Text>}
      </Pressable>

      <Pressable onPress={() => router.push("/(auth)/register")} style={styles.linkBtn}>
        <Text style={styles.linkText}>Create account</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  brand: { fontSize: 34, fontWeight: "800", textAlign: "center" },
  sub: { fontSize: 16, opacity: 0.7, textAlign: "center", marginTop: 8, marginBottom: 28 },

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

  btn: { marginTop: 18, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: "#111", alignItems: "center" },
  btnDisabled: { opacity: 0.45 },
  btnText: { fontSize: 16, fontWeight: "700" },

  linkBtn: { marginTop: 14, alignItems: "center" },
  linkText: { fontSize: 14, fontWeight: "700", textDecorationLine: "underline" },
});