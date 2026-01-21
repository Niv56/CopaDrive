import React, { useState, useMemo } from "react";
import { View, Text, ImageBackground, SafeAreaView } from "react-native";
import { useFonts, BrunoAceSC_400Regular } from "@expo-google-fonts/bruno-ace-sc";

// Layout & Components
import TopBar from "../../layout/TopBar";
import BottomBar from "../../layout/BottomBar";
import Fab from "../../layout/fab/Fab"; 

// Pages
import MainHomePage from "../../features/drive/pages/MainHomePage";
import StarredPage from "../../features/drive/pages/StarredPage";
import SharedPage from "../../features/drive/pages/SharedPage";
import MyDrivePage from "../../features/drive/pages/MyDrivePage";

// ✅ Theme Imports
import { getDriveStyles } from "../../features/drive/styles/myDrive.styles";
import { useTheme } from "../providers/ThemeContext";

// Images
const lightBg = require("../../assets/images/light.png");
const nightBg = require("../../assets/images/night.png");

export default function HomeManager() {
  const [activeTab, setActiveTab] = useState("home");
  const [fontsLoaded] = useFonts({ BrunoAceSC_400Regular });

  // ✅ שימוש ב-Theme לקביעת הרקע והצבעים
  const { isDarkMode, colors } = useTheme();
  const styles = useMemo(() => getDriveStyles(colors), [colors]);

  // פונקציה שמועברת ל-FAB.
  // ה-FAB מבצע את הרענון בפועל דרך ה-Event Bus (emitDriveRefresh),
  // אז כאן אנחנו רק מדפיסים לוג או יכולים להוסיף לוגיקה גלובלית אם נרצה בעתיד.
  const handleRefresh = () => {
    console.log("Global refresh triggered via FAB");
  };

  if (!fontsLoaded) return null;

  return (
    <ImageBackground
      // ✅ החלפת תמונת הרקע לפי המצב
      source={isDarkMode ? nightBg : lightBg}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1 }}>
        <TopBar />

        {/* כותרת הדף המשתנה */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={[styles.homeTitle, { marginLeft: 0 }]}>
            {activeTab.toUpperCase()}
          </Text>
        </View>

        {/* איזור התוכן המשתנה */}
        <View style={{ flex: 1 }}>
          {activeTab === "home" && <MainHomePage />}
          {activeTab === "starred" && <StarredPage />}
          {activeTab === "shared" && <SharedPage />}
          {activeTab === "mydrive" && <MyDrivePage />}
        </View>
      </SafeAreaView>

      {/* כפתור הפעולה הצף */}
      <Fab onRefresh={handleRefresh} />

      {/* תפריט הניווט התחתון */}
      <BottomBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </ImageBackground>
  );
}