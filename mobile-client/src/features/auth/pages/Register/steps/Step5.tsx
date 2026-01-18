import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { authStyles } from "../../../styles/auth.styles";

export default function Step5() {
  return (
    <View style={localStyles.container}>
      <Ionicons name="checkmark-circle" size={80} color="#28a745" />
      
      {/* שימוש בפונט המיוחד גם כאן למראה אחיד */}
      <Text style={[authStyles.brandText, { marginTop: 20, fontSize: 30 }]}>Success!</Text>
      
      <Text style={authStyles.subText}>Your account is ready.</Text>
      
      <Text style={localStyles.desc}>
        We're excited to have you join the CopaDrive family.
      </Text>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: { alignItems: "center", paddingVertical: 20 },
  desc: { textAlign: "center", marginTop: 15, color: "#666", lineHeight: 22, fontSize: 16 },
});