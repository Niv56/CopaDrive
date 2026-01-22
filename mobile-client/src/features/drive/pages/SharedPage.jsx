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

/**
 * Shared Page Component
 * Organizes files shared by others, grouped by their respective owners.
 */
export default function SharedPage() {
  const { items, loading } = useMyDrive();
  const { user, token } = useAuth();
  const { colors, isDarkMode } = useTheme();

  const [ownersData, setOwnersData] = useState({});
  const [ownersLoading, setOwnersLoading] = useState(false);
  const [selectedOwnerId, setSelectedOwnerId] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const myUserId = user?.id || user?._id;

  // Cache and tracking for owner data to prevent redundant API calls
  const ownersCacheRef = useRef({});
  const ownersLoadingRef = useRef(new Set());

  /** Filters items to only include those shared with the user by others */
  const sharedItems = useMemo(() => {
    return (items || []).filter(
      (f) => f?.ownerId && String(f.ownerId) !== String(myUserId)
    );
  }, [items, myUserId]);

  /** Identifies unique owner IDs present in the shared items list */
  const uniqueOwnerIds = useMemo(() => {
    const ids = sharedItems.map((f) => String(f.ownerId)).filter(Boolean);
    return Array.from(new Set(ids));
  }, [sharedItems]);

  /** * Fetches metadata for file owners from the user service.
   * Implements a local cache and a "loading set" to ensure each user is only fetched once.
   */
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
    } finally {
      setOwnersLoading(false);
    }
  }, [token, uniqueOwnerIds]);

  useEffect(() => {
    loadOwners();
  }, [loadOwners]);

  /** Maps owner IDs to UI-friendly display objects */
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

  /** Sub-view filtering: shows files belonging only to the selected owner */
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

  // Render logic for the "Owner Detail" view (List of shared files from a specific user)
  if (selectedOwnerId) {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.breadcrumbContainer}>
          <Pressable
            onPress={() => setSelectedOwnerId(null)}
            style={[
              styles.backButton,
              {
                backgroundColor: isDarkMode ? 'rgba(20, 20, 30, 0.6)' : 'rgba(255, 255, 255, 0.65)',
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.4)'
              }
            ]}
          >
            <Ionicons name="arrow-back" size={20} color={isDarkMode ? '#FFFFFF' : '#1A2A3A'} />
          </Pressable>

          <Pressable onPress={() => setSelectedOwnerId(null)}>
            <Text style={[styles.breadcrumbText, { color: colors.textSecondary }]}>Shared</Text>
          </Pressable>

          <Ionicons name="chevron-forward" size={14} color={colors.textTertiary} />

          <Text style={[styles.breadcrumbText, { color: colors.primary, fontWeight: '700' }]} numberOfLines={1}>
            {ownersData[selectedOwnerId]?.firstName || "User"}
          </Text>
        </View>

        <FlatList
          data={filesByOwner}
          keyExtractor={(item) => String(item.id || item._id)}
          renderItem={({ item }) => <DriveListItem item={item} onPress={openItem} />}
          contentContainerStyle={{ paddingBottom: 150, paddingHorizontal: 15 }}
        />

        <FilePreviewModal open={previewOpen} fileId={selectedId} onClose={() => setPreviewOpen(false)} />
      </View>
    );
  }

  // Render logic for the "All Owners" list view
  return (
    <View style={{ flex: 1 }}>
      {ownersLoading && <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 10 }} />}

      <FlatList
        data={ownersList}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.userCard,
              {
                backgroundColor: isDarkMode ? 'rgba(20, 20, 30, 0.6)' : 'rgba(255, 255, 255, 0.65)',
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.4)',
              }
            ]}
            onPress={() => setSelectedOwnerId(item.id)}
          >
            <View style={styles.avatarWrapper}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                  <Ionicons name="person" size={18} color={isDarkMode ? '#FFFFFF' : '#1A2A3A'} />
                </View>
              )}
            </View>

            <View style={styles.userInfo}>
              <Text
                style={[
                  styles.userName,
                  {
                    color: isDarkMode ? '#FFFFFF' : '#1A2A3A',
                    textShadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 4,
                  }
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.email}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={60} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No shared items yet</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 150, paddingHorizontal: 15, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      />

      <FilePreviewModal open={previewOpen} fileId={selectedId} onClose={() => setPreviewOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 15,
    paddingHorizontal: 15,
    marginTop: 10,
    gap: 5
  },
  backButton: {
    padding: 6,
    borderRadius: 8,
    marginRight: 5,
    borderWidth: 1,
  },
  breadcrumbText: {
    fontSize: 15,
    marginHorizontal: 2
  },
  avatarWrapper: { marginRight: 15 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: { flex: 1, justifyContent: "center" },
  userName: { fontWeight: "700", fontSize: 15, letterSpacing: 0.5 },
  userEmail: { fontSize: 12, marginTop: 2 },
  emptyContainer: { alignItems: 'center', marginTop: 100, opacity: 0.6 },
  emptyText: { textAlign: "center", marginTop: 10, fontSize: 16 },
});