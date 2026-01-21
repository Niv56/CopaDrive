import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ActionMenu({ onAction, disabled }) {
  return (
    <View style={styles.menuContainer}>
      <MenuOption
        icon="folder-outline"
        label="New Folder"
        disabled={disabled}
        onPress={() => onAction("create_folder")}
      />
      <MenuOption
        icon="document-text-outline"
        label="New File"
        disabled={disabled}
        onPress={() => onAction("create_file")}
      />
      <MenuOption 
        icon="image-outline" 
        label="Upload Pic" 
        disabled={disabled} 
        onPress={() => onAction("upload_image")} 
      />
      <MenuOption 
        icon="camera-outline" 
        label="Take Photo" 
        disabled={disabled} 
        onPress={() => onAction("take_photo")} 
      />
      <MenuOption 
        icon="cloud-upload-outline" 
        label="Import File" 
        disabled={disabled} 
        onPress={() => onAction("upload_file")} 
      />
    </View>
  );
}

function MenuOption({ icon, label, onPress, disabled }) {
  return (
    <TouchableOpacity
      style={[styles.singleContainer, disabled && { opacity: 0.6 }]}
      onPress={disabled ? undefined : onPress}
      activeOpacity={0.9}
    >
      <Ionicons name={icon} size={22} color="#444" style={{ marginRight: 12 }} />
      <Text style={styles.labelText} numberOfLines={1} ellipsizeMode="clip">
        {label.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    position: "absolute",
    bottom: 165,
    right: 25,
    alignItems: "flex-end",
    gap: 15,
  },
  singleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 4,
    minWidth: 200,
  },
  labelText: { flex: 1, fontSize: 13, color: "#333", letterSpacing: 1, textAlign: "left" },
});