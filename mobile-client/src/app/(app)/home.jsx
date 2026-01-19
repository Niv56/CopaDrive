import React, { useState, useMemo } from "react";
import { View, Text, FlatList, ImageBackground, SafeAreaView, ActivityIndicator } from "react-native";
import { useFonts, BrunoAceSC_400Regular } from "@expo-google-fonts/bruno-ace-sc";
import { Ionicons } from "@expo/vector-icons";

// Hooks & Logic
import { useMyDrive } from "../../features/drive/hooks/useMyDrive";
import DriveListItem from "../../features/drive/components/DriveListItem";
import { driveStyles } from "../../features/drive/styles/myDrive.styles";

// Layout Components
import TopBar from "../../layout/TopBar";
import BottomBar from "../../layout/BottomBar";
import Fab from "../../layout/Fab";

const bgImage = require("../../assets/images/back.png");

export default function Home() {
  const { items, loading, refreshing, onRefresh } = useMyDrive();
  const [activeTab, setActiveTab] = useState("home");
  const [fontsLoaded] = useFonts({ BrunoAceSC_400Regular });

  // חלוקה חכמה של הנתונים
  const folders = useMemo(() => items.filter(i => i.type === 'folder'), [items]);
  const files = useMemo(() => items.filter(i => i.type === 'file'), [items]);

  if (!fontsLoaded) return <ActivityIndicator size="large" color="#007bff" style={{ flex: 1 }} />;

  // פונקציית עזר לכותרות (הוסר ה-Type :any)
  const SectionHeader = ({ icon, title, style }) => (
    <View style={[driveStyles.sectionHeader, style]}>
      <Ionicons name={icon} size={18} color="#333" />
      <Text style={driveStyles.sectionText}>{title}</Text>
    </View>
  );

  return (
    <ImageBackground source={bgImage} style={driveStyles.backgroundImage} resizeMode="cover">
      <SafeAreaView style={{ flex: 1 }}>

        {/* 1. Top Bar Component */}
        <TopBar />

        {/* Title */}
        <Text style={driveStyles.homeTitle}>
          {activeTab === "home" ? "HOME" : activeTab.toUpperCase()}
        </Text>

        {/* Main Content List */}
        <FlatList
          data={activeTab === "home" ? [] : files}
          contentContainerStyle={{ paddingBottom: 150 }}

          // Header: מוצג רק בטאב הראשי - מכיל תיקיות וקבצים מומלצים
          ListHeaderComponent={activeTab === "home" ? (
            <View>
              <SectionHeader icon="folder-outline" title="Suggested folders" />
              {folders.map(item => (
                <DriveListItem key={item.id} item={item} onPress={(i) => console.log(i.name)} />
              ))}

              <SectionHeader icon="document-text-outline" title="Suggested files" style={{ marginTop: 20 }} />
              {files.map(item => (
                <DriveListItem key={item.id} item={item} onPress={(i) => console.log(i.name)} />
              ))}
            </View>
          ) : null}

          // Items: מוצג בשאר הטאבים (רשימה שטוחה)
          renderItem={activeTab !== "home" ? ({ item }) => (
            <DriveListItem item={item} onPress={(i) => console.log(i.name)} />
          ) : null}

          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={items.length === 0 && !loading ? <Text style={driveStyles.emptyText}>No items to show here</Text> : null}
        />
      </SafeAreaView>

      {/* 2. Floating Action Button */}
      <Fab onPress={() => console.log("Add new item")} />

      {/* 3. Bottom Navigation Bar */}
      <BottomBar activeTab={activeTab} setActiveTab={setActiveTab} />

    </ImageBackground>
  );
}