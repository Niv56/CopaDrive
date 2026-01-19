import React, { useMemo } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMyDrive } from "../hooks/useMyDrive";
import DriveListItem from "../components/DriveListItem";
import { driveStyles } from "../styles/myDrive.styles";

export default function MainHomePage() {
    const { items, loading, refreshing, onRefresh } = useMyDrive();

    // לוגיקה פנימית של הדף: חלוקה לתיקיות וקבצים
    const folders = useMemo(() => items.filter(i => i.type === 'folder'), [items]);
    const files = useMemo(() => items.filter(i => i.type === 'file'), [items]);

    if (loading && items.length === 0) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

    return (
        <FlatList
            data={[]}
            ListHeaderComponent={
                <View>
                    <SectionHeader icon="folder-outline" title="Suggested folders" />
                    {folders.map(item => <DriveListItem key={item.id} item={item} onPress={() => { }} />)}

                    <SectionHeader icon="document-text-outline" title="Suggested files" style={{ marginTop: 20 }} />
                    {files.map(item => <DriveListItem key={item.id} item={item} onPress={() => { }} />)}
                </View>
            }
            refreshing={refreshing}
            onRefresh={onRefresh}
            contentContainerStyle={{ paddingBottom: 150 }}
        />
    );
}

const SectionHeader = ({ icon, title, style }) => (
    <View style={[driveStyles.sectionHeader, style]}>
        <Ionicons name={icon} size={18} color="#333" />
        <Text style={driveStyles.sectionText}>{title}</Text>
    </View>
);