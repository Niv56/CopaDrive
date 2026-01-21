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
import { useTheme } from "../../../app/providers/ThemeContext";
import { getDriveStyles } from "../styles/myDrive.styles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ShareModal({ visible, item, onClose }) {
    const { token, user } = useAuth();
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [adding, setAdding] = useState(false);
    const { colors, isDarkMode } = useTheme();

    // Determine file ID and check if the current user is the owner
    const fileId = item?.id || item?._id;
    const isOwner = String(item?.ownerId || item?.owner) === String(user?.id || user?._id);
    const driveStyles = useMemo(() => getDriveStyles(colors), [colors]);

    // Fetch existing permissions for the specific file
    const loadPermissions = useCallback(async () => {
        if (!fileId || !token) return;
        setLoading(true);
        try {
            const data = await getPermissions(token, fileId);
            setPermissions(Array.isArray(data) ? data : []);
        } catch (e) {
            Alert.alert("Error", "Failed to load permissions");
        } finally {
            setLoading(true);
            setLoading(false);
        }
    }, [fileId, token]);

    // Load data whenever the modal becomes visible
    useEffect(() => {
        if (visible && fileId) loadPermissions();
    }, [visible, fileId, loadPermissions]);

    // Find a user by email and grant them "viewer" access
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

    // Toggle between "viewer" and "editor" roles
    const handleToggleRole = async (perm) => {
        const newRole = perm.role === "viewer" ? "editor" : "viewer";
        try {
            const permId = perm.id || perm._id;
            await updatePermission(token, fileId, permId, newRole);
            await loadPermissions();
        } catch (e) {
            console.error("Update role error:", e);
            Alert.alert("Error", "Failed to update role");
        }
    };

    // Revoke a user's access with a confirmation alert
    const handleRemove = async (perm) => {
        Alert.alert(
            "Remove Access",
            `Are you sure you want to remove access for ${perm.email}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const permId = perm.id || perm._id;
                            await deletePermission(token, fileId, permId);
                            await loadPermissions();
                        } catch (e) {
                            console.error("Delete permission error:", e);
                            Alert.alert("Error", "Failed to remove user");
                        }
                    },
                },
            ]
        );
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                {/* Background Blur */}
                <BlurView intensity={20} tint={isDarkMode ? "dark" : "dark"} style={StyleSheet.absoluteFill} />
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.container}
                >
                    <BlurView intensity={95} tint={isDarkMode ? "dark" : "light"} style={[styles.glassCard, { backgroundColor: colors.card + 'F2' }]}>
                        {/* Header Section */}
                        <View style={styles.header}>
                            <Text style={[styles.title, { color: colors.textPrimary, fontFamily: 'BrunoAceSC_400Regular' }]}>
                                SHARE FILE
                            </Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                                <Ionicons name="close" size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        {/* Search and Add User Input (Owners only) */}
                        {isOwner && (
                            <View style={styles.addSection}>
                                <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                    <TextInput
                                        style={[styles.input, { color: colors.textPrimary }]}
                                        placeholder="Enter email..."
                                        placeholderTextColor={colors.textTertiary}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity
                                        style={[styles.addBtn, { backgroundColor: colors.primary }]}
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
                            </View>
                        )}

                        {/* List of Users with current access */}
                        <View style={styles.listContainer}>
                            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PEOPLE WITH ACCESS</Text>
                            {loading ? (
                                <ActivityIndicator style={{ marginVertical: 20 }} color={colors.primary} />
                            ) : (
                                <FlatList
                                    data={permissions}
                                    keyExtractor={(p) => p.id || p.userId || Math.random().toString()}
                                    renderItem={({ item: perm }) => (
                                        <View style={[styles.permItem, { borderBottomColor: colors.border }]}>
                                            <View style={styles.avatarWrapper}>
                                                {perm.image ? (
                                                    <Image source={{ uri: perm.image }} style={styles.avatar} />
                                                ) : (
                                                    <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.primary + '26' }]}>
                                                        <Ionicons name="person" size={18} color={colors.primary} />
                                                    </View>
                                                )}
                                            </View>

                                            <View style={styles.userInfo}>
                                                <Text style={[styles.userName, { color: colors.textPrimary }]} numberOfLines={1}>
                                                    {perm.firstName} {perm.lastName}
                                                </Text>
                                                <Text style={[styles.userEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                                                    {perm.email}
                                                </Text>
                                            </View>

                                            <View style={styles.actionsContainer}>
                                                {isOwner ? (
                                                    <>
                                                        {/* Role switcher for Owners */}
                                                        <TouchableOpacity
                                                            style={[styles.roleBadgeActive, { backgroundColor: colors.primary + '26', borderColor: colors.primary + '33' }]}
                                                            onPress={() => handleToggleRole(perm)}
                                                        >
                                                            <Text style={[styles.roleTextActive, { color: colors.primary }]}>{perm.role?.toUpperCase()}</Text>
                                                            <Ionicons name="chevron-down" size={12} color={colors.primary} style={{ marginLeft: 4 }} />
                                                        </TouchableOpacity>

                                                        {/* Delete permission for Owners */}
                                                        <TouchableOpacity
                                                            style={[styles.deleteBtn, { backgroundColor: colors.danger + '1A' }]}
                                                            onPress={() => handleRemove(perm)}
                                                        >
                                                            <Ionicons name="trash-outline" size={18} color={colors.danger} />
                                                        </TouchableOpacity>
                                                    </>
                                                ) : (
                                                    /* Read-only badge for Viewers/Editors */
                                                    <View style={[styles.roleBadgeReadOnly, { backgroundColor: colors.surface }]}>
                                                        <Text style={[styles.roleTextReadOnly, { color: colors.textSecondary }]}>{perm.role?.toUpperCase()}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    )}
                                    ListEmptyComponent={
                                        <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No shared users found.</Text>
                                    }
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
    closeIcon: { padding: 5 },

    actionsContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    roleBadgeActive: {
        backgroundColor: "rgba(13, 110, 253, 0.15)",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(13, 110, 253, 0.2)",
    },
    roleTextActive: {
        fontSize: 10,
        fontWeight: "900",
        color: "#0d6efd"
    },
    roleBadgeReadOnly: {
        backgroundColor: "rgba(0, 0, 0, 0.05)",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    roleTextReadOnly: {
        fontSize: 10,
        fontWeight: "700",
        color: "#666"
    },
    deleteBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(220, 53, 69, 0.1)",
        justifyContent: "center",
        alignItems: "center",
    },
});