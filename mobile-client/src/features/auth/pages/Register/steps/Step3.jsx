import React from "react";
import { View, Text, TextInput, StyleSheet, Pressable } from "react-native";
import { authStyles } from "../../../styles/auth.styles";

export default function Step3({ formData, setFormData, errors }: any) {
  
  const genders = ["male", "female", "other"];

  return (
    <View>
      
      <Text style={authStyles.label}>Date of Birth (YYYY-MM-DD)</Text>
      <View style={authStyles.inputWrapper}>
        <TextInput
          style={authStyles.input}
          placeholder="2000-01-01"
          placeholderTextColor="#999"
          value={formData.dateOfBirth}
          onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })}
        />
      </View>
      {errors.dateOfBirth && <Text style={authStyles.errorText}>{errors.dateOfBirth}</Text>}

      <Text style={[authStyles.label, { marginTop: 10 }]}>Gender</Text>
      <View style={localStyles.genderRow}>
        {genders.map((g) => (
          <Pressable
            key={g}
            style={[
              localStyles.genderBtn,
              formData.gender === g && localStyles.genderBtnActive
            ]}
            onPress={() => setFormData({ ...formData, gender: g })}
          >
            <Text style={[
              localStyles.genderText,
              formData.gender === g && localStyles.genderTextActive
            ]}>
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>
      {errors.gender && <Text style={authStyles.errorText}>{errors.gender}</Text>}
    </View>
  );
}

// עיצוב מקומי לכפתורי המגדר
const localStyles = StyleSheet.create({
  genderRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  genderBtn: {
    flex: 1, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: "#e1e1e1",
    alignItems: "center", backgroundColor: "#fff"
  },
  genderBtnActive: { backgroundColor: "#007bff", borderColor: "#007bff" },
  genderText: { color: "#333", fontWeight: "600" },
  genderTextActive: { color: "#fff" },
});