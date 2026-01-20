import React, { useEffect, useRef, useState } from "react";
import { View, TextInput, StyleSheet, ActivityIndicator, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../app/providers/AuthContext";
import { getSearchResults } from "../../features/drive/services/searchService";

export default function SearchBar({ query = "", setQuery = () => {}, onResults = () => {} }) {
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);

  const cacheRef = useRef(new Map());
  const lastDataRef = useRef([]);
  const abortRef = useRef(null);

  const matchesQuery = (item, q) => {
    const s = String(q || "").toLowerCase();
    const name = String(item?.name || "").toLowerCase();
    return name.includes(s);
  };

  useEffect(() => {
    const q = String(query || "").trim();
    if (!q) {
      onResults([]);
      return;
    }

    const immediate = Array.isArray(lastDataRef.current)
      ? lastDataRef.current.filter((item) => matchesQuery(item, q))
      : [];
    onResults(immediate);

    const timer = setTimeout(async () => {
      if (cacheRef.current.has(q)) {
        const cached = cacheRef.current.get(q);
        lastDataRef.current = cached;
        onResults(cached.filter((item) => matchesQuery(item, q)));
        return;
      }

      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      try {
        const data = await getSearchResults(token, q, { signal: controller.signal });

        const arr = Array.isArray(data) ? data : [];
        cacheRef.current.set(q, arr);
        lastDataRef.current = arr;

        onResults(arr.filter((item) => matchesQuery(item, q)));
      } catch (e) {
        if (e?.name !== "AbortError") console.log("search error:", e?.message || e);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, token]);

  return (
    <View style={s.wrap}>
      <Ionicons name="search-outline" size={18} color="#555" />
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search in CopaDrive..."
        placeholderTextColor="rgba(0,0,0,0.45)"
        style={s.input}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {loading ? <ActivityIndicator size="small" /> : null}
      {!!query && (
        <Ionicons
          name="close-circle"
          size={18}
          color="rgba(0,0,0,0.35)"
          onPress={() => setQuery("")}
          suppressHighlighting
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 18,

    // glass feel
    backgroundColor: "rgba(255,255,255,0.90)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",

    // subtle shadow
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#111",
    paddingVertical: Platform.OS === "ios" ? 10 : 0,
  },
});
