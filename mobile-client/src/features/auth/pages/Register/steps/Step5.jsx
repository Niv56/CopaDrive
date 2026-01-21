import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Step5({ styles }) {
  return (
    <View style={localStyles.container}>
      <Ionicons name="checkmark-circle" size={80} color="#28a745" />
      
      <Text style={[styles.brandText, { marginTop: 20, fontSize: 30 }]}>Success!</Text>
      
      <Text style={styles.subText}>Your account is ready.</Text>
      
      <Text style={[localStyles.desc, { color: styles.subText.color }]}>
        We're excited to have you join the CopaDrive family.
      </Text>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: { alignItems: "center", paddingVertical: 20 },
  desc: { textAlign: "center", marginTop: 15, lineHeight: 22, fontSize: 16 },
});