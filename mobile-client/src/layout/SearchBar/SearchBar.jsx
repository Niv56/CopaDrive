import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, ActivityIndicator, Keyboard } from "react-native";
import SearchDropdown from "./SearchDropdown";
import { fetchSearchItems } from "../../features/drive/services/searchService";
import FilePreviewModal from "../../features/drive/components/FilePreviewModal";
import { emitNavigateToFolder } from "../../features/drive/services/driveEvents";

/**
 * Global Search Bar
 * Handles real-time search debouncing and navigation to files/folders.
 */
export default function SearchBar({ token }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedFileId, setSelectedFileId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  /** * Debouncing Logic:
   * Waits 200ms after the last keystroke before triggering the API request
   * to reduce server load and improve performance.
   */
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      const data = await fetchSearchItems(token, query);
      setResults(data || []);
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  /** Action handler for search result selection */
  const handleFileClick = (file) => {
    setQuery("");
    Keyboard.dismiss();
    setIsFocused(false);

    // If it's a folder, trigger a global navigation event to update the Drive view
    if (file.type === "folder") {
      emitNavigateToFolder(file.id, file.name);
      return;
    }

    // If it's a file, open the preview modal directly
    setSelectedFileId(file.id);
    setModalOpen(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputBar}>
        <Text style={styles.treeIcon}>🌴</Text>
        <TextInput
          style={styles.input}
          placeholder={isFocused ? "" : "Search in CopaDrive"}
          placeholderTextColor="rgba(95, 99, 104, 0.5)"
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsFocused(true)}
          // Timeout prevents the dropdown from closing before the 'onPress' event fires
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        />
        {loading && <ActivityIndicator size="small" color="#0d6efd" />}
      </View>

      {/* Results Dropdown */}
      {isFocused && (query.length > 0 || loading) && (
        <SearchDropdown
          results={results}
          loading={loading}
          query={query}
          onResultPress={handleFileClick}
        />
      )}

      {/* Direct File Interaction */}
      <FilePreviewModal
        open={modalOpen}
        fileId={selectedFileId}
        onClose={() => {
          setModalOpen(false);
          setSelectedFileId(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, zIndex: 5000 },
  inputBar: { flex: 1, flexDirection: "row", alignItems: "center", paddingLeft: 5 },
  treeIcon: { fontSize: 20, marginRight: 8 },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#202124",
    height: "100%",
    // Alignment fix: forces left-to-right alignment to prevent UI jumps on RTL (Hebrew) devices
    textAlign: "left"
  },
});