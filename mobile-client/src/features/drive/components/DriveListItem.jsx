// mobile-client/src/features/drive/components/DriveListItem.jsx

import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { driveStyles } from "../styles/myDrive.styles";
import { getFileIconMeta } from "../utils/fileIcon";

export default function DriveListItem({ item, onPress }) {
  const isFolder = item.type === "folder";
  const { icon, color } = getFileIconMeta(item.name, item.mimeType, isFolder);

  return (
    <Pressable style={driveStyles.fileCard} onPress={() => onPress(item)}>
      <View style={driveStyles.iconContainer}>
        <Ionicons name={icon} size={28} color={color} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={driveStyles.fileName} numberOfLines={1}>
          {item.name}
        </Text>

        <Text style={driveStyles.fileInfo}>
          {isFolder ? "Folder" : "File"} •{" "}
          {item.displayDate || new Date(item.updatedAt).toLocaleDateString()}
        </Text>
      </View>

      <Ionicons name="ellipsis-vertical" size={18} color="#5f6368" />
    </Pressable>
  );
}
