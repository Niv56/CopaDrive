import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  FlatList,
  ActivityIndicator,
  StatusBar
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../providers/AuthContext";
import { getImportantFiles } from "../../features/drive/services/fileService";
import DriveListItem from "../../features/drive/components/DriveListItem";
import { driveStyles } from "../../features/drive/styles/myDrive.styles";

// ✅ auto-refresh bus
import { subscribeDriveRefresh } from "../../features/drive/services/driveEvents";

export default function ImportantPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadImportant = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getImportantFiles(token);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load important files:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadImportant();
  }, [loadImportant]);

  // ✅ listen for global refresh events (upload/create/delete/etc.)
  useEffect(() => {
    const unsubscribe = subscribeDriveRefresh(() => {
      loadImportant();
    });
    return unsubscribe;
  }, [loadImportant]);

  return (
    <View style={styles.modalContainer}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.modalHeader}>
          <View style={styles.headerLeftSpace} />
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close-outline" size={32} color="#6c757d" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.textHeader}>
            <Text style={[driveStyles.homeTitle, { marginLeft: 0 }]}>IMPORTANT</Text>
            <Text style={styles.subTitle}>Items marked with high priority</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#0d6efd" style={{ marginTop: 50 }} />
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <DriveListItem item={item} onPress={(i) => console.log("Open:", i.name)} />
              )}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="alert-circle-outline" size={80} color="#f0f0f0" />
                  <Text style={driveStyles.emptyText}>No important items yet</Text>
                </View>
              }
              onRefresh={loadImportant}
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
    height: 60
  },
  headerLeftSpace: { width: 40 },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
    backgroundColor: "#f8f9fa"
  },
  content: { flex: 1 },
  textHeader: {
    paddingHorizontal: 20,
    marginBottom: 15
  },
  subTitle: {
    fontSize: 13,
    color: "#6c757d",
    marginTop: -8,
    marginLeft: 0
  },
  emptyContainer: { alignItems: "center", marginTop: 100 }
});
