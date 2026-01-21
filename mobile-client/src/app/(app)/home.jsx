// mobile-client/src/app/(app)/home.jsx

import React, { useState } from "react";
import { View, Text, ImageBackground, SafeAreaView } from "react-native";
import { useFonts, BrunoAceSC_400Regular } from "@expo-google-fonts/bruno-ace-sc";

// Layout & Pages
import TopBar from "../../layout/TopBar";
import BottomBar from "../../layout/BottomBar";
import Fab from "../../layout/fab/Fab"; // ✅ הנתיב החדש שסידרנו קודם

import MainHomePage from "../../features/drive/pages/MainHomePage";
import StarredPage from "../../features/drive/pages/StarredPage";
import SharedPage from "../../features/drive/pages/SharedPage";
import MyDrivePage from "../../features/drive/pages/MyDrivePage";

// Styles
import { driveStyles } from "../../features/drive/styles/myDrive.styles";

const bgImage = require("../../assets/images/back.png");

export default function HomeManager() {
  const [activeTab, setActiveTab] = useState("home");
  const [fontsLoaded] = useFonts({ BrunoAceSC_400Regular });

  const handleRefresh = () => {
    console.log("File uploaded/created, refreshing...");
  };

  if (!fontsLoaded) return null;

  return (
    <ImageBackground
      source={bgImage}
      style={driveStyles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1 }}>
        <TopBar />

        <View style={{ paddingHorizontal: 20 }}>
          <Text style={[driveStyles.homeTitle, { marginLeft: 0 }]}>
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

      {/* FAB */}
      <Fab onRefresh={handleRefresh} />

      <BottomBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </ImageBackground>
  );
}