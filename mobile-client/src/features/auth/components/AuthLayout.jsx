import React, { useMemo } from "react";
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
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../../app/providers/ThemeContext";
import { getAuthStyles } from "../styles/auth.styles";
import MusicToggle from "../../../shared_code/components/MusicToggle";

const loginBg = require("../../../assets/images/login.png");

export default function AuthLayout({ children, title = "CopaDrive", subtitle }) {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  let [fontsLoaded] = useFonts({ BrunoAceSC_400Regular });

  const authStyles = useMemo(() => getAuthStyles(colors, isDarkMode), [colors, isDarkMode]);

  if (!fontsLoaded) return <ActivityIndicator size="large" color={colors.primary} />;

  return (
    <ImageBackground 
        source={loginBg} 
        style={authStyles.backgroundImage} 
        resizeMode="cover"
    >
      {/* ✅ שכבת החשכה: מופיעה רק במצב לילה */}
      {isDarkMode && <View style={authStyles.dimOverlay} />}
      
      <View style={styles.topControls}>
         <MusicToggle />
         <TouchableOpacity style={[styles.themeBtn, { backgroundColor: colors.surface }]} onPress={toggleTheme}>
            <Feather name={isDarkMode ? "sun" : "moon"} size={20} color={colors.textPrimary} />
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
    topControls: { 
        position: 'absolute', 
        top: 60, 
        right: 20, 
        flexDirection: 'row', 
        gap: 10, 
        zIndex: 10,
        alignItems: 'center'
    },
    themeBtn: { 
        width: 36, 
        height: 36, 
        borderRadius: 18, 
        justifyContent: 'center', 
        alignItems: 'center',
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    }
});