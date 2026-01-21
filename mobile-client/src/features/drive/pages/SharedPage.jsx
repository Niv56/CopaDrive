import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  FlatList,
  Pressable,
  View,
  Text,
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useMyDrive } from "../hooks/useMyDrive";
import { useAuth } from "../../../app/providers/AuthContext";
import { useTheme } from "../../../app/providers/ThemeContext";
import DriveListItem from "../components/DriveListItem";
import FilePreviewModal from "../components/FilePreviewModal";
import { getUserById } from "../../user/services/userService";

export default function SharedPage() {
  const { items, loading } = useMyDrive();
  const { user, token } = useAuth();
  const { colors } = useTheme();

  const [ownersData, setOwnersData] = useState({});
  const [ownersLoading, setOwnersLoading] = useState(false);
  const [selectedOwnerId, setSelectedOwnerId] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const myUserId = user?.id || user?._id;
  const ownersCacheRef = useRef({});
  const ownersLoadingRef = useRef(new Set());

  const sharedItems = useMemo(() => {
    return (items || []).filter(
      (f) => f?.ownerId && String(f.ownerId) !== String(myUserId)
    );
  }, [items, myUserId]);

  const uniqueOwnerIds = useMemo(() => {
    const ids = sharedItems.map((f) => String(f.ownerId)).filter(Boolean);
    return Array.from(new Set(ids));
  }, [sharedItems]);

  const loadOwners = useCallback(async () => {
    if (!token || uniqueOwnerIds.length === 0) return;

    const missing = uniqueOwnerIds.filter(
      (id) => !ownersCacheRef.current[id] && !ownersLoadingRef.current.has(id)
    );

    if (missing.length === 0) return;

    missing.forEach((id) => ownersLoadingRef.current.add(id));
    setOwnersLoading(true);

    try {
      const results = await Promise.allSettled(
        missing.map((id) => getUserById(token, id))
      );

      const next = {};
      results.forEach((r, idx) => {
        const id = missing[idx];
        if (r.status === "fulfilled" && r.value) {
          const u = r.value;
          next[id] = {
            id,
            email: u.email || "",
            firstName: u.firstName || "",
            lastName: u.lastName || "",
            image: u.image || u.profilePicture || null,
          };
        } else {
          next[id] = { id, email: "Unknown", firstName: "", lastName: "", image: null };
        }
        ownersLoadingRef.current.delete(id);
      });

      ownersCacheRef.current = { ...ownersCacheRef.current, ...next };
      setOwnersData({ ...ownersCacheRef.current });
    } catch (e) {
      console.error("loadOwners error:", e);
    } finally {
      setOwnersLoading(false);
    }
  }, [token, uniqueOwnerIds]);

  useEffect(() => {
    loadOwners();
  }, [loadOwners]);

  const ownersList = useMemo(() => {
    return uniqueOwnerIds.map((id) => {
      const o = ownersData[id] || {};
      const fullName = `${o.firstName || ""} ${o.lastName || ""}`.trim();
      const displayName = fullName || (o.email && o.email.includes("@") ? o.email.split("@")[0] : "Shared User");

      return {
        id,
        title: `Shared by ${displayName}`,
        email: o.email || "Unknown",
        image: o.image || null,
      };
    });
  }, [uniqueOwnerIds, ownersData]);

  const filesByOwner = useMemo(() => {
    if (!selectedOwnerId) return [];
    return sharedItems.filter((f) => String(f.ownerId) === String(selectedOwnerId));
  }, [sharedItems, selectedOwnerId]);

  const openItem = useCallback((item) => {
    if (!item) return;
    if (item.type === "folder") {
      Alert.alert("CopaDrive", "Folders view is coming soon.");
      return;
    }
    setSelectedId(item.id || item._id);
    setPreviewOpen(true);
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />;
  }

  if (selectedOwnerId) {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.headerContainer}>
          <Pressable onPress={() => setSelectedOwnerId(null)} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
            <Text style={styles.backText}>Back to Users</Text>
          </Pressable>
        </View>

        <FlatList
          data={filesByOwner}
          keyExtractor={(item) => String(item.id || item._id)}
          renderItem={({ item }) => <DriveListItem item={item} onPress={openItem} />}
          contentContainerStyle={{ paddingBottom: 150 }}
        />

        <FilePreviewModal open={previewOpen} fileId={selectedId} onClose={() => setPreviewOpen(false)} />
      </View>
    );
  }

  return (
    <>
      {ownersLoading && <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 10 }} />}

      <FlatList
        data={ownersList}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Pressable
            style={styles.userCard}
            onPress={() => setSelectedOwnerId(item.id)}
          >
            <View style={styles.avatarWrapper}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={18} color="#fff" />
                </View>
              )}
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {item.email}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.5)" />
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No shared items yet</Text>
        }
        contentContainerStyle={{ paddingBottom: 150, paddingHorizontal: 16, paddingTop: 10 }}
      />

      <FilePreviewModal open={previewOpen} fileId={selectedId} onClose={() => setPreviewOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  headerContainer: {
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  backText: {
    fontWeight: "600",
    marginLeft: 8,
    color: "#fff",
    fontSize: 14
  },
  avatarWrapper: { marginRight: 15 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)"
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)"
  },
  userInfo: { flex: 1, justifyContent: "center" },
  userName: { fontWeight: "700", fontSize: 15, color: "#fff" },
  userEmail: { fontSize: 12, marginTop: 2, color: "rgba(255, 255, 255, 0.6)" },
  emptyText: { textAlign: "center", marginTop: 20 },
});