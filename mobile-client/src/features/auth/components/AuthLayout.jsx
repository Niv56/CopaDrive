import React from "react";
import {
  View,
  Text,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator
} from "react-native";
import { useFonts, BrunoAceSC_400Regular } from "@expo-google-fonts/bruno-ace-sc";
import { authStyles } from "../styles/auth.styles";

const bgImage = require("../../../assets/images/back.png");

export default function AuthLayout({ children, title = "CopaDrive", subtitle }) {
  let [fontsLoaded] = useFonts({
    BrunoAceSC_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <ImageBackground source={bgImage} style={authStyles.backgroundImage} resizeMode="cover">
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