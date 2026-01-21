import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    Modal, View, Text, TextInput, Pressable, FlatList,
    ActivityIndicator, Alert, StyleSheet, TouchableOpacity, Image, Dimensions, KeyboardAvoidingView, Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useAuth } from "../../../app/providers/AuthContext";
import {
    getPermissions, addPermission, updatePermission, deletePermission, findUserByEmail,
} from "../services/permissionService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ShareModal({ visible, item, onClose }) {
    const { token, user } = useAuth();
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [adding, setAdding] = useState(false);

    const fileId = item?.id || item?._id;
    const isOwner = String(item?.ownerId || item?.owner) === String(user?.id || user?._id);

    const loadPermissions = useCallback(async () => {
        if (!fileId || !token) return;
        setLoading(true);
        try {
            const data = await getPermissions(token, fileId);
            setPermissions(Array.isArray(data) ? data : []);
        } catch (e) {
            Alert.alert("Error", "Failed to load permissions");
        } finally {
            setLoading(false);
        }
    }, [fileId, token]);

    useEffect(() => {
        if (visible && fileId) loadPermissions();
    }, [visible, fileId, loadPermissions]);

    const handleShare = async () => {
        if (!email.trim()) return;
        setAdding(true);
        try {
            const foundUser = await findUserByEmail(token, email.trim());
            if (!foundUser?.id && !foundUser?._id) {
                Alert.alert("User Not Found", "No user with that email exists.");
                return;
            }
            await addPermission(token, fileId, foundUser.id || foundUser._id, "viewer");
            setEmail("");
            loadPermissions();
        } catch (e) {
            Alert.alert("Error", e?.message || "Failed to share");
        } finally {
            setAdding(false);
        }
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.container}
                >
                    <BlurView intensity={95} tint="light" style={styles.glassCard}>
                        <View style={styles.header}>
                            <Text style={styles.title}>SHARE FILE</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {isOwner && (
                            <View style={styles.addSection}>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter email..."
                                        placeholderTextColor="#888"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity
                                        style={styles.addBtn}
                                        onPress={handleShare}
                                        disabled={adding}
                                    >
                                        {adding ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="person-add" size={20} color="#fff" />}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        <View style={styles.listContainer}>
                            <Text style={styles.sectionLabel}>PEOPLE WITH ACCESS</Text>
                            {loading ? (
                                <ActivityIndicator style={{ marginVertical: 20 }} />
                            ) : (
                                <FlatList
                                    data={permissions}
                                    keyExtractor={(p) => p.id || p.userId || Math.random().toString()}
                                    renderItem={({ item: perm }) => (
                                        <View style={styles.permItem}>
                                            {/* תמונת פרופיל או Placeholder */}
                                            <View style={styles.avatarWrapper}>
                                                {perm.image ? (
                                                    <Image source={{ uri: perm.image }} style={styles.avatar} />
                                                ) : (
                                                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                                        <Ionicons name="person" size={16} color="#0d6efd" />
                                                    </View>
                                                )}
                                            </View>

                                            <View style={styles.userInfo}>
                                                <Text style={styles.userName} numberOfLines={1}>
                                                    {perm.firstName} {perm.lastName}
                                                </Text>
                                                <Text style={styles.userEmail} numberOfLines={1}>
                                                    {perm.email}
                                                </Text>
                                            </View>

                                            <View style={styles.roleBadge}>
                                                <Text style={styles.roleText}>{perm.role?.toUpperCase()}</Text>
                                            </View>
                                        </View>
                                    )}
                                    ListEmptyComponent={<Text style={styles.emptyText}>No shared users found.</Text>}
                                />
                            )}
                        </View>
                    </BlurView>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: "center", alignItems: "center" },
    container: { width: SCREEN_WIDTH * 0.9, maxWidth: 400 },
    glassCard: {
        borderRadius: 28,
        padding: 24,
        overflow: "hidden",
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.3)",
    },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    title: {
        fontSize: 22,
        fontFamily: "BrunoAceSC_400Regular",
        color: "#1a1a1a"
    },
    addSection: { marginBottom: 20 },
    inputWrapper: {
        flexDirection: "row",
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        borderRadius: 15,
        alignItems: "center",
        paddingLeft: 15,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)"
    },
    input: { flex: 1, height: 50, color: "#333" },
    addBtn: {
        backgroundColor: "#0d6efd",
        width: 50,
        height: 50,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
    },
    listContainer: { maxHeight: 300 },
    sectionLabel: { fontSize: 11, fontWeight: "800", color: "#666", marginBottom: 10, letterSpacing: 1 },

    permItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.05)"
    },
    avatarWrapper: {
        marginRight: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.5)",
    },
    avatarPlaceholder: {
        backgroundColor: "rgba(13, 110, 253, 0.1)",
        justifyContent: "center",
        alignItems: "center",
    },
    userInfo: {
        flex: 1,
        justifyContent: "center"
    },
    userName: {
        fontWeight: "700",
        color: "#333",
        fontSize: 15
    },
    userEmail: {
        fontSize: 12,
        color: "#666",
        marginTop: 2
    },
    roleBadge: {
        backgroundColor: "rgba(13, 110, 253, 0.15)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginLeft: 10
    },
    roleText: {
        fontSize: 10,
        fontWeight: "900",
        color: "#0d6efd",
        letterSpacing: 0.5
    },

    emptyText: { textAlign: "center", color: "#999", marginTop: 20 },
    closeIcon: { padding: 5 }
});