import React from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from "./providers/AuthContext";
import { ThemeProvider } from "./providers/ThemeContext";
import { MusicProvider } from "./providers/MusicContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <MusicProvider>
            
            <Stack 
              screenOptions={{ 
                headerShown: false,
                animation: 'fade',
                gestureEnabled: false,
                contentStyle: { backgroundColor: 'transparent' }
              }}
            >
              
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(app)" />

            </Stack>
          </MusicProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}