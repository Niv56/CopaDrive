import React, { useMemo } from "react";
import { FlatList, Text, Pressable, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { getFileIconMeta } from "../../features/drive/utils/fileIcon";

export default function SearchDropdown({ results, loading, query, onResultPress, colors, isDarkMode }) {
    const dynamicStyles = useMemo(() => ({
        dropdown: {
            borderColor: isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
        },
        overlay: {
            backgroundColor: isDarkMode ? "rgba(30, 30, 30, 0.85)" : "rgba(255, 255, 255, 0.85)",
        },
        item: {
            borderBottomColor: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
        },
        text: {
            color: colors?.textPrimary || "#202124",
        },
        emptyText: {
            color: colors?.textSecondary || "#70757a",
        },
    }), [colors, isDarkMode]);

    const renderItem = ({ item }) => {
        const { icon, color } = getFileIconMeta(item.name, item.mimeType, item.type === "folder");
        return (
            <Pressable style={[styles.item, dynamicStyles.item]} onPress={() => onResultPress(item)}>
                <Ionicons name={icon} size={22} color={color} style={styles.icon} />
                <Text style={[styles.text, dynamicStyles.text]} numberOfLines={1}>{item.name}</Text>
            </Pressable>
        );
    };

    return (
        <BlurView intensity={85} tint={isDarkMode ? "dark" : "light"} style={[styles.dropdown, dynamicStyles.dropdown]}>
            <View style={[styles.overlay, dynamicStyles.overlay]} />

            <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="always"
                renderItem={renderItem}
                ListEmptyComponent={!loading && query.length > 0 && (
                    <Text style={[styles.emptyText, dynamicStyles.emptyText]}>No matches found for "{query}"</Text>
                )}
            />
        </BlurView>
    );
}

const styles = StyleSheet.create({
    dropdown: {
        position: "absolute",
        top: 55,
        left: 0,
        right: 0,
        borderRadius: 20,
        maxHeight: 350,
        overflow: "hidden",
        borderWidth: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        borderBottomWidth: 0.5,
    },
    icon: { marginRight: 15 },
    text: { fontSize: 16, flex: 1, fontWeight: "500" },
    emptyText: { padding: 20, textAlign: "center" }
});