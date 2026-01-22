import React, { useState, useEffect, useMemo } from "react";
import { View, Text, TextInput, StyleSheet, ActivityIndicator, Keyboard } from "react-native";
import SearchDropdown from "./SearchDropdown";
import { fetchSearchItems } from "../../features/drive/services/searchService";
import FilePreviewModal from "../../features/drive/components/FilePreviewModal";
import { emitNavigateToFolder } from "../../features/drive/services/driveEvents";
import { useTheme } from "../../app/providers/ThemeContext";

export default function SearchBar({ token }) {
  const { colors, isDarkMode } = useTheme();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedFileId, setSelectedFileId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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

  const handleFileClick = (file) => {
    setQuery("");
    Keyboard.dismiss();
    setIsFocused(false);

    if (file.type === "folder") {
      emitNavigateToFolder(file.id, file.name);
      return;
    }

    setSelectedFileId(file.id);
    setModalOpen(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputBar}>
        <Text style={styles.treeIcon}>🌴</Text>
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          placeholder={isFocused ? "" : "Search in CopaDrive"}
          placeholderTextColor={colors.textTertiary}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        />
        {loading && <ActivityIndicator size="small" color={colors.primary} />}
      </View>

      {isFocused && (query.length > 0 || loading) && (
        <SearchDropdown
          results={results}
          loading={loading}
          query={query}
          onResultPress={handleFileClick}
          colors={colors}
          isDarkMode={isDarkMode}
        />
      )}

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
    height: "100%",
    textAlign: "left"
  },
});