import React, { useState } from "react";
import { View, Text, ImageBackground, SafeAreaView, Alert } from "react-native";
import { useFonts, BrunoAceSC_400Regular } from "@expo-google-fonts/bruno-ace-sc";

// Layout & Pages
import TopBar from "../../layout/TopBar";
import BottomBar from "../../layout/BottomBar";
import Fab from "../../layout/Fab";
import MainHomePage from "../../features/drive/pages/MainHomePage";
import StarredPage from "../../features/drive/pages/StarredPage";
import SharedPage from "../../features/drive/pages/SharedPage";
import MyDrivePage from "../../features/drive/pages/MyDrivePage";
import CreateFileModal from "../../features/drive/components/CreateFileModal";

// Styles & Services
import { driveStyles } from "../../features/drive/styles/myDrive.styles";
import { createFile } from "../../features/drive/services/fileService";
import { useAuth } from "../providers/AuthContext";

const bgImage = require("../../assets/images/back.png");

export default function HomeManager() {
  const [activeTab, setActiveTab] = useState("home");
  const [modalVisible, setModalVisible] = useState(false);
  const { token } = useAuth();
  const [fontsLoaded] = useFonts({ BrunoAceSC_400Regular });

  /* ===========================================================
     📍 אזור קריאה לשרת - לשינוי עבור MONGODB 📍
     =========================================================== */
  const handleCreateFile = async (fileData) => {
    try {
      await createFile(token, fileData);
      setModalVisible(false);
      Alert.alert("Success", "File added to MongoDB/Server");
      // כאן נצטרך דרך לרענן את הדף הפעיל (למשל ע"י Event emitter או פשוט לסמוך על הריפרוש הידני)
    } catch (e) { Alert.alert("Error", "Check Connection"); }
  };

  if (!fontsLoaded) return null;

  return (
    <ImageBackground source={bgImage} style={driveStyles.backgroundImage} resizeMode="cover">
      <SafeAreaView style={{ flex: 1 }}>
        <TopBar />
        <Text style={driveStyles.homeTitle}>{activeTab.toUpperCase()}</Text>

        <View style={{ flex: 1 }}>
          {activeTab === "home" && <MainHomePage />}
          {activeTab === "starred" && <StarredPage />}
          {activeTab === "shared" && <SharedPage />}
          {activeTab === "mydrive" && <MyDrivePage />}
        </View>
      </SafeAreaView>

      <Fab onPress={() => setModalVisible(true)} />
      <BottomBar activeTab={activeTab} setActiveTab={setActiveTab} />

      <CreateFileModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleCreateFile}
      />
    </ImageBackground>
  );
}