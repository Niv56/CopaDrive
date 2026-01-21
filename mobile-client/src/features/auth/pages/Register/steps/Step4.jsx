import React from "react";
import { View, Text, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * Registration Step 4: Security & Credentials
 * Handles email setup with auto-domain completion and password verification.
 */
export default function Step4({ formData, setFormData, errors, styles, colors }) {

  /** * QoL helper: Automatically appends the organization domain 
   * when the user types the '@' symbol.
   */
  const handleEmailChange = (text) => {
    let val = text;
    if (val.endsWith("@") && val.length > (formData.email || "").length) {
      if ((val.match(/@/g) || []).length === 1) {
        val += "copa.com";
      }
    }
    setFormData({ ...formData, email: val });
  };

  return (
    <View>
      {/* Email Input */}
      <Text style={styles.label}>Email</Text>
      <View style={styles.inputWrapper}>
        <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="username@copa.com"
          placeholderTextColor={colors.textTertiary}
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={handleEmailChange}
        />
      </View>
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      {/* Password Input */}
      <Text style={styles.label}>Password</Text>
      <View style={styles.inputWrapper}>
        <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={colors.textTertiary}
          secureTextEntry
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
        />
      </View>
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      {/* Confirmation Input */}
      <Text style={styles.label}>Confirm Password</Text>
      <View style={styles.inputWrapper}>
        <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={colors.textTertiary}
          secureTextEntry
          value={formData.verifyPassword}
          onChangeText={(text) => setFormData({ ...formData, verifyPassword: text })}
        />
      </View>
      {errors.verifyPassword && <Text style={styles.errorText}>{errors.verifyPassword}</Text>}
    </View>
  );
}