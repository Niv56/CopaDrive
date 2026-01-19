import React, { useState, useMemo } from "react";
import { FlatList, Pressable, View, Text, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMyDrive } from "../hooks/useMyDrive";
import { useAuth } from "../../../app/providers/AuthContext";
import DriveListItem from "../components/DriveListItem";
import { driveStyles } from "../styles/myDrive.styles";

export default function SharedPage() {
    const { items, loading, refreshing, onRefresh } = useMyDrive();
    const { userId } = useAuth();
    const [selectedOwnerId, setSelectedOwnerId] = useState(null);

    // סינון פריטים ששותפו איתי
    const sharedItems = useMemo(() => items.filter(i => i.ownerId !== userId), [items, userId]);

    // יצירת רשימת בעלים
    const owners = useMemo(() => {
        const uniqueIds = [...new Set(sharedItems.map(i => i.ownerId))];
        return uniqueIds.map(id => ({
            id,
            email: sharedItems.find(i => i.ownerId === id).ownerEmail || 'Shared User'
        }));
    }, [sharedItems]);

    const filesByOwner = useMemo(() =>
        sharedItems.filter(i => i.ownerId === selectedOwnerId),
        [sharedItems, selectedOwnerId]
    );

    if (loading && items.length === 0) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

    if (selectedOwnerId) {
        return (
            <View style={{ flex: 1 }}>
                <Pressable onPress={() => setSelectedOwnerId(null)} style={{ margin: 15, flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="arrow-back" size={20} color="#1a73e8" />
                    <Text style={{ color: '#1a73e8', fontWeight: 'bold', marginLeft: 5 }}>Back to Users</Text>
                </Pressable>
                <FlatList
                    data={filesByOwner}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <DriveListItem item={item} onPress={() => Alert.alert("MongoDB Needed")} />}
                />
            </View>
        );
    }

    return (
        <FlatList
            data={owners}
            refreshing={refreshing}
            onRefresh={onRefresh}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <Pressable style={driveStyles.fileCard} onPress={() => setSelectedOwnerId(item.id)}>
                    <Ionicons name="person-circle" size={40} color="#5f6368" style={{ marginRight: 15 }} />
                    <Text style={driveStyles.fileName}>{item.email}</Text>
                </Pressable>
            )}
            ListEmptyComponent={<Text style={driveStyles.emptyText}>No shared items yet</Text>}
        />
    );
}