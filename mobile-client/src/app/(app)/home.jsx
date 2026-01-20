import React, { useState } from "react";
import { View, Text, ImageBackground, SafeAreaView, StyleSheet } from "react-native";
import { useFonts, BrunoAceSC_400Regular } from "@expo-google-fonts/bruno-ace-sc";

// Layout & Pages
import TopBar from "../../layout/TopBar";
import BottomBar from "../../layout/BottomBar";
import Fab from "../../layout/Fab";

import MainHomePage from "../../features/drive/pages/MainHomePage";
import StarredPage from "../../features/drive/pages/StarredPage";
import SharedPage from "../../features/drive/pages/SharedPage";
import MyDrivePage from "../../features/drive/pages/MyDrivePage";

import { useTheme } from "../providers/ThemeContext";

// Styles
import { driveStyles } from "../../features/drive/styles/myDrive.styles";

export default function HomeManager() {
  const [activeTab, setActiveTab] = useState("home");
  const [fontsLoaded] = useFonts({ BrunoAceSC_400Regular });

  const { theme, colors } = useTheme();

  const bgImage = theme === "dark"
    ? require("../../assets/images/dark_back.png")
    : require("../../assets/images/back.png");

  const handleRefresh = () => {
    console.log("File uploaded/created, refreshing...");
  };

  if (!fontsLoaded) return null;

  return (
    <ImageBackground
      source={bgImage}
      style={[driveStyles.backgroundImage, { backgroundColor: colors.background }]}
      resizeMode="cover"
      imageStyle={theme === "dark" ? { opacity: 0.6 } : { opacity: 1 }}
    >
      <View style={[styles.mainOverlay, { backgroundColor: theme === "dark" ? 'rgba(0,0,0,0.4)' : 'transparent' }]}>
        <SafeAreaView style={{ flex: 1 }}>
          <TopBar />

          <View style={{ paddingHorizontal: 20 }}>
            <Text style={[driveStyles.homeTitle, { marginLeft: 0, color: colors.text }]}>
              {activeTab.toUpperCase()}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            {activeTab === "home" && <MainHomePage />}
            {activeTab === "starred" && <StarredPage />}
            {activeTab === "shared" && <SharedPage />}
            {activeTab === "mydrive" && <MyDrivePage />}
          </View>
        </SafeAreaView>

        <Fab onRefresh={handleRefresh} />

        <BottomBar activeTab={activeTab} setActiveTab={setActiveTab} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  mainOverlay: {
    flex: 1,
  }
});