import React from "react";
import { FlatList, Text, Pressable, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { getFileIconMeta } from "../../features/drive/utils/fileIcon";

/**
 * Search Dropdown Overlay
 * Displays live search results with glassmorphism styling.
 */
export default function SearchDropdown({ results, loading, query, onResultPress }) {

    // Renders individual search result with dynamic icons
    const renderItem = ({ item }) => {
        const { icon, color } = getFileIconMeta(item.name, item.mimeType, item.type === "folder");
        return (
            <Pressable style={styles.item} onPress={() => onResultPress(item)}>
                <Ionicons name={icon} size={22} color={color} style={styles.icon} />
                <Text style={styles.text} numberOfLines={1}>{item.name}</Text>
            </Pressable>
        );
    };

    return (
        <BlurView intensity={85} tint="light" style={styles.dropdown}>
            {/* Subtle light overlay to enhance readability on varied backgrounds */}
            <View style={styles.overlay} />

            <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                // Ensures selection works even while the keyboard is active
                keyboardShouldPersistTaps="always"
                renderItem={renderItem}
                ListEmptyComponent={!loading && query.length > 0 && (
                    <Text style={styles.emptyText}>No matches found for "{query}"</Text>
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
        borderColor: "rgba(255,255,255,0.5)",
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255, 255, 255, 0.4)",
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: "rgba(0,0,0,0.05)",
    },
    icon: { marginRight: 15 },
    text: { fontSize: 16, color: "#202124", flex: 1, fontWeight: "500" },
    emptyText: { padding: 20, textAlign: "center", color: "#70757a" }
});