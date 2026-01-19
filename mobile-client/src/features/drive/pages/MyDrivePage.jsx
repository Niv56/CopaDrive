import React, { useMemo } from "react";
import { FlatList, Text, Alert, ActivityIndicator } from "react-native";
import { useMyDrive } from "../hooks/useMyDrive";
import DriveListItem from "../components/DriveListItem";
import { driveStyles } from "../styles/myDrive.styles";

export default function MyDrivePage() {
    const { items, loading, refreshing, onRefresh } = useMyDrive();

    // פילטר חכם: מציג רק פריטים מסוג file
    const onlyFiles = useMemo(() =>
        items.filter(i => i.type === 'file'),
        [items]
    );

    const handleMongoDBAlert = () => {
        Alert.alert("MongoDB Required", "File actions in My Drive will be enabled after MongoDB integration.");
    };

    if (loading && items.length === 0) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

    return (
        <FlatList
            data={onlyFiles}
            contentContainerStyle={{ paddingBottom: 150 }}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <DriveListItem item={item} onPress={handleMongoDBAlert} />
            )}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={
                <Text style={driveStyles.emptyText}>No files found in your drive.</Text>
            }
            showsVerticalScrollIndicator={false}
        />
    );
}