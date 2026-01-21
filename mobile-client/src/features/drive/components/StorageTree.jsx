import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { formatBytes } from "../../../shared_code/utils/formatBytes";

/**
 * A unique storage visualizer that fills a palm tree icon based on usage.
 * Uses CSS masking logic via overflow to simulate a vertical progress bar.
 */
export default function StorageTree({ usedBytes = 0, quotaBytes = 15 * 1024 * 1024 * 1024 }) {
  const used = Math.max(0, Number(usedBytes) || 0);
  const quota = Math.max(1, Number(quotaBytes) || 1);

  // Calculate usage percentage capped at 100%
  const percentage = Math.min(100, (used / quota) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.treeContainer}>
        {/* The "Empty" background of the tree */}
        <Text style={styles.treeIconBase}>🌴</Text>

        {/* The "Full" colored part of the tree, masked by height */}
        <View style={[styles.fillWrapper, { height: `${percentage}%` }]}>
          <Text style={styles.treeIconFill}>🌴</Text>
        </View>
      </View>

      <Text style={styles.text}>
        {formatBytes(used)} of {formatBytes(quota)} used
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    marginTop: "auto",
  },
  treeContainer: {
    width: 60,
    height: 60,
    position: "relative",
    marginBottom: 5,
  },
  treeIconBase: {
    fontSize: 50,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    textAlign: "center",
    opacity: 0.3,
    color: "#5f6368",
    // Grayscale fallback for non-iOS platforms or specific styles
    filter: "grayscale(100%)",
  },
  fillWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  treeIconFill: {
    fontSize: 50,
    textAlign: "center",
    height: 60,
    lineHeight: 60,
  },
  text: {
    fontSize: 12,
    color: "#5f6368",
    fontWeight: "600",
  },
});