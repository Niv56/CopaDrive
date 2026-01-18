import React from "react";
import { View, Text, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { authStyles } from "../../../styles/auth.styles";

export default function Step4({ formData, setFormData, errors }) {
  
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
      <Text style={authStyles.label}>Email</Text>
      <View style={authStyles.inputWrapper}>
        <Ionicons name="mail-outline" size={20} color="#666" style={authStyles.inputIcon} />
        <TextInput
          style={authStyles.input}
          placeholder="username@copa.com"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={handleEmailChange}
        />
      </View>
      {errors.email && <Text style={authStyles.errorText}>{errors.email}</Text>}

      <Text style={authStyles.label}>Password</Text>
      <View style={authStyles.inputWrapper}>
        <Ionicons name="lock-closed-outline" size={20} color="#666" style={authStyles.inputIcon} />
        <TextInput
          style={authStyles.input}
          placeholder="••••••••"
          placeholderTextColor="#999"
          secureTextEntry
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
        />
      </View>
      {errors.password && <Text style={authStyles.errorText}>{errors.password}</Text>}

      <Text style={authStyles.label}>Confirm Password</Text>
      <View style={authStyles.inputWrapper}>
        <Ionicons name="lock-closed-outline" size={20} color="#666" style={authStyles.inputIcon} />
        <TextInput
          style={authStyles.input}
          placeholder="••••••••"
          placeholderTextColor="#999"
          secureTextEntry
          value={formData.verifyPassword}
          onChangeText={(text) => setFormData({ ...formData, verifyPassword: text })}
        />
      </View>
      {errors.verifyPassword && <Text style={authStyles.errorText}>{errors.verifyPassword}</Text>}
    </View>
  );
}