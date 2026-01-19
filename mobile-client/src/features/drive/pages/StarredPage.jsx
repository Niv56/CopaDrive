import React, { useMemo } from "react";
import { FlatList, Alert } from "react-native";
import DriveListItem from "../components/DriveListItem";
import { driveStyles } from "../styles/myDrive.styles";

export default function StarredPage({ items }) {
    const starredItems = useMemo(() => items.filter(i => i.starred), [items]);

    return (
        <FlatList
            data={starredItems}
            contentContainerStyle={{ paddingBottom: 150 }}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <DriveListItem item={item} onPress={() => Alert.alert("CopaDrive", "MongoDB integration required for file actions.")} />
            )}
            ListEmptyComponent={<Text style={driveStyles.emptyText}>No starred items yet</Text>}
        />
    );
}