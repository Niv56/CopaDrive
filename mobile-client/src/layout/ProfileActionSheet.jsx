import React from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../app/providers/ThemeContext";

export default function ProfileActionSheet({ visible, onClose, onEditProfile }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <BlurView intensity={22} tint={theme === "dark" ? "dark" : "light"} style={StyleSheet.absoluteFill} />

        <Pressable style={[styles.menu, { backgroundColor: theme === "dark" ? "#222" : "#fff" }]}>
          <MenuItem
            icon={theme === "dark" ? "sunny-outline" : "moon-outline"}
            label={theme === "dark" ? "Day mode" : "Night mode"}
            onPress={() => { toggleTheme(); onClose(); }} // הפעלה
          />
          <MenuItem icon="create-outline" label="Edit profile" onPress={onEditProfile} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function MenuItem({ icon, label, onPress, disabled }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={disabled ? undefined : onPress}
      style={[styles.item, disabled && { opacity: 0.45 }]}
    >
      <Ionicons name={icon} size={18} color="#333" style={{ marginRight: 10 }} />
      <Text style={styles.itemText} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "transparent" },
  dim: { backgroundColor: "rgba(0,0,0,0.08)" },

  menu: {
    position: "absolute",
    top: 70,
    right: 14,
    backgroundColor: "rgba(255,255,255,0.98)",
    borderRadius: 16,
    paddingVertical: 8,
    width: 190,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  itemText: {
    fontSize: 14,
    color: "#222",
  },
});
