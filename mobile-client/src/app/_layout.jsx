import React from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from "./providers/AuthContext";
import { ThemeProvider } from "./providers/ThemeContext";

export default function RootLayout() {
  return (
    // 1. עוטף הכל כדי שהמחוות (כמו החלקה) יעבדו חלק
    <GestureHandlerRootView style={{ flex: 1 }}>
      
      {/* 2. ספק הצבעים (עבור Night Mode) */}
      <ThemeProvider>
        
        {/* 3. ספק האימות (Login/Register) */}
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </AuthProvider>

      </ThemeProvider>
    </GestureHandlerRootView>
  );
}