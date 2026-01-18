import React, { useState, useMemo } from "react";
import { View, Text, FlatList, ImageBackground, SafeAreaView, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, BrunoAceSC_400Regular } from "@expo-google-fonts/bruno-ace-sc";
import { useMyDrive } from "../../features/drive/hooks/useMyDrive";
import DriveListItem from "../../features/drive/components/DriveListItem";
import { driveStyles } from "../../features/drive/styles/myDrive.styles";

const bgImage = require("../../assets/images/back.png");

export default function Home() {
  const { items, loading, refreshing, onRefresh } = useMyDrive();
  const [activeTab, setActiveTab] = useState("home");
  const [fontsLoaded] = useFonts({ BrunoAceSC_400Regular });

  // חלוקה חכמה של הנתונים לפי סוג (תיקייה/קובץ)
  const folders = useMemo(() => items.filter(i => i.type === 'folder'), [items]);
  const files = useMemo(() => items.filter(i => i.type === 'file'), [items]);

  if (!fontsLoaded) return <ActivityIndicator size="large" color="#007bff" style={{ flex: 1 }} />;

  return (
    <ImageBackground source={bgImage} style={driveStyles.backgroundImage} resizeMode="cover">
      <SafeAreaView style={{ flex: 1 }}>

        {/* Top Bar - חיפוש ארוך עם המבורגר ופרופיל */}
        <View style={driveStyles.topBarSearchWrapper}>
          <Ionicons name="menu" size={24} color="#5f6368" />
          <Text style={driveStyles.searchText}>Search in CopaDrive</Text>
          <View style={driveStyles.profileCircle}>
            <Ionicons name="person" size={18} color="#fff" />
          </View>
        </View>

        <Text style={driveStyles.homeTitle}>
          {activeTab === "home" ? "HOME" : activeTab.toUpperCase()}
        </Text>

        <FlatList
          data={activeTab === "home" ? [] : files} // בטאב myDrive נציג רק קבצים
          contentContainerStyle={{ paddingBottom: 150 }}
          ListHeaderComponent={activeTab === "home" ? (
            <View>
              {/* חלק עליון: תיקיות */}
              <SectionHeader icon="folder-outline" title="Suggested folders" />
              {folders.map(item => (
                <DriveListItem key={item.id} item={item} onPress={(i) => console.log(i.name)} />
              ))}

              {/* חלק תחתון: קבצים */}
              <SectionHeader icon="document-text-outline" title="Suggested files" style={{ marginTop: 20 }} />
              {files.map(item => (
                <DriveListItem key={item.id} item={item} onPress={(i) => console.log(i.name)} />
              ))}
            </View>
          ) : null}
          renderItem={activeTab !== "home" ? ({ item }) => (
            <DriveListItem item={item} onPress={(i) => console.log(i.name)} />
          ) : null}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={items.length === 0 && !loading ? <Text style={driveStyles.emptyText}>No items to show here</Text> : null}
        />
      </SafeAreaView>

      <Pressable style={driveStyles.fab}>
        <Ionicons name="add" size={36} color="#1a73e8" />
      </Pressable>

      {/* Lower Bar - מכסה את כל התחתית */}
      <View style={driveStyles.bottomNav}>
        <NavItem icon="home" label="Home" active={activeTab === "home"} onPress={() => setActiveTab("home")} />
        <NavItem icon="star-outline" label="Starred" active={activeTab === "starred"} onPress={() => setActiveTab("starred")} />
        <NavItem icon="people-outline" label="Shared" active={activeTab === "shared"} onPress={() => setActiveTab("shared")} />
        <NavItem icon="folder-outline" label="myDrive" active={activeTab === "mydrive"} onPress={() => setActiveTab("mydrive")} />
      </View>
    </ImageBackground>
  );
}

// רכיב לכותרות הסקשנים (תיקיות/קבצים)
function SectionHeader({ icon, title, style }: any) {
  return (
    <View style={[driveStyles.sectionHeader, style]}>
      <Ionicons name={icon} size={18} color="#333" />
      <Text style={driveStyles.sectionText}>{title}</Text>
    </View>
  );
}

function NavItem({ icon, label, active, onPress }: any) {
  return (
    <Pressable style={driveStyles.navItem} onPress={onPress}>
      <Ionicons name={icon} size={24} color={active ? "#1a73e8" : "#5f6368"} />
      <Text style={[driveStyles.navLabel, active && driveStyles.navLabelActive]}>{label}</Text>
    </Pressable>
  );
}