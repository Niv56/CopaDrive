import React from "react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { driveStyles } from "../features/drive/styles/myDrive.styles";

export default function Fab({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable style={driveStyles.fab} onPress={onPress}>
      <Ionicons name="add" size={36} color="#1a73e8" />
    </Pressable>
  );
}