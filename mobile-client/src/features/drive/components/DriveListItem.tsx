import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DriveItem } from "../types/driveItem";
import { driveStyles } from "../styles/myDrive.styles";

interface Props {
    item: DriveItem;
    onPress: (item: DriveItem) => void;
}

export default function DriveListItem({ item, onPress }: Props) {
    const isFolder = item.type === 'folder';

    return (
        <Pressable style={driveStyles.fileCard} onPress={() => onPress(item)}>
            <View style={driveStyles.iconContainer}>
                <Ionicons
                    name={isFolder ? "folder" : "document-text"}
                    size={28}
                    color={isFolder ? "#f8d775" : "#4285F4"}
                />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={driveStyles.fileName} numberOfLines={1}>{item.name}</Text>
                <Text style={driveStyles.fileInfo}>
                    {isFolder ? "Folder" : `${item.size} KB`} • {item.updatedAt}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </Pressable>
    );
}