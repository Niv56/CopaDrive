// mobile-client/src/features/drive/modals/ShareModal.jsx

import React, { useState, useEffect, useCallback } from "react";
import {
    Modal, View, Text, TextInput, Pressable, FlatList,
    ActivityIndicator, Alert, StyleSheet, TouchableOpacity
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
            const data = await getPermissions(token, fileId);
            const list = Array.isArray(data) ? data : data?.permissions || [];
            setPermissions(list);
        } catch (e) {
            console.error("Failed to load permissions:", e);
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
        Alert.alert(
            "Remove Access",
            `Remove ${perm.userEmail || "this user"}'s access?`,
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

    return (
        <Modal visible={visible} transparent animationType="fade">
            <Pressable style={styles.backdrop} onPress={onClose}>
                <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />

                <Pressable style={styles.card} onPress={() => { }}>
                    <View style={styles.header}>
                        <Text style={styles.title} numberOfLines={1}>Share "{item?.name}"</Text>
                        <Pressable onPress={onClose} hitSlop={10}>
                            <Ionicons name="close" size={24} color="#666" />
                        </Pressable>
                    </View>

                    {/* Add new person */}
                    {isOwner && (
                        <View style={styles.addSection}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter email address"
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                style={[styles.addBtn, adding && styles.addBtnDisabled]}
                                onPress={handleShare}
                                disabled={adding}
                            >
                                {adding ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Ionicons name="person-add" size={20} color="#fff" />
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Permission list */}
                    <Text style={styles.sectionTitle}>People with access</Text>

                    {loading ? (
                        <ActivityIndicator style={{ marginVertical: 20 }} />
                    ) : permissions.length === 0 ? (
                        <Text style={styles.emptyText}>No one else has access</Text>
                    ) : (
                        <FlatList
                            data={permissions}
                            keyExtractor={(p) => p.id || p.userId || String(Math.random())}
                            style={{ maxHeight: 250 }}
                            renderItem={({ item: perm }) => (
                                <View style={styles.permItem}>
                                    <View style={styles.permInfo}>
                                        <Text style={styles.permName}>
                                            {perm.userName || perm.userEmail || "User"}
                                        </Text>
                                        <Text style={styles.permEmail}>{perm.userEmail}</Text>
                                    </View>

                                    {isOwner ? (
                                        <View style={styles.permActions}>
                                            <TouchableOpacity
                                                style={styles.roleBtn}
                                                onPress={() => handleToggleRole(perm)}
                                            >
                                                <Text style={styles.roleText}>{perm.role}</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleRemove(perm)}>
                                                <Ionicons name="trash-outline" size={18} color="#dc3545" />
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <Text style={styles.roleTextReadonly}>{perm.role}</Text>
                                    )}
                                </View>
                            )}
                        />
                    )}
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
        maxHeight: "80%",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: "#333",
        flex: 1,
        marginRight: 10,
    },
    addSection: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 20,
    },
    input: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
    },
    addBtn: {
        backgroundColor: "#0d6efd",
        borderRadius: 12,
        paddingHorizontal: 16,
        justifyContent: "center",
    },
    addBtnDisabled: {
        opacity: 0.6,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
        marginBottom: 12,
    },
    emptyText: {
        color: "#999",
        textAlign: "center",
        paddingVertical: 20,
    },
    permItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    permInfo: {
        flex: 1,
    },
    permName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#333",
    },
    permEmail: {
        fontSize: 13,
        color: "#666",
    },
    permActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    roleBtn: {
        backgroundColor: "#e9ecef",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    roleText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#495057",
        textTransform: "uppercase",
    },
    roleTextReadonly: {
        fontSize: 12,
        color: "#666",
        textTransform: "uppercase",
    },
});