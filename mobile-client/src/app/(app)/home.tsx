import React from "react";
import { View, Text, FlatList, ImageBackground, SafeAreaView, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, BrunoAceSC_400Regular } from "@expo-google-fonts/bruno-ace-sc";
import { useMyDrive } from "../../features/drive/hooks/useMyDrive";
import DriveListItem from "../../features/drive/components/DriveListItem";
import { driveStyles } from "../../features/drive/styles/myDrive.styles";

const bgImage = require("../../assets/images/back.png");

export default function Home() {
  const { items, loading, refreshing, onRefresh } = useMyDrive();
  const [fontsLoaded] = useFonts({ BrunoAceSC_400Regular });

  if (!fontsLoaded) return <ActivityIndicator size="large" color="#007bff" style={{ flex: 1 }} />;

  return (
    <ImageBackground source={bgImage} style={driveStyles.backgroundImage} resizeMode="cover">
      {/* SafeArea רק לחלק העליון והתוכן */}
      <SafeAreaView style={{ flex: 1 }}>

        {/* Top Bar - כבר נראה טוב אצלך */}
        <View style={driveStyles.topBarSearchWrapper}>
          <Pressable onPress={() => console.log("Sidebar")}>
            <Ionicons name="menu" size={24} color="#5f6368" />
          </Pressable>
          <Text style={driveStyles.searchText}>Search in CopaDrive</Text>
          <Pressable style={driveStyles.profileCircle}>
            <Ionicons name="person" size={18} color="#fff" />
          </Pressable>
        </View>

        <Text style={driveStyles.homeTitle}>HOME</Text>

        <FlatList
          data={items}
          contentContainerStyle={{ paddingBottom: 120 }} // מניעת הסתרה ע"י הבר התחתון
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DriveListItem item={item} onPress={(i) => console.log(i.name)} />
          )}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>

      {/* רכיבים אלו יוצאים מה-SafeAreaView כדי להגיע לקצוות המוחלטים */}
      <Pressable style={driveStyles.fab}>
        <Ionicons name="add" size={36} color="#1a73e8" />
      </Pressable>

      <View style={driveStyles.bottomNav}>
        <NavItem icon="home" label="Home" active />
        <NavItem icon="star-outline" label="Starred" />
        <NavItem icon="people-outline" label="Shared" />
        <NavItem icon="folder-outline" label="myDrive" />
      </View>
    </ImageBackground>
  );
}

function NavItem({ icon, label, active = false }: any) {
  return (
    <View style={driveStyles.navItem}>
      <Ionicons name={icon} size={24} color={active ? "#1a73e8" : "#5f6368"} />
      <Text style={[driveStyles.navLabel, active && driveStyles.navLabelActive]}>{label}</Text>
    </View>
  );
}