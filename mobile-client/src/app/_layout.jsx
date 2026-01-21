import React from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from "./providers/AuthContext";
import { ThemeProvider } from "./providers/ThemeContext";
import { MusicProvider } from "./providers/MusicContext";

/**
 * Global Root Layout component.
 * Sets up the context provider hierarchy and main navigation stack.
 */
export default function RootLayout() {
  return (
    // Essential for handling native gestures like swiping and dragging
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <MusicProvider>

            <Stack
              screenOptions={{
                headerShown: false,
                // Unified smooth transition across the entire app
                animation: 'fade',
                // Disabled to prevent breaking the login/auth flow experience
                gestureEnabled: false,
                contentStyle: { backgroundColor: 'transparent' }
              }}
            >
              {/* Route Groups */}
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