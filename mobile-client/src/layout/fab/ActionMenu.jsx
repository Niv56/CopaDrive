import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../app/providers/ThemeContext";

/**
 * Floating Action Menu
 * Provides quick access to file creation and upload actions.
 */
export default function ActionMenu({ onAction, disabled }) {
  const { isDarkMode, colors } = useTheme();

  return (
    <View style={styles.menuContainer}>
      <MenuOption
        icon="folder-outline"
        label="New Folder"
        disabled={disabled}
        onPress={() => onAction("create_folder")}
        isDarkMode={isDarkMode}
        colors={colors}
      />
      <MenuOption
        icon="document-text-outline"
        label="New File"
        disabled={disabled}
        onPress={() => onAction("create_file")}
        isDarkMode={isDarkMode}
        colors={colors}
      />
      <MenuOption
        icon="image-outline"
        label="Upload Pic"
        disabled={disabled}
        onPress={() => onAction("upload_image")}
        isDarkMode={isDarkMode}
        colors={colors}
      />
      <MenuOption
        icon="camera-outline"
        label="Take Photo"
        disabled={disabled}
        onPress={() => onAction("take_photo")}
        isDarkMode={isDarkMode}
        colors={colors}
      />
      <MenuOption
        icon="cloud-upload-outline"
        label="Import File"
        disabled={disabled}
        onPress={() => onAction("upload_file")}
        isDarkMode={isDarkMode}
        colors={colors}
      />
    </View>
  );
}

/**
 * Individual Menu Item
 * Implements theme-aware background colors and disabled states.
 */
function MenuOption({ icon, label, onPress, disabled, isDarkMode, colors }) {
  return (
    <TouchableOpacity
      style={[
        styles.singleContainer,
        disabled && { opacity: 0.6 },
        // Dynamic background based on current theme mode
        { backgroundColor: isDarkMode ? "rgba(40,40,40,0.95)" : "rgba(255,255,255,0.95)" }
      ]}
      onPress={disabled ? undefined : onPress}
      activeOpacity={0.9}
    >
      <Ionicons name={icon} size={22} color={colors.textPrimary} style={{ marginRight: 12 }} />
      <Text
        style={[styles.labelText, { color: colors.textPrimary }]}
        numberOfLines={1}
        ellipsizeMode="clip"
      >
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    minWidth: 180,
  },
  labelText: { flex: 1, fontSize: 13, letterSpacing: 1, textAlign: "left", fontWeight: '600' },
});