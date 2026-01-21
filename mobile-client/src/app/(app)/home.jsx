import React, { useState, useMemo } from "react";
import { View, Text, ImageBackground, SafeAreaView } from "react-native";
import { useFonts, BrunoAceSC_400Regular } from "@expo-google-fonts/bruno-ace-sc";

import TopBar from "../../layout/TopBar";
import BottomBar from "../../layout/BottomBar";
import Fab from "../../layout/fab/Fab"; 

import MainHomePage from "../../features/drive/pages/MainHomePage";
import StarredPage from "../../features/drive/pages/StarredPage";
import SharedPage from "../../features/drive/pages/SharedPage";
import MyDrivePage from "../../features/drive/pages/MyDrivePage";

// ✅ Theme Imports
import { getDriveStyles } from "../../features/drive/styles/myDrive.styles";
import { useTheme } from "../providers/ThemeContext";

const lightBg = require("../../assets/images/light.png");
const nightBg = require("../../assets/images/night.png");

export default function HomeManager() {
  const [activeTab, setActiveTab] = useState("home");
  const [fontsLoaded] = useFonts({ BrunoAceSC_400Regular });

  const { isDarkMode, colors } = useTheme();
  const styles = useMemo(() => getDriveStyles(colors), [colors]);

  const handleRefresh = () => { console.log("Refreshing..."); };

  if (!fontsLoaded) return null;

  return (
    <ImageBackground
      source={isDarkMode ? nightBg : lightBg}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1 }}>
        <TopBar />

        <View style={{ paddingHorizontal: 20 }}>
          <Text style={[styles.homeTitle, { marginLeft: 0 }]}>
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
    </ImageBackground>
  );
}