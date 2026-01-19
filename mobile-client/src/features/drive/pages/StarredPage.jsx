import React, { useMemo } from "react";
import { FlatList, Alert, Text, ActivityIndicator } from "react-native";
import { useMyDrive } from "../hooks/useMyDrive";
import DriveListItem from "../components/DriveListItem";
import { driveStyles } from "../styles/myDrive.styles";

export default function StarredPage() {
    const { items, loading, refreshing, onRefresh } = useMyDrive();

    const starredItems = useMemo(() => items.filter(i => i.starred), [items]);

    const handleMongoDBAlert = () => {
        Alert.alert("CopaDrive", "MongoDB integration required for file actions.");
    };

    if (loading && items.length === 0) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

    return (
        <FlatList
            data={starredItems}
            contentContainerStyle={{ paddingBottom: 150 }}
            keyExtractor={(item) => item.id}
            refreshing={refreshing}
            onRefresh={onRefresh}
            renderItem={({ item }) => (
                <DriveListItem item={item} onPress={handleMongoDBAlert} />
            )}
            ListEmptyComponent={
                <Text style={driveStyles.emptyText}>No starred items yet</Text>
            }
        />
    );
}