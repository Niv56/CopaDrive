import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, ActivityIndicator, Keyboard } from "react-native";
import SearchDropdown from "./SearchDropdown";
import { fetchSearchItems } from "../../features/drive/services/searchService";
// ✅ ייבוא המודל שמציג את הקבצים
import FilePreviewModal from "../../features/drive/components/FilePreviewModal";

export default function SearchBar({ token }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ משתנים לניהול פתיחת הקובץ
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
    // 1. סוגרים את המקלדת ומנקים את החיפוש
    setQuery("");
    Keyboard.dismiss();
    setIsFocused(false);

    // 2. פותחים את המודל עם הקובץ שנבחר
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
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        />
        {loading && <ActivityIndicator size="small" color="#0d6efd" />}
      </View>

      {isFocused && (query.length > 0 || loading) && (
        <SearchDropdown
          results={results}
          loading={loading}
          query={query}
          onResultPress={handleFileClick} // ✅ שימוש בפונקציה החדשה
        />
      )}

      {/* ✅ רכיב המודל שיושב ברקע ונפתח רק כשצריך */}
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
  input: { flex: 1, fontSize: 16, color: "#202124", height: "100%" },
});