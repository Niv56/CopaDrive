// mobile-client/src/features/drive/modals/ShareModal.jsx

import React, { useState, useEffect, useCallback } from "react";
import {
    Modal, View, Text, TextInput, Pressable, FlatList,
    ActivityIndicator, Alert, StyleSheet, TouchableOpacity, Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

import { useAuth } from "../../../app/providers/AuthContext";
import {
    getPermissions,
    addPermission,
    updatePermission,
    deletePermission,
    findUserByEmail,
} from "../services/permissionService";

export default function ShareModal({ visible, item, onClose }) {
    const { token, user } = useAuth();
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [adding, setAdding] = useState(false);

    const isOwner = item?.ownerId === user?.id;
    const fileId = item?.id;

    // Load permissions
    const loadPermissions = useCallback(async () => {
        if (!fileId || !token) return;
        setLoading(true);
        try {
            console.log("=== SHARE MODAL: Loading permissions for file:", fileId);
            const data = await getPermissions(token, fileId);
            console.log("=== SHARE MODAL: Received data:", JSON.stringify(data, null, 2));

            // Make sure we always set an array
            const list = Array.isArray(data) ? data : [];
            console.log("=== SHARE MODAL: Setting permissions list:", JSON.stringify(list, null, 2));

            setPermissions(list);
        } catch (e) {
            console.error("=== SHARE MODAL: Failed to load permissions:", e);
            Alert.alert("Error", "Failed to load permissions: " + e.message);
        } finally {
            setLoading(false);
        }
    }, [fileId, token]);

    useEffect(() => {
        if (visible && fileId) {
            loadPermissions();
        }
    }, [visible, fileId, loadPermissions]);

    // Share with user by email
    const handleShare = async () => {
        if (!email.trim()) return;
        setAdding(true);
        try {
            const foundUser = await findUserByEmail(token, email.trim());
            console.log("Found user:", JSON.stringify(foundUser, null, 2));

            if (!foundUser?.id) {
                Alert.alert("User Not Found", "No user with that email exists.");
                setAdding(false);
                return;
            }
            await addPermission(token, fileId, foundUser.id, "viewer");
            setEmail("");
            await loadPermissions();
            Alert.alert("Success", `Shared with ${email}`);
        } catch (e) {
            console.error("Share error:", e);
            Alert.alert("Error", e?.message || "Failed to share");
        } finally {
            setAdding(false);
        }
    };

    // Toggle role between viewer/editor
    const handleToggleRole = async (perm) => {
        const newRole = perm.role === "viewer" ? "editor" : "viewer";
        try {
            await updatePermission(token, fileId, perm.id, newRole);
            await loadPermissions();
        } catch (e) {
            Alert.alert("Error", e?.message || "Failed to update role");
        }
    };

    // Remove permission
    const handleRemove = async (perm) => {
        const displayName = perm.firstName && perm.lastName
            ? `${perm.firstName} ${perm.lastName}`.trim()
            : perm.firstName || perm.email || "this user";

        Alert.alert(
            "Remove Access",
            `Remove ${displayName}'s access?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deletePermission(token, fileId, perm.id);
                            await loadPermissions();
                        } catch (e) {
                            Alert.alert("Error", e?.message || "Failed to remove");
                        }
                    },
                },
            ]
        );
    };

    if (!visible) return null;

    console.log("=== SHARE MODAL: Rendering with permissions:", permissions.length);

    return (
        <Modal visible={visible} transparent animationType="fade">
            <Pressable style={styles.backdrop} onPress={onClose}>
                <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />

                <Pressable style={styles.card} onPress={() => { }}>
                    <View style={styles.header}>
                        <Text style={styles.title} numberOfLines={1}>
                            Share "{item?.name}"
                        </Text>
                        <Pressable onPress={onClose} hitSlop={10} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#5f6368" />
                        </Pressable>
                    </View>

                    {isOwner && (
                        <View style={styles.addSection}>
                            <Text style={styles.sectionLabel}>ADD PEOPLE</Text>
                            <View style={styles.inputRow}>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="search" size={20} color="#5f6368" style={styles.searchIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter email address"
                                        placeholderTextColor="#999"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>
                                <TouchableOpacity
                                    style={[styles.searchBtn, adding && styles.searchBtnDisabled]}
                                    onPress={handleShare}
                                    disabled={adding}
                                >
                                    {adding ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.searchBtnText}>Search</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <View style={styles.divider} />

                    <View style={styles.peopleSection}>
                        <Text style={styles.sectionLabel}>PEOPLE WITH ACCESS</Text>

                        {loading ? (
                            <ActivityIndicator style={{ marginVertical: 20 }} />
                        ) : permissions.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="people-outline" size={48} color="#dadce0" />
                                <Text style={styles.emptyText}>No one else has access</Text>
                                {isOwner && (
                                    <Text style={styles.emptySubtext}>
                                        Only the owner can manage sharing settings for this file.
                                    </Text>
                                )}
                            </View>
                        ) : (
                            <FlatList
                                data={permissions}
                                keyExtractor={(p, index) => p.id || p.userId || String(index)}
                                style={{ maxHeight: 280 }}
                                renderItem={({ item: perm, index }) => {
                                    console.log(`=== Rendering permission ${index}:`, JSON.stringify(perm, null, 2));

                                    // Build display values
                                    const userName = perm.firstName && perm.lastName
                                        ? `${perm.firstName} ${perm.lastName}`.trim()
                                        : perm.firstName || "User";
                                    const userEmail = perm.email || "unknown@email.com";
                                    const userImage = perm.image || null;

                                    console.log(`Display values - Name: ${userName}, Email: ${userEmail}, Image: ${userImage ? 'YES' : 'NO'}`);

                                    return (
                                        <View style={styles.permItem}>
                                            <View style={styles.avatarContainer}>
                                                {userImage ? (
                                                    <Image
                                                        source={{ uri: userImage }}
                                                        style={styles.avatar}
                                                        onError={(e) => console.log("Image load error:", e.nativeEvent.error)}
                                                    />
                                                ) : (
                                                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                                        <Text style={styles.avatarInitial}>
                                                            {(userName || userEmail || "U")[0].toUpperCase()}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>

                                            <View style={styles.permInfo}>
                                                <Text style={styles.permName} numberOfLines={1}>
                                                    {userName}
                                                </Text>
                                                <Text style={styles.permEmail} numberOfLines={1}>
                                                    {userEmail}
                                                </Text>
                                            </View>

                                            {isOwner ? (
                                                <View style={styles.permActions}>
                                                    <TouchableOpacity
                                                        style={styles.roleBtn}
                                                        onPress={() => handleToggleRole(perm)}
                                                    >
                                                        <Text style={styles.roleText}>
                                                            {perm.role === "editor" ? "Editor" : "Viewer"}
                                                        </Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        onPress={() => handleRemove(perm)}
                                                        style={styles.removeBtn}
                                                    >
                                                        <Ionicons name="trash-outline" size={18} color="#dc3545" />
                                                    </TouchableOpacity>
                                                </View>
                                            ) : (
                                                <View style={styles.roleTag}>
                                                    <Text style={styles.roleTagText}>
                                                        {perm.role === "editor" ? "Editor" : "Viewer"}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    );
                                }}
                            />
                        )}
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.closeFooterBtn}
                            onPress={onClose}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.closeFooterText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: { flex: 1, justifyContent: "center", padding: 20 },
    card: { backgroundColor: "#fff", borderRadius: 24, maxHeight: "85%", elevation: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },
    title: { fontSize: 20, fontWeight: "700", color: "#202124", flex: 1, marginRight: 10 },
    closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#f1f3f4", alignItems: "center", justifyContent: "center" },
    addSection: { paddingHorizontal: 24, paddingVertical: 12 },
    sectionLabel: { fontSize: 11, fontWeight: "800", color: "#5f6368", letterSpacing: 0.8, marginBottom: 12 },
    inputRow: { flexDirection: "row", gap: 10 },
    inputWrapper: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#f1f3f4", borderRadius: 24, paddingHorizontal: 16, height: 48 },
    searchIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 15, color: "#202124", height: "100%" },
    searchBtn: { backgroundColor: "#1a73e8", borderRadius: 24, paddingHorizontal: 24, height: 48, justifyContent: "center", alignItems: "center", minWidth: 100 },
    searchBtnDisabled: { opacity: 0.6 },
    searchBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
    divider: { height: 1, backgroundColor: "#e8eaed", marginVertical: 16, marginHorizontal: 24 },
    peopleSection: { paddingHorizontal: 24, flex: 1, minHeight: 200 },
    emptyState: { alignItems: "center", paddingVertical: 40 },
    emptyText: { color: "#5f6368", fontSize: 14, marginTop: 16, fontWeight: "500" },
    emptySubtext: { color: "#80868b", fontSize: 12, marginTop: 8, textAlign: "center", paddingHorizontal: 20, lineHeight: 18 },
    permItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f1f3f4" },
    avatarContainer: { marginRight: 12 },
    avatar: { width: 40, height: 40, borderRadius: 20 },
    avatarPlaceholder: { backgroundColor: "#1a73e8", alignItems: "center", justifyContent: "center" },
    avatarInitial: { color: "#fff", fontSize: 16, fontWeight: "700" },
    permInfo: { flex: 1, marginRight: 12 },
    permName: { fontSize: 14, fontWeight: "600", color: "#202124", marginBottom: 2 },
    permEmail: { fontSize: 13, color: "#5f6368" },
    permActions: { flexDirection: "row", alignItems: "center", gap: 8 },
    roleBtn: { backgroundColor: "#f1f3f4", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, minWidth: 70, alignItems: "center" },
    roleText: { fontSize: 12, fontWeight: "700", color: "#5f6368" },
    removeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#fce8e6", alignItems: "center", justifyContent: "center" },
    roleTag: { backgroundColor: "#e8f0fe", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    roleTagText: { fontSize: 12, fontWeight: "600", color: "#1967d2" },
    footer: { paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: "#e8eaed" },
    closeFooterBtn: { backgroundColor: "#1a73e8", borderRadius: 24, paddingVertical: 14, alignItems: "center" },
    closeFooterText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});