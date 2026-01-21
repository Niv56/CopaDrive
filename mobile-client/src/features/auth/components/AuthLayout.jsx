import React from "react";
import {
  View,
  Text,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import { useFonts, BrunoAceSC_400Regular } from "@expo-google-fonts/bruno-ace-sc";
import { authStyles } from "../styles/auth.styles";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useTheme } from "../../../app/providers/ThemeContext";

// ✅ שימוש בתמונה login.png
const loginBg = require("../../../assets/images/login.png");

export default function AuthLayout({ children, title = "CopaDrive", subtitle }) {
  const { isDarkMode, toggleTheme } = useTheme();
  let [fontsLoaded] = useFonts({ BrunoAceSC_400Regular });

  if (!fontsLoaded) return <ActivityIndicator size="large" color="#007bff" />;

  return (
    <ImageBackground source={loginBg} style={authStyles.backgroundImage} resizeMode="cover">
      
      {/* כפתורים עליונים */}
      <View style={styles.topControls}>
         <TouchableOpacity 
            style={styles.songBtn} 
            onPress={() => alert("Music coming soon!")}
         >
            <Ionicons name="musical-notes" size={16} color="white" />
            <Text style={styles.songText}>PlaySong</Text>
         </TouchableOpacity>

         <TouchableOpacity style={styles.themeBtn} onPress={toggleTheme}>
            <Feather name={isDarkMode ? "sun" : "moon"} size={20} color="#333" />
         </TouchableOpacity>
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={authStyles.keyboardView}
        >
          <View style={authStyles.cardContainer}>
            <View style={authStyles.header}>
              <Text style={authStyles.brandText}>{title}</Text>
              {subtitle && <Text style={authStyles.subText}>{subtitle}</Text>}
            </View>
            {children}
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
    topControls: { position: 'absolute', top: 50, right: 20, flexDirection: 'row', gap: 10, zIndex: 10 },
    songBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d6efd', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, gap: 6 },
    songText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    themeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }
});