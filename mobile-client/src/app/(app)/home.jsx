import React, { useState, useMemo, useEffect } from "react";
import { View, Text, ImageBackground, SafeAreaView, StyleSheet, Platform, StatusBar } from "react-native";
import { useFonts, BrunoAceSC_400Regular } from "@expo-google-fonts/bruno-ace-sc";
import { Stack } from "expo-router";

import TopBar from "../../layout/TopBar";
import BottomBar from "../../layout/BottomBar";
import Fab from "../../layout/fab/Fab";

import MainHomePage from "../../features/drive/pages/MainHomePage";
import StarredPage from "../../features/drive/pages/StarredPage";
import SharedPage from "../../features/drive/pages/SharedPage";
import MyDrivePage from "../../features/drive/pages/MyDrivePage";

import { getDriveStyles } from "../../features/drive/styles/myDrive.styles";
import { useTheme } from "../providers/ThemeContext";

import { subscribeNavigateToFolder } from "../../features/drive/services/driveEvents";

// Images
const lightBg = require("../../assets/images/light.png");
const nightBg = require("../../assets/images/night.png");

export default function HomeManager() {
  const [activeTab, setActiveTab] = useState("home");
  const [fontsLoaded] = useFonts({ BrunoAceSC_400Regular });

  const { isDarkMode, colors } = useTheme();
  const styles = useMemo(() => getDriveStyles(colors), [colors]);

  useEffect(() => {
    const unsubscribe = subscribeNavigateToFolder(() => {
      setActiveTab("mydrive");
    });
    return unsubscribe;
  }, []);


  const handleRefresh = () => {
  };

  if (!fontsLoaded) return null;

  const getTitle = () => {
    switch (activeTab) {
      case 'home': return 'HOME';
      case 'starred': return 'STARRED';
      case 'shared': return 'SHARED';
      case 'mydrive': return 'MY DRIVE';
      default: return 'COPA DRIVE';
    }
  };

  return (
    <View style={localStyles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ImageBackground
        source={isDarkMode ? nightBg : lightBg}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      <SafeAreaView style={localStyles.safeArea}>

        {/* TopBar */}
        <View style={{ zIndex: 100 }}>
          <TopBar />
        </View>

        <View style={[
          localStyles.titleCard,
          {
            backgroundColor: isDarkMode ? 'rgba(20, 20, 30, 0.6)' : 'rgba(255, 255, 255, 0.65)',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.4)'
          }
        ]}>
          <Text style={[
            styles.homeTitle,
            localStyles.customTitleText,
            {
              color: isDarkMode ? '#FFFFFF' : '#1A2A3A',
              textShadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
            }
          ]}>
            {getTitle()}
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
      <View style={localStyles.fabWrapper} pointerEvents="box-none">
        <Fab onRefresh={handleRefresh} />
      </View>

      {/* BottomBar */}
      <View style={localStyles.bottomBarWrapper}>
        <BottomBar activeTab={activeTab} setActiveTab={setActiveTab} />
      </View>

    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    paddingBottom: 80,
  },
  titleCard: {
    marginTop: 5,
    marginBottom: 5,
    marginHorizontal: 20,

    paddingVertical: 3,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  customTitleText: {
    marginLeft: 0,
    marginTop: 0,
    marginBottom: 0,
    paddingVertical: 0,

    fontSize: 18,
    lineHeight: 22,
    letterSpacing: 1.5,
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  fabWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    top: 0,
    zIndex: 110,
  },
  bottomBarWrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    zIndex: 100,
  }
});