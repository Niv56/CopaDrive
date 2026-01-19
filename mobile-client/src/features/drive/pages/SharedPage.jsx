import React, { useState, useMemo } from "react";
import { FlatList, Pressable, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DriveListItem from "../components/DriveListItem";
import { driveStyles } from "../styles/myDrive.styles";

export default function SharedPage({ items, userId }) {
    const [selectedOwnerId, setSelectedOwnerId] = useState(null);

    const sharedItems = useMemo(() => items.filter(i => i.ownerId !== userId), [items, userId]);

    const owners = useMemo(() => {
        const uniqueIds = [...new Set(sharedItems.map(i => i.ownerId))];
        return uniqueIds.map(id => ({ id, email: sharedItems.find(i => i.ownerId === id).ownerEmail || 'User' }));
    }, [sharedItems]);

    const filesByOwner = useMemo(() => sharedItems.filter(i => i.ownerId === selectedOwnerId), [sharedItems, selectedOwnerId]);

    if (selectedOwnerId) {
        return (
            <View style={{ flex: 1 }}>
                <Pressable onPress={() => setSelectedOwnerId(null)} style={{ margin: 15, flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="arrow-back" size={20} color="#1a73e8" />
                    <Text style={{ color: '#1a73e8', fontWeight: 'bold', marginLeft: 5 }}>Back</Text>
                </Pressable>
                <FlatList
                    data={filesByOwner}
                    renderItem={({ item }) => <DriveListItem item={item} onPress={() => { }} />}
                />
            </View>
        );
    }

    return (
        <FlatList
            data={owners}
            renderItem={({ item }) => (
                <Pressable style={driveStyles.fileCard} onPress={() => setSelectedOwnerId(item.id)}>
                    <Ionicons name="person-circle" size={40} color="#5f6368" style={{ marginRight: 15 }} />
                    <Text style={driveStyles.fileName}>{item.email}</Text>
                </Pressable>
            )}
        />
    );
}