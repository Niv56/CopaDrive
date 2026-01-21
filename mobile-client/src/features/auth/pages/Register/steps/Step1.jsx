import React from "react";
import { View, Text, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * Registration Step 1: Basic Identity
 * Handles First Name and Optional Last Name inputs.
 */
export default function Step1({ formData, setFormData, errors, styles, colors }) {
  return (
    <View>
      {/* First Name Input Area */}
      <Text style={styles.label}>First Name</Text>
      <View style={styles.inputWrapper}>
        <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="First name"
          placeholderTextColor={colors.textTertiary}
          value={formData.firstName}
          // Updates the global registration form state
          onChangeText={(text) => setFormData({ ...formData, firstName: text })}
        />
      </View>
      {/* Displays validation errors if the field is empty or too short */}
      {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

      {/* Optional Last Name Input Area */}
      <Text style={styles.label}>Last Name (Optional)</Text>
      <View style={styles.inputWrapper}>
        <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Last name"
          placeholderTextColor={colors.textTertiary}
          value={formData.lastName}
          onChangeText={(text) => setFormData({ ...formData, lastName: text })}
        />
      </View>
    </View>
  );
}