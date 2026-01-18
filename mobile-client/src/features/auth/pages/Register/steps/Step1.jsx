import React from "react";
import { View, Text, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { authStyles } from "../../../styles/auth.styles";

export default function Step1({ formData, setFormData, errors }) {
  return (
    <View>
      <Text style={authStyles.label}>First Name</Text>
      <View style={authStyles.inputWrapper}>
        <Ionicons name="person-outline" size={20} color="#666" style={authStyles.inputIcon} />
        <TextInput
          style={authStyles.input}
          placeholder="First name"
          placeholderTextColor="#999"
          value={formData.firstName}
          onChangeText={(text) => setFormData({ ...formData, firstName: text })}
        />
      </View>
      {errors.firstName && <Text style={authStyles.errorText}>{errors.firstName}</Text>}

      <Text style={authStyles.label}>Last Name (Optional)</Text>
      <View style={authStyles.inputWrapper}>
        <Ionicons name="person-outline" size={20} color="#666" style={authStyles.inputIcon} />
        <TextInput
          style={authStyles.input}
          placeholder="Last name"
          placeholderTextColor="#999"
          value={formData.lastName}
          onChangeText={(text) => setFormData({ ...formData, lastName: text })}
        />
      </View>
    </View>
  );
}