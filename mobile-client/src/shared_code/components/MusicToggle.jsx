import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useMusic } from "../../app/providers/MusicContext";

/**
 * A reusable UI component to toggle global background music.
 * Displays dynamic icons and labels based on the current playback state.
 */
export default function MusicToggle({ style }) {
  const { isPlaying, toggleMusic } = useMusic();

  return (
    <TouchableOpacity
      onPress={toggleMusic}
      activeOpacity={0.8}
      style={[styles.container, style]}
    >
      <View style={styles.content}>
        {/* Icon container with relative positioning for the sparkle effect */}
        <View style={styles.iconWrapper}>
          <Ionicons
            name={isPlaying ? "pause" : "musical-notes"}
            size={16}
            color="white"
          />
          {/* Decorative sparkle icon positioned absolutely relative to the main icon */}
          <Ionicons name="sparkles" size={10} color="#FFD700" style={styles.sparkle} />
        </View>

        <Text style={styles.text}>
          {isPlaying ? "PauseSong" : "PlaySong"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#007bff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 50,
    alignSelf: "flex-start",
    // Elevation and shadow for a "floating" button effect
    shadowColor: "#007bff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  iconWrapper: {
    position: 'relative'
  },
  sparkle: {
    position: 'absolute',
    top: -4,
    right: -4,
    opacity: 0.9
  },
  text: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.5,
  },
});