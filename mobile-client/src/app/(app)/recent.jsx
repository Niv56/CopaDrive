import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  FlatList,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../providers/AuthContext";
import { getRecentFiles, formatLastAccessed } from "../../features/drive/services/fileService";
import DriveListItem from "../../features/drive/components/DriveListItem";
import { driveStyles } from "../../features/drive/styles/myDrive.styles";

// ✅ auto-refresh bus
import { subscribeDriveRefresh } from "../../features/drive/services/driveEvents";

export default function RecentPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRecent = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getRecentFiles(token);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load recent files:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadRecent();
  }, [loadRecent]);

  // ✅ listen for global refresh events
  useEffect(() => {
    const unsubscribe = subscribeDriveRefresh(() => {
      loadRecent();
    });
    return unsubscribe;
  }, [loadRecent]);

  return (
    <View style={styles.modalContainer}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.modalHeader}>
          <View style={styles.headerLeftSpace} />
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close-outline" size={32} color="#6c757d" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.textHeader}>
            <Text style={[driveStyles.homeTitle, { marginLeft: 0, paddingLeft: 0 }]}>
              RECENT
            </Text>
            <Text style={styles.subTitle}>Last accessed items</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#0d6efd" style={{ marginTop: 50 }} />
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <DriveListItem
                  item={{
                    ...item,
                    displayDate: formatLastAccessed(item.lastAccessed),
                  }}
                  onPress={(i) => console.log("Open:", i.name)}
                />
              )}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="time-outline" size={80} color="#f0f0f0" />
                  <Text style={driveStyles.emptyText}>No recent files</Text>
                </View>
              }
              onRefresh={loadRecent}
              refreshing={loading}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: "#ffffff" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    height: 60,
  },
  headerLeftSpace: { width: 40 },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
    backgroundColor: "#f8f9fa",
  },
  content: { flex: 1 },
  textHeader: {
    paddingHorizontal: 20,
    marginBottom: 15,
    alignItems: "flex-start",
  },
  subTitle: { fontSize: 13, color: "#6c757d", marginTop: -8, marginLeft: 0 },
  emptyContainer: { alignItems: "center", marginTop: 100 },
});
