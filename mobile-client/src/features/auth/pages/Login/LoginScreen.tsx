import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../../app/providers/AuthContext";
import AuthLayout from "../../components/AuthLayout";
import { authStyles } from "../../styles/auth.styles";

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
    <AuthLayout subtitle="Sign in to continue">
      <View>
        <Text style={authStyles.label}>Email</Text>
        <View style={authStyles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color="#666" style={authStyles.inputIcon} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="username@copa.com"
            placeholderTextColor="#999"
            style={authStyles.input}
          />
        </View>

        <Text style={authStyles.label}>Password</Text>
        <View style={authStyles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={authStyles.inputIcon} />
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#999"
            style={authStyles.input}
          />
        </View>

        <Pressable
          disabled={!canSubmit}
          onPress={onLogin}
          style={[authStyles.btnPrimary, !canSubmit && authStyles.btnDisabled]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={authStyles.btnTextPrimary}>Sign In</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.push("/(auth)/register")} style={authStyles.linkBtn}>
          <Text style={authStyles.linkText}>
            Don't have an account? <Text style={authStyles.linkTextBold}>Create account</Text>
          </Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
}